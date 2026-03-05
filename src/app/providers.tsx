"use client";

import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { initNative } from "@/lib/native/init";
import { useSyncEffect } from "@/hooks/useSync";
import WelcomeScreen from "@/components/ui/WelcomeScreen";

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

  // Auth/sync listener - runs globally so auth state resolves on every page
  useSyncEffect();

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

function WelcomeGate({ children }: { children: React.ReactNode }) {
  const hasSeenWelcome = useSettingsStore((s) => s.hasSeenWelcome);

  // Allow public pages through without the welcome screen
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (["/privacy", "/terms", "/support", "/delete-account"].includes(path)) {
      return <>{children}</>;
    }
  }

  if (!hasSeenWelcome) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGuard>
      <ThemeProvider>
        <WelcomeGate>{children}</WelcomeGate>
      </ThemeProvider>
    </HydrationGuard>
  );
}
