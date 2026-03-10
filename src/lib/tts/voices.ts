/** Server-side TTS voice definitions for Edge TTS */

export interface TTSVoice {
  id: string;
  /** Edge TTS voice identifier */
  edgeVoice: string;
  label: string;
  gender: "male" | "female";
}

/**
 * Curated voices for Bible reading — calm, warm, natural-sounding.
 * 3 male + 2 female, all neural quality.
 */
export const TTS_VOICES: TTSVoice[] = [
  {
    id: "andrew",
    edgeVoice: "en-US-AndrewMultilingualNeural",
    label: "Andrew",
    gender: "male",
  },
  {
    id: "brian",
    edgeVoice: "en-US-BrianMultilingualNeural",
    label: "Brian",
    gender: "male",
  },
  {
    id: "ryan",
    edgeVoice: "en-GB-RyanNeural",
    label: "Ryan",
    gender: "male",
  },
  {
    id: "emma",
    edgeVoice: "en-US-EmmaMultilingualNeural",
    label: "Emma",
    gender: "female",
  },
  {
    id: "ava",
    edgeVoice: "en-US-AvaMultilingualNeural",
    label: "Ava",
    gender: "female",
  },
];

export function getVoiceById(id: string): TTSVoice | undefined {
  return TTS_VOICES.find((v) => v.id === id);
}
