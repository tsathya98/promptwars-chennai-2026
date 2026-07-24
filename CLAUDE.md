# PromptWars Chennai 2026 — Hackathon Workspace

One-day Google hackathon (25 July 2026). Problem statement revealed at the venue.
The app under construction lives in a subfolder here once scaffolded.

## Ground rules for all work in this directory

1. **Submission code uses Google models only**: `gemini-3.6-flash` (main) and
   `gemini-3.5-flash-lite` (fast/fallback). Never other providers in app code. Never
   invent model IDs. **Provider priority: Antigravity subscription (`agy -p`, local
   non-interactive calls) first, API key second** — routing rules in
   `docs/05-antigravity-programmatic.md`; streaming/deployed paths are API-key only.
2. **Demo-first, never half-baked**: follow the `rapid-mvp` skill for all feature work
   (cut scope, never quality — every shipped feature meets its Definition of Done and
   the README stays product-grade), the `gemini` skill for all model-calling code, the
   `antigravity` skill for agy/subscription usage, the `interactive-ui` skill for all
   user-facing UI (cursor-reactive design language), `google-auth` if login is needed,
   and `demo-polish` in the final hour.
3. **Docs are pre-baked** — read before proposing architecture:
   - `docs/01-hackathon-briefing.md` — logistics, quota strategy, time budget
   - `docs/02-google-stack.md` — verified model IDs, API snippets, limits
   - `docs/03-techstack-blueprint.md` — the decided stack + architecture diagram
   - `docs/04-takeda-patterns.md` — proven patterns to reuse
   - `prompts/` — kickoff prompts (for me) and system-prompt templates (for the app)
   - `starters/` — scaffold script + golden template files
4. **Deploy early, deploy often**: Vercel, first deploy within 40 minutes, health check
   (`/api/health`) after every deploy.
5. Don't spend tokens re-analyzing the Takeda repos — the distilled learnings are in
   doc 04.
