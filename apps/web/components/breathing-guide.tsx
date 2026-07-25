"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type Props = {
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  cycles: number;
};

type Phase = "inhale" | "hold" | "exhale";

const PHASE_LABEL: Record<Phase, string> = {
  inhale: "Breathe in",
  hold: "Hold gently",
  exhale: "Breathe out",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Paced-breathing widget — the only sanctioned distress-state animation.
 * Pausable and stoppable; reduced-motion users get the text pacer without the
 * scaling circle. Breath exercises don't suit everyone: it never autostarts.
 */
export function BreathingGuide({ inhaleSeconds, holdSeconds, exhaleSeconds, cycles }: Props) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!running || done) return;
    const durations: Record<Phase, number> = {
      inhale: inhaleSeconds,
      hold: holdSeconds,
      exhale: exhaleSeconds,
    };
    const timer = setTimeout(() => {
      if (phase === "inhale") {
        setPhase(holdSeconds > 0 ? "hold" : "exhale");
      } else if (phase === "hold") {
        setPhase("exhale");
      } else {
        if (cycle + 1 >= cycles) {
          setDone(true);
          setRunning(false);
          return;
        }
        setCycle((c) => c + 1);
        setPhase("inhale");
      }
    }, durations[phase] * 1000);
    return () => clearTimeout(timer);
  }, [running, done, phase, cycle, inhaleSeconds, holdSeconds, exhaleSeconds, cycles]);

  const restart = () => {
    setPhase("inhale");
    setCycle(0);
    setDone(false);
    setRunning(true);
  };

  const expanded = running && phase !== "exhale";
  const phaseDuration = phase === "inhale" ? inhaleSeconds : phase === "exhale" ? exhaleSeconds : 0.3;
  const phaseSeconds =
    phase === "inhale" ? inhaleSeconds : phase === "hold" ? holdSeconds : exhaleSeconds;

  return (
    <div className="flex flex-col items-center gap-4 p-2 text-center">
      {!reducedMotion && (
        <div className="flex h-32 items-center justify-center" aria-hidden>
          <div
            className="breath-circle h-20 w-20 rounded-full border-2 border-[var(--teal)] bg-[var(--teal)]/10"
            style={{
              transform: `scale(${expanded ? 1.45 : 1})`,
              ["--breath-dur" as string]: `${phaseDuration}s`,
            }}
          />
        </div>
      )}
      <p className="min-h-6 text-lg font-semibold" aria-live="polite">
        {done
          ? `Nice work — ${cycles} ${cycles === 1 ? "cycle" : "cycles"} complete.`
          : running
            ? `${PHASE_LABEL[phase]} — ${phaseSeconds}s`
            : `Paced breathing: in ${inhaleSeconds}s${holdSeconds ? ` · hold ${holdSeconds}s` : ""} · out ${exhaleSeconds}s, ${cycles} cycles`}
      </p>
      {running && !done && (
        <p className="text-sm text-[var(--text-soft)]">
          Cycle {cycle + 1} of {cycles}
        </p>
      )}
      <div className="flex gap-2">
        {!done && (
          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--teal)]/15 px-5 py-2.5 text-sm font-semibold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/25"
          >
            {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            {running ? "Pause" : cycle > 0 || phase !== "inhale" ? "Resume" : "Start"}
          </button>
        )}
        {(done || cycle > 0 || phase !== "inhale") && (
          <button
            type="button"
            onClick={restart}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Restart
          </button>
        )}
      </div>
    </div>
  );
}
