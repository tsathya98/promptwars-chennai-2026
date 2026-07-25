"use client";

import type { ActivityEvent } from "@/lib/schemas";
import {
  BadgeCheck,
  LayoutGrid,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

const STAGE_ICONS = {
  routing: ShieldCheck,
  generation: Sparkles,
  validation: BadgeCheck,
  rendering: LayoutGrid,
  connector: PhoneCall,
} as const;

/**
 * Compact agent-activity rail. Every row is a REAL pipeline stage streamed by
 * /api/intervene (plus one honest client-side rendering stage) — no fabricated
 * reasoning theater, never chain-of-thought.
 */
export function ActivityRail({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) return null;
  return (
    <aside aria-label="Agent activity" className="surface p-4">
      <p className="kicker mb-3">[ Agent activity ]</p>
      <ol className="flex flex-col gap-2.5" aria-live="polite">
        {events.map((e) => {
          const Icon = e.status === "failed" ? TriangleAlert : STAGE_ICONS[e.stage];
          return (
            <li key={e.id} className="flex items-start gap-2.5 text-sm">
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  e.status === "working"
                    ? "dot-working bg-[var(--teal)]"
                    : e.status === "failed"
                      ? "bg-[var(--amber)]"
                      : "bg-[var(--teal)]"
                }`}
              />
              <Icon aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-soft)]" />
              <span className="flex-1 leading-snug text-[var(--text-soft)]">
                {e.label}
                {typeof e.durationMs === "number" && e.status !== "working" && (
                  <span className="ml-1.5 font-mono text-xs opacity-60">{e.durationMs}ms</span>
                )}
                {e.detail && <span className="block text-xs opacity-60">{e.detail}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
