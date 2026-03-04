"use client";

import { useState } from "react";
import Link from "next/link";
import { useReaderStore } from "@/store/readerStore";
import { useAudioStore } from "@/store/audioStore";
import { getBookById } from "@/lib/bible/books";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BookPicker from "@/components/reader/BookPicker";
import TestamentSwitcher from "@/components/reader/TestamentSwitcher";
import { AudioModeSheet } from "@/components/voice/AudioModeSheet";

export default function AppHeader() {
  const currentBook = useReaderStore((s) => s.currentBook);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const audioMode = useAudioStore((s) => s.audioMode);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const [showAudioSheet, setShowAudioSheet] = useState(false);

  const book = getBookById(currentBook);
  const displayName = book ? `${book.name} ${currentChapter}` : `${currentBook} ${currentChapter}`;

  function handleAudioTap() {
    if (audioMode) {
      // Toggle play/pause when already in audio mode
      if (isPlaying) {
        useAudioStore.getState().pause();
      } else {
        useAudioStore.getState().play();
      }
    } else {
      setShowAudioSheet(true);
    }
  }

  return (
    <>
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
            <button
              onClick={handleAudioTap}
              className={`p-2 rounded-lg transition-colors ${
                audioMode
                  ? isPlaying
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-amber-600 bg-amber-600/10"
                  : "hover:bg-[var(--color-muted)]"
              }`}
              aria-label={
                audioMode
                  ? isPlaying
                    ? "Pause audio"
                    : "Resume audio"
                  : "Audio mode"
              }
            >
              {audioMode && isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                </svg>
              )}
            </button>
            <Link
              href="/notes"
              className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors hidden sm:block"
              aria-label="Notes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
              </svg>
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <TestamentSwitcher />
      </header>

      {showAudioSheet && (
        <AudioModeSheet onClose={() => setShowAudioSheet(false)} />
      )}
    </>
  );
}
