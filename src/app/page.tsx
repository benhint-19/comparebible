"use client";

import AppHeader from "@/components/reader/AppHeader";
import ChapterView from "@/components/reader/ChapterView";
import ChapterNav from "@/components/reader/ChapterNav";
import AIPerspectivePanel from "@/components/ai/AIPerspectivePanel";
import { VoiceFab } from "@/components/voice/VoiceFab";
import { VoiceFeedback } from "@/components/voice/VoiceFeedback";
import { TTSControls } from "@/components/voice/TTSControls";
import OfflineBanner from "@/components/ui/OfflineBanner";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <OfflineBanner />
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
        <ChapterView />
      </main>

      <ChapterNav />

      <AIPerspectivePanel />
      <VoiceFab />
      <VoiceFeedback />
      <TTSControls />
    </div>
  );
}
