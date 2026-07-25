"use client";

/**
 * Shared card chrome for every recovery widget: cursor-spotlight surface with
 * the design-token background. Inline styles override SpotlightCard's default
 * light background so the token system stays the single source of truth.
 */
import { SpotlightCard } from "../spotlight-card";

/** Wraps widget content in the standard spotlight surface card. */
export function WidgetShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SpotlightCard
      radius={180}
      className={`h-full p-5 ${className}`}
      style={{
        background: "color-mix(in oklab, var(--surface) 94%, transparent)",
        borderColor: "var(--line)",
      }}
    >
      {children}
    </SpotlightCard>
  );
}
