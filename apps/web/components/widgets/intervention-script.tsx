"use client";

/**
 * Intervention script widget: a short validating acknowledgement plus one to
 * three immediate coping steps. "One step at a time" switches to a focused
 * single-step view (one huge instruction + a Done button) for the highest
 * cognitive-load moments; "Read aloud" uses the natural server TTS voice
 * (with browser speech as fallback) in the response's language.
 */
import { useRef, useState } from "react";
import { ArrowLeft, ListMinus, ListOrdered, Volume2, VolumeX } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/connectors";
import type { WidgetSpec } from "@/lib/schemas";
import { SourceBadge } from "./source-badge";
import { WidgetShell } from "./widget-shell";

type Props = {
  spec: Extract<WidgetSpec, { type: "intervention-script" }>;
  /** BCP-47 speech locale, e.g. "ta-IN" — used by the browser fallback. */
  speechLang: string;
  /** Response language code, e.g. "ta" — steers the server TTS voice. */
  language?: string;
};

/** Renders the acknowledgement + numbered steps with read-aloud controls. */
export function InterventionScript({ spec, speechLang, language }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const modeToggleRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const fullText = `${spec.acknowledgement} ${spec.steps.join(". ")}`;
  const lastStep = stepIndex >= spec.steps.length - 1;

  const advanceStep = () => {
    if (lastStep) {
      // Exiting step mode: keep keyboard focus on a real control, not <body>.
      setStepMode(false);
      setStepIndex(0);
      modeToggleRef.current?.focus();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const backStep = () => {
    const next = Math.max(0, stepIndex - 1);
    setStepIndex(next);
    // Back disables itself at step 1 — move focus before it goes inert.
    if (next === 0) nextButtonRef.current?.focus();
  };

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    void speak(fullText, { lang: speechLang, language, onEnd: () => setSpeaking(false) }).then(
      (result) => {
        if (result.status === "failed") setSpeaking(false);
      },
    );
  };

  return (
    <WidgetShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SourceBadge source={spec.source} />
        <div className="flex gap-2">
          <button
            ref={modeToggleRef}
            type="button"
            onClick={() => {
              setStepMode((v) => !v);
              setStepIndex(0);
            }}
            aria-pressed={stepMode}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)]"
          >
            {stepMode ? <ListOrdered className="h-3.5 w-3.5" aria-hidden /> : <ListMinus className="h-3.5 w-3.5" aria-hidden />}
            {stepMode ? "Show all" : "One step at a time"}
          </button>
          <button
            type="button"
            onClick={toggleSpeak}
            aria-pressed={speaking}
            className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
              speaking
                ? "bg-[var(--teal)]/20 text-[var(--teal)]"
                : "bg-[var(--teal)]/10 text-[var(--teal)] hover:bg-[var(--teal)]/20"
            }`}
          >
            {speaking ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
            {speaking ? "Stop" : "Read aloud"}
          </button>
        </div>
      </div>
      {stepMode ? (
        /* Focused mode: one huge instruction, one obvious action. */
        <div className="flex flex-col items-center gap-5 py-4 text-center" aria-live="polite">
          <p className="kicker">
            Step {stepIndex + 1} of {spec.steps.length}
          </p>
          <p className="text-2xl font-bold leading-snug md:text-3xl">{spec.steps[stepIndex]}</p>
          <div aria-hidden className="flex gap-1.5">
            {spec.steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === stepIndex ? "bg-[var(--teal)]" : "bg-[var(--line-hi)]"}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={backStep}
              disabled={stepIndex === 0}
              className="flex min-h-12 items-center gap-1.5 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <button
              ref={nextButtonRef}
              type="button"
              onClick={advanceStep}
              className="flex min-h-12 items-center rounded-xl bg-[var(--teal)]/15 px-6 text-sm font-bold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/25"
            >
              {lastStep ? "Finished — show all" : "Done — next step"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="hero-serif mb-4 text-xl font-semibold leading-snug md:text-2xl">
            {spec.acknowledgement}
          </p>
          <ol className="flex flex-col gap-3">
            {spec.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--teal)]/15 font-mono text-sm font-bold text-[var(--teal)]"
                >
                  {i + 1}
                </span>
                <p className="text-base leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </WidgetShell>
  );
}
