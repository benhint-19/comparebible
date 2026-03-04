"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useReaderStore } from "@/store/readerStore";
import { useTranslationStore } from "@/store/translationStore";
import { getVerseOfDay } from "@/lib/bible/verseOfDay";
import { fetchChapter, extractSimpleVerses } from "@/lib/bible/api";

export default function VerseOfDay() {
  const quizCompleted = useSettingsStore((s) => s.quizCompleted);
  const navigateTo = useReaderStore((s) => s.navigateTo);
  const toggleVerseExpanded = useReaderStore((s) => s.toggleVerseExpanded);
  const primaryTranslation = useTranslationStore((s) => s.primaryTranslation);

  const [dismissed, setDismissed] = useState(true);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const votd = getVerseOfDay();

  useEffect(() => {
    if (!quizCompleted) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem("votd-last-shown");
    if (lastShown === today) return;

    // Show the modal and mark today
    setDismissed(false);
    localStorage.setItem("votd-last-shown", today);
  }, [quizCompleted]);

  useEffect(() => {
    if (dismissed) return;

    let cancelled = false;
    setLoading(true);

    fetchChapter(primaryTranslation, votd.bookId, votd.chapter)
      .then((chapter) => {
        if (cancelled) return;
        const verses = extractSimpleVerses(chapter);
        const match = verses.find((v) => v.number === votd.verse);
        setVerseText(match?.text ?? "Verse not available.");
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setVerseText("Unable to load verse.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dismissed, primaryTranslation, votd.bookId, votd.chapter, votd.verse]);

  if (dismissed || !quizCompleted) return null;

  const handleDigDeeper = () => {
    navigateTo(votd.bookId, votd.chapter);
    // Small delay so chapter loads, then expand the verse
    setTimeout(() => {
      toggleVerseExpanded(votd.verse);
    }, 100);
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setDismissed(true)}
      />

      {/* card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--color-background)] p-6 shadow-2xl border border-[var(--muted)]">
        {/* close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-1">
          Verse of the Day
        </p>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          {votd.reference}
        </h2>

        {/* verse text */}
        <div className="mb-6 min-h-[3rem]">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <span className="text-sm text-[var(--muted-foreground)]">
                Loading...
              </span>
            </div>
          ) : (
            <p className="text-base leading-relaxed text-[var(--foreground)] font-serif italic">
              &ldquo;{verseText}&rdquo;
            </p>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDigDeeper}
            className="flex-1 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Dig Deeper &rarr;
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg border border-[var(--muted)] px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
