"use client";

import { useReaderStore } from "@/store/readerStore";
import { getBookById } from "@/lib/bible/books";

export default function TestamentSwitcher() {
  const currentBook = useReaderStore((s) => s.currentBook);
  const navigateTo = useReaderStore((s) => s.navigateTo);

  const book = getBookById(currentBook);
  const currentTestament = book?.testament ?? "NT";

  return (
    <div className="flex items-center justify-center gap-1 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="inline-flex rounded-full bg-[var(--color-muted)] p-0.5">
        <button
          onClick={() => navigateTo("GEN", 1)}
          className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
            currentTestament === "OT"
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          }`}
        >
          OT
        </button>
        <button
          onClick={() => navigateTo("MAT", 1)}
          className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
            currentTestament === "NT"
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          }`}
        >
          NT
        </button>
      </div>
    </div>
  );
}
