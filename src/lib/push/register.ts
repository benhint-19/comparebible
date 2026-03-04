// ---------------------------------------------------------------------------
// Push notification registration -- works on both native (Capacitor) and web
// ---------------------------------------------------------------------------

import { Capacitor } from "@capacitor/core";
import { getFirebaseApp } from "@/lib/firebase";

/**
 * Whether push notifications are supported on the current platform.
 */
export function isPushSupported(): boolean {
  // Native always supports push via Capacitor
  if (Capacitor.isNativePlatform()) return true;

  // Web: needs service worker + Notification API
  if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
    return true;
  }

  return false;
}

/**
 * Register for push notifications.
 * - On native (iOS/Android): uses @capacitor/push-notifications to get the FCM token.
 * - On web: uses firebase/messaging to get a web push token.
 *
 * Sends the token to our API so it can be stored server-side, along with
 * the user's timezone and preferred notification hour.
 *
 * @param preferredHour - The hour (0-23) the user wants their daily notification. Defaults to 8.
 * Returns the token string on success, or null if denied / unsupported.
 */
export async function registerForPush(preferredHour: number = 8): Promise<string | null> {
  if (!isPushSupported()) return null;

  const platform = Capacitor.isNativePlatform()
    ? Capacitor.getPlatform() // "ios" | "android"
    : "web";

  let token: string | null = null;

  if (Capacitor.isNativePlatform()) {
    token = await registerNative();
  } else {
    token = await registerWeb();
  }

  if (!token) return null;

  // Detect the user's IANA timezone (e.g. "America/New_York")
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Send to our API
  try {
    await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform, timezone, preferredHour }),
    });
  } catch (err) {
    console.error("[push] Failed to register token with server:", err);
  }

  return token;
}

// ---------------------------------------------------------------------------
// Native registration via @capacitor/push-notifications
// ---------------------------------------------------------------------------
async function registerNative(): Promise<string | null> {
  try {
    // Dynamic import to avoid SSR / web bundling issues
    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") {
      console.warn("[push] Native permission denied");
      return null;
    }

    // Register with APNs / FCM
    await PushNotifications.register();

    // Wait for the registration event to fire with the token
    return await new Promise<string | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 10_000);

      PushNotifications.addListener("registration", (regToken) => {
        clearTimeout(timeout);
        resolve(regToken.value);
      });

      PushNotifications.addListener("registrationError", (err) => {
        clearTimeout(timeout);
        console.error("[push] Native registration error:", err);
        resolve(null);
      });
    });
  } catch (err) {
    console.error("[push] Native push module unavailable:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Web registration via firebase/messaging
// ---------------------------------------------------------------------------
async function registerWeb(): Promise<string | null> {
  try {
    if (typeof Notification === "undefined") return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[push] Web notification permission denied");
      return null;
    }

    const app = getFirebaseApp();
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    return fcmToken || null;
  } catch (err) {
    console.error("[push] Web push registration failed:", err);
    return null;
  }
}
