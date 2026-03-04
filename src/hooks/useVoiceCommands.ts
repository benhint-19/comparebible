"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useTTS } from "@/hooks/useTTS";
import { parseVoiceCommand, type VoiceCommand } from "@/lib/voice/commands";
import { useReaderStore } from "@/store/readerStore";
import type { ParsedBibleReference } from "@/lib/voice/references";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVoiceCommands() {
  const router = useRouter();
  const {
    isListening,
    transcript,
    startListening: startRecognition,
    stopListening: stopRecognition,
    isSupported,
    unsupportedReason,
  } = useVoiceRecognition();

  const { speak } = useTTS();
  const navigateTo = useReaderStore((s) => s.navigateTo);

  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);

  // Track the previous listening state so we can detect the transition
  // from listening → not listening (i.e. final transcript is ready).
  const wasListeningRef = useRef(false);

  useEffect(() => {
    // Detect the moment recognition stops (final result available)
    if (wasListeningRef.current && !isListening && transcript) {
      const command = parseVoiceCommand(transcript);
      setLastCommand(command);
      dispatch(command);
    }
    wasListeningRef.current = isListening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const dispatch = useCallback(
    (command: VoiceCommand) => {
      switch (command.type) {
        case "navigate": {
          const ref = command.payload as ParsedBibleReference | string | undefined;
          if (ref && typeof ref === "object") {
            navigateTo(ref.bookId, ref.chapter);
            router.push("/");
          }
          break;
        }
        case "read": {
          // The caller / page should provide the text. For now we announce.
          speak("Reading the current passage aloud.");
          break;
        }
        case "search": {
          const query = command.payload as string | undefined;
          if (query) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }
          break;
        }
        case "compare": {
          router.push("/compare");
          break;
        }
        case "perspective": {
          router.push("/perspective");
          break;
        }
        case "quiz": {
          router.push("/quiz");
          break;
        }
        default:
          break;
      }
    },
    [navigateTo, router, speak],
  );

  const startListening = useCallback(() => {
    setLastCommand(null);
    startRecognition();
  }, [startRecognition]);

  const stopListening = useCallback(() => {
    stopRecognition();
  }, [stopRecognition]);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported,
    unsupportedReason,
    lastCommand,
  };
}
