"use client";

import Link from "next/link";
import { useReaderStore } from "@/store/readerStore";
import { getBookById } from "@/lib/bible/books";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BookPicker from "@/components/reader/BookPicker";
import SearchBar from "@/components/search/SearchBar";

export default function AppHeader() {
  const currentBook = useReaderStore((s) => s.currentBook);
  const currentChapter = useReaderStore((s) => s.currentChapter);

  const book = getBookById(currentBook);
  const displayName = book ? `${book.name} ${currentChapter}` : `${currentBook} ${currentChapter}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-4">
        {/* Left: BookPicker trigger */}
        <div className="flex items-center min-w-0">
          <BookPicker />
        </div>

        {/* Center: Current book + chapter */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base md:text-lg font-semibold text-[var(--color-foreground)] truncate max-w-[50%] text-center pointer-events-none">
          {displayName}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <Link
            href="/quiz"
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors hidden sm:block"
            aria-label="Translation Quiz"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
