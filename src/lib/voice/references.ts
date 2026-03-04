import { getBookByName } from "@/lib/bible/books";

// ---------------------------------------------------------------------------
// Spoken-number / ordinal normalisation
// ---------------------------------------------------------------------------

const SPOKEN_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  "one hundred": 100,
  "one hundred and fifty": 150,
};

const ORDINAL_WORDS: Record<string, string> = {
  first: "1",
  second: "2",
  third: "3",
  fourth: "4",
  fifth: "5",
};

/**
 * Convert a spoken number word to its numeric value.
 * Returns the original string if no match is found.
 */
function spokenToNumber(word: string): number | null {
  const lower = word.toLowerCase().trim();

  // Already a digit?
  const asNum = Number(lower);
  if (!Number.isNaN(asNum) && lower.length > 0) return asNum;

  // Direct lookup
  if (lower in SPOKEN_NUMBERS) return SPOKEN_NUMBERS[lower];

  // Compound numbers like "twenty three"
  const parts = lower.split(/[\s-]+/);
  if (parts.length === 2) {
    const tens = SPOKEN_NUMBERS[parts[0]];
    const ones = SPOKEN_NUMBERS[parts[1]];
    if (tens !== undefined && ones !== undefined) return tens + ones;
  }

  // "one hundred and ..." patterns
  if (parts.length >= 3 && parts[0] === "one" && parts[1] === "hundred") {
    const rest = parts.slice(parts[2] === "and" ? 3 : 2).join(" ");
    const restNum = spokenToNumber(rest);
    if (restNum !== null) return 100 + restNum;
  }

  return null;
}

/**
 * Normalise ordinal prefixes in the input text:
 *   "first corinthians" → "1 corinthians"
 *   "1st john"          → "1 john"
 */
function normaliseOrdinals(text: string): string {
  let result = text;

  // Word ordinals: "first", "second", etc.
  for (const [word, digit] of Object.entries(ORDINAL_WORDS)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    result = result.replace(re, digit);
  }

  // Suffix ordinals: "1st", "2nd", "3rd", "4th", "5th"
  result = result.replace(/\b(\d+)(?:st|nd|rd|th)\b/gi, "$1");

  return result;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export interface ParsedBibleReference {
  bookId: string;
  chapter: number;
  verse?: number;
}

/**
 * Parse a natural-language Bible reference from speech or text.
 *
 * Supported formats:
 *   "John 3:16"
 *   "Genesis 1"
 *   "first Corinthians 13"
 *   "1st John 2 verse 3"
 *   "Psalm chapter three verse sixteen"
 */
export function parseBibleReference(
  text: string,
): ParsedBibleReference | null {
  if (!text || !text.trim()) return null;

  let input = text.trim().toLowerCase();

  // Normalise ordinals so "first corinthians" → "1 corinthians"
  input = normaliseOrdinals(input);

  // Strip filler words that speech recognition might add
  input = input
    .replace(/\bchapter\b/gi, "")
    .replace(/\bverse\b/gi, ":")
    .replace(/\s+/g, " ")
    .trim();

  // Try to separate book name from chapter:verse by greedily matching the
  // longest book name from the left.
  let bookMeta = null;
  let remainder = "";

  // Try progressively shorter prefixes
  const words = input.split(" ");
  for (let i = words.length; i >= 1; i--) {
    const candidate = words.slice(0, i).join(" ");
    const found = getBookByName(candidate);
    if (found) {
      bookMeta = found;
      remainder = words.slice(i).join(" ").trim();
      break;
    }
  }

  if (!bookMeta) return null;

  // No chapter/verse provided — default to chapter 1
  if (!remainder) {
    return { bookId: bookMeta.id, chapter: 1 };
  }

  // Parse chapter and optional verse from the remainder.
  // Remainder could be: "3:16", "3 16", "three sixteen", "3 : 16", etc.

  // Collapse spaces around colons
  remainder = remainder.replace(/\s*:\s*/g, ":").trim();

  let chapter: number | null = null;
  let verse: number | undefined;

  if (remainder.includes(":")) {
    const [chStr, vStr] = remainder.split(":");
    chapter = spokenToNumber(chStr.trim());
    if (vStr && vStr.trim()) {
      verse = spokenToNumber(vStr.trim()) ?? undefined;
    }
  } else {
    // Could be "3 16" or just "3" or "three sixteen"
    const remWords = remainder.split(/\s+/);
    chapter = spokenToNumber(remWords[0]);
    if (remWords.length > 1) {
      verse = spokenToNumber(remWords.slice(1).join(" ")) ?? undefined;
    }
  }

  if (chapter === null || chapter < 1) return null;

  return { bookId: bookMeta.id, chapter, verse };
}
