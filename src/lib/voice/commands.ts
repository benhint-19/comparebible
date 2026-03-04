import {
  parseBibleReference,
  type ParsedBibleReference,
} from "@/lib/voice/references";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VoiceCommandType =
  | "navigate"
  | "read"
  | "search"
  | "compare"
  | "perspective"
  | "quiz"
  // Audio-mode specific commands
  | "audio_pause"
  | "audio_play"
  | "audio_stop"
  | "audio_next_verse"
  | "audio_prev_verse"
  | "audio_next_chapter"
  | "audio_prev_chapter"
  | "audio_repeat"
  | "audio_compare"
  | "audio_analyze"
  | "audio_exit"
  | "unknown";

export interface VoiceCommand {
  type: VoiceCommandType;
  payload?: ParsedBibleReference | string;
}

// ---------------------------------------------------------------------------
// Intent patterns (ordered — first match wins)
// ---------------------------------------------------------------------------

interface IntentPattern {
  type: VoiceCommandType;
  /** Regex to test against the normalised transcript. */
  pattern: RegExp;
  /** Extract a payload string from the match (group 1 by default). */
  extractPayload?: (match: RegExpMatchArray) => string | undefined;
}

// ---------------------------------------------------------------------------
// Audio-mode patterns (checked first when audio mode is active)
// ---------------------------------------------------------------------------

const AUDIO_INTENT_PATTERNS: IntentPattern[] = [
  // Pause / stop playback
  {
    type: "audio_pause",
    pattern: /^(?:pause|stop|stop\s+reading|pause\s+reading|hold\s+on|wait)$/,
  },

  // Resume / play
  {
    type: "audio_play",
    pattern:
      /^(?:play|continue|resume|keep\s+reading|keep\s+going|go\s+on|start\s+reading|continue\s+reading|resume\s+reading)$/,
  },

  // Exit audio mode entirely
  {
    type: "audio_exit",
    pattern:
      /^(?:exit\s+audio(?:\s+mode)?|stop\s+listening|turn\s+off\s+audio|quit\s+audio|close\s+audio|exit)$/,
  },

  // Compare translations
  {
    type: "audio_compare",
    pattern:
      /^(?:compare|compare\s+(?:this|translations?|versions?)|show\s+(?:other\s+)?translations?|show\s+(?:other\s+)?versions?|other\s+translations?|what\s+do\s+other\s+translations?\s+say|how\s+(?:do|does)\s+(?:other|different)\s+translations?\s+(?:read|say)|expand\s+(?:this|verse))$/,
  },

  // AI analysis
  {
    type: "audio_analyze",
    pattern:
      /^(?:analyze\s+this|analyse\s+this|go\s+deeper|what\s+does\s+this\s+mean|explain\s+this|tell\s+me\s+more|what\s+does\s+that\s+mean|ai\s+analysis|get\s+ai|ask\s+ai|what\s+do\s+scholars?\s+think|perspectives?)$/,
  },

  // Next chapter
  {
    type: "audio_next_chapter",
    pattern: /^(?:next\s+chapter|skip\s+chapter|forward\s+chapter)$/,
  },

  // Previous chapter
  {
    type: "audio_prev_chapter",
    pattern:
      /^(?:previous\s+chapter|prev\s+chapter|last\s+chapter|back\s+(?:a\s+)?chapter|go\s+back\s+(?:a\s+)?chapter)$/,
  },

  // Repeat current verse
  {
    type: "audio_repeat",
    pattern:
      /^(?:repeat|read\s+(?:that\s+)?again|say\s+(?:that\s+)?again|repeat\s+(?:that|this)(?:\s+verse)?)$/,
  },

  // Next verse / skip
  {
    type: "audio_next_verse",
    pattern: /^(?:skip|next|next\s+verse|skip\s+verse|forward)$/,
  },

  // Previous verse
  {
    type: "audio_prev_verse",
    pattern:
      /^(?:go\s+back|previous\s+verse|prev\s+verse|back\s+(?:one|a\s+verse)|last\s+verse|previous)$/,
  },
];

const INTENT_PATTERNS: IntentPattern[] = [
  // ---- read aloud (must come before navigate "read [ref]") ----
  {
    type: "read",
    pattern: /^(?:read\s+aloud|read\s+this|read\s+it|start\s+reading)$/,
  },

  // ---- navigate ----
  {
    type: "navigate",
    pattern: /^(?:go\s+to|open|turn\s+to|read|navigate\s+to)\s+(.+)$/,
    extractPayload: (m) => m[1],
  },

  // ---- search ----
  {
    type: "search",
    pattern: /^(?:search\s+(?:for\s+)?|find\s+|look\s+up\s+)(.+)$/,
    extractPayload: (m) => m[1],
  },

  // ---- compare ----
  {
    type: "compare",
    pattern:
      /^(?:compare\s+translations?|show\s+translations?|compare\s+versions?)$/,
  },

  // ---- perspective ----
  {
    type: "perspective",
    pattern:
      /^(?:what\s+do\s+scholars?\s+think|perspective\s+on|analyze|analyse|scholarly\s+view)(?:\s+.+)?$/,
  },

  // ---- quiz ----
  {
    type: "quiz",
    pattern:
      /^(?:take\s+(?:a\s+)?quiz|translation\s+quiz|start\s+quiz|quiz\s+me)$/,
  },
];

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parse a voice transcript into a structured command.
 *
 * Case-insensitive. Leading/trailing whitespace is stripped. Returns
 * `{ type: 'unknown' }` when no intent can be determined.
 *
 * When `audioMode` is true, audio-specific commands are checked first.
 */
export function parseVoiceCommand(
  transcript: string,
  audioMode = false,
): VoiceCommand {
  const input = transcript.trim().toLowerCase();

  if (!input) return { type: "unknown" };

  // In audio mode, check audio-specific patterns first
  if (audioMode) {
    for (const intent of AUDIO_INTENT_PATTERNS) {
      const match = input.match(intent.pattern);
      if (!match) continue;
      return { type: intent.type };
    }
  }

  for (const intent of INTENT_PATTERNS) {
    const match = input.match(intent.pattern);
    if (!match) continue;

    const rawPayload = intent.extractPayload?.(match);

    // For navigate commands, try to resolve the payload as a Bible reference
    if (intent.type === "navigate" && rawPayload) {
      const ref = parseBibleReference(rawPayload);
      if (ref) return { type: "navigate", payload: ref };
      // If it doesn't parse as a reference, still return navigate with
      // the raw string so the caller can decide what to do.
      return { type: "navigate", payload: rawPayload };
    }

    // For search commands, the payload is the raw query string
    if (intent.type === "search" && rawPayload) {
      return { type: "search", payload: rawPayload };
    }

    return { type: intent.type };
  }

  // Last resort: the entire transcript might just be a Bible reference
  const ref = parseBibleReference(input);
  if (ref) return { type: "navigate", payload: ref };

  return { type: "unknown" };
}
