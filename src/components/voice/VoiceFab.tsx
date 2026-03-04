"use client";

import { useState } from "react";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

export function VoiceFab() {
  const {
    startListening,
    stopListening,
    isListening,
    isSupported,
    unsupportedReason,
  } = useVoiceCommands();

  const [showTooltip, setShowTooltip] = useState(false);

  const toggle = () => {
    if (!isSupported) {
      // Show a tooltip briefly explaining why it's not available
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip for unsupported platforms */}
      {showTooltip && unsupportedReason && (
        <div className="absolute bottom-16 right-0 w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
          {unsupportedReason}
          <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-gray-900" />
        </div>
      )}

      <button
        onClick={toggle}
        aria-label={
          !isSupported
            ? "Voice commands not supported"
            : isListening
              ? "Stop listening"
              : "Start voice command"
        }
        className={`
          relative flex h-14 w-14 items-center justify-center
          rounded-full shadow-lg transition-colors
          ${
            !isSupported
              ? "bg-gray-400 text-white/70"
              : isListening
                ? "bg-red-500 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
          }
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
        `}
      >
        {/* Pulsing ring when listening */}
        {isListening && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        )}

        {/* Microphone SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="relative z-10 h-6 w-6"
        >
          <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
          <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
        </svg>

        {/* Slash overlay when not supported */}
        {!isSupported && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="absolute z-20 h-8 w-8 opacity-60"
          >
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        )}
      </button>
    </div>
  );
}
