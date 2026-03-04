"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export default function WelcomeScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setHasSeenWelcome = useSettingsStore((s) => s.setHasSeenWelcome);

  function dismiss() {
    setHasSeenWelcome(true);
  }

  function friendlyError(err: unknown): string {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : "";
    switch (code) {
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      const { signInWithGoogle } = await import("@/lib/auth");
      await signInWithGoogle();
      dismiss();
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleApple() {
    setError(null);
    setBusy(true);
    try {
      const { signInWithApple } = await import("@/lib/auth");
      await signInWithApple();
      dismiss();
    } catch (err) {
      console.error("Apple sign-in failed:", err);
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-background)] px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Icon + Brand */}
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 text-[var(--color-accent)]"
            >
              <path d="M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Selah</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Pause and reflect</p>
        </div>

        {/* Explanation */}
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          Sign in to sync your notes, settings, and reading position across devices. This is completely optional.
        </p>

        {/* Sign-in buttons */}
        <div className="space-y-3">
          {/* Google */}
          <button
            disabled={busy}
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Apple */}
          <button
            disabled={busy}
            onClick={handleApple}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Email link to settings */}
          <a
            href="/settings"
            onClick={dismiss}
            className="block text-sm text-[var(--color-accent)] hover:underline"
          >
            Sign in with email
          </a>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Skip */}
        <button
          onClick={dismiss}
          className="w-full rounded-lg border-2 border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
        >
          Continue without an account
        </button>
      </div>
    </div>
  );
}
