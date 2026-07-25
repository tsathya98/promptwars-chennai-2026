---
name: interactive-ui
description: State-of-the-art cursor-reactive and motion-rich frontend — particle fields, cursor spotlight cards, magnetic elements, streaming-native animations — with strict performance and restraint rules. Use whenever building or polishing user-facing UI, landing/login screens, hero sections, or when the user asks for "wow", "innovative", or "interactive" frontend.
---

# Interactive UI — cursor-reactive, state-of-the-art frontend

**Precedence rule — function over flash: any effect that delays, obscures, or risks a functional flow gets cut.** Judged functionality always outranks visual wow; when an effect and a flow conflict, the effect loses, immediately and without debate.

Reference pedigree: agentic-central-reporting's login (`MoleculeCanvas.tsx` — cursor-reactive particle field, `CursorReadout.tsx` — instrumentation-style coords readout). The goal is UI that *responds to the user's presence* — judges remember interfaces that feel alive.

## Cursor-reactivity is an app-wide design language

Treat it as a coherent system across ALL surfaces, not a login-page gimmick. Two layers:

1. **One ambient layer** (pick one place it earns its keep — login/hero, or dialed-down behind the main workspace): the particle field template below.
2. **A reactive component layer everywhere interactive**: every card gets the cursor spotlight, every primary CTA is magnetic, list rows get hover-lit borders that follow the pointer, charts get a glow crosshair, KPI tiles brighten on approach. Consistency is what sells it — same accent color, same radius, same response curve on every element, driven by shared CSS variables so it reads as one system.

**Intensity budget** still applies: the *ambient* layer appears once; the *component* layer is subtle (low alpha, small radii) and pervasive. Loud everywhere = noise; quiet everywhere + one hero moment = craft.

## The Dribbble/Awwwards stack — and hackathon-speed equivalents

What the studios behind those showpiece sites actually use (verified July 2026): **Next.js + GSAP (ScrollTrigger) + Lenis smooth scroll + Three.js / React Three Fiber with custom GLSL shaders** (WebGPU renderer with WebGL fallback is the emerging flagship pattern). Design-wise the 2026 look is: **dark-default + refined glassmorphism** (subtle translucent layers, NOT heavy blur) floating over **ambient gradient orbs** (deep purple / neon blue / hot pink blurred blobs drifting behind the UI), liquid micro-interactions, kinetic/variable typography, scroll as the storytelling engine. Their #1 craft rule transfers directly: **pick ONE hard idea and execute it cleanly — never stack effects.**

Hackathon-speed equivalents (same look, hours not weeks):

| Studio technique | 1-day equivalent |
|---|---|
| Custom GLSL shader backgrounds | Ambient gradient orbs: 2–3 absolutely-positioned `blur(90px)` radial-gradient divs with slow `transform` keyframe drift — pure CSS, looks 90% the same behind glass |
| Glassmorphism depth system | `backdrop-blur-md bg-white/10 border-white/15` panels over the orbs; one blur strength app-wide; text always on ≥4.5:1 contrast |
| GSAP ScrollTrigger scenes | `motion/react` `whileInView` staggered reveals; CSS `animation-timeline: view()` for simple cases |
| Lenis smooth scroll | `pnpm add lenis` — genuinely 5 minutes, instantly reads "premium"; skip if the app is a dashboard rather than a narrative page |
| Three.js hero scenes | Our `cursor-field.tsx` particle canvas, or ONE copy-paste WebGL component (below); full R3F only if hours remain, one scene max |
| Bespoke interaction components | **Aceternity UI** (3D cards, spotlight, glowing beams, particle backgrounds, magnetic buttons) + **Magic UI** (animated beams, bento grids, text effects, number tickers) — both are shadcn-style COPY-PASTE components on Tailwind + Motion, zero lock-in, minutes each |

Assembly recipe for the "Dribbble look" in ~1 hour: dark default → 2–3 gradient orbs behind everything → glass panels for surfaces → our spotlight-card layer on all tiles → one Aceternity hero effect on the landing view → kinetic text reveal on the headline → Lenis if the page scrolls as a story.

## Technique catalog (all proven, cheapest first)

### 1. Cursor-reactive particle field (the template — zero deps)
Current implementation: `apps/web/components/cursor-field.tsx`, ported from agentic-central-reporting. Mechanics that make it feel organic: **lerped cursor follow** (`mouse += (target - mouse) * 0.12`), proximity-scaled dot brightness/size, particle↔particle + cursor↔particle connection lines, radial cursor halo, velocity damping + screen wrap. Density scales with viewport (`min(72, w*h/22000)`), DPR capped at 2. Drop behind login/hero: `<CursorField />` + content at `z-10`.

### 2. Cursor spotlight cards (pure CSS variables — the workhorse, use everywhere)
Current implementation: `apps/web/components/spotlight-card.tsx` — wrap any card, tile, or row.
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

## Designing for distressed users

When the app serves users under acute stress (crisis, health, recovery, safety contexts), these rules override the showpiece aesthetics above:

- **Dark muted palette**: for this product, use a dark, low-saturation color system so urgent content remains visually calm. Reserve high-saturation color for small accents such as focus rings and thin highlights, never large fills.
- **Crisis/emergency states collapse around ONE dominant action** with ALL decorative
  effects disabled — particles, gradient orbs, magnetic hovers, spotlight layers all
  off. Keep secondary verified instructions concise and progressively disclosed so
  they support, rather than compete with, the primary action.
- **No shame mechanics**: no streak resets, no confetti, no buttons that carry moral weight ("I failed", "I gave in"). Celebration and punishment patterns both backfire under distress.
- **A pausable breathing pacer is the ONLY sanctioned distress-state animation.** Every other motion in a distress flow is noise at best and a stressor at worst.
- **Voice controls are always paired with visible button fallbacks** — speech fails exactly when stress peaks.
- **Touch targets ≥48px** throughout; primary crisis actions larger.
- **Never rely on color, motion, or iconography alone** for urgency. Pair every
  state with short, literal text and preserve visible keyboard focus.

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
