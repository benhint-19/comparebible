"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchBible, type SearchResult } from "@/lib/bible/search";
import { useReaderStore } from "@/store/readerStore";
import { useTranslationStore } from "@/store/translationStore";

interface SearchResultsProps {
  query: string;
}

/**
 * Highlight all occurrences of `term` within `text` by wrapping matches
 * in <strong> tags. Case-insensitive.
 */
function HighlightedText({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const parts: { value: string; highlight: boolean }[] = [];
  let start = 0;

  while (start < text.length) {
    const idx = lowerText.indexOf(lowerTerm, start);
    if (idx === -1) {
      parts.push({ value: text.slice(start), highlight: false });
      break;
    }
    if (idx > start) {
      parts.push({ value: text.slice(start, idx), highlight: false });
    }
    parts.push({ value: text.slice(idx, idx + term.length), highlight: true });
    start = idx + term.length;
  }

  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <strong key={i} className="text-accent font-semibold">
            {part.value}
          </strong>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </>
  );
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigateTo = useReaderStore((s) => s.navigateTo);
  const primaryTranslation = useTranslationStore((s) => s.primaryTranslation);
  const parallelTranslations = useTranslationStore((s) => s.parallelTranslations);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const translationIds = [primaryTranslation, ...parallelTranslations];

    searchBible(query, translationIds).then((res) => {
      if (!cancelled) {
        setResults(res);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query, primaryTranslation, parallelTranslations]);

  function handleResultClick(result: SearchResult) {
    navigateTo(result.bookId, result.chapter);
    router.push("/");
  }

  // -- Loading state ----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-accent" />
        <span className="ml-3 text-sm text-muted-foreground">Searching...</span>
      </div>
    );
  }

  // -- Empty state ------------------------------------------------------------

  if (!query.trim()) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Enter a search term to find passages.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">No results found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Only cached chapters are searched. Browse more chapters to expand search coverage.
        </p>
      </div>
    );
  }

  // -- Results list -----------------------------------------------------------

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {results.length}
        {results.length >= 100 ? "+" : ""} result{results.length !== 1 ? "s" : ""} found
      </p>

      <ul className="space-y-1">
        {results.map((result, i) => (
          <li key={`${result.bookId}-${result.chapter}-${result.verseNumber}-${result.translationId}-${i}`}>
            <button
              onClick={() => handleResultClick(result)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-accent">
                  {result.bookName} {result.chapter}:{result.verseNumber}
                </span>
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent uppercase tracking-wide">
                  {result.translationId}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                <HighlightedText text={result.text} term={query} />
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
