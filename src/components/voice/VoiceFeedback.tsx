"use client";

import { useEffect, useState } from "react";
import { useVoiceStore } from "@/store/voiceStore";

export function VoiceFeedback() {
  const { isListening, transcript } = useVoiceStore();
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

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-x-0 bottom-24 z-50 flex justify-center px-4
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
