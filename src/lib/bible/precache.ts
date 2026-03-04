// ---------------------------------------------------------------------------
// Background pre-caching of Bible translation data into IndexedDB
// ---------------------------------------------------------------------------

import { BIBLE_BOOKS } from "@/lib/bible/books";
import { fetchChapter } from "@/lib/bible/api";

export interface PrecacheProgress {
  bookName: string;
  chapter: number;
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Pre-cache every chapter of every book for a given translation.
 * Yields progress updates after each chapter fetch so callers can
 * display a progress indicator.
 */
export async function* precachePrimaryTranslation(
  translationId: string,
): AsyncGenerator<PrecacheProgress> {
  const total = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);
  let completed = 0;

  for (const book of BIBLE_BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      try {
        await fetchChapter(translationId, book.id, chapter);
      } catch {
        // Silently skip failed fetches — they can be retried later.
      }

      completed++;

      yield {
        bookName: book.name,
        chapter,
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      };

      // Small delay between fetches to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

/**
 * Kick off pre-caching in the background. Returns an AbortController so the
 * caller can cancel the process if needed.
 */
export function startPrecache(
  translationId: string,
  onProgress?: (progress: PrecacheProgress) => void,
): AbortController {
  const controller = new AbortController();

  (async () => {
    for await (const progress of precachePrimaryTranslation(translationId)) {
      if (controller.signal.aborted) break;
      onProgress?.(progress);
    }
  })();

  return controller;
}
