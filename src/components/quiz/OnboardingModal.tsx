"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";
import QuizWizard from "@/components/quiz/QuizWizard";

export default function OnboardingModal() {
  const quizCompleted = useSettingsStore((s) => s.quizCompleted);
  const setQuizCompleted = useSettingsStore((s) => s.setQuizCompleted);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (quizCompleted || dismissed) return null;

  const handleSkip = () => {
    setDismissed(true);
    setQuizCompleted(true);
  };

  const handleManual = () => {
    setDismissed(true);
    setQuizCompleted(true);
    router.push("/settings");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-lg font-bold">Welcome to CompareBible</h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
              Find the best English Bible interpretation for you
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-md hover:bg-[var(--color-muted)] transition-colors shrink-0"
            aria-label="Skip quiz"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quiz content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <QuizWizard onComplete={() => setDismissed(true)} />
        </div>

        {/* Footer - skip options */}
        <div className="shrink-0 px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <button
            onClick={handleManual}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Choose translations manually
          </button>
          <button
            onClick={handleSkip}
            className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Skip, use defaults
          </button>
        </div>
      </div>
    </div>
  );
}
