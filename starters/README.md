# Starter Kit — Next.js + Gemini golden skeleton

**Event day:** run `./setup.sh` with NO args — it scaffolds the Next.js app **into the
repo root** (this repo IS the project; root already carries Dockerfile, .dockerignore,
.env.example). **Tonight:** run `./setup.sh test-run` once to warm the pnpm store
(subfolder mode, git-ignored). Either way it scaffolds Next.js 15 (App Router, TS,
Tailwind), installs `ai` + `@ai-sdk/google` + `@google/genai` + `zod` + shadcn/ui
basics, and copies the golden files from `templates/`.

## Golden files (in `templates/`)

| File | Purpose |
|---|---|
| `lib/gemini.ts` | Single Gemini wrapper: model constants, retry/backoff, fallback ladder, MOCK mode |
| `app/api/health/route.ts` | Quota smoke check (`flash-lite` ping) |
| `app/api/chat/route.ts` | Streaming chat with tools via AI SDK `streamText` |
| `components/widget-renderer.tsx` | Generic SDUI renderer (card/row/col/title/text/badge/chart/table) — the generative-UI trick from agentic-central-reporting |
| `lib/widget-types.ts` | Zod schemas for widget tree + section specs |
| `lib/antigravity.ts` | **Subscription-quota Gemini** via headless `agy -p` (text + validated JSON) |
| `lib/llm.ts` | Unified facade: Antigravity subscription first → API-key fallback |
| `scripts/agy-batch.mjs` | Fixture/copy generation on subscription quota (zero API spend) |
| `components/cursor-field.tsx` | Cursor-reactive particle field (ambient layer) — ported from agentic-central-reporting, zero deps |
| `components/spotlight-card.tsx` | Cursor-spotlight wrapper for ALL cards/tiles (app-wide reactive layer, CSS-vars, zero re-renders) |
| `backend/` | Optional Python sidecar: FastAPI + google-genai, **uv-managed** (pyproject + uv Dockerfile per agentic-central-reporting) — only if the problem needs pandas/statsmodels-grade work |

## The architecture these implement (memorize this)

```
user input → API route → Gemini (structured output: SECTION SPECS, not pixels)
          → server-side compiler fetches/derives data, builds widget-tree JSON
          → WidgetRenderer recursively renders a closed vocabulary of ~8 node types
```

The model authors *intent*; deterministic code authors *pixels*. Charts never
hallucinate, styling is always consistent, and "the app builds dashboards from
plain English" is a judge-visible wow moment.

## Env vars (`.env.local`)

```
GEMINI_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...   # same value; used by @ai-sdk/google
GEMINI_API_KEY_FALLBACK=...        # key from second Google account
MOCK=0
```
