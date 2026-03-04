"use client";

import { useMemo } from "react";
import { useReaderStore } from "@/store/readerStore";
import { useNotesStore } from "@/store/notesStore";
import { useAudioStore } from "@/store/audioStore";
import type { ChapterVerse, VerseContentItem } from "@/lib/bible/types";
import ParallelVerses from "@/components/reader/ParallelVerses";
import VerseNote from "@/components/reader/VerseNote";

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
  const hasNote = useNotesStore((s) => s.hasNote(bookId, chapter, verseNumber));

  const audioMode = useAudioStore((s) => s.audioMode);
  const isActiveVerse = useAudioStore(
    (s) => s.audioMode && s.currentVerseIndex === verseNumber,
  );

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
    <div
      className={`group transition-all duration-300 ${
        isActiveVerse
          ? "border-l-3 border-[var(--color-accent)] bg-[var(--color-accent)]/8 rounded-r-lg -ml-1 pl-1"
          : ""
      }`}
      data-verse={verseNumber}
    >
      <p
        onClick={() => toggleVerseExpanded(verseNumber)}
        className={`cursor-pointer rounded px-1 py-0.5 leading-relaxed transition-colors sm:px-2 sm:py-1 ${
          isActiveVerse
            ? "hover:bg-[var(--color-accent)]/12"
            : "hover:bg-[var(--muted)]"
        }`}
      >
        <sup className="mr-1 text-xs font-semibold text-[var(--accent)] select-none">
          {verseNumber}
          {hasNote && (
            <span
              className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500/80 align-super"
              title="Has note"
            />
          )}
        </sup>
        {verse.content.map(renderContentItem)}
      </p>

      <div className={`verse-content ${isExpanded ? "verse-expanded" : ""}`}>
        <div>
          {isExpanded && (
            <>
              <ParallelVerses
                bookId={bookId}
                chapter={chapter}
                verseNumber={verseNumber}
                verseText={plainText}
              />
              <VerseNote
                bookId={bookId}
                chapter={chapter}
                verseNumber={verseNumber}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
