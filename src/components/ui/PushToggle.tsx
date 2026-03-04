"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { registerForPush, isPushSupported } from "@/lib/push/register";

/** Hour options for the notification time picker (6 AM through 10 PM). */
const HOUR_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // 6..22
  const label =
    hour === 0
      ? "12 AM"
      : hour < 12
        ? `${hour} AM`
        : hour === 12
          ? "12 PM"
          : `${hour - 12} PM`;
  const value = `${String(hour).padStart(2, "0")}:00`;
  return { hour, label, value };
});

/**
 * A toggle switch for enabling / disabling push notifications,
 * with a time picker for choosing the daily notification hour.
 */
export default function PushToggle() {
  const pushEnabled = useSettingsStore((s) => s.pushEnabled);
  const setPushEnabled = useSettingsStore((s) => s.setPushEnabled);
  const pushTime = useSettingsStore((s) => s.pushTime);
  const setPushTime = useSettingsStore((s) => s.setPushTime);
  const [registering, setRegistering] = useState(false);

  if (!isPushSupported()) return null;

  /** Parse the stored "HH:00" string into an hour number. */
  const preferredHour = parseInt(pushTime, 10) || 8;

  const handleToggle = async () => {
    if (pushEnabled) {
      // Disable
      setPushEnabled(false);
      return;
    }

    // Enable -- register for push
    setRegistering(true);
    try {
      const token = await registerForPush(preferredHour);
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

  const handleTimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = e.target.value;
    const newHour = parseInt(newTime, 10) || 8;
    setPushTime(newTime);

    // Re-register with the updated preferred hour so the server knows
    if (pushEnabled) {
      try {
        await registerForPush(newHour);
      } catch (err) {
        console.error("[PushToggle] Re-registration error:", err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
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

      {pushEnabled && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--muted-foreground)]">
            Notification time
          </span>
          <select
            value={pushTime}
            onChange={handleTimeChange}
            className="
              rounded-md border border-[var(--border)] bg-[var(--background)]
              px-2 py-1 text-xs text-[var(--foreground)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
            "
          >
            {HOUR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
