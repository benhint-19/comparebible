"use client";

import { useRouter } from "next/navigation";
import { useTranslationStore } from "@/store/translationStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translationProfiles } from "@/lib/quiz/translations";
import type { QuizResult } from "@/lib/quiz/scoring";

interface QuizResultsProps {
  result: QuizResult;
  onRetake: () => void;
}

function getTranslationName(id: string): string {
  return translationProfiles.find((t) => t.id === id)?.name ?? id;
}

export default function QuizResults({ result, onRetake }: QuizResultsProps) {
  const router = useRouter();
  const setPrimary = useTranslationStore((s) => s.setPrimary);
  const setParallel = useTranslationStore((s) => s.setParallel);
  const setQuizCompleted = useSettingsStore((s) => s.setQuizCompleted);

  const handleAccept = () => {
    setPrimary(result.primary);
    setParallel(result.parallels);
    setQuizCompleted(true);
    router.push("/");
  };

  return (
    <div className="space-y-8">
      {/* Primary recommendation */}
      <div className="rounded-xl border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-6 text-center">
        <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-2">
          Your Top Translation
        </p>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
          {getTranslationName(result.primary)}
        </h2>
        <p className="text-sm text-[var(--color-muted,var(--color-foreground))]/60">
          {result.primary}
        </p>
      </div>

      {/* Parallel recommendations */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-foreground)] mb-3 uppercase tracking-wider">
          Recommended for Parallel Reading
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.parallels.map((id) => (
            <div
              key={id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface,var(--color-background))] p-4"
            >
              <p className="font-semibold text-[var(--color-foreground)]">
                {getTranslationName(id)}
              </p>
              <p className="text-xs text-[var(--color-muted,var(--color-foreground))]/60">
                {id}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All scores (collapsed) */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-[var(--color-muted,var(--color-foreground))]/60 hover:text-[var(--color-foreground)] transition-colors">
          View all translation scores
        </summary>
        <div className="mt-3 space-y-1">
          {result.scores.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between text-sm py-1 px-2 rounded"
            >
              <span className="text-[var(--color-foreground)]">
                {i + 1}. {s.name} ({s.id})
              </span>
              <span className="text-[var(--color-muted,var(--color-foreground))]/60 tabular-nums">
                {s.distance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </details>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Use these translations
        </button>
        <button
          onClick={onRetake}
          className="flex-1 px-6 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] font-medium hover:bg-[var(--color-border)]/20 transition-colors"
        >
          Retake quiz
        </button>
      </div>
    </div>
  );
}
