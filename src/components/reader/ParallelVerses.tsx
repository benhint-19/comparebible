"use client";

import { useState, useEffect } from "react";
import { useTranslationStore } from "@/store/translationStore";
import { fetchVerseRange } from "@/lib/bible/api";
import type { VerseRange } from "@/lib/bible/types";

interface ParallelVersesProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
}

export default function ParallelVerses({
  bookId,
  chapter,
  verseNumber,
}: ParallelVersesProps) {
  const parallelTranslations = useTranslationStore(
    (s) => s.parallelTranslations,
  );
  const [results, setResults] = useState<VerseRange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parallelTranslations.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      parallelTranslations.map((tid) =>
        fetchVerseRange(tid, bookId, chapter, verseNumber, verseNumber).catch(
          () => null,
        ),
      ),
    ).then((ranges) => {
      if (cancelled) return;
      setResults(ranges.filter((r): r is VerseRange => r !== null));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [parallelTranslations, bookId, chapter, verseNumber]);

  if (parallelTranslations.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] italic py-2 pl-6">
        No parallel translations selected.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 pl-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <span className="text-sm text-[var(--muted-foreground)]">
          Loading translations...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2 pl-4 sm:pl-6">
      {results.map((range) => {
        const verseText =
          range.verses.length > 0
            ? range.verses.map((v) => v.text).join(" ")
            : "Verse not available";

        return (
          <div
            key={range.translationId}
            className="rounded-lg border-l-3 border-[var(--accent)] bg-[var(--muted)] px-3 py-2 sm:px-4 sm:py-3"
          >
            <span className="mr-2 inline-block rounded bg-[var(--accent)] px-1.5 py-0.5 text-xs font-semibold text-[var(--accent-foreground)]">
              {range.translationId}
            </span>
            <span className="text-sm leading-relaxed text-[var(--foreground)]">
              {verseText}
            </span>
          </div>
        );
      })}
    </div>
  );
}
