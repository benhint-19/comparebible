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
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const input = transcript.trim().toLowerCase();

  if (!input) return { type: "unknown" };

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
