"use client";

import { useAIStore } from "@/store/aiStore";
import { personas, personaIds, defaultPersonaIds } from "@/lib/ai/personas";
import { useState } from "react";

const MAX_PERSONAS = 6;

export default function PersonaSettings() {
  const selectedPersonas = useAIStore((s) => s.selectedPersonas);
  const setSelectedPersonas = useAIStore((s) => s.setSelectedPersonas);
  const [warning, setWarning] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (selectedPersonas.includes(id)) {
      // Removing — enforce minimum 1
      if (selectedPersonas.length <= 1) {
        setWarning("You must keep at least 1 perspective selected.");
        return;
      }
      setWarning(null);
      setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
    } else {
      // Adding — enforce maximum 6
      if (selectedPersonas.length >= MAX_PERSONAS) {
        setWarning(
          `You can select up to ${MAX_PERSONAS} perspectives. Deselect one first.`,
        );
        return;
      }
      setWarning(null);
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  const resetToDefaults = () => {
    setWarning(null);
    setSelectedPersonas(defaultPersonaIds);
  };

  return (
    <div className="space-y-3">
      {warning && (
        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
          {warning}
        </p>
      )}

      <div className="space-y-2">
        {personaIds.map((id) => {
          const persona = personas[id];
          const isSelected = selectedPersonas.includes(id);

          return (
            <label
              key={id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors cursor-pointer ${
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] bg-[var(--color-background)]"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(id)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              />
              <span className="text-lg leading-none">{persona.icon}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${persona.color}`}>
                  {persona.name}
                </span>
                <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                  {persona.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {selectedPersonas.length} / {MAX_PERSONAS} selected
        </span>
        <button
          onClick={resetToDefaults}
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
