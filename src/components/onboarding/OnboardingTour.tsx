"use client";

import { useState, useCallback } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslationStore } from "@/store/translationStore";
import { useAIStore } from "@/store/aiStore";
import { translationPresets } from "@/lib/bible/presets";
import { personas, personaIds } from "@/lib/ai/personas";
import TranslationSelect, { getAllTranslations } from "@/components/ui/TranslationSelect";
import QuizWizard from "@/components/quiz/QuizWizard";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

type StepId =
  | "welcome"
  | "primary-translation"
  | "parallel-translations"
  | "ai-perspectives"
  | "voice-overview"
  | "tour-navigation"
  | "tour-verses"
  | "tour-ai"
  | "tour-notes"
  | "tour-notes-page"
  | "tour-voice-controls"
  | "done";

const STEP_ORDER: StepId[] = [
  "welcome",
  "primary-translation",
  "parallel-translations",
  "ai-perspectives",
  "tour-navigation",
  "tour-verses",
  "tour-ai",
  "tour-notes",
  "tour-notes-page",
  "tour-voice-controls",
  "voice-overview",
  "done",
];

const STEP_META: Record<StepId, { title: string; phase: "setup" | "tour" | "meta" }> = {
  welcome:                { title: "Welcome",               phase: "meta" },
  "primary-translation":  { title: "Primary Translation",   phase: "setup" },
  "parallel-translations":{ title: "Parallel Translations",  phase: "setup" },
  "ai-perspectives":      { title: "Scholarly Perspectives", phase: "setup" },
  "voice-overview":       { title: "Voice Commands",        phase: "tour" },
  "tour-navigation":      { title: "Navigate",              phase: "tour" },
  "tour-verses":          { title: "Compare Verses",        phase: "tour" },
  "tour-ai":              { title: "Persona Analysis",      phase: "tour" },
  "tour-notes":           { title: "Take Notes",            phase: "tour" },
  "tour-notes-page":      { title: "View Notes",            phase: "tour" },
  "tour-voice-controls":  { title: "Audio Controls",        phase: "tour" },
  done:                   { title: "You're Ready!",          phase: "meta" },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function OnboardingTour() {
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const neverShowOnboarding = useSettingsStore((s) => s.neverShowOnboarding);
  const setOnboardingCompleted = useSettingsStore((s) => s.setOnboardingCompleted);
  const setQuizCompleted = useSettingsStore((s) => s.setQuizCompleted);

  const [stepIndex, setStepIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const currentStep = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const next = useCallback(() => {
    if (stepIndex < totalSteps - 1) setStepIndex((i) => i + 1);
  }, [stepIndex, totalSteps]);

  const back = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  const finish = useCallback(() => {
    setOnboardingCompleted(true);
    setQuizCompleted(true);
    setDismissed(true);
  }, [setOnboardingCompleted, setQuizCompleted]);

  const skip = useCallback(() => {
    setOnboardingCompleted(true);
    setQuizCompleted(true);
    setDismissed(true);
  }, [setOnboardingCompleted, setQuizCompleted]);

  // Don't show if completed, never-show, or dismissed this session
  if (onboardingCompleted || neverShowOnboarding || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/70" onClick={skip} />
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider">
              {STEP_META[currentStep].phase === "setup"
                ? "Setup"
                : STEP_META[currentStep].phase === "tour"
                ? "App Tour"
                : ""}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>
          <button
            onClick={skip}
            className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--color-muted)]"
          >
            Skip tour
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-[var(--color-border)]">
          <div
            className="h-1 bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {currentStep === "welcome" && <WelcomeStep />}
          {currentStep === "primary-translation" && (
            <PrimaryTranslationStep showQuiz={showQuiz} setShowQuiz={setShowQuiz} onQuizComplete={() => {
              setShowQuiz(false);
              next();
            }} />
          )}
          {currentStep === "parallel-translations" && <ParallelTranslationsStep />}
          {currentStep === "ai-perspectives" && <AIPerspectivesStep />}
          {currentStep === "voice-overview" && <VoiceOverviewStep />}
          {currentStep === "tour-navigation" && <TourNavigationStep />}
          {currentStep === "tour-verses" && <TourVersesStep />}
          {currentStep === "tour-ai" && <TourAIStep />}
          {currentStep === "tour-notes" && <TourNotesStep />}
          {currentStep === "tour-notes-page" && <TourNotesPageStep />}
          {currentStep === "tour-voice-controls" && <TourVoiceControlsStep />}
          {currentStep === "done" && <DoneStep />}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Back
          </button>
          {currentStep === "done" ? (
            <button
              onClick={finish}
              className="px-6 py-2 text-sm rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Start Reading
            </button>
          ) : (
            <button
              onClick={next}
              className="px-6 py-2 text-sm rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function WelcomeStep() {
  return (
    <div className="text-center space-y-4">
      <div className="text-5xl">
        <span className="inline-block animate-pulse">&#9776;</span>
      </div>
      <h2 className="text-2xl font-bold">Welcome to Selah</h2>
      <p className="text-[var(--color-muted-foreground)] leading-relaxed">
        Compare Bible translations side by side, explore scholarly perspectives from multiple viewpoints,
        listen in audio mode, and save notes on any verse.
      </p>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        This quick tour will help you set up your preferences and show you around the app.
        It takes about 2 minutes.
      </p>
      <div className="pt-2 flex items-center justify-center gap-6 text-xs text-[var(--color-muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          Setup preferences
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]/50" />
          Learn the app
        </span>
      </div>
    </div>
  );
}

function PrimaryTranslationStep({
  showQuiz,
  setShowQuiz,
  onQuizComplete,
}: {
  showQuiz: boolean;
  setShowQuiz: (v: boolean) => void;
  onQuizComplete: () => void;
}) {
  const { primaryTranslation, setPrimary } = useTranslationStore();
  const allTranslations = getAllTranslations();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">&#128214;</span>
        <div>
          <h2 className="text-lg font-bold">Choose Your Primary Translation</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            This is the main Bible text you'll read. Not sure which one? Take the quick quiz.
          </p>
        </div>
      </div>

      {showQuiz ? (
        <div className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
          <QuizWizard onComplete={onQuizComplete} />
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowQuiz(true)}
            className="w-full rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 px-4 py-3 text-sm text-[var(--color-accent)] font-medium hover:bg-[var(--color-accent)]/10 transition-colors text-left"
          >
            <span className="block font-semibold">Take the Translation Quiz</span>
            <span className="block text-xs text-[var(--color-muted-foreground)] mt-0.5">
              Answer a few questions to find your best match
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 border-t border-[var(--color-border)]" />
            <p className="relative text-center text-xs text-[var(--color-muted-foreground)] bg-[var(--color-background)] px-3 w-fit mx-auto">
              or choose manually
            </p>
          </div>

          <TranslationSelect
            mode="single"
            value={primaryTranslation}
            onChange={setPrimary}
            translations={allTranslations}
          />
        </>
      )}
    </div>
  );
}

