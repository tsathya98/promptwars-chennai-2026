---
name: interactive-ui
description: State-of-the-art cursor-reactive and motion-rich frontend — particle fields, cursor spotlight cards, magnetic elements, streaming-native animations — with strict performance and restraint rules. Use whenever building or polishing user-facing UI, landing/login screens, hero sections, or when the user asks for "wow", "innovative", or "interactive" frontend.
---

# Interactive UI — cursor-reactive, state-of-the-art frontend

Reference pedigree: agentic-central-reporting's login (`MoleculeCanvas.tsx` — cursor-reactive particle field, `CursorReadout.tsx` — instrumentation-style coords readout). The goal is UI that *responds to the user's presence* — judges remember interfaces that feel alive.

## Cursor-reactivity is an app-wide design language

Treat it as a coherent system across ALL surfaces, not a login-page gimmick. Two layers:

1. **One ambient layer** (pick one place it earns its keep — login/hero, or dialed-down behind the main workspace): the particle field template below.
2. **A reactive component layer everywhere interactive**: every card gets the cursor spotlight, every primary CTA is magnetic, list rows get hover-lit borders that follow the pointer, charts get a glow crosshair, KPI tiles brighten on approach. Consistency is what sells it — same accent color, same radius, same response curve on every element, driven by shared CSS variables so it reads as one system.

**Intensity budget** still applies: the *ambient* layer appears once; the *component* layer is subtle (low alpha, small radii) and pervasive. Loud everywhere = noise; quiet everywhere + one hero moment = craft.

## Technique catalog (all proven, cheapest first)

### 1. Cursor-reactive particle field (the template — zero deps)
`starters/templates/components/cursor-field.tsx`, ported from agentic-central-reporting. Mechanics that make it feel organic: **lerped cursor follow** (`mouse += (target - mouse) * 0.12`), proximity-scaled dot brightness/size, particle↔particle + cursor↔particle connection lines, radial cursor halo, velocity damping + screen wrap. Density scales with viewport (`min(72, w*h/22000)`), DPR capped at 2. Drop behind login/hero: `<CursorField />` + content at `z-10`.

### 2. Cursor spotlight cards (pure CSS variables — the workhorse, use everywhere)
Template: `starters/templates/components/spotlight-card.tsx` — wrap ANY card/tile/row.
Track pointer per-element into CSS vars; paint a radial gradient at the cursor. GPU-cheap, no re-renders:
```tsx
function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}
// card CSS: a ::before overlay, opacity 0 → 1 on hover
// background: radial-gradient(240px circle at var(--mx) var(--my),
//   color-mix(in oklch, var(--accent) 14%, transparent), transparent 70%);
```
The same vars drive a gradient border (`mask` composite) for a "lit edge" that follows the cursor. **Group effect**: on a grid, track the pointer on the PARENT and light the borders of neighboring cards near the cursor too — the whole dashboard responds, not just the hovered card.

### 3. Magnetic buttons / tilt cards (transform-only)
Primary CTA leans toward the cursor: translate by `(cursor - center) * 0.25`, clamp ±8px, spring back on leave. 3D tilt: `rotateX/rotateY` from normalized cursor position, max 6°, `transform-style: preserve-3d` child pop. Never on more than 1–2 elements per view.

### 4. Streaming-native motion (AI apps specifically)
- Tool-call activity feed items slide-fade in as the agent works (the "visible agency" pattern).
- Skeleton → content crossfade, never a pop; widget-tree sections stagger in 40ms apart.
- Animated number tickers for KPIs (count up on mount with an ease-out).
- Motion library: `motion/react` (Framer Motion successor) — `AnimatePresence` for exits, `layout` for reflows; or plain CSS `@starting-style` + `transition` for simple entries.

### 5. Instrumentation details (cheap "crafted" signals)
Cursor coords readout in the footer (normalized 0–1, mono font, tabular nums), live clock, session tick counter, tiny status dot pulsing with `/api/health`. One or two of these make the app feel like a precision instrument.

## Performance & correctness rules (non-negotiable)

- **One rAF loop per canvas**; all pointer state in refs — `pointermove` must NEVER call `setState` per event (exception: throttled readouts).
- Animate **transform/opacity only** in CSS; no layout-triggering properties. `will-change` on at most the 1–2 elements that need it.
- `devicePixelRatio` capped at 2; particle counts scaled to viewport.
- **`prefers-reduced-motion: reduce` → static fallback** (the template self-disables). Also disable cursor effects on `pointer: coarse` (touch) — judges WILL open the app on phones.
- Effects sit on `pointer-events-none` + `aria-hidden` layers; content stays selectable and focus-visible.
- Effects must never delay LCP: canvas mounts client-side after content paint; zero blocking scripts.
- Verify 60fps with DevTools performance panel on the DEPLOYED build before the pitch; if a moment janks, cut it — smooth-and-simple beats rich-and-stuttering.

## Taste rules

- Effects use the app's semantic design tokens (accent RGB from CSS vars), correct in dark AND light.
- Motion durations 150–400ms, ease-out for entries, spring only for magnetic/tilt.
- The effect layer must never reduce text contrast or obscure data — dial alpha down until content wins.
