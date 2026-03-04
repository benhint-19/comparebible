"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "@/store/audioStore";
import { useReaderStore } from "@/store/readerStore";
import { useTTS } from "@/hooks/useTTS";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { parseVoiceCommand } from "@/lib/voice/commands";
import type { ParsedBibleReference } from "@/lib/voice/references";
import { useAIStore } from "@/store/aiStore";
import { getBookById } from "@/lib/bible/books";
import { useRouter } from "next/navigation";

interface SimpleVerse {
  number: number;
  text: string;
}

/**
 * Orchestrates Audio Mode — verse-by-verse TTS playback with always-on
 * voice commands. Provide the list of verses in the current chapter so
 * the hook can read them sequentially.
 */
export function useAudioMode(verses: SimpleVerse[]) {
  const router = useRouter();

  const audioMode = useAudioStore((s) => s.audioMode);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentVerseIndex = useAudioStore((s) => s.currentVerseIndex);
  const playbackSpeed = useAudioStore((s) => s.playbackSpeed);
  const audioIsListening = useAudioStore((s) => s.isListening);

  const {
    play: audioPlay,
    pause: audioPause,
    setCurrentVerse,
    setTotalVerses,
    setAudioMode,
    nextVerse: audioNextVerse,
    prevVerse: audioPrevVerse,
    setIsListening: setAudioListening,
  } = useAudioStore.getState();

  const navigateTo = useReaderStore((s) => s.navigateTo);
  const currentBook = useReaderStore((s) => s.currentBook);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const toggleVerseExpanded = useReaderStore((s) => s.toggleVerseExpanded);
  const nextChapter = useReaderStore((s) => s.nextChapter);
  const prevChapter = useReaderStore((s) => s.prevChapter);

  const setCurrentPassage = useAIStore((s) => s.setCurrentPassage);
  const toggleAIPanel = useAIStore((s) => s.togglePanel);
  const isAIPanelOpen = useAIStore((s) => s.isPanelOpen);

  const { speak, stop: stopTTS, isSpeaking, isSupported: ttsSupported } = useTTS(playbackSpeed);
  const {
    startListening,
    stopListening,
    isListening: micIsListening,
    transcript,
    isSupported: micSupported,
  } = useVoiceRecognition();

  // Refs to keep callbacks stable while accessing latest state
  const versesRef = useRef(verses);
  versesRef.current = verses;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const currentVerseRef = useRef(currentVerseIndex);
  currentVerseRef.current = currentVerseIndex;
  const audioModeRef = useRef(audioMode);
  audioModeRef.current = audioMode;
  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  // Track previous listening state to detect end-of-recognition
  const wasListeningRef = useRef(false);

  // Update total verses when the verse list changes
  useEffect(() => {
    setTotalVerses(verses.length);
  }, [verses.length, setTotalVerses]);

  // -----------------------------------------------------------------------
  // Scroll the active verse into view
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!audioMode) return;

    const el = document.querySelector(`[data-verse="${currentVerseIndex}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [audioMode, currentVerseIndex]);

  // -----------------------------------------------------------------------
  // Read the current verse aloud, then advance to the next one
  // -----------------------------------------------------------------------
  const speakCurrentVerse = useCallback(() => {
    const vs = versesRef.current;
    const idx = useAudioStore.getState().currentVerseIndex;
    const verse = vs.find((v) => v.number === idx);

    if (!verse) return;

    speak(verse.text, () => {
      // When the verse finishes, advance to next if still playing
      const state = useAudioStore.getState();
      if (!state.audioMode || !state.isPlaying) return;

      if (idx < vs.length) {
        // Find the next verse number
        const currentIdx = vs.findIndex((v) => v.number === idx);
        if (currentIdx >= 0 && currentIdx < vs.length - 1) {
          useAudioStore.getState().setCurrentVerse(vs[currentIdx + 1].number);
        } else {
          // End of chapter
          useAudioStore.getState().pause();
        }
      } else {
        useAudioStore.getState().pause();
      }
    });
  }, [speak]);

  // -----------------------------------------------------------------------
  // When currentVerseIndex or isPlaying changes, speak the verse
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!audioMode || !isPlaying) return;

    speakCurrentVerse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioMode, isPlaying, currentVerseIndex]);

  // -----------------------------------------------------------------------
  // Stop TTS when paused or audio mode turns off
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!audioMode || !isPlaying) {
      stopTTS();
    }
  }, [audioMode, isPlaying, stopTTS]);

  // -----------------------------------------------------------------------
  // Always-on mic listening while in audio mode
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (audioMode && audioIsListening && micSupported && !micIsListening) {
      startListening();
    }
    if (!audioMode || !audioIsListening) {
      if (micIsListening) {
        stopListening();
      }
    }
  }, [audioMode, audioIsListening, micSupported, micIsListening, startListening, stopListening]);

  // Restart listening after recognition ends (continuous listening in audio mode)
  useEffect(() => {
    if (wasListeningRef.current && !micIsListening && audioModeRef.current && useAudioStore.getState().isListening) {
      // Small delay before restarting to avoid rapid cycles
      const timer = setTimeout(() => {
        if (audioModeRef.current && useAudioStore.getState().isListening) {
          startListening();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    wasListeningRef.current = micIsListening;
  }, [micIsListening, startListening]);

  // -----------------------------------------------------------------------
  // Process voice commands when transcript finalizes
  // -----------------------------------------------------------------------
  const lastTranscriptRef = useRef("");

  useEffect(() => {
    if (!audioMode) return;
    if (!transcript || transcript === lastTranscriptRef.current) return;
    // Only process when mic stops (transcript is final)
    if (micIsListening) return;

    lastTranscriptRef.current = transcript;
    const command = parseVoiceCommand(transcript, true);

    switch (command.type) {
      case "audio_pause":
        audioPause();
        break;

      case "audio_play":
        audioPlay();
        break;

      case "audio_exit":
      case "audio_stop":
        setAudioMode(false);
        break;

      case "audio_next_verse":
        audioNextVerse();
        break;

      case "audio_prev_verse":
        audioPrevVerse();
        break;

      case "audio_next_chapter":
        stopTTS();
        nextChapter();
        // Reset to verse 1 and keep playing
        setTimeout(() => {
          setCurrentVerse(1);
          audioPlay();
        }, 500);
        break;

      case "audio_prev_chapter":
        stopTTS();
        prevChapter();
        setTimeout(() => {
          setCurrentVerse(1);
          audioPlay();
        }, 500);
        break;

      case "audio_repeat":
        // Re-speak current verse
        stopTTS();
        setTimeout(() => speakCurrentVerse(), 100);
        break;

      case "audio_compare":
        // Pause and expand verse to show parallel translations
        audioPause();
        toggleVerseExpanded(currentVerseRef.current);
        break;

      case "audio_note":
        // Pause and expand verse so note editor is visible
        audioPause();
        toggleVerseExpanded(currentVerseRef.current);
        // Focus the note editor after expansion animation
        setTimeout(() => {
          const noteInput = document.querySelector<HTMLTextAreaElement>(
            `[data-verse="${currentVerseRef.current}"] textarea, [data-verse="${currentVerseRef.current}"] [data-note-editor]`,
          );
          noteInput?.focus();
        }, 400);
        break;

      case "audio_analyze": {
        // Pause, expand verse, and open AI analysis panel
        audioPause();
        toggleVerseExpanded(currentVerseRef.current);
        const verseNum = currentVerseRef.current;
        const verse = versesRef.current.find((v) => v.number === verseNum);
        if (verse) {
          const bookMeta = getBookById(currentBook);
          const bookName = bookMeta?.name ?? currentBook;
          const passage = `${bookName} ${currentChapter}:${verseNum}`;
          setCurrentPassage(passage, verse.text);
          if (!isAIPanelOpen) {
            toggleAIPanel();
          }
        }
        break;
      }

      case "navigate": {
        const ref = command.payload;
        if (ref && typeof ref === "object") {
          stopTTS();
          navigateTo((ref as ParsedBibleReference).bookId, (ref as ParsedBibleReference).chapter);
          router.push("/");
          setTimeout(() => {
            setCurrentVerse(1);
            audioPlay();
          }, 1000);
        }
        break;
      }

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, micIsListening, audioMode]);

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    return () => {
      stopTTS();
      stopListening();
    };
  }, [stopTTS, stopListening]);

  return {
    ttsSupported,
    micSupported,
  };
}
