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
  // Uncomment for local development:
  // server: {
  //   url: "http://localhost:3000",
  //   cleartext: true,
  // },
};

export default config;
