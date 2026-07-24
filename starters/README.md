# Starter Kit — Next.js + Gemini golden skeleton

Run `./setup.sh my-app` the night before (pre-caches npm deps) and again at the venue
once the problem statement is known. It scaffolds Next.js 15 (App Router, TS, Tailwind),
installs `ai` + `@ai-sdk/google` + `@google/genai` + `zod` + shadcn/ui basics, and copies
the golden files from `templates/` into the app.

## Golden files (in `templates/`)

| File | Purpose |
|---|---|
| `lib/gemini.ts` | Single Gemini wrapper: model constants, retry/backoff, fallback ladder, MOCK mode |
| `app/api/health/route.ts` | Quota smoke check (`flash-lite` ping) |
| `app/api/chat/route.ts` | Streaming chat with tools via AI SDK `streamText` |
| `components/widget-renderer.tsx` | Generic SDUI renderer (card/row/col/title/text/badge/chart/table) — the generative-UI trick from agentic-central-reporting |
| `lib/widget-types.ts` | Zod schemas for widget tree + section specs |

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
