# PromptWars Chennai 2026 — Battle Kit

Prep kit for the Google for Developers × Hack2skill one-day hackathon (25 July 2026,
IndiQube Millenia). Problem statement drops at the venue; this kit makes the first
40 minutes and the last 60 minutes automatic.

## Contents

| Path | What |
|---|---|
| `docs/01-hackathon-briefing.md` | Logistics + **night-before checklist** + quota strategy + day-of time budget |
| `docs/02-google-stack.md` | Verified Gemini 3.6 Flash / 3.5 Flash-Lite reference, API snippets, free-tier limits, Antigravity notes |
| `docs/03-techstack-blueprint.md` | The decided stack (Next.js 15 + AI SDK + Gemini), architecture diagram, feature menu |
| `docs/04-takeda-patterns.md` | Distilled innovations from 4 production repos, translated to Gemini |
| `docs/05-antigravity-programmatic.md` | **Subscription-first model access** — `agy -p` wrapper templates, routing rules, verified locally |
| `prompts/kickoff-prompts.md` | Copy-paste prompts: triage → scaffold → iterate → freeze → emergency |
| `prompts/system-prompts.md` | System-prompt templates for the app itself |
| `.claude/skills/` | Auto-loaded Claude Code skills: `gemini`, `hackathon-mvp`, `demo-polish` |
| `starters/` | `setup.sh` scaffold + golden templates (gemini wrapper, widget renderer, routes) |

## Tonight (do these, ~30 min)

1. Work through the checklist in `docs/01-hackathon-briefing.md` — especially: two AI
   Studio API keys, `agy` login check in a real terminal, Vercel login, run
   `starters/setup.sh test-run` once to warm the npm cache (then delete `test-run/`).
2. Skim docs 02–04 once so the patterns are loaded in your head.

## Tomorrow at 9:00

1. Problem drops → paste it into kickoff prompt #1 (`prompts/kickoff-prompts.md`).
2. `./starters/setup.sh <app-name>` → deploy hello-world → build the walking skeleton.
3. Claude Code builds; Gemini powers the product; Antigravity gets one showcase task.
4. 4:00 PM: say "freeze" → the `demo-polish` skill takes over.
