"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslationStore } from "@/store/translationStore";
import { translationProfiles } from "@/lib/quiz/translations";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  const { fontSize, setFontSize, quizCompleted } = useSettingsStore();
  const {
    primaryTranslation,
    parallelTranslations,
    setPrimary,
    addParallel,
    removeParallel,
  } = useTranslationStore();

  const [showTranslationPicker, setShowTranslationPicker] = useState(false);

  const getPrimaryName = () => {
    return translationProfiles.find((t) => t.id === primaryTranslation)?.name ?? primaryTranslation;
  };

  const getTranslationName = (id: string) => {
    return translationProfiles.find((t) => t.id === id)?.name ?? id;
  };

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

        {/* Primary Translation */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-3">Primary Translation</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            The main English interpretation you read. Different translators render the original Hebrew and Greek texts with different priorities — some prioritize literal accuracy, others readability.
          </p>
          <select
            value={primaryTranslation}
            onChange={(e) => setPrimary(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] px-3 py-2 text-sm"
          >
            {translationProfiles.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
            ))}
          </select>
        </section>

        {/* Parallel Translations */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Parallel Translations</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Shown when you tap a verse. Compare how different translators interpreted the same passage.
          </p>

          {/* Current parallels */}
          <div className="space-y-2 mb-3">
            {parallelTranslations.map((id) => (
              <div key={id} className="flex items-center justify-between rounded-lg bg-[var(--color-background)] px-3 py-2 border border-[var(--color-border)]">
                <span className="text-sm font-medium">{getTranslationName(id)}</span>
                <button
                  onClick={() => removeParallel(id)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
            {parallelTranslations.length === 0 && (
              <p className="text-sm text-[var(--color-muted-foreground)] italic">No parallel translations selected</p>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowTranslationPicker(!showTranslationPicker)}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            {showTranslationPicker ? "Hide list" : "+ Add translation"}
          </button>

          {showTranslationPicker && (
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
              {translationProfiles
                .filter((t) => t.id !== primaryTranslation && !parallelTranslations.includes(t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => addParallel(t.id)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-background)] transition-colors"
                  >
                    {t.name} <span className="text-[var(--color-muted-foreground)]">({t.id})</span>
                  </button>
                ))}
            </div>
          )}
        </section>

        {/* Quiz */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">Translation Quiz</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            Not sure which translations to use? Take a quick quiz to find the best match for your reading style.
          </p>
          <Link
            href="/quiz"
            className="inline-block text-sm text-[var(--color-accent)] hover:underline"
          >
            {quizCompleted ? "Retake translation quiz" : "Take the translation quiz"}
          </Link>
        </section>

        {/* About */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-2">About</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            CompareBible — Compare how different English translators have interpreted Bible passages over the centuries, with AI-powered analysis from multiple perspectives.
            Bible text from bible.helloao.org. AI analysis powered by Google Gemini.
          </p>
        </section>
      </main>
    </div>
  );
}
