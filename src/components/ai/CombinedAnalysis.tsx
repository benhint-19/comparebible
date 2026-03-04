"use client";

// ---------------------------------------------------------------------------
// CombinedAnalysis -- all 6 personas streaming simultaneously
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { personas } from "@/lib/ai/personas";
import { useGemini } from "@/hooks/useGemini";
import { useAIStore } from "@/store/aiStore";

interface CombinedCardProps {
  personaId: string;
  passage: string;
  verseText: string;
}

function CombinedCard({ personaId, passage, verseText }: CombinedCardProps) {
  const { streamResponse, isLoading, content, error } = useGemini();
  const startedRef = useRef(false);
  const persona = personas[personaId];

  useEffect(() => {
    if (!startedRef.current && passage && verseText) {
      startedRef.current = true;
      streamResponse(personaId, passage, verseText);
    }
  }, [personaId, passage, verseText, streamResponse]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{persona.icon}</span>
        <h3 className={`text-sm font-semibold ${persona.color}`}>
          {persona.name}
        </h3>
        {isLoading && (
          <span className="ml-auto text-xs text-[var(--muted-foreground)] animate-pulse">
            streaming...
          </span>
        )}
      </div>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
          {content || (
            <span className="text-[var(--muted-foreground)]">Loading...</span>
          )}
        </p>
      )}
    </div>
  );
}

interface CombinedAnalysisProps {
  passage: string;
  verseText: string;
}

export default function CombinedAnalysis({
  passage,
  verseText,
}: CombinedAnalysisProps) {
  const selectedPersonas = useAIStore((s) => s.selectedPersonas);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {selectedPersonas.map((id) => (
        <CombinedCard
          key={id}
          personaId={id}
          passage={passage}
          verseText={verseText}
        />
      ))}
    </div>
  );
}
