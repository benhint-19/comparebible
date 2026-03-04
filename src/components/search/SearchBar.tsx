"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  /** Pre-fill the input with a previous query */
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the Bible..."
          className="w-full rounded-full border border-border bg-muted pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        />
      </div>
    </form>
  );
}
