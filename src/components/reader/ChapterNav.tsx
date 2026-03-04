"use client";

import { useReaderStore } from "@/store/readerStore";
import { getBookById } from "@/lib/bible/books";

export default function ChapterNav() {
  const currentBook = useReaderStore((s) => s.currentBook);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const nextChapter = useReaderStore((s) => s.nextChapter);
  const prevChapter = useReaderStore((s) => s.prevChapter);

  const book = getBookById(currentBook);
  const totalChapters = book?.chapters ?? 1;

  const isFirst = currentChapter <= 1;
  const isLast = currentChapter >= totalChapters;

  return (
    <nav className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 md:py-4">
      <button
        onClick={prevChapter}
        disabled={isFirst}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] disabled:opacity-30 disabled:pointer-events-none"
      >
        <span aria-hidden="true">&larr;</span> Previous
      </button>

      <span className="text-xs text-[var(--color-muted-foreground)]">
        {currentChapter} / {totalChapters}
      </span>

      <button
        onClick={nextChapter}
        disabled={isLast}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] disabled:opacity-30 disabled:pointer-events-none"
      >
        Next <span aria-hidden="true">&rarr;</span>
      </button>
    </nav>
  );
}
