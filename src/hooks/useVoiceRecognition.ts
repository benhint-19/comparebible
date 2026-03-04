"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useVoiceStore } from "@/store/voiceStore";

// Write-only access — avoids subscribing to all store changes which would
// recreate callbacks and cause infinite update loops in useAudioMode.
const getVoice = () => useVoiceStore.getState();

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
// Helpers
// ---------------------------------------------------------------------------

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

/** True when running inside a Capacitor native shell (iOS / Android). */
function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Lazily import the Capacitor community speech-recognition plugin.
 * We use a dynamic import so the module is only loaded on native platforms
 * and doesn't break SSR / desktop-web builds where the plugin isn't needed.
 */
async function getCapSpeechRecognition() {
  const mod = await import("@capacitor-community/speech-recognition");
  return mod.SpeechRecognition;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVoiceRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  /** A human-readable reason when recognition is not supported. */
  const [unsupportedReason, setUnsupportedReason] = useState<string | null>(null);

  // Track whether we're using the Capacitor native plugin
  const usingNativeRef = useRef(false);
  // Keep a handle to remove the Capacitor listener on cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const capListenerRef = useRef<any>(null);

  // ------------------------------------------------------------------
  // Check support on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function detect() {
      // --- Native (Capacitor) path ---
      if (isNative()) {
        try {
          const CapSR = await getCapSpeechRecognition();
          const { available } = await CapSR.available();
          if (cancelled) return;

          if (available) {
            usingNativeRef.current = true;
            setIsSupported(true);
            setUnsupportedReason(null);
          } else {
            setIsSupported(false);
            setUnsupportedReason(
              "Speech recognition is not available on this device.",
            );
          }
        } catch (err) {
          if (cancelled) return;
          console.warn("[VoiceRecognition] Capacitor plugin unavailable:", err);
          setIsSupported(false);
          setUnsupportedReason(
            "Speech recognition plugin failed to load.",
          );
        }
        return;
      }

      // --- Web path ---
      const webSupported = getSpeechRecognitionCtor() !== null;
      if (cancelled) return;

      setIsSupported(webSupported);
      if (!webSupported) {
        setUnsupportedReason(
          "Your browser does not support speech recognition. Try Chrome or Edge on desktop.",
        );
      } else {
        setUnsupportedReason(null);
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------------
  // Start listening
  // ------------------------------------------------------------------
  const startListening = useCallback(async () => {
    // ----- Native (Capacitor) -----
    if (usingNativeRef.current) {
      try {
        const CapSR = await getCapSpeechRecognition();

        // Request permissions if needed
        const { speechRecognition: perm } = await CapSR.checkPermissions();
        if (perm !== "granted") {
          const { speechRecognition: newPerm } = await CapSR.requestPermissions();
          if (newPerm !== "granted") {
            console.warn("[VoiceRecognition] Permission denied");
            return;
          }
        }

        setTranscript("");
        getVoice().setTranscript("");

        // Listen for partial results
        capListenerRef.current = await CapSR.addListener(
          "partialResults",
          (data: { matches: string[] }) => {
            const text = data.matches?.[0] ?? "";
            setTranscript(text);
            getVoice().setTranscript(text);
          },
        );

        // Also listen for listeningState to detect stop
        const stateListener = await CapSR.addListener(
          "listeningState",
          (data: { status: "started" | "stopped" }) => {
            if (data.status === "started") {
              setIsListening(true);
              getVoice().setListening(true);
            } else {
              setIsListening(false);
              getVoice().setListening(false);
            }
          },
        );

        // Store both listeners for cleanup
        const partialListener = capListenerRef.current;
        capListenerRef.current = { partialListener, stateListener };

        await CapSR.start({
          language: "en-US",
          partialResults: true,
          popup: false,
        });

        setIsListening(true);
        getVoice().setListening(true);
      } catch (err) {
        console.warn("[VoiceRecognition] Native start error:", err);
        setIsListening(false);
        getVoice().setListening(false);
      }
      return;
    }

    // ----- Web Speech API -----
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
      getVoice().setListening(true);
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
      getVoice().setTranscript(current);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "aborted" is not a real error -- happens when we call .abort()
      if (event.error === "aborted") return;

      if (event.error === "not-allowed") {
        console.warn(
          "[VoiceRecognition] Microphone permission denied. Please allow microphone access in your browser settings.",
        );
      } else {
        console.warn("[VoiceRecognition] error:", event.error, event.message);
      }

      setIsListening(false);
      getVoice().setListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      getVoice().setListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }, []);

  // ------------------------------------------------------------------
  // Stop listening
  // ------------------------------------------------------------------
  const stopListening = useCallback(async () => {
    // Native
    if (usingNativeRef.current) {
      try {
        const CapSR = await getCapSpeechRecognition();
        await CapSR.stop();
      } catch {
        // ignore -- may already be stopped
      }
      // Clean up listeners
      if (capListenerRef.current) {
        try {
          capListenerRef.current.partialListener?.remove?.();
          capListenerRef.current.stateListener?.remove?.();
        } catch {
          // ignore
        }
        capListenerRef.current = null;
      }
      setIsListening(false);
      getVoice().setListening(false);
      return;
    }

    // Web
    recognitionRef.current?.stop();
  }, []);

  // ------------------------------------------------------------------
  // Cleanup on unmount
  // ------------------------------------------------------------------
  useEffect(() => {
    return () => {
      // Web cleanup
      recognitionRef.current?.abort();

      // Native cleanup
      if (usingNativeRef.current && capListenerRef.current) {
        try {
          capListenerRef.current.partialListener?.remove?.();
          capListenerRef.current.stateListener?.remove?.();
        } catch {
          // ignore
        }
        // Best-effort stop
        getCapSpeechRecognition()
          .then((CapSR) => CapSR.stop())
          .catch(() => {});
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    unsupportedReason,
  };
}
