import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReaderState {
  currentBook: string;
  currentChapter: number;
  expandedVerses: Set<number>;
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  navigateTo: (book: string, chapter: number) => void;
  toggleVerseExpanded: (verse: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      currentBook: "JHN",
      currentChapter: 1,
      expandedVerses: new Set<number>(),

      setBook: (book) =>
        set({ currentBook: book, currentChapter: 1, expandedVerses: new Set() }),

      setChapter: (chapter) =>
        set({ currentChapter: chapter, expandedVerses: new Set() }),

      navigateTo: (book, chapter) =>
        set({ currentBook: book, currentChapter: chapter, expandedVerses: new Set() }),

      toggleVerseExpanded: (verse) =>
        set((state) => {
          const next = new Set(state.expandedVerses);
          if (next.has(verse)) {
            next.delete(verse);
          } else {
            next.add(verse);
          }
          return { expandedVerses: next };
        }),

      nextChapter: () =>
        set((state) => ({
          currentChapter: state.currentChapter + 1,
          expandedVerses: new Set(),
        })),

      prevChapter: () =>
        set((state) => ({
          currentChapter: Math.max(1, state.currentChapter - 1),
          expandedVerses: new Set(),
        })),
    }),
    {
      name: "reader-storage",
      partialize: (state) => ({
        currentBook: state.currentBook,
        currentChapter: state.currentChapter,
      }),
    }
  )
);
