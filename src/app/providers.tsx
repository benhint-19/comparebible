"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(resolved: "light" | "dark") {
      root.setAttribute("data-theme", resolved);
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches ? "dark" : "light");

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
