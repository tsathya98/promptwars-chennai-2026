"use client";

/**
 * Idle-state architecture strip: explains the three-stage pipeline (route →
 * generate → act) in plain language and shows the verified-source chips.
 * Replaces an empty canvas with trust-building content before the first tap.
 */
import type { ComponentType, SVGProps } from "react";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const STEPS: ReadonlyArray<{ kicker: string; title: string; body: string; icon: Icon }> = [
  {
    kicker: "route",
    title: "Deterministic safety first",
    body: "Every tap, sentence, or voice note passes a safety router. Emergencies get verified 112 guidance instantly — no AI in the path.",
    icon: ShieldCheck,
  },
  {
    kicker: "generate",
    title: "One specialist, one plan",
    body: "A recovery specialist personalizes your plan with live AI — checked twice against our safety rules before anything reaches your screen.",
    icon: Sparkles,
  },
  {
    kicker: "act",
    title: "Real actions, honestly reported",
    body: "Call, message, breathe, share — every action opens your own apps and says “opened”, never “sent”.",
    icon: HeartHandshake,
  },
];

const VERIFIED_CHIPS = [
  "112 · Emergency (ERSS)",
  "14446 · De-addiction helpline",
  "14416 · Tele-MANAS",
] as const;

/** Renders the three pipeline cards and verified-source chips. */
export function HowItWorks() {
  return (
    <section aria-label="How IBUKI Circle works" className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          return (
            <div key={step.kicker} className="surface reveal p-5" style={{ animationDelay: `${i * 90}ms` }}>
              <p className="kicker mb-3">
                0{i + 1} · {step.kicker}
              </p>
              <p className="mb-2 flex items-center gap-2 text-[15px] font-bold">
                <StepIcon className="h-4 w-4 text-[var(--teal)]" aria-hidden />
                {step.title}
              </p>
              <p className="text-sm leading-relaxed text-[var(--text-soft)]">{step.body}</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="kicker">[ Verified sources ]</span>
        {VERIFIED_CHIPS.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)]"
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}
