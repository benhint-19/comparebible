// ---------------------------------------------------------------------------
// IndexedDB caching layer for Bible API responses
// ---------------------------------------------------------------------------

import { getDB } from "@/lib/db";
import type {
  AvailableTranslationsResponse,
  BooksResponse,
  ChapterResponse,
} from "./types";

// -- Key helpers ------------------------------------------------------------

function chapterKey(
  translationId: string,
  bookId: string,
  chapter: number,
): string {
  return `${translationId}:${bookId}:${chapter}`;
}

// -- Translations -----------------------------------------------------------

export async function getCachedTranslations(): Promise<AvailableTranslationsResponse | undefined> {
  const db = await getDB();
  const data = await db.get("translations", "all");
  return data as AvailableTranslationsResponse | undefined;
}

export async function cacheTranslations(
  data: AvailableTranslationsResponse,
): Promise<void> {
  const db = await getDB();
  await db.put("translations", data, "all");
}

// -- Books ------------------------------------------------------------------

export async function getCachedBooks(
  translationId: string,
): Promise<BooksResponse | undefined> {
  const db = await getDB();
  const data = await db.get("books", translationId);
  return data as BooksResponse | undefined;
}

export async function cacheBooks(
  translationId: string,
  data: BooksResponse,
): Promise<void> {
  const db = await getDB();
  await db.put("books", data, translationId);
}

// -- Chapters ---------------------------------------------------------------

export async function getCachedChapter(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<ChapterResponse | undefined> {
  const db = await getDB();
  const key = chapterKey(translationId, bookId, chapter);
  const data = await db.get("chapters", key);
  return data as ChapterResponse | undefined;
}

export async function cacheChapter(
  translationId: string,
  bookId: string,
  chapter: number,
  data: ChapterResponse,
): Promise<void> {
  const db = await getDB();
  const key = chapterKey(translationId, bookId, chapter);
  await db.put("chapters", data, key);
}
