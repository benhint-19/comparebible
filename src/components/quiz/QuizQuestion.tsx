"use client";

import type { QuizQuestion as QuizQuestionType } from "@/lib/quiz/questions";
import Tooltip from "@/components/ui/Tooltip";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedOption: number | undefined;
  onSelect: (index: number) => void;
}

export default function QuizQuestion({ question, selectedOption, onSelect }: QuizQuestionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
        {question.questionTooltip ? (
          <Tooltip text={question.questionTooltip}>
            {question.text}
          </Tooltip>
        ) : (
          question.text
        )}
      </h2>

      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface,var(--color-background))] text-[var(--color-foreground)] hover:border-[var(--color-accent)]/50"
              }`}
              aria-pressed={isSelected}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm">
                  {option.tooltip ? (
                    <Tooltip text={option.tooltip}>
                      {option.label}
                    </Tooltip>
                  ) : (
                    option.label
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
