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

