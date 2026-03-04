"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function DeleteAccountPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [step, setStep] = useState<"confirm" | "deleting" | "done" | "error">("confirm");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setStep("deleting");
    setError(null);
    try {
      const { deleteUserAccount } = await import("@/lib/auth");
      await deleteUserAccount();
      setStep("done");
    } catch (err) {
      console.error("Account deletion failed:", err);
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code
          : "";
      if (code === "auth/requires-recent-login") {
        setError(
          "For security, Firebase requires a recent sign-in before deleting your account. Please sign out, sign back in, then try again."
        );
      } else {
        setError("Something went wrong. Please try again or contact us at privacy@selahbible.app.");
      }
      setStep("error");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4">
        <Link
          href="/settings"
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">Delete Account</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        {isLoading ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">Loading...</p>
        ) : !user ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              You are not signed in. Only signed-in users have accounts to delete.
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              To clear local data (cached chapters, settings, notes), clear your browser&rsquo;s
              site data for this site.
            </p>
            <Link href="/settings" className="text-sm text-[var(--color-accent)] hover:underline">
              Back to Settings
            </Link>
          </div>
        ) : step === "done" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <h2 className="font-medium text-green-700 dark:text-green-400 mb-2">Account deleted</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Your account and all synced data have been removed. Local data on this device
                remains until you clear it from your browser settings.
              </p>
            </div>
            <Link href="/" className="block text-sm text-[var(--color-accent)] hover:underline">
              Return to reader
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <h2 className="font-medium text-red-600 dark:text-red-400">This action is permanent</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Deleting your account will permanently remove:
              </p>
              <ul className="list-disc pl-5 text-sm text-[var(--color-muted-foreground)] space-y-1">
                <li>Your Firebase authentication account</li>
                <li>All synced data (reading position, settings, notes)</li>
                <li>Push notification registrations</li>
              </ul>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Local data (cached Bible chapters in your browser) will not be affected.
                This cannot be undone.
              </p>
            </section>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Signed in as</p>
              <p className="text-sm font-medium">
                {user.isAnonymous
                  ? "Anonymous account"
                  : user.email || user.displayName || "Signed in"}
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3">
              <Link
                href="/settings"
                className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-center hover:bg-[var(--color-muted)] transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleDelete}
                disabled={step === "deleting"}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {step === "deleting" ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
