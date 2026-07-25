---
name: rapid-mvp
description: Demo-first rapid prototyping under a hard deadline — narrow scope, deploy-early discipline, walking-skeleton ordering, web verification, and a strict polish bar. Narrow the scope, never the quality. Use for ALL feature development on time-boxed MVPs, hackathon builds, POCs, and spikes.
---

# Rapid MVP Working Rules

You are building a time-boxed demo evaluated on a **90-second live pitch**. Every engineering decision must optimize for speed, visibility, and execution.

**Law #0 — Functionality IS the demo**: a feature exists only when it runs end-to-end on the deployed URL against real model calls. Judges disqualify static pages, mock data presented as real, hallucinated AI responses, and false positives. If a feature can't work by freeze, hide its entry point instead of faking it.

**The core law: cut scope, never quality.** Fewer features, each one finished, eye-catching, and documented — a demo with 2 polished features beats one with 5 half-baked ones. "Rapid" means ruthless prioritization, NOT half-baked output.

## 1. Prime Directives

1. **The Deployed URL is the Single Source of Truth**:
   - Deploy to Vercel within the first **40 minutes** (`pnpm dlx vercel --prod`).
   - Re-deploy after every feature addition. Never allow local development state to diverge >30 minutes from the live deployment.
2. **Demo-First Execution**:
   - Prioritize what judges *see* and *experience* over hidden architectural perfection.
   - Seeded one-click chips and deterministic demo paths are welcome. Fixtures are
     for local UI development only; production must never present them as live AI.
3. **Walking Skeleton First**:
   - Complete the end-to-end slice (`UI` → active API route → server-only provider wrapper → `WidgetRenderer`) before spending time on secondary features.
4. **End Every Increment with a Demo Line**:
   - After completing any task, state in exactly one sentence what capability can now be demonstrated on stage.

## 2. Definition of Done (per feature — no exceptions)

A feature is NOT done until ALL of these hold. If time runs short, drop the next feature — never ship a current feature below this bar:

- **Functional**: the full happy path works on the DEPLOYED URL, not just localhost.
- **Eye-catching**: intentional visual design — smooth loading skeletons, micro-transitions (hover/enter states), meaningful empty states, consistent semantic design tokens, dark-mode correct, and cursor-reactive surfaces per the `interactive-ui` skill (spotlight cards app-wide, one ambient moment). It should look like a product screenshot, never a bootstrap tutorial.
- **Resilient**: friendly styled error states, retry paths, and clearly labelled
  deterministic guidance where the domain provides it. Fixture paths stay local-only.
- **Documented**: covered in the README (see §5) and, if user-facing, in the demo script.

## 3. Strict Scope Control

- **DO NOT BUILD**: Custom authentication or user accounts (exception: if the problem demands identity or a login adds demo value, use the `google-auth` skill — Auth.js v5 + Google, ~20 min, guest-mode fallback mandatory), database setup (Postgres/DynamoDB), settings screens, multi-tenancy, i18n, micro-frontends, or heavy testing suites.
- **MUST BUILD**:
  - `GET /api/health` route pinging whichever model actually powers the app (no
    vendor restriction — `gemini-3.5-flash-lite` and `gpt-5.6-terra` low-effort are
    both cheap enough for a health ping; see `gemini`/`openai` skills).
  - Loading skeleton states for generative UI.
  - Friendly error boundaries (no raw JSON/red overlays).
  - One-click "Try Example" chips pre-loaded with optimal demo queries.
  - Dark mode design system using Tailwind 4 semantic CSS variables.
- **PRODUCTION TRIPWIRE**: fail closed if `MOCK=1` is detected with
  `NODE_ENV=production`. A deployment must not be able to expose fixture output by
  configuration accident.

## 4. Web Verification & Fact-Checking

- **Verify External Dependencies**: Before writing code against an external API, dataset, or npm package, perform a web search to verify it is active, keyless or accessible, and functions as expected.
- **Fact-Check Domain Claims**: Verify any statistics, regulatory references, or industry facts featured in system prompts or sample data. Judges familiar with the domain will spot hallucinated facts immediately.

## 5. Documentation Is a Judged Deliverable

Judges and mentors WILL open the repo. Maintain from the first hour (not retrofitted at the end):

- **README.md** — the repo root already contains a jury-grade TEMPLATE with `{{...}}`
  placeholders (hero + badges, problem, features, 90-second demo beats, mermaid
  architecture, Google-stack table, quickstart, footer). Fill every placeholder within
  the first hour; update as features land; never leave a `{{...}}` visible at freeze.
  Screenshots: capture the deployed app (Cmd+Shift+5) into `public/hero.png` once the
  UI is presentable, again before the pitch. Never list unshipped features.
- **.env.example** — every variable with a one-line comment; never let setup require guesswork.
- **PITCH.md** — maintained by the demo-polish skill in the final hour.
- Code comments only where a constraint isn't obvious — documentation effort goes to the README, not inline noise.

## 6. Code & Architecture Discipline

- **Nx monorepo (pre-scaffolded)**: `apps/web` = Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 (+ shadcn/ui); `apps/backend` = optional uv-managed FastAPI sidecar. Run everything through `pnpm nx ...` (`dev web`, `test web`, `lint web`, `build web`, `serve backend`). Do NOT create new apps/libs mid-hackathon unless the problem truly demands it.
- **Centralized Wrapper**: Route active provider calls through the corresponding
  server-only wrapper. The current submission uses `lib/openai.ts`; if the provider
  changes, create one equivalent wrapper rather than scattering SDK calls.
- **Zero-Token UI Iteration**: Use fixture mode only when the active wrapper
  explicitly implements it. Fixture mode is local-development-only and must never
  be reachable on a deployment — mock output presented as live AI is a
  disqualification hazard (see Law #0).
- **Frequent Git Commits**: Commit after every working slice (`git commit -am "wip: <feature>"`).

## 7. Failure Mitigation

- If a feature takes longer than 30 minutes to resolve or debug, simplify its
  *scope* (fewer inputs, seeded data) while keeping its polish bar. If it still
  cannot work live, hide it; do not replace production AI behavior with a fixture.
- If a component remains broken near freeze time, hide the UI entry point. A hidden feature is neutral; a broken feature during a live pitch loses points.
- Never present an unstyled, error-prone, or undocumented feature as "done" — downgrade scope until what remains meets the Definition of Done.
