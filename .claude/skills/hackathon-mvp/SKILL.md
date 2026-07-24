---
name: hackathon-mvp
description: Working rules for the PromptWars one-day hackathon build — demo-first development, scope control, deploy-early discipline. Use for ALL feature work during the hackathon.
---

# Hackathon MVP Working Rules

You are building a one-day hackathon demo, not a product. Judges see a 90-second pitch. Optimize every decision for that.

## Prime directives

1. **The deployed demo is the only truth.** Deploy to Vercel within the first 40 minutes and after every feature. Never let local diverge >30 min from deployed.
2. **Demo-first ordering**: build what the judge *sees* before what's architecturally "right". Hardcoded demo data, seeded examples, and one-click input chips are features, not hacks.
3. **Walking skeleton first**: UI → API route → Gemini → rendered result, end to end, before any second feature.
4. **Every change ends with a demo line**: after finishing a task, state in one sentence what can now be shown on stage.

## Scope control

- Do NOT build: auth/login, user accounts, settings pages, multi-tenancy, persistence beyond a JSON file or in-memory store (unless the problem statement demands it), mobile-perfect responsiveness, i18n, tests beyond one smoke test.
- DO build: loading skeletons, friendly error states, an "example inputs" bar, dark-mode-correct styling (single pass), the `/api/health` Gemini smoke check.
- Any feature estimated >45 min: propose a faked/simplified version first and ask which to build.

## Code style under time pressure

- One `lib/gemini.ts` wrapper (see `gemini` skill). One `components/` folder, flat. No premature abstraction — copy-paste twice before extracting.
- Tailwind only, shadcn/ui for anything non-trivial (`npx shadcn@latest add <component>`).
- TypeScript loose is fine (`any` allowed at boundaries); never spend time on type gymnastics.
- Commit after every working increment (`git commit -am "wip: <what works now>"`) — cheap rollback beats debugging.

## When something breaks

- Fix forward with the smallest change; no refactors after 3:00 PM.
- If unfixable in 15 min: feature-flag it off or hide the UI entry point. A hidden feature is invisible; a broken one loses the pitch.
