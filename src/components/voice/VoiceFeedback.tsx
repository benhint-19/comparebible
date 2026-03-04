"use client";

import { useEffect, useState } from "react";
import { useVoiceStore } from "@/store/voiceStore";
import { useAudioStore } from "@/store/audioStore";

export function VoiceFeedback() {
  const { isListening, transcript } = useVoiceStore();
  const audioMode = useAudioStore((s) => s.audioMode);
  const [visible, setVisible] = useState(false);

  // Show while listening or briefly after recognition ends so the user
  // can see the final transcript before it fades out.
  useEffect(() => {
    if (isListening) {
      setVisible(true);
      return;
    }

    // Keep visible for a short period after listening stops
    if (transcript) {
      const timer = setTimeout(() => setVisible(false), 1800);
      return () => clearTimeout(timer);
    }

    setVisible(false);
  }, [isListening, transcript]);

  // In audio mode, show transcript feedback above the bottom bar
  // but only when mic picks something up
  if (!visible) return null;

  // In audio mode, position higher to avoid overlapping the controls bar
  const positionClass = audioMode
    ? "fixed inset-x-0 bottom-20 z-50"
    : "fixed inset-x-0 bottom-24 z-50";

  return (
    <div
      className={`
        ${positionClass} flex justify-center px-4
        transition-opacity duration-300
        ${isListening ? "opacity-100" : "opacity-60"}
      `}
    >
      <div className="max-w-md rounded-2xl bg-black/70 px-6 py-3 text-center text-white backdrop-blur-sm">
        {transcript ? (
          <p className="animate-pulse text-sm font-medium">{transcript}</p>
        ) : (
          <p className="text-sm text-white/70">Listening&hellip;</p>
        )}
      </div>
    </div>
  );
}
