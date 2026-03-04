"use client";

import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslationStore } from "@/store/translationStore";
import { translationPresets } from "@/lib/bible/presets";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PersonaSettings from "@/components/ai/PersonaSettings";
import PushToggle from "@/components/ui/PushToggle";
import TranslationSelect, { getAllTranslations } from "@/components/ui/TranslationSelect";

export default function SettingsPage() {
  const { fontSize, setFontSize, quizCompleted } = useSettingsStore();
  const {
    primaryTranslation,
    parallelTranslations,
    setPrimary,
    setParallel,
    addParallel,
    removeParallel,
  } = useTranslationStore();

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

        {/* Primary Translation */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h2 className="font-medium mb-3">Primary Translation</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            The main English interpretation you read. Different translators render the original Hebrew and Greek texts with different priorities — some prioritize literal accuracy, others readability.
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
            Quick-start groupings — click one to set your parallel translations.
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
                        {" — "}
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
