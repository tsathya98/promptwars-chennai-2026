# PromptWars Chennai 2026 — Hackathon Workspace

One-day Google hackathon (25 July 2026). Problem statement revealed at the venue.
**This repo IS the project** — an Nx monorepo, pre-scaffolded and build-verified the
night before. The repo gets renamed once the problem statement is known.

## Layout (Nx 23 + pnpm workspaces + uv)

- `apps/web` — Next.js 16 App Router + React 19 + Tailwind 4. Active submission
  modules include `lib/{openai,schemas,safety-router,resources,connectors}.ts`,
  `lib/agents/`, the recovery widget/voice/activity components, `/api/health`, and
  the unified `/api/intervene` route.
- `apps/backend` — OPTIONAL Python sidecar (FastAPI + google-genai, **uv-managed,
  never pip**). Only touch if the problem needs pandas/statsmodels-grade work.
- Commands: `pnpm nx dev web` · `pnpm nx test web` · `pnpm nx lint web` ·
  `pnpm nx build web` · `pnpm nx serve backend` (runs `uv run uvicorn`). Always
  go through `pnpm nx ...`, never the raw tool. Nx-specific agent guidance:
  `docs/06-nx-workspace-notes.md`.
- **pnpm for all JS, uv for all Python — never npm/pip.**

## Ground rules

1. **No vendor restriction — any model, any provider**. The active submission path
   uses OpenAI `gpt-5.6-terra` with low reasoning effort through `lib/openai.ts`.
   The key is region-pinned to `https://us.api.openai.com/v1`; the default host
   fails with `incorrect_hostname`. Never invent model IDs: smoke-test any new
   model against the region-pinned host before adding it to application code.
2. **Demo-first, never half-baked**: `rapid-mvp` skill for all feature work, `gemini`
   skill for Gemini model calls, `openai` skill for OpenAI model calls, `antigravity`
   skill for agy usage (optional), `interactive-ui` skill for all user-facing UI
   (cursor-reactive design language), `google-auth` if login is needed, `demo-polish`
   in the final hour.
3. **README.md is the jury-facing template** — fill its `{{...}}` placeholders in the
   first hour, keep it current, never leave a placeholder at freeze. Kit/prep
   instructions live in KIT.md.
4. **Docs are pre-baked** — read before proposing architecture:
   `docs/01` briefing/quota · `docs/02` Google stack · `docs/03` techstack blueprint ·
   `docs/04` Takeda patterns · `docs/05` Antigravity programmatic · `docs/07`
   IBUKI Circle plan · `prompts/` · `starters/templates/`.
5. **Deploy early**: Vercel (root directory = `apps/web`), first deploy within 40
   minutes, `/api/health` check after every deploy. Docker alternative: root
   `Dockerfile` (builds `apps/web` standalone).
6. **Skills sync rule**: edit skills ONLY in `.claude/skills/`, then mirror with
   `rsync -a --delete .claude/skills/ .agents/skills/` and verify with
   `diff -qr .claude/skills .agents/skills`. `.agents/` is Antigravity's
   project-level customization root; never recreate repo-level `.gemini/`.
7. **Guidance sync rule**: `CLAUDE.md` is canonical. After editing it, mirror it
   to `AGENTS.md` and verify both files are byte-identical with
   `cmp -s CLAUDE.md AGENTS.md`. Repository skills follow the same
   canonical-to-mirror rule from `.claude/skills` to `.agents/skills`.
8. Don't re-analyze the Takeda repos — distilled learnings are in doc 04.
