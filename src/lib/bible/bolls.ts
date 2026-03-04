// ---------------------------------------------------------------------------
// Bolls.life Bible API adapter for copyrighted translations (NIV, ESV, etc.)
// ---------------------------------------------------------------------------

import type { SimpleVerse, VerseRange } from "./types";
import { BIBLE_BOOKS } from "./books";
import { fetchJSON } from "./fetchJSON";

const BASE_URL = "https://bolls.life";

// Bolls uses sequential book numbers 1-66
const bookIdToNumber: Record<string, number> = {};
BIBLE_BOOKS.forEach((book) => {
  bookIdToNumber[book.id] = book.order;
});

// Translations available on Bolls.life that aren't on bible.helloao.org
export const BOLLS_TRANSLATIONS = [
  { id: "bolls:NIV", name: "New International Version", bollsId: "NIV" },
  { id: "bolls:ESV", name: "English Standard Version", bollsId: "ESV" },
  { id: "bolls:NRSVCE", name: "New Revised Standard Version (Catholic)", bollsId: "NRSVCE" },
  { id: "bolls:NLT", name: "New Living Translation", bollsId: "NLT" },
  { id: "bolls:NASB", name: "New American Standard Bible", bollsId: "NASB" },
  { id: "bolls:MSG", name: "The Message", bollsId: "MSG" },
  { id: "bolls:NKJV", name: "New King James Version", bollsId: "NKJV" },
  { id: "bolls:CSB", name: "Christian Standard Bible", bollsId: "CSB17" },
  { id: "bolls:AMP", name: "Amplified Bible", bollsId: "AMP" },
] as const;

export function isBollsTranslation(translationId: string): boolean {
  return translationId.startsWith("bolls:");
}

function getBollsId(translationId: string): string {
  const entry = BOLLS_TRANSLATIONS.find((t) => t.id === translationId);
  if (entry) return entry.bollsId;
  return translationId.replace("bolls:", "");
}

interface BollsVerse {
  pk: number;
  verse: number;
  text: string;
}

function cleanText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<sup>[^<]*<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch a chapter from Bolls.life and return SimpleVerse array.
 */
export async function fetchBollsChapter(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<SimpleVerse[]> {
  const bollsId = getBollsId(translationId);
  const bookNum = bookIdToNumber[bookId];
  if (!bookNum) throw new Error(`Unknown book ID: ${bookId}`);

  const data: BollsVerse[] = await fetchJSON(
    `${BASE_URL}/get-text/${bollsId}/${bookNum}/${chapter}/`,
  );
  return data.map((v) => ({
    number: v.verse,
    text: cleanText(v.text),
  }));
}

/**
 * Fetch a specific verse range from Bolls.life.
 */
export async function fetchBollsVerseRange(
  translationId: string,
  bookId: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
): Promise<VerseRange> {
  const verses = await fetchBollsChapter(translationId, bookId, chapter);
  const filtered = verses.filter(
    (v) => v.number >= startVerse && v.number <= endVerse,
  );

  return {
    translationId,
    bookId,
    chapter,
    startVerse,
    endVerse,
    verses: filtered,
  };
}
