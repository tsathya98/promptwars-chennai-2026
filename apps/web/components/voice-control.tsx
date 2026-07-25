"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Props = {
  disabled?: boolean;
  /** BCP-47 speech code, e.g. "en-IN", "ta-IN". */
  lang?: string;
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
  onerror: ((event: { error?: string }) => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

/** Honest, user-visible explanations for recognition failures. */
const ERROR_HINTS: Record<string, string> = {
  "not-allowed": "Microphone permission is blocked — allow it in the address bar, or use the buttons.",
  "service-not-allowed":
    "This browser blocks speech-to-text (Brave does). Try Chrome/Edge — or use Live voice, which works here.",
  network:
    "This browser blocks speech-to-text (Brave does). Try Chrome/Edge — or use Live voice, which works here.",
  "no-speech": "Didn't catch anything — tap Speak and try again.",
  "audio-capture": "No microphone was found on this device.",
};

/**
 * Voice input via the browser Speech Recognition API. Feature-detected; the
 * one-tap buttons remain the primary zero-typing path when unsupported or when
 * microphone permission is declined. Audio and transcripts are never stored.
 */
export function VoiceControl({ disabled, lang = "en-IN", onTranscript }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const gotResultRef = useRef(false);
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
      if (interimText) {
        gotResultRef.current = true;
        setInterim(interimText);
      }
      if (finalText.trim()) {
        gotResultRef.current = true;
        setInterim("");
        recognition.stop();
        onTranscriptRef.current(finalText.trim());
      }
    };
    recognition.onend = () => {
      setListening(false);
      if (!gotResultRef.current) {
        setHint((h) => h ?? ERROR_HINTS["no-speech"]);
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      setInterim("");
      setHint(ERROR_HINTS[event.error ?? ""] ?? "Voice input hit a snag — the buttons always work.");
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
      setHint(null);
      gotResultRef.current = false;
      recognition.lang = lang;
      try {
        recognition.start();
        setListening(true);
      } catch {
        setListening(false);
        setHint("Voice input couldn't start — the buttons always work.");
      }
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Speak instead of typing"}
        className={`flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
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
        <span className="min-w-0 truncate text-sm italic text-[var(--text-soft)]" aria-live="polite">
          “{interim}”
        </span>
      )}
      {hint && !interim && (
        <span className="min-w-0 text-xs leading-tight text-[var(--amber)]" role="status">
          {hint}
        </span>
      )}
    </div>
  );
}
