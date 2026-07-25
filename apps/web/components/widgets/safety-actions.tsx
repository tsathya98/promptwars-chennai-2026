"use client";

/**
 * Safety actions widget: verified helpline and emergency call buttons built
 * from the reviewed resource registry — never from model output. Calls open
 * the user's own dialler; nothing is placed automatically.
 */
import { ExternalLink, PhoneCall } from "lucide-react";
import { buildTelLink } from "@/lib/connectors";
import { getResource } from "@/lib/resources";
import type { WidgetSpec } from "@/lib/schemas";
import { SourceBadge } from "./source-badge";
import { WidgetShell } from "./widget-shell";

type Props = {
  spec: Extract<WidgetSpec, { type: "safety-actions" }>;
  /** Emergency styling escalates the 112 action to the crisis color. */
  emergency: boolean;
};

/** Renders registry-backed call/link actions with honest labelling. */
export function SafetyActions({ spec, emergency }: Props) {
  const resources = spec.resourceIds
    .map((id) => getResource(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  return (
    <WidgetShell>
      <div className="mb-3 flex items-center justify-between gap-2">
        <SourceBadge source={spec.source} />
      </div>
      {spec.note && <p className="mb-4 text-sm text-[var(--text-soft)]">{spec.note}</p>}
      <div className="flex flex-col gap-3">
        {resources.map((r) =>
          r.phone ? (
            <a
              key={r.id}
              href={buildTelLink(r.phone)}
              className={`flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 font-bold transition-colors ${
                emergency || r.id === "erss-112"
                  ? "bg-[var(--crisis)] text-white hover:bg-[var(--crisis-strong)]"
                  : "bg-[var(--teal)]/12 text-[var(--teal)] hover:bg-[var(--teal)]/20"
              }`}
            >
              <PhoneCall className="h-5 w-5 shrink-0" aria-hidden />
              <span className="flex flex-col text-left">
                <span className="text-base leading-tight">Call {r.phone}</span>
                <span className="text-xs font-medium">{r.title}</span>
              </span>
            </a>
          ) : (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)]"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              {r.title}
            </a>
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--text-soft)] opacity-80">
        Calls open your dialler — nothing is placed automatically.
      </p>
    </WidgetShell>
  );
}
