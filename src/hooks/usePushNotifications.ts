// ---------------------------------------------------------------------------
// usePushNotifications -- React hook for push notification lifecycle
// ---------------------------------------------------------------------------

"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { useSettingsStore } from "@/store/settingsStore";
import { useReaderStore } from "@/store/readerStore";
import { registerForPush, isPushSupported } from "@/lib/push/register";

const PUSH_REGISTERED_KEY = "push-registered";

/**
 * Manages push notification registration and tap handling.
 * Should be mounted once at the app level, after quiz is completed.
 */
export function usePushNotifications() {
  const pushEnabled = useSettingsStore((s) => s.pushEnabled);
  const setPushEnabled = useSettingsStore((s) => s.setPushEnabled);
  const quizCompleted = useSettingsStore((s) => s.quizCompleted);
  const navigateTo = useReaderStore((s) => s.navigateTo);
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  // --- Auto-register once after quiz is completed & push is enabled ---
  useEffect(() => {
    if (!quizCompleted || !pushEnabled) return;
    if (!isPushSupported()) return;

    const alreadyRegistered = localStorage.getItem(PUSH_REGISTERED_KEY);
    if (alreadyRegistered) return;

    registerForPush().then((token) => {
      if (token) {
        localStorage.setItem(PUSH_REGISTERED_KEY, "true");
      }
    });
  }, [quizCompleted, pushEnabled]);

  // --- Handle notification taps ---
  useEffect(() => {
    if (!quizCompleted) return;

    if (Capacitor.isNativePlatform()) {
      // Native: listen for notification taps via Capacitor
      setupNativeListeners(navigateTo).then((cleanup) => {
        listenerCleanupRef.current = cleanup;
      });
    } else {
      // Web: listen for messages from the service worker
      const handler = (event: MessageEvent) => {
        if (event.data?.type === "NOTIFICATION_TAP") {
          const { bookId, chapter } = event.data;
          if (bookId && chapter) {
            navigateTo(bookId, Number(chapter));
          }
        }
      };

      navigator.serviceWorker?.addEventListener("message", handler);
      listenerCleanupRef.current = () => {
        navigator.serviceWorker?.removeEventListener("message", handler);
      };
    }

    return () => {
      listenerCleanupRef.current?.();
      listenerCleanupRef.current = null;
    };
  }, [quizCompleted, navigateTo]);

  return { pushEnabled, setPushEnabled, isPushSupported: isPushSupported() };
}

// ---------------------------------------------------------------------------
// Native tap listener setup
// ---------------------------------------------------------------------------
async function setupNativeListeners(
  navigateTo: (book: string, chapter: number) => void
): Promise<() => void> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const listener = await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        const data = notification.notification.data;
        if (data?.bookId && data?.chapter) {
          navigateTo(data.bookId, Number(data.chapter));
        }
      }
    );

    return () => {
      listener.remove();
    };
  } catch {
    return () => {};
  }
}
