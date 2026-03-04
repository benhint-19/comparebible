import { create } from "zustand";

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setTranscript: (transcript: string) => void;
}

export const useVoiceStore = create<VoiceState>()((set) => ({
  isListening: false,
  isSpeaking: false,
  transcript: "",

  setListening: (listening) => set({ isListening: listening }),

  setSpeaking: (speaking) => set({ isSpeaking: speaking }),

  setTranscript: (transcript) => set({ transcript }),
}));
