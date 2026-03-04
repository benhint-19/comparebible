"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to reader"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <div className="flex-1">
          <SearchBar defaultValue={query} />
        </div>
      </div>

      {/* Results */}
      <SearchResults query={query} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-accent" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
