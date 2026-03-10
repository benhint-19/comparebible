"use client";

import { TTS_VOICES } from "@/lib/tts/voices";

export interface VoiceOption {
  uri: string;
  label: string;
  gender: "male" | "female";
}

/** Returns the curated list of server-side TTS voices. */
export function useAvailableVoices(): VoiceOption[] {
  return TTS_VOICES.map((v) => ({
    uri: v.id,
    label: v.label,
    gender: v.gender,
  }));
}
