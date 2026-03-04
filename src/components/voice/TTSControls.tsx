"use client";

import { useTTS } from "@/hooks/useTTS";
import { useVoiceStore } from "@/store/voiceStore";

export function TTSControls() {
  const { isSpeaking: localSpeaking } = useVoiceStore();
  const { stop, pause, resume, isSpeaking, isSupported } = useTTS();

  // Only render when TTS is active
  if (!isSupported || (!isSpeaking && !localSpeaking)) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full bg-indigo-900/90 px-5 py-2 text-white shadow-lg backdrop-blur-sm">
        {/* Pause / Resume */}
        <button
          onClick={() => (isSpeaking ? pause() : resume())}
          aria-label={isSpeaking ? "Pause reading" : "Resume reading"}
          className="rounded-full p-2 transition-colors hover:bg-white/10"
        >
          {isSpeaking ? (
            /* Pause icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" />
            </svg>
          ) : (
            /* Play icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
          )}
        </button>

        <span className="text-sm font-medium">Reading aloud</span>

        {/* Stop */}
        <button
          onClick={stop}
          aria-label="Stop reading"
          className="rounded-full p-2 transition-colors hover:bg-white/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6 6h12v12H6V6Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
