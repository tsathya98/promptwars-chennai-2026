---
name: rapid-mvp
description: Demo-first rapid prototyping under a hard deadline — narrow scope, deploy-early discipline, walking-skeleton ordering, web verification, and a strict polish bar. Narrow the scope, never the quality. Use for ALL feature development on time-boxed MVPs, hackathon builds, POCs, and spikes.
---

# Rapid MVP Working Rules

You are building a time-boxed demo evaluated on a **90-second live pitch**. Every engineering decision must optimize for speed, visibility, and execution.

**The core law: cut scope, never quality.** Fewer features, each one finished, eye-catching, and documented — a demo with 2 polished features beats one with 5 half-baked ones. "Rapid" means ruthless prioritization, NOT half-baked output.

## 1. Prime Directives

1. **The Deployed URL is the Single Source of Truth**:
   - Deploy to Vercel within the first **40 minutes** (`npx vercel --prod`).
   - Re-deploy after every feature addition. Never allow local development state to diverge >30 minutes from the live deployment.
2. **Demo-First Execution**:
   - Prioritize what judges *see* and *experience* over hidden architectural perfection.
   - Hardcoded demo paths, seeded one-click chips, and canned fallback fixtures are essential demo features, not hacky workarounds.
3. **Walking Skeleton First**:
   - Complete the end-to-end slice (`UI` → `/api/chat` → `Gemini 3.6 Flash` → `WidgetRenderer`) before spending time on secondary features.
4. **End Every Increment with a Demo Line**:
   - After completing any task, state in exactly one sentence what capability can now be demonstrated on stage.

## 2. Definition of Done (per feature — no exceptions)

A feature is NOT done until ALL of these hold. If time runs short, drop the next feature — never ship a current feature below this bar:

- **Functional**: the full happy path works on the DEPLOYED URL, not just localhost.
- **Eye-catching**: intentional visual design — smooth loading skeletons, micro-transitions (hover/enter states), meaningful empty states, consistent semantic design tokens, dark-mode correct, and cursor-reactive surfaces per the `interactive-ui` skill (spotlight cards app-wide, one ambient moment). It should look like a product screenshot, never a bootstrap tutorial.
- **Resilient**: friendly styled error states; fallback fixture path for the seeded demo inputs.
- **Documented**: covered in the README (see §5) and, if user-facing, in the demo script.

## 3. Strict Scope Control

- **DO NOT BUILD**: Custom authentication or user accounts (exception: if the problem demands identity or a login adds demo value, use the `google-auth` skill — Auth.js v5 + Google, ~20 min, guest-mode fallback mandatory), database setup (Postgres/DynamoDB), settings screens, multi-tenancy, i18n, micro-frontends, or heavy testing suites.
- **MUST BUILD**:
  - `GET /api/health` route pinging `gemini-3.5-flash-lite`.
  - Loading skeleton states for generative UI.
  - Friendly error boundaries (no raw JSON/red overlays).
  - One-click "Try Example" chips pre-loaded with optimal demo queries.
  - Dark mode design system using Tailwind 4 semantic CSS variables.

## 4. Web Verification & Fact-Checking

- **Verify External Dependencies**: Before writing code against an external API, dataset, or npm package, perform a web search to verify it is active, keyless or accessible, and functions as expected.
- **Fact-Check Domain Claims**: Verify any statistics, regulatory references, or industry facts featured in system prompts or sample data. Judges familiar with the domain will spot hallucinated facts immediately.

## 5. Documentation Is a Judged Deliverable

Judges and mentors WILL open the repo. Maintain from the first hour (not retrofitted at the end):

- **README.md** — product-grade, updated as features land:
  - One-line pitch + a banner/screenshot or short GIF of the app near the top.
  - "What it does" — 3-5 feature bullets phrased as user value, not implementation.
  - Architecture diagram (mermaid) of the UI → API → Gemini → renderer flow.
  - Tech-stack section explicitly name-checking the Google stack (Gemini 3.6 Flash, AI Studio, Antigravity, search grounding, structured outputs).
  - "Run it" — exact copy-paste setup: env vars table, install, dev, deploy.
  - Live demo URL + QR code image.
- **.env.example** — every variable with a one-line comment; never let setup require guesswork.
- **PITCH.md** — maintained by the demo-polish skill in the final hour.
- Code comments only where a constraint isn't obvious — documentation effort goes to the README, not inline noise.

## 6. Code & Architecture Discipline

- **Single App Router Layout**: Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui.
- **Centralized Wrapper**: ALL Gemini API calls must route through `lib/gemini.ts` (or `lib/llm.ts`).
- **Zero-Token UI Iteration**: Toggle `MOCK=1` in `.env.local` to iterate on UI components using cached JSON fixtures without spending Gemini API quota.
- **Frequent Git Commits**: Commit after every working slice (`git commit -am "wip: <feature>"`).

## 7. Failure Mitigation

- If a feature takes longer than 30 minutes to resolve or debug, simplify its *scope* (fewer inputs, seeded data) while keeping its polish bar — or replace it with a pre-seeded fixture.
- If a component remains broken near freeze time, hide the UI entry point. A hidden feature is neutral; a broken feature during a live pitch loses points.
- Never present an unstyled, error-prone, or undocumented feature as "done" — downgrade scope until what remains meets the Definition of Done.
