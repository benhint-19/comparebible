"use client";

import { useMemo } from "react";
import { useReaderStore } from "@/store/readerStore";
import type { ChapterVerse, VerseContentItem } from "@/lib/bible/types";
import ParallelVerses from "@/components/reader/ParallelVerses";

interface VerseBlockProps {
  verse: ChapterVerse;
  verseNumber: number;
  bookId: string;
  chapter: number;
}

function renderContentItem(item: VerseContentItem, index: number) {
  if (typeof item === "string") {
    return <span key={index}>{item}</span>;
  }
  if ("text" in item) {
    return <span key={index}>{item.text}</span>;
  }
  // VerseNoteRef -- skip
  return null;
}

export default function VerseBlock({
  verse,
  verseNumber,
  bookId,
  chapter,
}: VerseBlockProps) {
  const toggleVerseExpanded = useReaderStore((s) => s.toggleVerseExpanded);
  const isExpanded = useReaderStore((s) => s.expandedVerses.has(verseNumber));

  const plainText = useMemo(() => {
    return verse.content
      .map((item) => {
        if (typeof item === "string") return item;
        if ("text" in item) return item.text;
        return "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }, [verse.content]);

  return (
    <div className="group">
      <p
        onClick={() => toggleVerseExpanded(verseNumber)}
        className="cursor-pointer rounded px-1 py-0.5 leading-relaxed transition-colors hover:bg-[var(--muted)] sm:px-2 sm:py-1"
      >
        <sup className="mr-1 text-xs font-semibold text-[var(--accent)] select-none">
          {verseNumber}
        </sup>
        {verse.content.map(renderContentItem)}
      </p>

      <div className={`verse-content ${isExpanded ? "verse-expanded" : ""}`}>
        <div>
          {isExpanded && (
            <ParallelVerses
              bookId={bookId}
              chapter={chapter}
              verseNumber={verseNumber}
              verseText={plainText}
            />
          )}
        </div>
      </div>
    </div>
  );
}
