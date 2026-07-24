"use client";
// Cursor-spotlight wrapper — the app-wide cursor-reactive workhorse.
// Wrap any card/tile/panel/row. A soft accent glow + lit border edge follow
// the pointer. Pure CSS variables: zero re-renders, GPU-cheap, works in grids.
// Accent comes from the --accent design token (set it in globals.css).
import { type HTMLAttributes, type PointerEvent } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** Glow radius in px (default 240). Use ~140 for small tiles/rows. */
  radius?: number;
};

export function SpotlightCard({ radius = 240, className = "", children, ...rest }: Props) {
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <div
      onPointerMove={onPointerMove}
      className={`spotlight group relative overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 ${className}`}
      style={{ "--r": `${radius}px` } as React.CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}

/* Add once to globals.css:

.spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease-out;
  background: radial-gradient(
    var(--r) circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in oklch, var(--accent, #6366f1) 12%, transparent),
    transparent 70%
  );
}
.spotlight:hover::before { opacity: 1; }

// lit border edge that follows the cursor
.spotlight::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease-out;
  border: 1px solid transparent;
  background: radial-gradient(
      calc(var(--r) * 0.75) circle at var(--mx, 50%) var(--my, 50%),
      color-mix(in oklch, var(--accent, #6366f1) 55%, transparent),
      transparent 70%
    ) border-box;
  mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
.spotlight:hover::after { opacity: 1; }

@media (prefers-reduced-motion: reduce), (pointer: coarse) {
  .spotlight::before, .spotlight::after { display: none; }
}
*/
