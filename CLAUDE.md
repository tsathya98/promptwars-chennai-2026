# PromptWars Chennai 2026 — Hackathon Workspace

One-day Google hackathon (25 July 2026). Problem statement revealed at the venue.
The app under construction lives in a subfolder here once scaffolded.

## Ground rules for all work in this directory

1. **Submission code uses Google models only**: `gemini-3.6-flash` (main) and
   `gemini-3.5-flash-lite` (fast/fallback) via `GEMINI_API_KEY`. Never other providers
   in app code. Never invent model IDs.
2. **Demo-first**: follow the `hackathon-mvp` skill for all feature work, the `gemini`
   skill for all model-calling code, and the `demo-polish` skill in the final hour.
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