function ParallelTranslationsStep() {
  const { parallelTranslations, setParallel, addParallel, removeParallel } = useTranslationStore();
  const allTranslations = getAllTranslations();
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">&#128203;</span>
        <div>
          <h2 className="text-lg font-bold">Parallel Translations</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            When you tap a verse, you'll see how it reads in these translations.
            Pick a preset or choose your own.
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
        {translationPresets.map((preset) => {
          const isActive =
            preset.translationIds.length === parallelTranslations.length &&
            preset.translationIds.every((id) => parallelTranslations.includes(id));
          return (
            <button
              key={preset.id}
              onClick={() => setParallel(preset.translationIds)}
              className={`w-full text-left rounded-lg border transition-colors cursor-pointer px-3 py-2.5 ${
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)]/50"
              }`}
            >
              <span className="text-sm font-medium">{preset.name}</span>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowManual(!showManual)}
        className="text-xs text-[var(--color-accent)] hover:underline"
      >
        {showManual ? "Hide manual selection" : "Or pick translations manually"}
      </button>

      {showManual && (
        <TranslationSelect
          mode="multi"
          value={parallelTranslations}
          onChange={(id, checked) => {
            if (checked) addParallel(id);
            else removeParallel(id);
          }}
          translations={allTranslations}
          placeholder="Search to add or remove..."
        />
      )}
    </div>
  );
}

function AIPerspectivesStep() {
  const selectedPersonas = useAIStore((s) => s.selectedPersonas);
  const setSelectedPersonas = useAIStore((s) => s.setSelectedPersonas);
  const [warning, setWarning] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (selectedPersonas.includes(id)) {
      if (selectedPersonas.length <= 1) {
        setWarning("Keep at least 1 perspective selected.");
        return;
      }
      setWarning(null);
      setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
    } else {
      if (selectedPersonas.length >= 6) {
        setWarning("Maximum 6 perspectives. Deselect one first.");
        return;
      }
      setWarning(null);
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">&#129504;</span>
        <div>
          <h2 className="text-lg font-bold">Scholarly Perspectives</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Choose up to 6 scholarly viewpoints for persona-driven verse analysis.
            Each perspective interprets passages through a different lens.
          </p>
        </div>
      </div>

      {warning && (
        <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
          {warning}
        </p>
      )}

      <div className="space-y-1.5 max-h-[45vh] overflow-y-auto">
        {personaIds.map((id) => {
          const persona = personas[id];
          const isSelected = selectedPersonas.includes(id);
          return (
            <label
              key={id}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border transition-colors cursor-pointer ${
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
              <span className="text-base leading-none">{persona.icon}</span>
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

      <p className="text-xs text-[var(--color-muted-foreground)] text-center">
        {selectedPersonas.length} / 6 selected
      </p>
    </div>
  );
}

function VoiceOverviewStep() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">&#127908;</span>
        <div>
          <h2 className="text-lg font-bold">Voice Commands</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Selah has an audio mode that reads chapters aloud. Control everything hands-free with voice commands.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
          <h3 className="font-medium text-[var(--color-foreground)] mb-2">Playback</h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--color-muted-foreground)]">
            <span>&ldquo;Pause&rdquo; / &ldquo;Play&rdquo;</span><span>Control playback</span>
            <span>&ldquo;Skip&rdquo; / &ldquo;Go back&rdquo;</span><span>Navigate verses</span>
            <span>&ldquo;Repeat&rdquo;</span><span>Re-read current verse</span>
            <span>&ldquo;Next chapter&rdquo;</span><span>Move to next chapter</span>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
          <h3 className="font-medium text-[var(--color-foreground)] mb-2">Exploration</h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--color-muted-foreground)]">
            <span>&ldquo;Compare&rdquo;</span><span>Show parallel translations</span>
            <span>&ldquo;Analyze this&rdquo;</span><span>Open persona analysis</span>
            <span>&ldquo;Take a note&rdquo;</span><span>Open note editor</span>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
          <h3 className="font-medium text-[var(--color-foreground)] mb-2">Navigation</h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--color-muted-foreground)]">
            <span>&ldquo;Go to John 3&rdquo;</span><span>Jump to any chapter</span>
            <span>&ldquo;Go to Romans 8:28&rdquo;</span><span>Jump to a specific verse</span>
            <span>&ldquo;Exit audio mode&rdquo;</span><span>Turn off audio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tour steps (illustrative descriptions of app features)
// ---------------------------------------------------------------------------

function TourStepLayout({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl block mb-2">{icon}</span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function TourNavigationStep() {
  return (
    <TourStepLayout icon="&#128204;" title="Navigating Books & Chapters">
      <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-muted)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-foreground)]">Book Picker</p>
            <p>Tap the book name in the top-left header to open the book and chapter picker. Switch between Old and New Testament.</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-muted)] flex items-center justify-center shrink-0 text-xs font-bold">
            OT NT
          </div>
          <div>
            <p className="font-medium text-[var(--color-foreground)]">Testament Switcher</p>
            <p>Toggle between Old Testament and New Testament using the tabs below the header.</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-muted)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-foreground)]">Chapter Navigation</p>
            <p>Use the Previous/Next buttons at the bottom of the screen to move between chapters.</p>
          </div>
        </div>
      </div>
    </TourStepLayout>
  );
}

