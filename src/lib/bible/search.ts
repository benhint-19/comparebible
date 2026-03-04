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
  translationId: string;
}

// -- Search -----------------------------------------------------------------

const MAX_RESULTS = 100;

/**
 * Search all cached chapters in IndexedDB across one or more translations.
 * Returns up to 100 matching verses with case-insensitive text matching.
 *
 * Results are deduplicated by verse reference (bookId:chapter:verse),
 * preferring results from the first translation in the array (primary).
 *
 * Only searches chapters that have already been fetched and cached --
 * this is a purely offline, client-side search.
 */
export async function searchBible(
  query: string,
  translationIds: string[],
): Promise<SearchResult[]> {
  if (!query.trim() || translationIds.length === 0) return [];

  const db = await getDB();
  const tx = db.transaction("chapters", "readonly");
  const store = tx.objectStore("chapters");

  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const lowerQuery = query.toLowerCase();

  // Build a set for O(1) membership checks
  const translationSet = new Set(translationIds);

  let cursor = await store.openCursor();

  while (cursor) {
    const key = cursor.key as string;
    const parts = key.split(":");
    const keyTranslation = parts[0];

    if (translationSet.has(keyTranslation)) {
      const chapterData = cursor.value as ChapterResponse;
      const verses = extractSimpleVerses(chapterData);
      const chapterNum = Number(parts[2]);

      for (const verse of verses) {
        if (verse.text.toLowerCase().includes(lowerQuery)) {
          const dedupeKey = `${chapterData.book.id}:${chapterNum}:${verse.number}`;

          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            results.push({
              bookId: chapterData.book.id,
              bookName: chapterData.book.name,
              chapter: chapterNum,
              verseNumber: verse.number,
              text: verse.text,
              translationId: keyTranslation,
            });

            if (results.length >= MAX_RESULTS) {
              return results;
            }
          }
        }
      }
    }

    cursor = await cursor.continue();
  }

  return results;
}
