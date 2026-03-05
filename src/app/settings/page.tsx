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
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4 pt-[env(safe-area-inset-top)]">
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
                <button
                  key={preset.id}
                  onClick={() => setParallel(preset.translationIds)}
                  className={`text-left rounded-lg border transition-colors cursor-pointer px-3 py-2.5 ${
                    isActive
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  <span className="text-sm font-medium">{preset.name}</span>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {preset.description}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {preset.explanations.map((ex) => (
                      <li key={ex.id} className="text-xs text-[var(--color-muted-foreground)] leading-snug">
                        <span className="font-semibold text-[var(--color-foreground)]">{ex.id.replace("bolls:", "").replace("eng_", "").toUpperCase()}</span>
                        {" - "}
                        {ex.why}
                      </li>
                    ))}
                  </ul>
                </button>
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
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      const { sendMagicLink } = await import("@/lib/auth");
      await sendMagicLink(email);
      setLinkSent(true);
    } catch (err) {
      console.error("Magic link failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
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

          {!linkSent ? (
            <form onSubmit={handleSendLink} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
              />

              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {authBusy ? "Sending..." : "Send sign-in link"}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                Sign-in link sent to <strong>{email}</strong>. Check your inbox and spam folder.
              </p>
              <button
                onClick={() => { setLinkSent(false); setAuthError(null); }}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}

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
                setAuthError(err instanceof Error ? err.message : "Something went wrong.");
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
