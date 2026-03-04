"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { translationProfiles } from "@/lib/quiz/translations";
import { BOLLS_TRANSLATIONS } from "@/lib/bible/bolls";

export interface TranslationOption {
  id: string;
  name: string;
}

/** Deduplicated combined list from translationProfiles and BOLLS_TRANSLATIONS. */
export function getAllTranslations(): TranslationOption[] {
  const seen = new Set<string>();
  const result: TranslationOption[] = [];

  for (const t of translationProfiles) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      result.push({ id: t.id, name: t.name });
    }
  }
  for (const t of BOLLS_TRANSLATIONS) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      result.push({ id: t.id, name: t.name });
    }
  }

  return result;
}

interface SingleSelectProps {
  mode: "single";
  value: string;
  onChange: (id: string) => void;
}

interface MultiSelectProps {
  mode: "multi";
  value: string[];
  onChange: (id: string, checked: boolean) => void;
}

type TranslationSelectProps = (SingleSelectProps | MultiSelectProps) & {
  translations?: TranslationOption[];
  placeholder?: string;
};

export default function TranslationSelect(props: TranslationSelectProps) {
  const {
    mode,
    translations = getAllTranslations(),
    placeholder = "Search translations...",
  } = props;

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return translations;
    const q = search.toLowerCase();
    return translations.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }, [search, translations]);

  const isSelected = (id: string) => {
    if (mode === "single") return (props as SingleSelectProps).value === id;
    return (props as MultiSelectProps).value.includes(id);
  };

  const handleSelect = (id: string) => {
    if (mode === "single") {
      (props as SingleSelectProps).onChange(id);
      setOpen(false);
      setSearch("");
    } else {
      const selected = isSelected(id);
      (props as MultiSelectProps).onChange(id, !selected);
    }
  };

  // Display label for the trigger button
  const triggerLabel = () => {
    if (mode === "single") {
      const val = (props as SingleSelectProps).value;
      const t = translations.find((t) => t.id === val);
      return t ? `${t.name} (${t.id})` : val;
    }
    const vals = (props as MultiSelectProps).value;
    if (vals.length === 0) return "None selected";
    if (vals.length === 1) {
      const t = translations.find((t) => t.id === vals[0]);
      return t ? t.name : vals[0];
    }
    return `${vals.length} translations selected`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] px-3 py-2 text-sm text-left flex items-center justify-between gap-2"
      >
        <span className="truncate">{triggerLabel()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg">
          <div className="p-2 border-b border-[var(--color-border)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-foreground)] px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-muted-foreground)]"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
                No translations found
              </li>
            )}
            {filtered.map((t) => {
              const selected = isSelected(t.id);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(t.id)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      selected
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "hover:bg-[var(--color-muted)]"
                    }`}
                  >
                    {mode === "multi" && (
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 shrink-0 rounded border text-xs ${
                          selected
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {selected && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    )}
                    {mode === "single" && selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span className="truncate">
                      {t.name}{" "}
                      <span className={selected ? "opacity-70" : "text-[var(--color-muted-foreground)]"}>
                        ({t.id})
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
