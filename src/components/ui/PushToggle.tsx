"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { registerForPush, isPushSupported } from "@/lib/push/register";

/**
 * A simple toggle switch for enabling / disabling push notifications.
 */
export default function PushToggle() {
  const pushEnabled = useSettingsStore((s) => s.pushEnabled);
  const setPushEnabled = useSettingsStore((s) => s.setPushEnabled);
  const [registering, setRegistering] = useState(false);

  if (!isPushSupported()) return null;

  const handleToggle = async () => {
    if (pushEnabled) {
      // Disable
      setPushEnabled(false);
      return;
    }

    // Enable -- register for push
    setRegistering(true);
    try {
      const token = await registerForPush();
      if (token) {
        setPushEnabled(true);
      } else {
        // Permission was denied or registration failed
        console.warn("[PushToggle] Registration returned no token");
      }
    } catch (err) {
      console.error("[PushToggle] Registration error:", err);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Notifications
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {pushEnabled
            ? "Daily Verse of the Day"
            : "Get daily verse reminders"}
        </span>
      </div>

      <button
        role="switch"
        aria-checked={pushEnabled}
        disabled={registering}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${pushEnabled ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full
            bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out
            ${pushEnabled ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}
