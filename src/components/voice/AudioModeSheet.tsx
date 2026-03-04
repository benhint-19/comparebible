"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/store/audioStore";

export function AudioModeSheet({ onClose }: { onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg animate-slide-up rounded-t-2xl bg-[var(--color-background)] border-t border-[var(--color-border)] px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />

        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">Audio Mode</h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
          Selah will read the chapter aloud verse by verse. While listening, use voice commands to control playback.
        </p>

        <div className="mb-5 space-y-2 text-sm text-[var(--color-muted-foreground)]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span>&ldquo;Pause&rdquo; / &ldquo;Play&rdquo;</span>
            <span className="text-[var(--color-foreground)]">Control playback</span>
            <span>&ldquo;Skip&rdquo; / &ldquo;Go back&rdquo;</span>
            <span className="text-[var(--color-foreground)]">Navigate verses</span>
            <span>&ldquo;Compare&rdquo;</span>
            <span className="text-[var(--color-foreground)]">Show translations</span>
            <span>&ldquo;Analyze this&rdquo;</span>
            <span className="text-[var(--color-foreground)]">AI perspective</span>
            <span>&ldquo;Take a note&rdquo;</span>
            <span className="text-[var(--color-foreground)]">Open note editor</span>
            <span>&ldquo;Exit audio mode&rdquo;</span>
            <span className="text-[var(--color-foreground)]">Stop listening</span>
          </div>
        </div>

        <button
          onClick={() => {
            useAudioStore.getState().setAudioMode(true);
            onClose();
          }}
          className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Start Listening
        </button>
      </div>
    </div>
  );
}
