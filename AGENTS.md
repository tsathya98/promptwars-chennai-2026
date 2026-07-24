# PromptWars Chennai 2026 — Hackathon Workspace

One-day Google hackathon (25 July 2026). Problem statement revealed at the venue.
**This repo IS the project** — an Nx monorepo, pre-scaffolded and build-verified the
night before. The repo gets renamed once the problem statement is known.

## Layout (Nx 23 + pnpm workspaces + uv)

- `apps/web` — Next.js 15 App Router + React 19 + Tailwind 4. Golden files already
  wired: `lib/{gemini,llm,antigravity,widget-types}.ts`, `components/{widget-renderer,
  cursor-field,spotlight-card}.tsx`, `/api/health`, `/api/chat`.
- `apps/backend` — OPTIONAL Python sidecar (FastAPI + google-genai, **uv-managed,
  never pip**). Only touch if the problem needs pandas/statsmodels-grade work.
- Commands: `pnpm nx dev web` · `pnpm nx build web` · `pnpm nx serve backend`
  (runs `uv run uvicorn`). Always go through `pnpm nx ...`, never the raw tool.
  Nx-specific agent guidance: `docs/06-nx-workspace-notes.md`.
- **pnpm for all JS, uv for all Python — never npm/pip.**

## Ground rules

1. **Submission code uses Google models only**: `gemini-3.6-flash` (main) and
   `gemini-3.5-flash-lite` (fast/fallback). Never invent model IDs. **Provider
   priority: Antigravity subscription (`agy -p`, local non-interactive) first, API key
   second** — routing in `docs/05-antigravity-programmatic.md`; streaming/deployed
   paths are API-key only. `ThinkingLevel` is an enum from `@google/genai`, not a string.
2. **Demo-first, never half-baked**: `rapid-mvp` skill for all feature work, `gemini`
   skill for model calls, `antigravity` skill for agy usage, `interactive-ui` skill for
   all user-facing UI (cursor-reactive design language), `google-auth` if login is
   needed, `demo-polish` in the final hour.
3. **README.md is the jury-facing template** — fill its `{{...}}` placeholders in the
   first hour, keep it current, never leave a placeholder at freeze. Kit/prep
   instructions live in KIT.md.
4. **Docs are pre-baked** — read before proposing architecture:
   `docs/01` briefing/quota · `docs/02` Google stack · `docs/03` techstack blueprint ·
   `docs/04` Takeda patterns · `docs/05` Antigravity programmatic · `prompts/` ·
   `starters/templates/` (source copies of the golden files).
5. **Deploy early**: Vercel (root directory = `apps/web`), first deploy within 40
   minutes, `/api/health` check after every deploy. Docker alternative: root
   `Dockerfile` (builds `apps/web` standalone).
6. **Skills sync rule**: edit skills ONLY in `.claude/skills/`, then mirror:
   `rm -rf .agents/skills && cp -R .claude/skills .agents/skills`
   (`.agents/` is Antigravity's project-level customization root; repo-level
   `.gemini/` is NOT read by Antigravity — never recreate it).
7. Don't re-analyze the Takeda repos — distilled learnings are in doc 04.
