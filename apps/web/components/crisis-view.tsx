"use client";

/**
 * Level-1 crisis view: the interface collapses to one primary action
 * (Call 112) plus verified protocol widgets — no decorative motion, no
 * competing choices, and keyboard focus lands on the call action the moment
 * the view mounts. Exiting is always an explicit user choice.
 */
import { useEffect, useRef } from "react";
import { PhoneCall, Siren } from "lucide-react";
import { buildTelLink } from "@/lib/connectors";
import type { AgentResponse } from "@/lib/schemas";
import { GENERATION_LABEL } from "./generation-label";
import { WidgetCanvas } from "./widget-renderer";

type Props = {
  response: AgentResponse;
  onExit: () => void;
};

/** Renders the focused emergency screen for an emergency-level response. */
export function CrisisView({ response, onExit }: Props) {
  const callRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    callRef.current?.focus();
  }, []);

  return (
    <section
      aria-live="assertive"
      className="flex flex-col gap-5 rounded-2xl border-2 border-[var(--crisis)] bg-[#1d1315] p-5 md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-[var(--crisis-soft)]">
          <Siren className="h-6 w-6" aria-hidden />
          Emergency support
        </h2>
        <span className="rounded-full border border-[var(--indigo)]/40 px-3 py-1 text-xs font-medium text-[var(--indigo)]">
          {GENERATION_LABEL[response.generation]}
        </span>
      </div>
      <a
        ref={callRef}
        href={buildTelLink("112")}
        className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-[var(--crisis)] text-xl font-extrabold text-white transition-colors hover:bg-[#c73a44]"
      >
        <PhoneCall className="h-6 w-6" aria-hidden />
        Call 112 now
      </a>
      <p className="text-sm text-[var(--text-soft)]">{response.summary}</p>
      <WidgetCanvas response={response} />
      <button
        type="button"
        onClick={onExit}
        className="mt-1 self-start rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)]"
      >
        I&apos;m safe — leave emergency view
      </button>
    </section>
  );
}
