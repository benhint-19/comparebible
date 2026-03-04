"use client";

import { useState, useCallback } from "react";
import { quizQuestions } from "@/lib/quiz/questions";
import { scoreQuiz, type QuizResult } from "@/lib/quiz/scoring";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";

export default function QuizWizard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const total = quizQuestions.length;
  const question = quizQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const hasAnswer = question ? answers[question.id] !== undefined : false;

  const handleSelect = useCallback(
    (index: number) => {
      setAnswers((prev) => ({ ...prev, [question.id]: index }));
    },
    [question?.id],
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      const quizResult = scoreQuiz(answers);
      setResult(quizResult);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLast, answers]);

  const handleBack = useCallback(() => {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
    }
  }, [isFirst]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  }, []);

  // Show results
  if (result) {
    return <QuizResults result={result} onRetake={handleRetake} />;
  }

  // Show question
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
            {question.category}
          </span>
          <span className="text-xs text-[var(--color-muted,var(--color-foreground))]/60">
            {currentIndex + 1} of {total}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]">
          <div
            className="h-1.5 rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuizQuestion
        key={question.id}
        question={question}
        selectedOption={answers[question.id]}
        onSelect={handleSelect}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleBack}
          disabled={isFirst}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswer}
          className="px-6 py-2 text-sm rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:pointer-events-none"
        >
          {isLast ? "See Results" : "Next"}
        </button>
      </div>
    </div>
  );
}
