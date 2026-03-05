"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStore } from "@/store/voiceStore";

// Write-only access — avoids subscribing to all store changes
const getVoice = () => useVoiceStore.getState();

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

function isNativePlatform(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      !!(window as any).Capacitor?.isNativePlatform?.()
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Web Speech API helpers (fallback for browser)
// ---------------------------------------------------------------------------

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (voices.length === 0) return null;

  const english = voices.filter((v) => v.lang.startsWith("en"));

  const natural = english.find(
    (v) =>
      /natural|google|samantha|daniel/i.test(v.name) ||
      v.name.includes("Enhanced"),
  );
  if (natural) return natural;

  if (english.length > 0) return english[0];
  return voices[0];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTTS(rate: number = 1) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  // Native plugin ref (loaded lazily)
  const nativeRef = useRef<typeof import("@capacitor-community/text-to-speech").TextToSpeech | null>(null);
  const isNative = useRef(isNativePlatform());

  // Web speech refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load native plugin or detect web support
  useEffect(() => {
    if (isNative.current) {
      import("@capacitor-community/text-to-speech").then(({ TextToSpeech }) => {
        nativeRef.current = TextToSpeech;
        setIsSupported(true);
      }).catch(() => {
        // Fall back to web
        isNative.current = false;
        setIsSupported(!!getSynthesis());
      });
    } else {
      const synth = getSynthesis();
      if (!synth) {
        setIsSupported(false);
        return;
      }
      setIsSupported(true);
      const onVoicesChanged = () => setIsSupported(true);
      synth.addEventListener("voiceschanged", onVoicesChanged);
      return () => synth.removeEventListener("voiceschanged", onVoicesChanged);
    }
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      // ---------------------------------------------------------------
      // Native path — @capacitor-community/text-to-speech
      // ---------------------------------------------------------------
      if (isNative.current && nativeRef.current) {
        const TTS = nativeRef.current;
        setIsSpeaking(true);
        getVoice().setSpeaking(true);

        TTS.speak({
          text,
          rate: rateRef.current,
          pitch: 1.0,
          lang: "en-US",
        })
          .then(() => {
            setIsSpeaking(false);
            getVoice().setSpeaking(false);
            onEnd?.();
          })
          .catch((err: any) => {
            // "interrupted" is normal when we call stop()
            if (String(err).includes("interrupted")) return;
            console.warn("[TTS] native error:", err);
            setIsSpeaking(false);
            getVoice().setSpeaking(false);
          });
        return;
      }

      // ---------------------------------------------------------------
      // Web Speech API fallback
      // ---------------------------------------------------------------
      const synth = getSynthesis();
      if (!synth) return;

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rateRef.current;
      utterance.pitch = 1;

      const voice = pickVoice(synth);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        getVoice().setSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        getVoice().setSpeaking(false);
        utteranceRef.current = null;
        onEnd?.();
      };

      utterance.onerror = (event) => {
        if (event.error === "interrupted" || event.error === "canceled") return;
        console.warn("[TTS] error:", event.error);
        setIsSpeaking(false);
        getVoice().setSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);

      // iOS WKWebView workaround: speechSynthesis pauses itself after ~15s.
      // Periodic resume() keeps it going. Harmless on other platforms.
      const keepAlive = setInterval(() => {
        if (!synth.speaking) {
          clearInterval(keepAlive);
          return;
        }
        synth.pause();
        synth.resume();
      }, 10000);

      const origOnEnd = utterance.onend;
      utterance.onend = (ev) => {
        clearInterval(keepAlive);
        if (origOnEnd) origOnEnd.call(utterance, ev);
      };
      const origOnError = utterance.onerror;
      utterance.onerror = (ev) => {
        clearInterval(keepAlive);
        if (origOnError) origOnError.call(utterance, ev);
      };
    },
    [],
  );

  const stop = useCallback(() => {
    if (isNative.current && nativeRef.current) {
      nativeRef.current.stop();
      setIsSpeaking(false);
      getVoice().setSpeaking(false);
      return;
    }
    const synth = getSynthesis();
    if (!synth) return;
    synth.cancel();
    setIsSpeaking(false);
    getVoice().setSpeaking(false);
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    // Native plugin doesn't have pause — stop instead
    if (isNative.current && nativeRef.current) return;
    getSynthesis()?.pause();
  }, []);

  const resume = useCallback(() => {
    if (isNative.current && nativeRef.current) return;
    getSynthesis()?.resume();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isNative.current && nativeRef.current) {
        nativeRef.current.stop();
      } else {
        getSynthesis()?.cancel();
      }
    };
  }, []);

  return { speak, stop, pause, resume, isSpeaking, isSupported };
}
