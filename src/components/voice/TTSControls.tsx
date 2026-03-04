"use client";

import { useAudioStore, type PlaybackSpeed } from "@/store/audioStore";

const SPEED_OPTIONS: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5];

export function TTSControls() {
  const audioMode = useAudioStore((s) => s.audioMode);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentVerseIndex = useAudioStore((s) => s.currentVerseIndex);
  const totalVerses = useAudioStore((s) => s.totalVerses);
  const playbackSpeed = useAudioStore((s) => s.playbackSpeed);
  const isListening = useAudioStore((s) => s.isListening);

  // Only show in audio mode
  if (!audioMode) return null;

  const {
    play,
    pause,
    nextVerse,
    prevVerse,
    setPlaybackSpeed,
    setAudioMode,
    setIsListening,
  } = useAudioStore.getState();

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setPlaybackSpeed(next);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg bg-[var(--color-background)] border-t border-[var(--color-border)] shadow-2xl">
        {/* Main controls row */}
        <div className="flex items-center gap-1 px-3 py-2 sm:gap-2 sm:px-4">
          {/* Mic toggle */}
          <button
            onClick={() => setIsListening(!isListening)}
            aria-label={isListening ? "Mute microphone" : "Enable microphone"}
            className={`rounded-full p-2 transition-colors ${
              isListening
                ? "text-red-500 hover:bg-red-500/10"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
            }`}
          >
            {isListening ? (
              // Mic on
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
                <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
              </svg>
            ) : (
              // Mic off
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" opacity={0.3} />
                <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" opacity={0.3} />
                <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Prev verse */}
          <button
            onClick={prevVerse}
            disabled={currentVerseIndex <= 1}
            aria-label="Previous verse"
            className="rounded-full p-2 text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M19 5v14l-7-7 7-7ZM12 5v14l-7-7 7-7Z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => (isPlaying ? pause() : play())}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            )}
          </button>

          {/* Next verse */}
          <button
            onClick={nextVerse}
            disabled={currentVerseIndex >= totalVerses}
            aria-label="Next verse"
            className="rounded-full p-2 text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M5 5v14l7-7-7-7Zm7 0v14l7-7-7-7Z" />
            </svg>
          </button>

          {/* Verse indicator */}
          <span className="min-w-[5rem] text-center text-xs text-[var(--color-muted-foreground)] tabular-nums">
            Verse {currentVerseIndex} of {totalVerses}
          </span>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            aria-label={`Playback speed: ${playbackSpeed}x`}
            className="rounded-full px-2 py-1 text-xs font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] tabular-nums"
          >
            {playbackSpeed}x
          </button>

          {/* Exit audio mode */}
          <button
            onClick={() => setAudioMode(false)}
            aria-label="Exit audio mode"
            className="ml-auto rounded-full p-2 text-[var(--color-muted-foreground)] transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
