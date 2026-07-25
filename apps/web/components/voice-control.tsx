"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Props = {
  disabled?: boolean;
  onTranscript: (text: string) => void;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

/**
 * Voice input via the browser Speech Recognition API. Feature-detected; the
 * one-tap buttons remain the primary zero-typing path when unsupported or when
 * microphone permission is declined. Audio and transcripts are never stored.
 */
export function VoiceControl({ disabled, onTranscript }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);

    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText.trim()) {
        setInterim("");
        recognition.stop();
        onTranscriptRef.current(finalText.trim());
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setInterim("");
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      setInterim("");
      try {
        recognition.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Speak instead of typing"}
        className={`flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
          listening
            ? "border-[var(--teal)] bg-[var(--teal)]/15 text-[var(--teal)]"
            : "border-[var(--line)] text-[var(--text-soft)] hover:border-[var(--line-hi)] hover:text-[var(--text)]"
        }`}
      >
        {listening ? (
          <>
            <span aria-hidden className="dot-working h-2 w-2 rounded-full bg-[var(--teal)]" />
            <Square className="h-4 w-4" aria-hidden />
          </>
        ) : (
          <Mic className="h-4 w-4" aria-hidden />
        )}
        <span className="hidden sm:inline">{listening ? "Listening…" : "Speak"}</span>
      </button>
      {interim && (
        <span className="max-w-48 truncate text-sm italic text-[var(--text-soft)]" aria-live="polite">
          “{interim}”
        </span>
      )}
    </div>
  );
}
