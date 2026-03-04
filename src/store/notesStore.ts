import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VerseNote {
  id: string;
  bookId: string;
  chapter: number;
  verseNumber: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}

/** Canonical key for a single verse: "bookId:chapter:verse" */
function verseKey(bookId: string, chapter: number, verse: number): string {
  return `${bookId}:${chapter}:${verse}`;
}

/** Canonical prefix for all verses in a chapter: "bookId:chapter:" */
function chapterPrefix(bookId: string, chapter: number): string {
  return `${bookId}:${chapter}:`;
}

interface NotesState {
  /** Map of verseKey -> VerseNote */
  notes: Record<string, VerseNote>;

  addNote: (
    bookId: string,
    chapter: number,
    verseNumber: number,
    text: string,
  ) => void;

  updateNote: (
    bookId: string,
    chapter: number,
    verseNumber: number,
    text: string,
  ) => void;

  deleteNote: (
    bookId: string,
    chapter: number,
    verseNumber: number,
  ) => void;

  getNotesForVerse: (
    bookId: string,
    chapter: number,
    verseNumber: number,
  ) => VerseNote | undefined;

  getNotesForChapter: (
    bookId: string,
    chapter: number,
  ) => VerseNote[];

  hasNote: (
    bookId: string,
    chapter: number,
    verseNumber: number,
  ) => boolean;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},

      addNote: (bookId, chapter, verseNumber, text) => {
        const key = verseKey(bookId, chapter, verseNumber);
        const now = Date.now();
        set((state) => ({
          notes: {
            ...state.notes,
            [key]: {
              id: key,
              bookId,
              chapter,
              verseNumber,
              text,
              createdAt: now,
              updatedAt: now,
            },
          },
        }));
      },

      updateNote: (bookId, chapter, verseNumber, text) => {
        const key = verseKey(bookId, chapter, verseNumber);
        set((state) => {
          const existing = state.notes[key];
          if (!existing) return state;
          return {
            notes: {
              ...state.notes,
              [key]: {
                ...existing,
                text,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      deleteNote: (bookId, chapter, verseNumber) => {
        const key = verseKey(bookId, chapter, verseNumber);
        set((state) => {
          const { [key]: _, ...rest } = state.notes;
          return { notes: rest };
        });
      },

      getNotesForVerse: (bookId, chapter, verseNumber) => {
        const key = verseKey(bookId, chapter, verseNumber);
        return get().notes[key];
      },

      getNotesForChapter: (bookId, chapter) => {
        const prefix = chapterPrefix(bookId, chapter);
        return Object.entries(get().notes)
          .filter(([k]) => k.startsWith(prefix))
          .map(([, v]) => v);
      },

      hasNote: (bookId, chapter, verseNumber) => {
        const key = verseKey(bookId, chapter, verseNumber);
        return key in get().notes;
      },
    }),
    {
      name: "notes-storage",
    },
  ),
);
