"use client";

/**
 * Non-crisis result area: loading skeletons while the orchestrator streams,
 * the validated widget canvas with specialist/provenance chips on success,
 * and the honest degraded state on failure (styled error + retry + verified
 * helplines — never canned content presented as AI output). The live
 * activity rail sits alongside on desktop and below on mobile.
 */
import { AGENTS } from "@/lib/agents/registry";
import { EMERGENCY_RESOURCE_ID, HELPLINE_RESOURCE_IDS } from "@/lib/resources";
import type { ActivityEvent, AgentResponse } from "@/lib/schemas";
import type { InterveneStatus } from "@/lib/use-intervene";
import { ActivityRail } from "./activity-rail";
import { GENERATION_LABEL } from "./generation-label";
import { Widget, WidgetCanvas } from "./widget-renderer";

/** Accent CSS variable per agent accent token. */
const ACCENT: Record<string, string> = {
  teal: "var(--teal)",
  indigo: "var(--indigo)",
  crimson: "var(--crisis)",
  amber: "var(--amber)",
};

type Props = {
  status: InterveneStatus;
  response: AgentResponse | null;
  error: string | null;
  events: ActivityEvent[];
  onRetry: () => void;
};

/** Renders the working/done/error states next to the agent activity rail. */
export function ResultPanel({ status, response, error, events, onRetry }: Props) {
  const agent = response ? AGENTS[response.agentId] : null;
  if (status === "idle") return null;

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_270px]">
      <div className="flex flex-col gap-4" aria-busy={status === "working"}>
        {status === "working" && (
          <div role="status" className="flex flex-col gap-3">
            <span className="sr-only">Preparing your support plan…</span>
            <div className="shimmer h-36" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="shimmer h-28" />
              <div className="shimmer h-28" />
            </div>
          </div>
        )}

        {status === "done" && response && agent && (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{
                  color: ACCENT[agent.accent],
                  borderColor: `color-mix(in oklab, ${ACCENT[agent.accent]} 40%, transparent)`,
                }}
              >
                {agent.label}
              </span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)]">
                {GENERATION_LABEL[response.generation]}
              </span>
            </div>
            <p className="text-sm text-[var(--text-soft)]">{response.summary}</p>
            <WidgetCanvas response={response} />
          </>
        )}

        {status === "error" && (
          <div className="flex flex-col gap-4">
            <div className="surface flex flex-col gap-3 border-[var(--amber)]/40 p-5">
              <p className="font-semibold text-[var(--amber)]">
                Personalized AI guidance is temporarily unavailable.
              </p>
              <p className="text-sm text-[var(--text-soft)]">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="self-start rounded-xl bg-[var(--teal)]/15 px-4 py-2.5 text-sm font-bold text-[var(--teal)] hover:bg-[var(--teal)]/25"
              >
                Try again
              </button>
            </div>
            <Widget
              spec={{
                type: "safety-actions",
                source: "verified",
                resourceIds: [EMERGENCY_RESOURCE_ID, ...HELPLINE_RESOURCE_IDS],
                note: "Verified helplines — available even when AI is not.",
              }}
            />
          </div>
        )}
      </div>

      <ActivityRail events={events} />
    </div>
  );
}
