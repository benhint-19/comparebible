"use client";

import { useVoiceCommands } from "@/hooks/useVoiceCommands";

export function VoiceFab() {
  const { startListening, stopListening, isListening, isSupported } =
    useVoiceCommands();

  if (!isSupported) return null;

  const toggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isListening ? "Stop listening" : "Start voice command"}
      className={`
        fixed bottom-6 right-6 z-50
        flex h-14 w-14 items-center justify-center
        rounded-full shadow-lg transition-colors
        ${
          isListening
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
    </button>
  );
}
