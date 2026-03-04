"use client";

import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslationStore } from "@/store/translationStore";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  const { fontSize, setFontSize, quizCompleted } = useSettingsStore();
  const { primaryTranslation, parallelTranslations } = useTranslationStore();

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

        {/* Translations */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Translations</h2>
          <div className="text-sm text-[var(--color-muted-foreground)] space-y-1">
            <p>Primary: <span className="text-[var(--color-foreground)] font-medium">{primaryTranslation}</span></p>
            <p>Parallel: <span className="text-[var(--color-foreground)] font-medium">{parallelTranslations.join(', ')}</span></p>
          </div>
          <Link
            href="/quiz"
            className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline"
          >
            {quizCompleted ? 'Retake translation quiz' : 'Take the translation quiz'}
          </Link>
        </section>

        {/* About */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">About</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            CompareBible — Parallel Bible reading with AI-powered perspectives.
            Bible text from bible.helloao.org. AI analysis powered by Google Gemini.
          </p>
        </section>
      </main>
    </div>
  );
}
