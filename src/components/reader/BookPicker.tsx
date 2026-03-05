"use client";

import { useState, useCallback, useEffect } from "react";
import { getBookById, getTestamentBooks } from "@/lib/bible/books";
import type { Testament } from "@/lib/bible/books";
import { useReaderStore } from "@/store/readerStore";

export default function BookPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestament, setSelectedTestament] = useState<Testament>("NT");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [step, setStep] = useState<"books" | "chapters">("books");

  const { currentBook, currentChapter, navigateTo } = useReaderStore();
  const currentBookMeta = getBookById(currentBook);

  const open = useCallback(() => {
    const meta = getBookById(currentBook);
    if (meta) setSelectedTestament(meta.testament);
    setSelectedBook(null);
    setStep("books");
    setIsOpen(true);
  }, [currentBook]);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleBookClick = (bookId: string) => {
    const meta = getBookById(bookId);
    if (meta && meta.chapters === 1) {
      navigateTo(bookId, 1);
      close();
      return;
    }
    setSelectedBook(bookId);
    setStep("chapters");
  };

  const handleChapterClick = (chapter: number) => {
    if (selectedBook) {
      navigateTo(selectedBook, chapter);
      close();
    }
  };

  const selectedBookMeta = selectedBook ? getBookById(selectedBook) : null;
  const testamentBooks = getTestamentBooks(selectedTestament);

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--color-border)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        {currentBookMeta?.name ?? currentBook} {currentChapter}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50" onClick={close}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                {step === "chapters" && (
                  <button
                    onClick={() => { setSelectedBook(null); setStep("books"); }}
                    className="p-1 rounded-md hover:bg-[var(--color-muted)] transition-colors"
                    aria-label="Back to books"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="text-base font-semibold">
                  {step === "chapters" && selectedBookMeta ? selectedBookMeta.name : "Select Book"}
                </h2>
              </div>
              <button
                onClick={close}
                className="p-2 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-border)] transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {step === "books" && (
              <>
                <div className="flex shrink-0 border-b border-[var(--color-border)]">
                  {(["OT", "NT"] as Testament[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTestament(t)}
                      className="flex-1 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        borderBottom: selectedTestament === t ? "2px solid var(--accent)" : "2px solid transparent",
                        color: selectedTestament === t ? "var(--accent)" : "var(--muted-foreground)",
                      }}
                    >
                      {t === "OT" ? "Old Testament" : "New Testament"}
                    </button>
                  ))}
                </div>
                <div className="overflow-y-auto flex-1 p-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {testamentBooks.map((book) => {
                      const isCurrent = book.id === currentBook;
                      return (
                        <button
                          key={book.id}
                          onClick={() => handleBookClick(book.id)}
                          className={`px-2 py-2 rounded-lg text-xs sm:text-sm font-medium truncate transition-colors ${
                            isCurrent
                              ? "bg-[var(--color-accent)] text-white"
                              : "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]"
                          }`}
                          title={book.name}
                        >
                          {book.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {step === "chapters" && selectedBookMeta && (
              <div className="overflow-y-auto flex-1 p-3">
                <p className="text-xs mb-3 px-1 text-[var(--color-muted-foreground)]">
                  {selectedBookMeta.chapters} chapter{selectedBookMeta.chapters !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                  {Array.from({ length: selectedBookMeta.chapters }, (_, i) => i + 1).map((ch) => {
                    const isCurrent = selectedBook === currentBook && ch === currentChapter;
                    return (
                      <button
                        key={ch}
                        onClick={() => handleChapterClick(ch)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isCurrent
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
