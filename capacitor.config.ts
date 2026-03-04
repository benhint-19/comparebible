import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.comparebible.app",
  appName: "CompareBible",
  webDir: "out",
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      backgroundColor: "#0a0a0a",
    },
  },
  // Uncomment for local development:
  // server: {
  //   url: "http://localhost:3000",
  //   cleartext: true,
  // },
};

export default config;
