// ---------------------------------------------------------------------------
// API base URL helper for Capacitor / web builds
// ---------------------------------------------------------------------------
//
// On the web (Vercel), API routes are relative ("/api/gemini").
// In a Capacitor native shell the app is served from a local file:// origin,
// so API calls must target the deployed Vercel URL.
//
// Set NEXT_PUBLIC_API_URL in your .env (or Capacitor build env) to the
// deployed site URL, e.g. "https://comparebible.vercel.app".
// When unset (normal Vercel deployment) it defaults to "" (relative).
// ---------------------------------------------------------------------------

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "";
