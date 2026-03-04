"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslationStore } from "@/store/translationStore";
import { useAuthStore, type AuthUser } from "@/store/authStore";
import { translationPresets } from "@/lib/bible/presets";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PersonaSettings from "@/components/ai/PersonaSettings";
import PushToggle from "@/components/ui/PushToggle";
import TranslationSelect, { getAllTranslations } from "@/components/ui/TranslationSelect";
import QuizWizard from "@/components/quiz/QuizWizard";

export default function SettingsPage() {
  const { fontSize, setFontSize, quizCompleted, setQuizCompleted } = useSettingsStore();
  const [showQuiz, setShowQuiz] = useState(false);
  const {
    primaryTranslation,
    parallelTranslations,
    setPrimary,
    setParallel,
    addParallel,
    removeParallel,
  } = useTranslationStore();
  const { user, isLoading: authLoading } = useAuthStore();
  const [authBusy, setAuthBusy] = useState(false);

  const allTranslations = getAllTranslations();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          aria-label="Back to reader"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Theme */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">Theme</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">Light, dark, or system</p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* Font Size */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-3">Font Size</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="w-10 h-10 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-background)] transition-colors text-lg"
            >
              A-
            </button>
            <span className="text-sm text-[var(--color-muted-foreground)] min-w-[3rem] text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="w-10 h-10 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-background)] transition-colors text-lg"
            >
              A+
            </button>
          </div>
        </section>

        {/* Translation Quiz */}
        <section className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
          <h2 className="font-medium mb-2">Translation Quiz</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Not sure which translations to use? Take a quick quiz to find the best match for your reading style.
          </p>
          {showQuiz ? (
            <QuizWizard onComplete={() => {
              setQuizCompleted(true);
              setShowQuiz(false);
            }} />
          ) : (
            <button
              onClick={() => setShowQuiz(true)}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              {quizCompleted ? "Retake translation quiz" : "Take the translation quiz"}
            </button>
          )}
        </section>

        {/* Primary Translation */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-3">Primary Translation</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            The main English interpretation you read. Different translators render the original Hebrew and Greek texts with different priorities - some prioritize literal accuracy, others readability.
          </p>
          <TranslationSelect
            mode="single"
            value={primaryTranslation}
            onChange={setPrimary}
            translations={allTranslations}
          />
        </section>

        {/* Translation Presets */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Translation Presets</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Quick-start groupings - click one to set your parallel translations.
          </p>
          <div className="grid gap-2">
            {translationPresets.map((preset) => {
              const isActive =
                preset.translationIds.length === parallelTranslations.length &&
                preset.translationIds.every((id) => parallelTranslations.includes(id));
              return (
                <div
                  key={preset.id}
                  className={`text-left rounded-lg border transition-colors ${
                    isActive
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-background)]"
                  }`}
                >
                  <button
                    onClick={() => setParallel(preset.translationIds)}
                    className={`w-full text-left px-3 py-2.5 rounded-t-lg transition-colors ${
                      !isActive ? "hover:border-[var(--color-accent)]/50" : ""
                    }`}
                  >
                    <span className="text-sm font-medium">{preset.name}</span>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      {preset.description}
                    </p>
                  </button>
                  <ul className="px-3 pb-2.5 space-y-1.5">
                    {preset.explanations.map((ex) => (
                      <li key={ex.id} className="text-xs text-[var(--color-muted-foreground)] leading-snug">
                        <span className="font-semibold text-[var(--color-foreground)]">{ex.id.replace("bolls:", "").replace("eng_", "").toUpperCase()}</span>
                        {" - "}
                        {ex.why}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Parallel Translations */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Parallel Translations</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Shown when you tap a verse. Compare how different translators interpreted the same passage.
          </p>

          <TranslationSelect
            mode="multi"
            value={parallelTranslations}
            onChange={(id, checked) => {
              if (checked) addParallel(id);
              else removeParallel(id);
            }}
            translations={allTranslations}
            placeholder="Search to add or remove..."
          />
        </section>

        {/* AI Perspectives */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">AI Perspectives</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Choose which scholarly perspectives to include when analyzing passages.
          </p>
          <PersonaSettings />
        </section>

        {/* Notifications */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Notifications</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Get a daily verse of the day push notification.
          </p>
          <PushToggle />
        </section>

        {/* Voice Commands */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Voice Commands (Audio Mode)</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
            Selah includes an audiobook mode that reads Bible chapters aloud.
            While listening, you can use voice commands to control playback and explore passages.
          </p>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-[var(--color-foreground)] mb-1.5">Playback</h3>
              <ul className="space-y-1 text-[var(--color-muted-foreground)]">
                <li>&ldquo;Pause&rdquo; or &ldquo;Stop&rdquo; &mdash; Pause reading</li>
                <li>&ldquo;Play&rdquo; or &ldquo;Continue&rdquo; &mdash; Resume reading</li>
                <li>&ldquo;Repeat&rdquo; &mdash; Read the current verse again</li>
                <li>&ldquo;Next verse&rdquo; or &ldquo;Skip&rdquo; &mdash; Jump ahead</li>
                <li>&ldquo;Previous verse&rdquo; or &ldquo;Go back&rdquo; &mdash; Go back one verse</li>
                <li>&ldquo;Next chapter&rdquo; &mdash; Move to the next chapter</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-[var(--color-foreground)] mb-1.5">Exploration</h3>
              <ul className="space-y-1 text-[var(--color-muted-foreground)]">
                <li>&ldquo;Compare&rdquo; or &ldquo;Show translations&rdquo; &mdash; Expand the current verse to show parallel translations</li>
                <li>&ldquo;Analyze this&rdquo; or &ldquo;Go deeper&rdquo; &mdash; Open AI analysis for the current verse</li>
                <li>&ldquo;What does this mean?&rdquo; or &ldquo;Perspectives&rdquo; &mdash; Same as above</li>
                <li>&ldquo;Take a note&rdquo; or &ldquo;Add note&rdquo; &mdash; Pause and open the note editor for the current verse</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-[var(--color-foreground)] mb-1.5">Navigation</h3>
              <ul className="space-y-1 text-[var(--color-muted-foreground)]">
                <li>&ldquo;Go to John 3&rdquo; &mdash; Navigate to a specific chapter</li>
                <li>&ldquo;Go to Romans 8:28&rdquo; &mdash; Navigate to a specific verse</li>
              </ul>
            </div>

            <p className="text-[var(--color-muted-foreground)]">
              &ldquo;Exit audio mode&rdquo; &mdash; Turn off audiobook mode
            </p>
          </div>
        </section>

        {/* Account & Sync */}
        <AccountSyncSection
          user={user}
          authLoading={authLoading}
          authBusy={authBusy}
          setAuthBusy={setAuthBusy}
        />

        {/* About */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">About</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Selah - Pause and reflect. Compare how different English translators have interpreted Bible passages over the centuries, listen in audiobook mode, and explore AI-powered analysis from multiple scholarly perspectives.
            Bible text from bible.helloao.org. AI analysis powered by Google Gemini.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/support" className="text-[var(--color-accent)] hover:underline">Support</Link>
            <Link href="/privacy" className="text-[var(--color-accent)] hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-[var(--color-accent)] hover:underline">Terms of Service</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account & Sync section - extracted for readability
// ---------------------------------------------------------------------------

function AccountSyncSection({
  user,
  authLoading,
  authBusy,
  setAuthBusy,
}: {
  user: AuthUser | null;
  authLoading: boolean;
  authBusy: boolean;
  setAuthBusy: (v: boolean) => void;
}) {
  const [emailMode, setEmailMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  /** Map Firebase error codes to user-friendly messages. */
  function friendlyError(err: unknown): string {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : "";
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in instead.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (emailMode === "sign-up") {
        const { signUpWithEmail } = await import("@/lib/auth");
        await signUpWithEmail(email, password);
      } else {
        const { signInWithEmail } = await import("@/lib/auth");
        await signInWithEmail(email, password);
      }
    } catch (err) {
      console.error("Email auth failed:", err);
      setAuthError(friendlyError(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setAuthError("Enter your email address first, then tap Forgot Password.");
      return;
    }
    setAuthError(null);
    setAuthBusy(true);
    try {
      const { resetPassword } = await import("@/lib/auth");
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      console.error("Password reset failed:", err);
      setAuthError(friendlyError(err));
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
      <h2 className="font-medium mb-2">Account & Sync</h2>

      {authLoading ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading...</p>
      ) : user ? (
        /* ---- Signed-in state ---- */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-[var(--color-muted-foreground)]">Sync is active</span>
          </div>
          <p className="text-sm">
            {user.isAnonymous
              ? "Signed in anonymously"
              : user.displayName || user.email || "Signed in"}
          </p>
          {user.email && !user.isAnonymous && (
            <p className="text-xs text-[var(--color-muted-foreground)]">{user.email}</p>
          )}
          <button
            disabled={authBusy}
            onClick={async () => {
              setAuthBusy(true);
              try {
                const { signOut } = await import("@/lib/auth");
                await signOut();
              } catch (err) {
                console.error("Sign out failed:", err);
              } finally {
                setAuthBusy(false);
              }
            }}
            className="text-sm text-red-500 hover:underline disabled:opacity-50"
          >
            {authBusy ? "Signing out..." : "Sign out"}
          </button>
          <Link
            href="/delete-account"
            className="block text-sm text-[var(--color-muted-foreground)] hover:text-red-500 hover:underline transition-colors"
          >
            Delete account
          </Link>
        </div>
      ) : (
        /* ---- Signed-out state ---- */
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Sign in to sync your settings, notes, and reading position across devices.
          </p>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
            />

            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}
            {resetSent && (
              <p className="text-sm text-green-600">Password reset email sent. Check your inbox.</p>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {authBusy
                ? "Please wait..."
                : emailMode === "sign-up"
                  ? "Create Account"
                  : "Sign In"}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setResetSent(false);
                  setEmailMode(emailMode === "sign-in" ? "sign-up" : "sign-in");
                }}
                className="text-[var(--color-accent)] hover:underline"
              >
                {emailMode === "sign-in" ? "Create Account" : "Already have an account? Sign In"}
              </button>
              {emailMode === "sign-in" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={authBusy}
                  className="text-[var(--color-muted-foreground)] hover:underline disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-muted-foreground)]">or continue with</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          {/* Google & Apple side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              disabled={authBusy}
              onClick={async () => {
                setAuthError(null);
                setAuthBusy(true);
                try {
                  const { signInWithGoogle } = await import("@/lib/auth");
                  await signInWithGoogle();
                } catch (err) {
                  console.error("Google sign-in failed:", err);
                  setAuthError(friendlyError(err));
                } finally {
                  setAuthBusy(false);
                }
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            {/* Apple */}
            <button
              disabled={authBusy}
              onClick={async () => {
                setAuthError(null);
                setAuthBusy(true);
                try {
                  const { signInWithApple } = await import("@/lib/auth");
                  await signInWithApple();
                } catch (err) {
                  console.error("Apple sign-in failed:", err);
                  setAuthError(friendlyError(err));
                } finally {
                  setAuthBusy(false);
                }
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-sm font-medium text-white hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          {/* Anonymous */}
          <button
            disabled={authBusy}
            onClick={async () => {
              setAuthError(null);
              setAuthBusy(true);
              try {
                const { signInAnonymously } = await import("@/lib/auth");
                await signInAnonymously();
              } catch (err) {
                console.error("Anonymous sign-in failed:", err);
                setAuthError(friendlyError(err));
              } finally {
                setAuthBusy(false);
              }
            }}
            className="block w-full text-center text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:underline disabled:opacity-50 transition-colors"
          >
            Continue without account
          </button>
        </div>
      )}
    </section>
  );
}
