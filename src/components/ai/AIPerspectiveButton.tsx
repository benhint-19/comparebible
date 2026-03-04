"use client";

// ---------------------------------------------------------------------------
// AIPerspectiveButton -- opens the AI panel from the chapter view
// ---------------------------------------------------------------------------

import { useAIStore } from "@/store/aiStore";

interface AIPerspectiveButtonProps {
  passage: string;
  verseText: string;
}

export default function AIPerspectiveButton({
  passage,
  verseText,
}: AIPerspectiveButtonProps) {
  const togglePanel = useAIStore((s) => s.togglePanel);
  const setPassage = useAIStore((s) => s.setCurrentPassage);

  const handleClick = () => {
    setPassage(passage, verseText);
    togglePanel();
  };

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center gap-2 rounded-lg
        bg-[var(--accent)] text-[var(--accent-foreground)]
        px-4 py-2 text-sm font-medium
        hover:opacity-90 transition-opacity cursor-pointer
        shadow-sm
      "
      aria-label="Open AI Perspectives"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
      </svg>
      AI Perspectives
    </button>
  );
}
