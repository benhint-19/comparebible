"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/store/notesStore";
import { useReaderStore } from "@/store/readerStore";
import { getBookById } from "@/lib/bible/books";

export default function NotesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const getAllNotesSorted = useNotesStore((s) => s.getAllNotesSorted);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const navigateTo = useReaderStore((s) => s.navigateTo);

  const allNotes = getAllNotesSorted();

  const filtered = useMemo(() => {
    if (!search.trim()) return allNotes;
    const q = search.toLowerCase();
    return allNotes.filter((note) => {
      const book = getBookById(note.bookId);
      const ref = `${book?.name ?? note.bookId} ${note.chapter}:${note.verseNumber}`;
      return (
        note.text.toLowerCase().includes(q) || ref.toLowerCase().includes(q)
      );
    });
  }, [allNotes, search]);

  function formatRef(bookId: string, chapter: number, verse: number) {
    const book = getBookById(bookId);
    return `${book?.name ?? bookId} ${chapter}:${verse}`;
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleNoteClick(bookId: string, chapter: number) {
    navigateTo(bookId, chapter);
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4 pt-[env(safe-area-inset-top)]">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          aria-label="Back to reader"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-muted-foreground)] py-12">
            {allNotes.length === 0
              ? "No notes yet. Tap a verse and add a note to get started."
              : "No notes match your search."}
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 flex gap-3"
              >
                <button
                  onClick={() => handleNoteClick(note.bookId, note.chapter)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium text-[var(--color-accent)]">
                    {formatRef(note.bookId, note.chapter, note.verseNumber)}
                  </p>
                  <p className="text-sm text-[var(--color-foreground)] mt-0.5 line-clamp-2">
                    {note.text}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                    {formatDate(note.updatedAt)}
                  </p>
                </button>
                <button
                  onClick={() => deleteNote(note.bookId, note.chapter, note.verseNumber)}
                  className="self-start p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Delete note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
