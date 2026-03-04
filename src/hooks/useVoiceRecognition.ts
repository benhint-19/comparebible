"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStore } from "@/store/voiceStore";

// ---------------------------------------------------------------------------
// Browser type augmentation
// ---------------------------------------------------------------------------

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export function useVoiceRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const voiceStore = useVoiceStore();

  // Check support on mount
  useEffect(() => {
    setIsSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    // Prevent duplicates
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      voiceStore.setListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      const current = final || interim;
      setTranscript(current);
      voiceStore.setTranscript(current);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "aborted" is not a real error — happens when we call .abort()
      if (event.error === "aborted") return;
      console.warn("[VoiceRecognition] error:", event.error, event.message);
      setIsListening(false);
      voiceStore.setListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      voiceStore.setListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [voiceStore]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  };
}
