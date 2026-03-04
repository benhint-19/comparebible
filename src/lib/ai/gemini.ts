// ---------------------------------------------------------------------------
// Client-side helpers for the Gemini AI API
// ---------------------------------------------------------------------------

import { getDB } from "@/lib/db";
import type { PerspectiveRequest } from "@/lib/ai/types";

// -- Streaming fetch --------------------------------------------------------

/**
 * Calls the server API route and yields text chunks as they arrive.
 */
export async function* streamPerspective(
  request: PerspectiveRequest,
): AsyncGenerator<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API error (${res.status}): ${msg}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream in response");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) yield chunk;
  }
}

// -- IndexedDB cache --------------------------------------------------------

function cacheKey(persona: string, passage: string): string {
  return `${persona}:${passage}`;
}

/**
 * Retrieve a cached AI response from IndexedDB, or null if not found.
 */
export async function getCachedPerspective(
  persona: string,
  passage: string,
): Promise<string | null> {
  try {
    const db = await getDB();
    const value = await db.get("ai-responses", cacheKey(persona, passage));
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Store an AI response in IndexedDB for later retrieval.
 */
export async function cachePerspective(
  persona: string,
  passage: string,
  content: string,
): Promise<void> {
  try {
    const db = await getDB();
    await db.put("ai-responses", content, cacheKey(persona, passage));
  } catch {
    // Caching failure is non-critical; silently ignore.
  }
}
