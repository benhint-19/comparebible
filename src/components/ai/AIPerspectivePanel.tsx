"use client";

// ---------------------------------------------------------------------------
// AIPerspectivePanel -- slide-in right panel for AI perspectives
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import { useAIStore } from "@/store/aiStore";
import { personas } from "@/lib/ai/personas";
import { useGemini } from "@/hooks/useGemini";
import PersonaCard from "@/components/ai/PersonaCard";
import CombinedAnalysis from "@/components/ai/CombinedAnalysis";

export default function AIPerspectivePanel() {
  const isPanelOpen = useAIStore((s) => s.isPanelOpen);
  const togglePanel = useAIStore((s) => s.togglePanel);
  const selectedPersona = useAIStore((s) => s.selectedPersona);
  const setPersona = useAIStore((s) => s.setPersona);
  const selectedPersonas = useAIStore((s) => s.selectedPersonas);

  const [showCombined, setShowCombined] = useState(false);

  return (
    <>
      {/* Backdrop on mobile */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={togglePanel}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full z-50
          w-full md:w-[400px]
          bg-[var(--background)] border-l border-[var(--border)]
          shadow-xl
          transition-transform duration-300 ease-in-out
          ${isPanelOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            AI Perspectives
          </h2>
          <button
            onClick={togglePanel}
            className="p-1.5 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Persona selector grid */}
          <div className="grid grid-cols-2 gap-2">
            {selectedPersonas.map((id) => (
              <PersonaCard
                key={id}
                persona={personas[id]}
                isSelected={!showCombined && selectedPersona === id}
                onClick={() => {
                  setShowCombined(false);
                  setPersona(id);
                }}
              />
            ))}
          </div>

          {/* Combined Analysis button */}
          <button
            onClick={() => {
              setShowCombined(true);
              setPersona(null);
            }}
            className={`
              w-full rounded-lg border p-3 text-sm font-medium transition-all cursor-pointer
              ${
                showCombined
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--accent)]/50"
              }
            `}
          >
            Combined Analysis (All {selectedPersonas.length} Perspectives)
          </button>

          {/* Response area */}
          <div className="mt-2">
            {showCombined ? (
              <CombinedAnalysisWrapper />
            ) : selectedPersona ? (
              <SinglePersonaResponse personaId={selectedPersona} />
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                Select a perspective above to see AI analysis of the current
                passage.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

function CombinedAnalysisWrapper() {
  const passage = useAIStore((s) => s.currentPassage) ?? "";
  const verseText = useAIStore((s) => s.currentVerseText) ?? "";

  if (!passage) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
        Navigate to a chapter to see AI analysis.
      </p>
    );
  }

  return <CombinedAnalysis passage={passage} verseText={verseText} />;
}

function SinglePersonaResponse({ personaId }: { personaId: string }) {
  const persona = personas[personaId];
  const passage = useAIStore((s) => s.currentPassage) ?? "";
  const verseText = useAIStore((s) => s.currentVerseText) ?? "";
  const { streamResponse, isLoading, content, error } = useGemini();

  const handleGenerate = useCallback(() => {
    if (passage && verseText) {
      streamResponse(personaId, passage, verseText);
    }
  }, [personaId, passage, verseText, streamResponse]);

  if (!passage) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
        Navigate to a chapter to see AI analysis.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
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

      {!content && !isLoading && !error && (
        <button
          onClick={handleGenerate}
          className="w-full rounded-lg border border-[var(--accent)] text-[var(--accent)] py-2 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors cursor-pointer"
        >
          Generate Perspective
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {content && (
        <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}

      {content && !isLoading && (
        <button
          onClick={handleGenerate}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          Regenerate
        </button>
      )}
    </div>
  );
}
