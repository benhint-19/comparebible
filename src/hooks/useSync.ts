"use client";

// ---------------------------------------------------------------------------
// useSyncEffect -- bridges auth state with Firestore sync
// ---------------------------------------------------------------------------
// Call this once from a top-level page component. It:
//   1. Listens to Firebase auth state and populates authStore
//   2. On sign-in, pulls remote data and merges with local stores
//   3. Subscribes to local store changes and debounce-writes to Firestore
//   4. Subscribes to Firestore snapshots for real-time cross-device sync
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslationStore } from "@/store/translationStore";
import { useReaderStore } from "@/store/readerStore";
import { useNotesStore } from "@/store/notesStore";
import { useAIStore } from "@/store/aiStore";
import type { AuthUser } from "@/store/authStore";
import type { VerseNote } from "@/store/notesStore";

const DEBOUNCE_MS = 500;

/**
 * Simple debounce helper that returns a cancel function.
 */
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}

export function useSyncEffect() {
  // Track whether a remote snapshot update is being applied so we don't
  // echo it back to Firestore.
  const isApplyingRemote = useRef(false);
  const unsubs = useRef<Array<() => void>>([]);
  const debouncedFns = useRef<Array<{ cancel: () => void }>>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // --- 1. Auth state listener --- //
      const { onAuthStateChanged } = await import("@/lib/auth");
      const unsubAuth = await onAuthStateChanged((firebaseUser) => {
        if (cancelled) return;
        if (firebaseUser) {
          useAuthStore.getState().setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAnonymous: firebaseUser.isAnonymous,
          });
          startSync(firebaseUser as AuthUser);
        } else {
          useAuthStore.getState().setUser(null);
          stopSync();
        }
      });
      unsubs.current.push(unsubAuth);
    }

    async function startSync(user: AuthUser) {
      const sync = await import("@/lib/sync");
      const uid = user.uid;

      // --- 2. Initial merge (remote wins, but skip empty remote) --- //
      try {
        const [remoteSettings, remoteTranslations, remoteReader, remoteNotes] =
          await Promise.all([
            sync.readSettings(uid),
            sync.readTranslations(uid),
            sync.readReader(uid),
            sync.readAllNotes(uid),
          ]);

        isApplyingRemote.current = true;

        if (remoteSettings) {
          const s = useSettingsStore.getState();
          if (remoteSettings.fontSize) s.setFontSize(remoteSettings.fontSize);
          if (remoteSettings.pushTime) s.setPushTime(remoteSettings.pushTime);
          if (typeof remoteSettings.pushEnabled === "boolean")
            s.setPushEnabled(remoteSettings.pushEnabled);
          if (typeof remoteSettings.quizCompleted === "boolean")
            s.setQuizCompleted(remoteSettings.quizCompleted);
          if (remoteSettings.selectedPersonas?.length) {
            useAIStore.getState().setSelectedPersonas(remoteSettings.selectedPersonas);
          }
        }

        if (remoteTranslations) {
          const t = useTranslationStore.getState();
          if (remoteTranslations.primaryTranslation)
            t.setPrimary(remoteTranslations.primaryTranslation);
          if (remoteTranslations.parallelTranslations?.length)
            t.setParallel(remoteTranslations.parallelTranslations);
        }

        if (remoteReader) {
          const r = useReaderStore.getState();
          if (remoteReader.currentBook && remoteReader.currentChapter) {
            r.navigateTo(remoteReader.currentBook, remoteReader.currentChapter);
          }
        }

        if (remoteNotes && Object.keys(remoteNotes).length > 0) {
          // Merge: remote wins on conflicts (by updatedAt), keep local-only notes
          const localNotes = useNotesStore.getState().notes;
          const merged: Record<string, VerseNote> = { ...localNotes };
          for (const [key, remoteNote] of Object.entries(remoteNotes)) {
            const local = merged[key];
            if (!local || remoteNote.updatedAt >= local.updatedAt) {
              merged[key] = remoteNote;
            }
          }
          useNotesStore.setState({ notes: merged });
        }

        // Push any local data that wasn't in remote (so first-time sign-in uploads)
        const localSettings = useSettingsStore.getState();
        const localAI = useAIStore.getState();
        await sync.writeSettings(uid, {
          fontSize: localSettings.fontSize,
          pushEnabled: localSettings.pushEnabled,
          pushTime: localSettings.pushTime,
          quizCompleted: localSettings.quizCompleted,
          selectedPersonas: localAI.selectedPersonas,
        });

        const localTrans = useTranslationStore.getState();
        await sync.writeTranslations(uid, {
          primaryTranslation: localTrans.primaryTranslation,
          parallelTranslations: localTrans.parallelTranslations,
        });

        const localReader = useReaderStore.getState();
        await sync.writeReader(uid, {
          currentBook: localReader.currentBook,
          currentChapter: localReader.currentChapter,
        });

        const localNotes = useNotesStore.getState().notes;
        if (Object.keys(localNotes).length > 0) {
          await sync.writeAllNotes(uid, localNotes);
        }

        isApplyingRemote.current = false;
      } catch (err) {
        console.error("[Sync] Initial merge failed:", err);
        isApplyingRemote.current = false;
      }

      // --- 3. Subscribe to local store changes -> write to Firestore --- //
      const debouncedWriteSettings = debounce(async () => {
        if (isApplyingRemote.current) return;
        const s = useSettingsStore.getState();
        const ai = useAIStore.getState();
        await sync.writeSettings(uid, {
          fontSize: s.fontSize,
          pushEnabled: s.pushEnabled,
          pushTime: s.pushTime,
          quizCompleted: s.quizCompleted,
          selectedPersonas: ai.selectedPersonas,
        });
      }, DEBOUNCE_MS);

      const debouncedWriteTranslations = debounce(async () => {
        if (isApplyingRemote.current) return;
        const t = useTranslationStore.getState();
        await sync.writeTranslations(uid, {
          primaryTranslation: t.primaryTranslation,
          parallelTranslations: t.parallelTranslations,
        });
      }, DEBOUNCE_MS);

      const debouncedWriteReader = debounce(async () => {
        if (isApplyingRemote.current) return;
        const r = useReaderStore.getState();
        await sync.writeReader(uid, {
          currentBook: r.currentBook,
          currentChapter: r.currentChapter,
        });
      }, DEBOUNCE_MS);

      const debouncedWriteNotes = debounce(async () => {
        if (isApplyingRemote.current) return;
        const n = useNotesStore.getState().notes;
        await sync.writeAllNotes(uid, n);
      }, DEBOUNCE_MS);

      debouncedFns.current.push(
        debouncedWriteSettings,
        debouncedWriteTranslations,
        debouncedWriteReader,
        debouncedWriteNotes,
      );

      const unsubSettings = useSettingsStore.subscribe(() => debouncedWriteSettings());
      const unsubAI = useAIStore.subscribe(() => debouncedWriteSettings());
      const unsubTrans = useTranslationStore.subscribe(() => debouncedWriteTranslations());
      const unsubReader = useReaderStore.subscribe(() => debouncedWriteReader());
      const unsubNotes = useNotesStore.subscribe(() => debouncedWriteNotes());

      unsubs.current.push(unsubSettings, unsubAI, unsubTrans, unsubReader, unsubNotes);

      // --- 4. Subscribe to Firestore snapshots for cross-device sync --- //
      try {
        const unsubRemoteSettings = await sync.subscribeSettings(uid, (data) => {
          isApplyingRemote.current = true;
          const s = useSettingsStore.getState();
          if (data.fontSize && data.fontSize !== s.fontSize) s.setFontSize(data.fontSize);
          if (data.pushTime && data.pushTime !== s.pushTime) s.setPushTime(data.pushTime);
          if (typeof data.pushEnabled === "boolean" && data.pushEnabled !== s.pushEnabled)
            s.setPushEnabled(data.pushEnabled);
          if (typeof data.quizCompleted === "boolean" && data.quizCompleted !== s.quizCompleted)
            s.setQuizCompleted(data.quizCompleted);
          if (data.selectedPersonas?.length) {
            const ai = useAIStore.getState();
            if (JSON.stringify(data.selectedPersonas) !== JSON.stringify(ai.selectedPersonas)) {
              ai.setSelectedPersonas(data.selectedPersonas);
            }
          }
          isApplyingRemote.current = false;
        });

        const unsubRemoteTrans = await sync.subscribeTranslations(uid, (data) => {
          isApplyingRemote.current = true;
          const t = useTranslationStore.getState();
          if (data.primaryTranslation && data.primaryTranslation !== t.primaryTranslation)
            t.setPrimary(data.primaryTranslation);
          if (
            data.parallelTranslations?.length &&
            JSON.stringify(data.parallelTranslations) !== JSON.stringify(t.parallelTranslations)
          )
            t.setParallel(data.parallelTranslations);
          isApplyingRemote.current = false;
        });

        const unsubRemoteReader = await sync.subscribeReader(uid, (data) => {
          isApplyingRemote.current = true;
          const r = useReaderStore.getState();
          if (
            data.currentBook &&
            data.currentChapter &&
            (data.currentBook !== r.currentBook || data.currentChapter !== r.currentChapter)
          ) {
            r.navigateTo(data.currentBook, data.currentChapter);
          }
          isApplyingRemote.current = false;
        });

        const unsubRemoteNotes = await sync.subscribeNotes(uid, (notes) => {
          isApplyingRemote.current = true;
          const localNotes = useNotesStore.getState().notes;
          // Only update if actually different
          if (JSON.stringify(notes) !== JSON.stringify(localNotes)) {
            useNotesStore.setState({ notes });
          }
          isApplyingRemote.current = false;
        });

        unsubs.current.push(
          unsubRemoteSettings,
          unsubRemoteTrans,
          unsubRemoteReader,
          unsubRemoteNotes,
        );
      } catch (err) {
        console.error("[Sync] Snapshot subscriptions failed:", err);
      }
    }

    function stopSync() {
      // Cancel debounced writes
      for (const fn of debouncedFns.current) {
        fn.cancel();
      }
      debouncedFns.current = [];

      // Keep the auth listener (index 0), unsubscribe the rest
      const authUnsub = unsubs.current[0];
      for (let i = 1; i < unsubs.current.length; i++) {
        unsubs.current[i]();
      }
      unsubs.current = authUnsub ? [authUnsub] : [];
    }

    init();

    return () => {
      cancelled = true;
      for (const fn of debouncedFns.current) fn.cancel();
      for (const unsub of unsubs.current) unsub();
      unsubs.current = [];
      debouncedFns.current = [];
    };
  }, []);
}
