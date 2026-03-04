"use client";

// ---------------------------------------------------------------------------
// React hook for streaming AI perspectives with caching
// ---------------------------------------------------------------------------

import { useState, useCallback, useRef } from "react";
import {
  streamPerspective,
  getCachedPerspective,
  cachePerspective,
} from "@/lib/ai/gemini";
import { useAIStore } from "@/store/aiStore";

export function useGemini() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const setStoreLoading = useAIStore((s) => s.setLoading);
  const setStoreResponse = useAIStore((s) => s.setResponse);

  const streamResponse = useCallback(
    async (persona: string, passage: string, verseText: string) => {
      // Reset state
      abortRef.current = false;
      setContent("");
      setError(null);
      setIsLoading(true);
      setStoreLoading(true);

      try {
        // Check IndexedDB cache first
        const cached = await getCachedPerspective(persona, passage);
        if (cached) {
          setContent(cached);
          setStoreResponse(`${persona}:${passage}`, cached);
          setIsLoading(false);
          setStoreLoading(false);
          return;
        }

        // Stream from API
        let accumulated = "";
        for await (const chunk of streamPerspective({
          persona,
          passage,
          verseText,
        })) {
          if (abortRef.current) break;
          accumulated += chunk;
          setContent(accumulated);
        }

        // Cache the final response
        if (accumulated && !abortRef.current) {
          await cachePerspective(persona, passage, accumulated);
          setStoreResponse(`${persona}:${passage}`, accumulated);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      } finally {
        setIsLoading(false);
        setStoreLoading(false);
      }
    },
    [setStoreLoading, setStoreResponse],
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { streamResponse, isLoading, content, error, abort };
}
