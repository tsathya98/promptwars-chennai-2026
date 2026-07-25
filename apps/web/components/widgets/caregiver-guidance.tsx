"use client";

/**
 * Caregiver guidance widget: say-this / avoid-this / warning-signs columns
 * with a fixed escalation row. The escalation action (Call 112) is
 * deterministic UI — the model can populate the guidance text but can never
 * remove or soften the emergency pathway.
 */
import type { ComponentType, SVGProps } from "react";
import { Check, PhoneCall, TriangleAlert, X } from "lucide-react";
import { buildTelLink } from "@/lib/connectors";
import type { WidgetSpec } from "@/lib/schemas";
import { SourceBadge } from "./source-badge";
import { WidgetShell } from "./widget-shell";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type Props = { spec: Extract<WidgetSpec, { type: "caregiver-guidance" }> };

/** Renders the three guidance columns and the fixed Call-112 escalation row. */
export function CaregiverGuidance({ spec }: Props) {
  const sections: Array<{ title: string; items: string[]; icon: Icon; tone: string }> = [
    { title: "Say this", items: spec.sayThis, icon: Check, tone: "text-[var(--teal)]" },
    { title: "Avoid this", items: spec.avoidThis, icon: X, tone: "text-[var(--amber)]" },
    { title: "Warning signs", items: spec.warningSigns, icon: TriangleAlert, tone: "text-[var(--crisis-soft)]" },
  ];
  return (
    <WidgetShell>
      <div className="mb-4">
        <SourceBadge source={spec.source} />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {sections.map(({ title, items, icon: SectionIcon, tone }) => (
          <div key={title}>
            <h3 className={`mb-2.5 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide ${tone}`}>
              <SectionIcon className="h-4 w-4" aria-hidden />
              {title}
            </h3>
            <ul className="flex flex-col gap-2">
              {items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-[var(--text-soft)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--crisis)]/30 bg-[var(--crisis)]/10 p-3">
        <p className="text-sm font-semibold text-[var(--crisis-soft)]">
          If any warning sign is present:
        </p>
        <a
          href={buildTelLink("112")}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-[var(--crisis)] px-4 text-sm font-bold text-white hover:bg-[var(--crisis-strong)]"
        >
          <PhoneCall className="h-4 w-4" aria-hidden />
          Call 112 now
        </a>
      </div>
    </WidgetShell>
  );
}
