import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  fontSize: number;
  quizCompleted: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setFontSize: (size: number) => void;
  setQuizCompleted: (completed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      fontSize: 16,
      quizCompleted: false,

      setTheme: (theme) => set({ theme }),

      setFontSize: (size) => set({ fontSize: size }),

      setQuizCompleted: (completed) => set({ quizCompleted: completed }),
    }),
    {
      name: "settings-storage",
    }
  )
);
