"use client";

/**
 * Provenance badge shown on every widget: content is either authored by a
 * live model call ("AI-personalized") or by the reviewed protocol registry
 * ("Verified guidance — not AI"). Shown to the user on every card, never
 * faked — this is the product's core honesty guarantee made visible.
 */
import type { ComponentType, SVGProps } from "react";
import { BadgeCheck, Bot } from "lucide-react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Renders the authorship badge for a widget's `source` field. */
export function SourceBadge({ source }: { source: "ai" | "verified" }) {
  const verified = source === "verified";
  const Badge: Icon = verified ? BadgeCheck : Bot;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        verified
          ? "border-[var(--indigo)]/40 text-[var(--indigo)]"
          : "border-[var(--teal)]/40 text-[var(--teal)]"
      }`}
    >
      <Badge className="h-3 w-3" aria-hidden />
      {verified ? "Verified guidance — not AI" : "AI-personalized"}
    </span>
  );
}
