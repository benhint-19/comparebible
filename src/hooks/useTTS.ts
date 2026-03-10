"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStore } from "@/store/voiceStore";
import { useAudioStore } from "@/store/audioStore";

const getVoice = () => useVoiceStore.getState();

// ---------------------------------------------------------------------------
// Hook — fetches audio from /api/tts and plays it via HTMLAudioElement
// ---------------------------------------------------------------------------

export function useTTS(rate: number = 1) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(true); // Always supported (server-side TTS)
  const rateRef = useRef(rate);
  rateRef.current = rate;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Track the blob URL so we can revoke it
  const blobUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSpeaking(false);
    getVoice().setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      // Stop any current playback
      cleanup();

      const voiceId = useAudioStore.getState().selectedVoiceURI || "andrew";
      const currentRate = rateRef.current;

      const controller = new AbortController();
      abortRef.current = controller;

      // Create audio element if needed
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;

      setIsSpeaking(true);
      getVoice().setSpeaking(true);

      fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceId, rate: currentRate }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`TTS API error: ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          if (controller.signal.aborted) return;

          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          audio.src = url;

          audio.onended = () => {
            setIsSpeaking(false);
            getVoice().setSpeaking(false);
            URL.revokeObjectURL(url);
            blobUrlRef.current = null;
            onEnd?.();
          };

          audio.onerror = () => {
            console.warn("[TTS] Audio playback error");
            setIsSpeaking(false);
            getVoice().setSpeaking(false);
            URL.revokeObjectURL(url);
            blobUrlRef.current = null;
          };

          audio.play().catch((err) => {
            if (err.name === "AbortError") return;
            console.warn("[TTS] Play failed:", err);
            setIsSpeaking(false);
            getVoice().setSpeaking(false);
          });
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.warn("[TTS] Fetch error:", err);
          setIsSpeaking(false);
          getVoice().setSpeaking(false);
        });
    },
    [cleanup],
  );

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return { speak, stop, pause, resume, isSpeaking, isSupported };
}
