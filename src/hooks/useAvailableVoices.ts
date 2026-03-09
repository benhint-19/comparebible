"use client";

import { useEffect, useState } from "react";

export interface VoiceOption {
  uri: string;
  label: string;
  lang: string;
}

/**
 * Quality keywords that indicate a natural / high-quality voice.
 * Tested against Chrome, Edge, Safari, and Android.
 */
const QUALITY_PATTERNS =
  /natural|neural|enhanced|premium|google\s+(us|uk)|samantha|daniel|karen|moira|tessa|rishi|aaron|nicky|fiona|alex|allison|ava|zoe|nova|aria|jenny|guy|sonia|libby|ryan|emma|brian|amy|joanna|matthew|olivia|liam/i;

/** Friendly label: strip engine prefixes like "Microsoft …" or "Google …" */
function friendlyName(voice: SpeechSynthesisVoice): string {
  let name = voice.name;
  // Strip common prefixes
  name = name.replace(/^(Microsoft|Google|Apple)\s+/i, "");
  // Strip trailing "Online (Natural)" style tags but keep "Natural"
  name = name.replace(/\s+Online\b/i, "");
  // Add language hint if not US English
  if (!voice.lang.startsWith("en-US") && voice.lang.startsWith("en")) {
    const region = voice.lang.replace("en-", "").toUpperCase();
    name += ` (${region})`;
  }
  return name;
}

/**
 * Returns a list of high-quality English voices available on this device.
 * Updates when the browser finishes loading voices.
 */
export function useAvailableVoices(): VoiceOption[] {
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) return;

    function update() {
      const all = synth!.getVoices();
      const english = all.filter((v) => v.lang.startsWith("en"));

      // Prefer voices that match quality patterns, but fall back to all English
      const quality = english.filter((v) => QUALITY_PATTERNS.test(v.name));
      const available = quality.length > 0 ? quality : english;

      // Sort: Natural voices first, then quality matches, then alphabetical
      available.sort((a, b) => {
        const aNat = /natural/i.test(a.name) ? 0 : 1;
        const bNat = /natural/i.test(b.name) ? 0 : 1;
        if (aNat !== bNat) return aNat - bNat;
        const aQ = QUALITY_PATTERNS.test(a.name) ? 0 : 1;
        const bQ = QUALITY_PATTERNS.test(b.name) ? 0 : 1;
        if (aQ !== bQ) return aQ - bQ;
        return a.name.localeCompare(b.name);
      });

      setVoices(
        available.map((v) => ({
          uri: v.voiceURI,
          label: friendlyName(v),
          lang: v.lang,
        })),
      );
    }

    update();
    synth.addEventListener("voiceschanged", update);
    return () => synth.removeEventListener("voiceschanged", update);
  }, []);

  return voices;
}
