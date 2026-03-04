"use client";

import Link from "next/link";
import QuizWizard from "@/components/quiz/QuizWizard";

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4">
        <Link
          href="/"
          className="text-sm text-[var(--color-foreground)] hover:text-[var(--color-accent)] transition-colors"
        >
          &larr; Back to reader
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
            Find Your Bible Translation
          </h1>
          <p className="text-sm text-[var(--color-muted,var(--color-foreground))]/60">
            Answer a few questions about your reading style, theological interests, and study
            goals. We will recommend the best translations for you.
          </p>
        </div>

        {/* Quiz */}
        <QuizWizard />
      </main>
    </div>
  );
}
