"use client";

import { useState, useEffect } from "react";
import { useReaderStore } from "@/store/readerStore";
import { useTranslationStore } from "@/store/translationStore";
import { fetchChapter } from "@/lib/bible/api";
import { getBookById } from "@/lib/bible/books";
import type { ChapterResponse, ChapterElement } from "@/lib/bible/types";
import VerseBlock from "@/components/reader/VerseBlock";
import AIPerspectiveButton from "@/components/ai/AIPerspectiveButton";
import { extractSimpleVerses } from "@/lib/bible/api";

export default function ChapterView() {
  const currentBook = useReaderStore((s) => s.currentBook);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const primaryTranslation = useTranslationStore((s) => s.primaryTranslation);

  const [chapterData, setChapterData] = useState<ChapterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookMeta = getBookById(currentBook);
  const bookName = bookMeta?.name ?? currentBook;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchChapter(primaryTranslation, currentBook, currentChapter)
      .then((data) => {
        if (!cancelled) {
          setChapterData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load chapter");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [primaryTranslation, currentBook, currentChapter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent)] border-t-transparent" />
          <span className="text-sm text-[var(--muted-foreground)]">
            Loading {bookName} {currentChapter}...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-6 py-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!chapterData) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {bookName} {currentChapter}
      </h1>

      <div className="space-y-1">
        {chapterData.chapter.map((element: ChapterElement, index: number) => {
          switch (element.type) {
            case "heading":
              return (
                <h2
                  key={`heading-${index}`}
                  className="mt-6 mb-2 text-lg font-semibold text-[var(--foreground)] sm:text-xl"
                >
                  {element.content.join(" ")}
                </h2>
              );

            case "verse":
              return (
                <VerseBlock
                  key={`verse-${element.number}`}
                  verse={element}
                  verseNumber={element.number}
                  bookId={currentBook}
                  chapter={currentChapter}
                />
              );

            case "line_break":
              return (
                <div
                  key={`break-${index}`}
                  className="h-4"
                  aria-hidden="true"
                />
              );

            default:
              return null;
          }
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <AIPerspectiveButton
          passage={`${bookName} ${currentChapter}`}
          verseText={extractSimpleVerses(chapterData).map(v => `${v.number}. ${v.text}`).join('\n')}
        />
      </div>
    </div>
  );
}
