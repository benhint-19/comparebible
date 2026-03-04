"use client";

import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { initNative } from "@/lib/native/init";

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

/**
 * HydrationGuard prevents rendering children until the client has mounted,
 * avoiding hydration mismatches from Zustand persist stores reading localStorage.
 */
function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const nativeInitRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (!nativeInitRef.current) {
      nativeInitRef.current = true;
      initNative();
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGuard>
      <ThemeProvider>{children}</ThemeProvider>
    </HydrationGuard>
  );
}
