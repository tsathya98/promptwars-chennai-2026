"use client";

/**
 * Verified resource widget: renders a registry entry (source organization,
 * summary, reviewed date, deterministic steps, call/source actions) exactly
 * as reviewed. If a resource id is somehow unknown it surfaces a visible
 * error block — the closed-vocabulary rule: never fail silently.
 */
import { ExternalLink, PhoneCall } from "lucide-react";
import { buildTelLink } from "@/lib/connectors";
import { getResource } from "@/lib/resources";
import type { WidgetSpec } from "@/lib/schemas";
import { SourceBadge } from "./source-badge";
import { WidgetShell } from "./widget-shell";

type Props = { spec: Extract<WidgetSpec, { type: "verified-resource" }> };

/** Renders a reviewed registry resource with its provenance and actions. */
export function VerifiedResourceCard({ spec }: Props) {
  const resource = getResource(spec.resourceId);
  if (!resource) {
    return (
      <pre className="overflow-x-auto rounded-xl border border-[var(--crisis)] p-3 text-xs text-[var(--crisis-soft)]">
        ▲ unknown resource: {spec.resourceId}
      </pre>
    );
  }
  return (
    <WidgetShell>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SourceBadge source="verified" />
        <span className="text-xs text-[var(--text-soft)] opacity-70">
          Reviewed {resource.reviewedOn}
        </span>
      </div>
      <h3 className="mb-1 text-lg font-bold leading-snug">{resource.title}</h3>
      <p className="mb-2 text-xs text-[var(--text-soft)] opacity-80">{resource.organization}</p>
      <p className="mb-3 text-sm leading-relaxed text-[var(--text-soft)]">{resource.summary}</p>
      {resource.steps && (
        <ol className="mb-3 flex list-decimal flex-col gap-1.5 pl-5">
          {resource.steps.map((step, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      )}
      {spec.note && <p className="mb-3 text-sm text-[var(--text-soft)]">{spec.note}</p>}
      <div className="flex flex-wrap gap-2">
        {resource.phone && (
          <a
            href={buildTelLink(resource.phone)}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--teal)]/12 px-4 text-sm font-bold text-[var(--teal)] hover:bg-[var(--teal)]/20"
          >
            <PhoneCall className="h-4 w-4" aria-hidden />
            Call {resource.phone}
          </a>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text-soft)] hover:border-[var(--line-hi)] hover:text-[var(--text)]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Source
        </a>
      </div>
    </WidgetShell>
  );
}
