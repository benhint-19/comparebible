import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.comparebible.app",
  appName: "Selah",
  webDir: "out",
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      backgroundColor: "#FAF8F5",
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FAF8F5",
    },
  },
  ios: {
    // Exclude @capacitor-firebase/authentication from iOS — its SPM package
    // hard-codes Facebook SDK which crashes without config. iOS uses
    // signInWithPopup instead (works fine in WKWebView).
    includePlugins: [
      "@capacitor-community/speech-recognition",
      "@capacitor-community/text-to-speech",
      "@capacitor/app",
      "@capacitor/haptics",
      "@capacitor/keyboard",
      "@capacitor/push-notifications",
      "@capacitor/status-bar",
    ],
  },
  // Uncomment for local development:
  // server: {
  //   url: "http://localhost:3000",
  //   cleartext: true,
  // },
};

export default config;
