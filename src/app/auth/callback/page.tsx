"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const { completeMagicLinkSignIn } = await import("@/lib/auth");
        const completed = await completeMagicLinkSignIn();

        if (completed) {
          setStatus("success");
          // Brief success message then redirect to home
          setTimeout(() => router.replace("/"), 1000);
        } else {
          // Not a magic link URL — just redirect home
          router.replace("/");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Sign-in failed");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
      <div className="w-full max-w-sm text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-[var(--color-accent)] border-t-transparent" />
            <p className="text-sm text-[var(--color-muted-foreground)]">Signing you in...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">Signed in successfully</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-sm text-red-500">{errorMsg}</p>
            <button
              onClick={() => router.replace("/")}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Go to app
            </button>
          </>
        )}
      </div>
    </div>
  );
}
