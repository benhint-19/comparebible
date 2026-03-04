// ---------------------------------------------------------------------------
// Central IndexedDB setup for the CompareBible app
// ---------------------------------------------------------------------------

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// -- Schema -----------------------------------------------------------------

export interface CompareBibleDB extends DBSchema {
  translations: {
    key: string; // "all" (single cached list) or translation id
    value: unknown;
  };
  books: {
    key: string; // translationId
    value: unknown;
  };
  chapters: {
    key: string; // `${translationId}:${bookId}:${chapter}`
    value: unknown;
  };
  "ai-responses": {
    key: string; // a caller-defined cache key
    value: unknown;
  };
  settings: {
    key: string;
    value: unknown;
  };
}

// -- DB name & version ------------------------------------------------------

const DB_NAME = "comparebible-cache";
const DB_VERSION = 1;

// -- Singleton promise ------------------------------------------------------

let dbPromise: Promise<IDBPDatabase<CompareBibleDB>> | null = null;

/**
 * Returns a promise that resolves to the open IDB database.
 * Safe to call from both client components and effects -- the DB is only
 * created once per page lifetime.
 */
export function getDB(): Promise<IDBPDatabase<CompareBibleDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CompareBibleDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("translations")) {
          db.createObjectStore("translations");
        }
        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books");
        }
        if (!db.objectStoreNames.contains("chapters")) {
          db.createObjectStore("chapters");
        }
        if (!db.objectStoreNames.contains("ai-responses")) {
          db.createObjectStore("ai-responses");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}
