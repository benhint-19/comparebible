// ---------------------------------------------------------------------------
// Fetch functions for the bible.helloao.org static JSON API
// ---------------------------------------------------------------------------

import {
  getCachedTranslations,
  cacheTranslations,
  getCachedBooks,
  cacheBooks,
  getCachedChapter,
  cacheChapter,
} from "./cache";

import { fetchJSON } from "./fetchJSON";

import type {
  AvailableTranslationsResponse,
  BooksResponse,
  ChapterResponse,
  ChapterVerse,
  SimpleVerse,
  VerseContentItem,
  VerseRange,
  VerseTextSegment,
} from "./types";

const BASE_URL = "https://bible.helloao.org";

// -- Core fetchers ----------------------------------------------------------

/**
 * Fetch the list of every available translation.
 * Returns from IndexedDB cache when available.
 */
export async function fetchAvailableTranslations(): Promise<AvailableTranslationsResponse> {
  const cached = await getCachedTranslations();
  if (cached) return cached;

  const data: AvailableTranslationsResponse = await fetchJSON(
    `${BASE_URL}/api/available_translations.json`,
  );
  await cacheTranslations(data);
  return data;
}

/**
 * Fetch the book list for a given translation.
 * Returns from IndexedDB cache when available.
 */
export async function fetchBooks(translationId: string): Promise<BooksResponse> {
  const cached = await getCachedBooks(translationId);
  if (cached) return cached;

  const data: BooksResponse = await fetchJSON(
    `${BASE_URL}/api/${encodeURIComponent(translationId)}/books.json`,
  );
  await cacheBooks(translationId, data);
  return data;
}

/**
 * Fetch a single chapter's content.
 * Returns from IndexedDB cache when available.
 */
export async function fetchChapter(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<ChapterResponse> {
  const cached = await getCachedChapter(translationId, bookId, chapter);
  if (cached) return cached;

  const data: ChapterResponse = await fetchJSON(
    `${BASE_URL}/api/${encodeURIComponent(translationId)}/${encodeURIComponent(bookId)}/${chapter}.json`,
  );
  await cacheChapter(translationId, bookId, chapter, data);
  return data;
}

// -- Helpers ----------------------------------------------------------------

/**
 * Collapse a verse's content array into a single plain-text string.
 */
function verseContentToText(content: VerseContentItem[]): string {
  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if ("text" in item) return (item as VerseTextSegment).text;
      // footnote refs are silently dropped from plain text
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract simplified verses (number + plain text) from a ChapterResponse.
 */
export function extractSimpleVerses(chapter: ChapterResponse): SimpleVerse[] {
  return chapter.chapter.content
    .filter((el): el is ChapterVerse => el.type === "verse")
    .map((v) => ({
      number: v.number,
      text: verseContentToText(v.content),
    }));
}

/**
 * Fetch a specific verse range from a translation, useful for parallel
 * comparison views. Routes to Bolls.life API for copyrighted translations.
 */
export async function fetchVerseRange(
  translationId: string,
  bookId: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
): Promise<VerseRange> {
  // Route Bolls translations to the Bolls.life adapter
  if (translationId.startsWith("bolls:")) {
    const { fetchBollsVerseRange } = await import("./bolls");
    return fetchBollsVerseRange(translationId, bookId, chapter, startVerse, endVerse);
  }

  const chapterData = await fetchChapter(translationId, bookId, chapter);
  const all = extractSimpleVerses(chapterData);
  const verses = all.filter(
    (v) => v.number >= startVerse && v.number <= endVerse,
  );

  return {
    translationId,
    bookId,
    chapter,
    startVerse,
    endVerse,
    verses,
  };
}
