import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Translation } from "@/lib/bible/types";

interface TranslationState {
  primaryTranslation: string;
  parallelTranslations: string[];
  availableTranslations: Translation[];
  setPrimary: (id: string) => void;
  setParallel: (ids: string[]) => void;
  addParallel: (id: string) => void;
  removeParallel: (id: string) => void;
  setAvailableTranslations: (translations: Translation[]) => void;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      primaryTranslation: "BSB",
      parallelTranslations: ["bolls:NIV", "bolls:ESV", "eng_kjv"],
      availableTranslations: [],

      setPrimary: (id) => set({ primaryTranslation: id }),

      setParallel: (ids) => set({ parallelTranslations: ids }),

      addParallel: (id) =>
        set((state) => {
          if (state.parallelTranslations.includes(id)) return state;
          return { parallelTranslations: [...state.parallelTranslations, id] };
        }),

      removeParallel: (id) =>
        set((state) => ({
          parallelTranslations: state.parallelTranslations.filter((t) => t !== id),
        })),

      setAvailableTranslations: (translations) =>
        set({ availableTranslations: translations }),
    }),
    {
      name: "translation-storage",
      partialize: (state) => ({
        primaryTranslation: state.primaryTranslation,
        parallelTranslations: state.parallelTranslations,
      }),
    }
  )
);
