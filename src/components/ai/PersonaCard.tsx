"use client";

// ---------------------------------------------------------------------------
// PersonaCard -- small card for the persona selector grid
// ---------------------------------------------------------------------------

import type { Persona } from "@/lib/ai/types";

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onClick: () => void;
}

export default function PersonaCard({
  persona,
  isSelected,
  onClick,
}: PersonaCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-start gap-1 rounded-lg border p-3 text-left
        transition-all duration-150 cursor-pointer
        ${
          isSelected
            ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm"
            : "border-[var(--border)] bg-[var(--muted)] hover:border-[var(--accent)]/50"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{persona.icon}</span>
        <span
          className={`text-sm font-semibold ${isSelected ? persona.color : "text-[var(--foreground)]"}`}
        >
          {persona.name}
        </span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] leading-snug line-clamp-2">
        {persona.description}
      </p>
    </button>
  );
}
