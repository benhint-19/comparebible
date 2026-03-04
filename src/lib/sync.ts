// ---------------------------------------------------------------------------
// Firestore sync service -- client-side only
// ---------------------------------------------------------------------------
// Syncs local Zustand stores to/from Firestore when a user is signed in.
// Uses the client SDK (NOT firebase-admin).
// ---------------------------------------------------------------------------

import { getFirebaseApp } from "./firebase";
import type { VerseNote } from "@/store/notesStore";

// ---- Firestore helpers (lazy-loaded) ---- //

async function getDb() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured");
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

async function firestoreDoc(path: string) {
  const { doc } = await import("firebase/firestore");
  const db = await getDb();
  return doc(db, path);
}

async function firestoreCollection(path: string) {
  const { collection } = await import("firebase/firestore");
  const db = await getDb();
  return collection(db, path);
}

// ---- Types ---- //

export interface SyncedSettings {
  fontSize: number;
  pushEnabled: boolean;
  pushTime: string;
  quizCompleted: boolean;
  selectedPersonas: string[];
}

export interface SyncedTranslations {
  primaryTranslation: string;
  parallelTranslations: string[];
}

export interface SyncedReader {
  currentBook: string;
  currentChapter: number;
}

// ---- Write functions (debounced externally) ---- //

export async function writeSettings(uid: string, data: SyncedSettings): Promise<void> {
  const { setDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/prefs`);
  await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function writeTranslations(uid: string, data: SyncedTranslations): Promise<void> {
  const { setDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/translations`);
  await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function writeReader(uid: string, data: SyncedReader): Promise<void> {
  const { setDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/reader`);
  await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function writeNote(uid: string, note: VerseNote): Promise<void> {
  const { setDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/notes/${note.id}`);
  await setDoc(ref, { ...note, updatedAt: Date.now() }, { merge: true });
}

export async function deleteNoteRemote(uid: string, noteId: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/notes/${noteId}`);
  await deleteDoc(ref);
}

export async function writeAllNotes(uid: string, notes: Record<string, VerseNote>): Promise<void> {
  const { writeBatch, doc } = await import("firebase/firestore");
  const db = await getDb();
  const batch = writeBatch(db);
  for (const [key, note] of Object.entries(notes)) {
    const ref = doc(db, `users/${uid}/notes/${key}`);
    batch.set(ref, { ...note, updatedAt: Date.now() }, { merge: true });
  }
  await batch.commit();
}

// ---- Read functions (initial pull on sign-in) ---- //

export async function readSettings(uid: string): Promise<SyncedSettings | null> {
  const { getDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/prefs`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as SyncedSettings;
}

export async function readTranslations(uid: string): Promise<SyncedTranslations | null> {
  const { getDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/translations`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as SyncedTranslations;
}

export async function readReader(uid: string): Promise<SyncedReader | null> {
  const { getDoc } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/reader`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as SyncedReader;
}

export async function readAllNotes(uid: string): Promise<Record<string, VerseNote>> {
  const { getDocs } = await import("firebase/firestore");
  const col = await firestoreCollection(`users/${uid}/notes`);
  const snap = await getDocs(col);
  const notes: Record<string, VerseNote> = {};
  snap.forEach((doc) => {
    const data = doc.data() as VerseNote;
    notes[doc.id] = data;
  });
  return notes;
}

// ---- Snapshot subscriptions (real-time sync) ---- //

export async function subscribeSettings(
  uid: string,
  callback: (data: SyncedSettings) => void,
): Promise<() => void> {
  const { onSnapshot } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/prefs`);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SyncedSettings);
    }
  });
}

export async function subscribeTranslations(
  uid: string,
  callback: (data: SyncedTranslations) => void,
): Promise<() => void> {
  const { onSnapshot } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/translations`);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SyncedTranslations);
    }
  });
}

export async function subscribeReader(
  uid: string,
  callback: (data: SyncedReader) => void,
): Promise<() => void> {
  const { onSnapshot } = await import("firebase/firestore");
  const ref = await firestoreDoc(`users/${uid}/settings/reader`);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SyncedReader);
    }
  });
}

export async function subscribeNotes(
  uid: string,
  callback: (notes: Record<string, VerseNote>) => void,
): Promise<() => void> {
  const { onSnapshot } = await import("firebase/firestore");
  const col = await firestoreCollection(`users/${uid}/notes`);
  return onSnapshot(col, (snap) => {
    const notes: Record<string, VerseNote> = {};
    snap.forEach((doc) => {
      notes[doc.id] = doc.data() as VerseNote;
    });
    callback(notes);
  });
}
