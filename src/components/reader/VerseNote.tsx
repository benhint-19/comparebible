"use client";

import { useState, useCallback } from "react";
import { useNotesStore } from "@/store/notesStore";

interface VerseNoteProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
}

export default function VerseNote({
  bookId,
  chapter,
  verseNumber,
}: VerseNoteProps) {
  const note = useNotesStore((s) => s.getNotesForVerse(bookId, chapter, verseNumber));
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const handleStartAdd = useCallback(() => {
    setDraft("");
    setEditing(true);
  }, []);

  const handleStartEdit = useCallback(() => {
    setDraft(note?.text ?? "");
    setEditing(true);
  }, [note?.text]);

  const handleSave = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (note) {
      updateNote(bookId, chapter, verseNumber, trimmed);
    } else {
      addNote(bookId, chapter, verseNumber, trimmed);
    }
    setEditing(false);
  }, [draft, note, bookId, chapter, verseNumber, addNote, updateNote]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setDraft("");
  }, []);

  const handleDelete = useCallback(() => {
    deleteNote(bookId, chapter, verseNumber);
    setEditing(false);
    setDraft("");
  }, [bookId, chapter, verseNumber, deleteNote]);

  // Edit mode
  if (editing) {
    return (
      <div className="mt-2 pl-4 sm:pl-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
            {note ? "Edit note" : "Add note"}
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your note..."
            autoFocus
            rows={3}
            className="w-full resize-y rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSave();
              }
              if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="rounded bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="rounded px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">
              Ctrl+Enter to save
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Display existing note
  if (note) {
    return (
      <div className="mt-2 pl-4 sm:pl-6">
        <div className="rounded-lg border-l-3 border-amber-500/60 bg-[var(--muted)] px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-start justify-between gap-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
              {note.text}
            </p>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={handleStartEdit}
                className="rounded p-1 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                title="Edit note"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.84 9.686a2.25 2.25 0 0 0-.602 1.07l-.58 2.608a.75.75 0 0 0 .9.9l2.608-.579a2.25 2.25 0 0 0 1.07-.602l7.174-7.174a1.75 1.75 0 0 0 0-2.475L13.488 2.513Z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="rounded p-1 text-[var(--muted-foreground)] transition-colors hover:text-red-500"
                title="Delete note"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No note -- show add button
  return (
    <div className="mt-1 pl-4 sm:pl-6">
      <button
        onClick={handleStartAdd}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--accent)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3"
        >
          <path d="M8 1a.75.75 0 0 1 .75.75V7h5.25a.75.75 0 0 1 0 1.5H8.75v5.25a.75.75 0 0 1-1.5 0V8.5H2a.75.75 0 0 1 0-1.5h5.25V1.75A.75.75 0 0 1 8 1Z" />
        </svg>
        Add note
      </button>
    </div>
  );
}
