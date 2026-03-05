"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export default function WelcomeScreen() {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setHasSeenWelcome = useSettingsStore((s) => s.setHasSeenWelcome);

  function dismiss() {
    setHasSeenWelcome(true);
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { sendMagicLink } = await import("@/lib/auth");
      await sendMagicLink(email);
      setLinkSent(true);
    } catch (err) {
      console.error("Magic link failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
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

        {/* App description */}
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          Compare Bible translations side by side, explore AI-powered scholarly perspectives, listen in audio mode, and take notes on any verse.
        </p>

        {/* Sign-in */}
        {!linkSent ? (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Sign in to sync your notes, settings, and reading position across devices. This is completely optional.
            </p>

            <form onSubmit={handleSendLink} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] transition-colors text-center"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {busy ? "Sending..." : "Send sign-in link"}
              </button>
            </form>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                <path d="m16 19 2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">Check your email</p>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              We sent a sign-in link to <strong>{email}</strong>. Tap the link to sign in — no password needed.
            </p>
            <button
              onClick={() => { setLinkSent(false); setError(null); }}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Skip */}
        <button
          onClick={dismiss}
          className="w-full rounded-lg border-2 border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
        >
          Continue without an account
        </button>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-muted-foreground)]">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
