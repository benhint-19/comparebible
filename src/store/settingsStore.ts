import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  fontSize: number;
  quizCompleted: boolean;
  pushEnabled: boolean;
  pushTime: string;
  hasSeenWelcome: boolean;
  onboardingCompleted: boolean;
  neverShowOnboarding: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setFontSize: (size: number) => void;
  setQuizCompleted: (completed: boolean) => void;
  setPushEnabled: (enabled: boolean) => void;
  setPushTime: (time: string) => void;
  setHasSeenWelcome: (v: boolean) => void;
  setOnboardingCompleted: (v: boolean) => void;
  setNeverShowOnboarding: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      fontSize: 16,
      quizCompleted: false,
      pushEnabled: false,
      pushTime: "08:00",
      hasSeenWelcome: false,
      onboardingCompleted: false,
      neverShowOnboarding: false,

      setTheme: (theme) => set({ theme }),

      setFontSize: (size) => set({ fontSize: size }),

      setQuizCompleted: (completed) => set({ quizCompleted: completed }),

      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),

      setPushTime: (time) => set({ pushTime: time }),

      setHasSeenWelcome: (v) => set({ hasSeenWelcome: v }),

      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),

      setNeverShowOnboarding: (v) => set({ neverShowOnboarding: v }),
    }),
    {
      name: "settings-storage",
    }
  )
);
