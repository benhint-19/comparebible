import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.comparebible.app",
  appName: "CompareBible",
  webDir: "out",
  server: {
    // During development, point to the Next.js dev server.
    // Comment this out (or remove) for production builds.
    url: "http://localhost:3000",
    cleartext: true,
  },
};

export default config;
