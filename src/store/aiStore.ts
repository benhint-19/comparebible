import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultPersonaIds } from "@/lib/ai/personas";

interface AIState {
  selectedPersona: string | null;
  responses: Record<string, string>;
  isLoading: boolean;
  isPanelOpen: boolean;
  currentPassage: string | null;
  currentVerseText: string | null;
  selectedPersonas: string[];
  setPersona: (persona: string | null) => void;
  setResponse: (key: string, response: string) => void;
  setLoading: (loading: boolean) => void;
  togglePanel: () => void;
  setCurrentPassage: (passage: string, verseText: string) => void;
  setSelectedPersonas: (ids: string[]) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      selectedPersona: null,
      responses: {},
      isLoading: false,
      isPanelOpen: false,
      currentPassage: null,
      currentVerseText: null,
      selectedPersonas: defaultPersonaIds,

      setPersona: (persona) => set({ selectedPersona: persona }),

      setResponse: (key, response) =>
        set((state) => ({
          responses: { ...state.responses, [key]: response },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

      setCurrentPassage: (passage, verseText) =>
        set({ currentPassage: passage, currentVerseText: verseText }),

      setSelectedPersonas: (ids) => set({ selectedPersonas: ids }),
    }),
    {
      name: "ai-storage",
      partialize: (state) => ({ selectedPersonas: state.selectedPersonas }),
    },
  ),
);