function TourVersesStep() {
  return (
    <TourStepLayout icon="&#128270;" title="Compare Translations">
      <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <p className="mb-3">
            <span className="font-medium text-[var(--color-foreground)]">Tap any verse</span> to expand it
            and see how your parallel translations render the same passage.
          </p>
          {/* Mini illustration */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3 space-y-2">
            <p className="text-xs">
              <span className="text-[var(--color-accent)] font-bold">1</span>{" "}
              In the beginning God created the heavens and the earth.
            </p>
            <div className="ml-3 pl-3 border-l-2 border-[var(--color-accent)]/30 space-y-1.5">
              <p className="text-xs">
                <span className="inline-block px-1.5 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-medium mr-1">NIV</span>
                In the beginning God created the heavens and the earth.
              </p>
              <p className="text-xs">
                <span className="inline-block px-1.5 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-medium mr-1">KJV</span>
                In the beginning God created the heaven and the earth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TourStepLayout>
  );
}

function TourAIStep() {
  return (
    <TourStepLayout icon="&#10024;" title="Persona Analysis">
      <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-3">
          <p>
            After expanding a verse, tap the{" "}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-muted)] text-xs font-medium text-[var(--color-foreground)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2.5 7.5H22l-6 4.5 2.5 7.5L12 18l-6.5 4.5L8 15 2 10.5h7.5z"/></svg>
              Persona Analysis
            </span>{" "}
            button to open the perspectives panel.
          </p>
          <p>
            Choose a perspective to see how that scholar would interpret the passage.
            Or tap <span className="font-medium text-[var(--color-foreground)]">Combined Analysis</span> to
            hear from all your selected perspectives at once.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {["Academic Theologian", "Evangelical Pastor", "Catholic Scholar", "Jewish Scholar"].map((name) => (
              <div key={name} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-1.5 text-xs text-center">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TourStepLayout>
  );
}

function TourNotesStep() {
  return (
    <TourStepLayout icon="&#128221;" title="Save Notes">
      <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-3">
          <p>
            When a verse is expanded, tap{" "}
            <span className="font-medium text-[var(--color-foreground)]">+ Add note</span>{" "}
            below the translations to save your thoughts on that verse.
          </p>
          <p>
            Verses with notes show a small{" "}
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 align-middle" />{" "}
            amber dot next to their verse number so you can spot them while reading.
          </p>
          {/* Mini illustration */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[var(--color-accent)] text-xs font-bold">6</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-xs italic">
              &ldquo;This reminds me of...&rdquo;
            </div>
          </div>
        </div>
      </div>
    </TourStepLayout>
  );
}

function TourNotesPageStep() {
  return (
    <TourStepLayout icon="&#128209;" title="View All Notes">
      <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-3">
          <p>
            Tap the{" "}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
              </svg>
            </span>{" "}
            notes icon in the top-right header to see all your saved notes.
          </p>
          <p>
            The notes page lets you search through your notes, see which verse each
            note belongs to, and tap any note to jump directly to that passage.
          </p>
        </div>
      </div>
    </TourStepLayout>
  );
}

function TourVoiceControlsStep() {
  return (
    <TourStepLayout icon="&#127911;" title="Audio Mode Controls">
      <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-3">
          <p>
            Tap the{" "}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
              </svg>
            </span>{" "}
            headphones icon in the header to enter audio mode.
          </p>

          <p className="font-medium text-[var(--color-foreground)]">The audio toolbar appears at the bottom:</p>

          {/* Mini control bar illustration */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </div>
              <span className="text-[10px]">Mic</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px]">Prev</span>
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span className="text-[10px]">Next</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px]">Speed</span>
              <span className="text-[10px]">Voice</span>
              <span className="text-[10px] text-red-400">Exit</span>
            </div>
          </div>

          <ul className="text-xs space-y-1">
            <li><span className="font-medium text-[var(--color-foreground)]">Mic (red)</span> &mdash; Toggle voice command listening</li>
            <li><span className="font-medium text-[var(--color-foreground)]">Prev / Next</span> &mdash; Move between verses</li>
            <li><span className="font-medium text-[var(--color-foreground)]">Play / Pause</span> &mdash; Control TTS playback</li>
            <li><span className="font-medium text-[var(--color-foreground)]">Speed</span> &mdash; Cycle 0.75x, 1x, 1.25x, 1.5x</li>
            <li><span className="font-medium text-[var(--color-foreground)]">Voice</span> &mdash; Pick a TTS voice</li>
            <li><span className="font-medium text-[var(--color-foreground)]">Exit</span> &mdash; Leave audio mode</li>
          </ul>
        </div>
      </div>
    </TourStepLayout>
  );
}

function DoneStep() {
  const neverShowOnboarding = useSettingsStore((s) => s.neverShowOnboarding);
  const setNeverShowOnboarding = useSettingsStore((s) => s.setNeverShowOnboarding);

  return (
    <div className="text-center space-y-5">
      <div className="text-5xl">&#127881;</div>
      <h2 className="text-2xl font-bold">You&apos;re All Set!</h2>
      <p className="text-[var(--color-muted-foreground)] leading-relaxed">
        Your preferences are saved. Start reading and tap any verse to explore translations,
        scholarly perspectives, and notes.
      </p>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        You can relaunch this tour anytime from <span className="font-medium text-[var(--color-foreground)]">Settings</span>.
      </p>

      <label className="flex items-center justify-center gap-2 text-sm text-[var(--color-muted-foreground)] cursor-pointer">
        <input
          type="checkbox"
          checked={neverShowOnboarding}
          onChange={(e) => setNeverShowOnboarding(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
        />
        Never show this again
      </label>
    </div>
  );
}
