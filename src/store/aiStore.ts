import { create } from "zustand";

interface AIState {
  selectedPersona: string | null;
  responses: Record<string, string>;
  isLoading: boolean;
  isPanelOpen: boolean;
  currentPassage: string | null;
  currentVerseText: string | null;
  setPersona: (persona: string | null) => void;
  setResponse: (key: string, response: string) => void;
  setLoading: (loading: boolean) => void;
  togglePanel: () => void;
  setCurrentPassage: (passage: string, verseText: string) => void;
}

export const useAIStore = create<AIState>()((set) => ({
  selectedPersona: null,
  responses: {},
  isLoading: false,
  isPanelOpen: false,
  currentPassage: null,
  currentVerseText: null,

  setPersona: (persona) => set({ selectedPersona: persona }),

  setResponse: (key, response) =>
    set((state) => ({
      responses: { ...state.responses, [key]: response },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setCurrentPassage: (passage, verseText) =>
    set({ currentPassage: passage, currentVerseText: verseText }),
}));
