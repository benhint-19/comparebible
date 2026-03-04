"use client";

import { useAIStore } from "@/store/aiStore";
import { getBookById } from "@/lib/bible/books";

interface VerseAIButtonProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
}

export default function VerseAIButton({
  bookId,
  chapter,
  verseNumber,
  verseText,
}: VerseAIButtonProps) {
  const setCurrentPassage = useAIStore((s) => s.setCurrentPassage);
  const togglePanel = useAIStore((s) => s.togglePanel);
  const isPanelOpen = useAIStore((s) => s.isPanelOpen);

  const handleClick = () => {
    const bookMeta = getBookById(bookId);
    const bookName = bookMeta?.name ?? bookId;
    const passage = `${bookName} ${chapter}:${verseNumber}`;
    setCurrentPassage(passage, verseText);
    if (!isPanelOpen) {
      togglePanel();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center gap-1.5 rounded-md
        bg-[var(--muted)] text-[var(--muted-foreground)]
        px-2.5 py-1.5 text-xs font-medium
        hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]
        transition-colors cursor-pointer
        mt-1
      "
      aria-label="AI Analysis for this verse"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
      </svg>
      AI Analysis
    </button>
  );
}
