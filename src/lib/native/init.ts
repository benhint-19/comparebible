import { Capacitor } from "@capacitor/core";

/**
 * One-time native platform setup: status bar styling and permission requests.
 * Called once on app mount. No-ops on web.
 */
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;

  // --- Status bar ---
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#FAF8F5" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn("[native] StatusBar setup failed:", err);
  }

  // --- Request permissions (non-blocking, best-effort) ---
  // Notifications
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { receive } = await PushNotifications.checkPermissions();
    if (receive === "prompt") {
      await PushNotifications.requestPermissions();
    }
  } catch (err) {
    console.warn("[native] Push permission request failed:", err);
  }

  // Microphone (speech recognition)
  try {
    const { SpeechRecognition } = await import(
      "@capacitor-community/speech-recognition"
    );
    const { speechRecognition } = await SpeechRecognition.checkPermissions();
    if (speechRecognition === "prompt") {
      await SpeechRecognition.requestPermissions();
    }
  } catch (err) {
    console.warn("[native] Mic permission request failed:", err);
  }
}
