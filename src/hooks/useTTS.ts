"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStore } from "@/store/voiceStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

/**
 * Pick a natural-sounding English voice if one is available.
 * Prefers voices with "Google" or "Natural" in the name, then falls back
 * to any en-* voice, then the default.
 */
function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (voices.length === 0) return null;

  const english = voices.filter((v) => v.lang.startsWith("en"));

  // Prefer natural / high-quality voices
  const natural = english.find(
    (v) =>
      /natural|google|samantha|daniel/i.test(v.name) ||
      v.name.includes("Enhanced"),
  );
  if (natural) return natural;

  // Fall back to any English voice
  if (english.length > 0) return english[0];

  // Last resort
  return voices[0];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const voiceStore = useVoiceStore();

  useEffect(() => {
    setIsSupported(getSynthesis() !== null);
  }, []);

  const speak = useCallback(
    (text: string) => {
      const synth = getSynthesis();
      if (!synth) return;

      // Cancel anything currently playing
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;

      const voice = pickVoice(synth);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        voiceStore.setSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        voiceStore.setSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        voiceStore.setSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [voiceStore],
  );

  const stop = useCallback(() => {
    const synth = getSynthesis();
    if (!synth) return;
    synth.cancel();
    setIsSpeaking(false);
    voiceStore.setSpeaking(false);
    utteranceRef.current = null;
  }, [voiceStore]);

  const pause = useCallback(() => {
    getSynthesis()?.pause();
  }, []);

  const resume = useCallback(() => {
    getSynthesis()?.resume();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      getSynthesis()?.cancel();
    };
  }, []);

  return { speak, stop, pause, resume, isSpeaking, isSupported };
}
