import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;

interface AudioState {
  /** Whether audio mode is enabled (persisted preference). */
  audioMode: boolean;
  /** Whether TTS is actively reading aloud. */
  isPlaying: boolean;
  /** 1-based verse number currently being read. */
  currentVerseIndex: number;
  /** Whether the mic is active for voice commands in audio mode. */
  isListening: boolean;
  /** TTS playback speed. */
  playbackSpeed: PlaybackSpeed;
  /** Total number of verses in the current chapter. */
  totalVerses: number;

  // Actions
  toggleAudioMode: () => void;
  setAudioMode: (on: boolean) => void;
  play: () => void;
  pause: () => void;
  setCurrentVerse: (verse: number) => void;
  setIsListening: (listening: boolean) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setTotalVerses: (total: number) => void;
  nextVerse: () => void;
  prevVerse: () => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      audioMode: false,
      isPlaying: false,
      currentVerseIndex: 1,
      isListening: false,
      playbackSpeed: 1,
      totalVerses: 0,

      toggleAudioMode: () => {
        const current = get().audioMode;
        if (current) {
          // Turning off — reset playback state
          set({
            audioMode: false,
            isPlaying: false,
            currentVerseIndex: 1,
            isListening: false,
          });
        } else {
          set({ audioMode: true, currentVerseIndex: 1, isPlaying: true, isListening: true });
        }
      },

      setAudioMode: (on) => {
        if (!on) {
          set({
            audioMode: false,
            isPlaying: false,
            currentVerseIndex: 1,
            isListening: false,
          });
        } else {
          set({ audioMode: true, currentVerseIndex: 1, isPlaying: true, isListening: true });
        }
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),

      setCurrentVerse: (verse) => set({ currentVerseIndex: verse }),

      setIsListening: (listening) => set({ isListening: listening }),

      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      setTotalVerses: (total) => set({ totalVerses: total }),

      nextVerse: () => {
        const { currentVerseIndex, totalVerses } = get();
        if (currentVerseIndex < totalVerses) {
          set({ currentVerseIndex: currentVerseIndex + 1 });
        }
      },

      prevVerse: () => {
        const { currentVerseIndex } = get();
        if (currentVerseIndex > 1) {
          set({ currentVerseIndex: currentVerseIndex - 1 });
        }
      },

      reset: () =>
        set({
          isPlaying: false,
          currentVerseIndex: 1,
          isListening: false,
        }),
    }),
    {
      name: "audio-mode-storage",
      partialize: (state) => ({
        audioMode: state.audioMode,
        playbackSpeed: state.playbackSpeed,
      }),
    },
  ),
);
