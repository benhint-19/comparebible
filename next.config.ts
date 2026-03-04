import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},

  // When building for Capacitor (iOS/Android), we need a static export.
  // The API route (/api/gemini) won't be included in static exports -- the
  // Capacitor app calls the deployed Vercel URL instead (configured via
  // NEXT_PUBLIC_API_URL).
  ...(process.env.CAPACITOR_BUILD === "true" && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default withPWA(nextConfig);
