"use client";

/**
 * Intervention script widget: a short validating acknowledgement plus one to
 * three immediate coping steps. "Fewer words" collapses to steps only for
 * high-cognitive-load moments; "Read aloud" uses the natural server TTS voice
 * (with browser speech as fallback) in the response's language.
 */
import { useState } from "react";
import { ListMinus, Volume2, VolumeX } from "lucide-react";
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
  const [fewerWords, setFewerWords] = useState(false);
  const fullText = `${spec.acknowledgement} ${spec.steps.join(". ")}`;

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
            type="button"
            onClick={() => setFewerWords((v) => !v)}
            aria-pressed={fewerWords}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)]"
          >
            <ListMinus className="h-3.5 w-3.5" aria-hidden />
            Fewer words
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
      {!fewerWords && (
        <p className="hero-serif mb-4 text-xl font-semibold leading-snug md:text-2xl">
          {spec.acknowledgement}
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {spec.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--teal)]/15 font-mono text-sm font-bold text-[var(--teal)]"
            >
              {i + 1}
            </span>
            <p className={`leading-relaxed ${fewerWords ? "text-lg font-semibold" : "text-base"}`}>{step}</p>
          </li>
        ))}
      </ol>
    </WidgetShell>
  );
}
