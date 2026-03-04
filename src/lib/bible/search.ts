// ---------------------------------------------------------------------------
// Client-side Bible search over cached IndexedDB chapters
// ---------------------------------------------------------------------------

import { getDB } from "@/lib/db";
import { extractSimpleVerses } from "@/lib/bible/api";
import type { ChapterResponse } from "@/lib/bible/types";

// -- Types ------------------------------------------------------------------

export interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
}

// -- Search -----------------------------------------------------------------

const MAX_RESULTS = 100;

/**
 * Search all cached chapters in IndexedDB for a given translation.
 * Returns up to 100 matching verses with case-insensitive text matching.
 *
 * Only searches chapters that have already been fetched and cached --
 * this is a purely offline, client-side search.
 */
export async function searchBible(
  query: string,
  translationId: string,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const db = await getDB();
  const tx = db.transaction("chapters", "readonly");
  const store = tx.objectStore("chapters");

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Iterate all keys to find chapters belonging to this translation
  let cursor = await store.openCursor();

  while (cursor) {
    const key = cursor.key as string;

    // Keys are formatted as "translationId:bookId:chapter"
    if (key.startsWith(`${translationId}:`)) {
      const chapterData = cursor.value as ChapterResponse;
      const verses = extractSimpleVerses(chapterData);

      for (const verse of verses) {
        if (verse.text.toLowerCase().includes(lowerQuery)) {
          results.push({
            bookId: chapterData.book.id,
            bookName: chapterData.book.name,
            chapter: Number(key.split(":")[2]),
            verseNumber: verse.number,
            text: verse.text,
          });

          if (results.length >= MAX_RESULTS) {
            return results;
          }
        }
      }
    }

    cursor = await cursor.continue();
  }

  return results;
}
