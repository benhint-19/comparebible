"use client";

import { useState, useRef, useCallback } from "react";
import { useAudioStore } from "@/store/audioStore";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

export function VoiceFab() {
  const audioMode = useAudioStore((s) => s.audioMode);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const audioIsListening = useAudioStore((s) => s.isListening);

  const {
    startListening,
    stopListening,
    isListening: micListening,
    isSupported,
    unsupportedReason,
  } = useVoiceCommands();

  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleTap = useCallback(() => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    if (!audioMode) {
      // When audio mode is OFF, tap enters audio mode
      if (!isSupported) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
        return;
      }
      useAudioStore.getState().setAudioMode(true);
    } else {
      // When audio mode is ON, tap toggles play/pause
      if (isPlaying) {
        useAudioStore.getState().pause();
      } else {
        useAudioStore.getState().play();
      }
    }
  }, [audioMode, isPlaying, isSupported]);

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    if (!audioMode) return; // long-press only meaningful in audio mode
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      // Toggle mic listening
      const store = useAudioStore.getState();
      store.setIsListening(!store.isListening);
    }, 500);
  }, [audioMode]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Decide icon and styling
  const isActive = audioMode;
  const showMicIndicator = audioMode && audioIsListening;

  return (
    <div className={`fixed right-6 z-50 transition-all duration-200 ${audioMode ? "bottom-20" : "bottom-6"}`}>
      {/* Tooltip for unsupported platforms */}
      {showTooltip && unsupportedReason && (
        <div className="absolute bottom-16 right-0 w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
          {unsupportedReason}
          <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-gray-900" />
        </div>
      )}

      <button
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label={
          !isSupported
            ? "Audio mode not supported"
            : !audioMode
              ? "Start audio mode"
              : isPlaying
                ? "Pause reading"
                : "Resume reading"
        }
        className={`
          relative flex h-14 w-14 items-center justify-center
          rounded-full shadow-lg transition-all duration-200
          ${
            !isSupported
              ? "bg-gray-400 text-white/70"
              : isActive
                ? isPlaying
                  ? "bg-amber-500 text-white ring-2 ring-amber-300/50"
                  : "bg-amber-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
          }
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
        `}
      >
        {/* Pulsing ring when playing */}
        {isActive && isPlaying && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
        )}

        {/* Icon: headphones when OFF, play/pause when ON */}
        {!audioMode ? (
          // Headphones icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative z-10 h-6 w-6"
          >
            <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5v-2a7 7 0 0 1 14 0v2h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9Z" />
          </svg>
        ) : isPlaying ? (
          // Pause icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative z-10 h-6 w-6"
          >
            <path d="M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" />
          </svg>
        ) : (
          // Play icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative z-10 h-6 w-6"
          >
            <path d="M8 5v14l11-7L8 5Z" />
          </svg>
        )}

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

        {/* Mic indicator dot */}
        {showMicIndicator && (
          <span className="absolute -top-0.5 -right-0.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-2.5 w-2.5 text-white"
            >
              <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            </svg>
          </span>
        )}
      </button>
    </div>
  );
}
