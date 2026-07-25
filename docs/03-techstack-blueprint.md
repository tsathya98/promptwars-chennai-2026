# Techstack Blueprint — what to build with tomorrow

Decided in advance so zero time is spent on stack debates at the venue. Informed by the four Takeda repo deep-dives (see `04-takeda-patterns.md`) translated to the Google stack.

> **Update (day-of)**: no vendor restriction on the model layer anymore — the rows
> below describe the Gemini lane specifically (still fully valid); an OpenAI lane
> (`gpt-5.6-terra` via `lib/openai.ts` / `openai` skill) is also wired and available.
> Everything else here (Nx, Next.js, Tailwind, Recharts, deploy) is unaffected.

## The stack (default for almost any problem statement)

| Layer | Choice | Why |
|---|---|---|
| Package managers | **pnpm** for all JS, **uv** for all Python — never npm/pip | Both reference repos pin these (takOS `packageManager: pnpm@11`, agentic-central-reporting pnpm 10 + uv workspace) |
| Workspace | **Nx 23 monorepo** — `apps/web` + optional `apps/backend` (uv), **pre-scaffolded and build-verified the night before** | Same shape as agentic-central-reporting (Nx + pnpm + uv); costs zero venue time because it's already built — scaffolding Nx AT the venue would not be worth it |
| App | **Next.js 15 App Router + React 19 + TypeScript** (`apps/web`) | Same as agentic-central-reporting's frontend; API routes replace a separate backend entirely for a demo |
| Styling | **Tailwind CSS 4 + shadcn/ui** | cva/cn component pattern from takOS, zero design time |
| AI plumbing | **Vercel AI SDK (`ai` + `@ai-sdk/google`)**: `streamText` + tools + `useChat`; raw `@google/genai` only for search grounding / Live API | Collapses the entire FastAPI + ChatKit + MCP stack of the Takeda POCs into API routes |
| Models | `gemini-3.6-flash` (star calls) + `gemini-3.5-flash-lite` (background/fallback) | See `02-google-stack.md` |
| Charts | **Recharts** | Lighter than Highcharts, good enough for a demo |
| State | `useChat` + plain React state; **localStorage** for persistence | agentic-central-reporting's sandbox-store pattern; no DB |
| Data | JSON files / in-memory seeded data; SQLite via better-sqlite3 only if the problem is data-heavy | No time for real infra |
| Deploy | **Vercel** (`pnpm dlx vercel --prod`) | 2-minute deploys, public URL for the QR code |
| Dev tooling | **Claude Code** (build) + **Antigravity/`agy`** (one showcase task + narrative) | Two quota lanes — see briefing doc |

**Explicitly skip** (all present in the Takeda repos, none earn their cost in one day): new Nx libs/apps beyond the two pre-scaffolded ones, MCP process separation (in-process AI SDK tools are equivalent for a demo), auth (MSAL/Entra), Redis/Kafka, DynamoDB/RDS, OTel, Storybook, testing beyond one smoke check, CI, micro-frontends, design-token pipelines.

## The architecture (memorize — it's one diagram)

```
Chat UI (useChat) ──► /api/chat  streamText(gemini-3.6-flash, tools)
                          │
        ┌─────────────────┼──────────────────────┐
   data tools        update_canvas tool      googleSearch
 (query seeded    model emits SECTION SPECS   (grounded answers
  JSON/SQLite)          │                      + citation chips)
                  server compiler: runs queries,
                  builds WidgetNode JSON tree,
                  returns {widget, emptySections}
                          │
              WidgetRenderer (closed vocab, ~8 node types)
              renders cards/KPIs/charts/tables beside chat
```

This is the agentic-central-reporting formula ported to Gemini: **the model authors intent (typed section specs); deterministic code authors pixels.** Charts can't hallucinate, styling is always consistent, and "it builds live dashboards from plain English" is the wow moment.

## Feature menu (pick by problem statement, each ~30–60 min on the skeleton)

1. **Generative dashboard/canvas** — the section-spec compiler above. Fits: analytics, reporting, monitoring, planning problems.
2. **Search-grounded answers with citation chips** — one config flag. Fits: research, news, compliance, consumer-advice problems.
3. **Multimodal intake** — Gemini reads an uploaded image/PDF/audio (`inlineData` parts). Fits: document processing, accessibility, field-inspection problems.
4. **Agent activity feed** — stream tool-call events to a side panel (AI SDK exposes tool invocations in `useChat` message parts; render them live). Makes agentic behavior *visible* to judges — the single cheapest credibility win.
5. **Voice** — Gemini Live API. Only if hours remain; the Takeda voice path was the most tuning-heavy part of their POC.
6. **"Explain what just happened" button** — 2-sentence judge-facing narration of the last agent action (prompt E in `prompts/system-prompts.md`).

## Reliability patterns to bake in from minute one (Takeda-proven, cheap)

- **Verifiable tool results**: every UI/data tool returns `emptySections`/`empty: true` markers the model must check before claiming success — kills the "here's your dashboard!" (blank screen) failure.
- **Tool-output budget**: cap each tool result (~4k chars) with a truncation marker telling the model how to narrow the request.
- **Max turns/steps bound** (AI SDK `stopWhen: stepCountAtMost(12)`) and per-call timeouts.
- **History trimming**: last ~10 messages; never orphan a tool call/result pair.
- **Routing-table system prompt** with demo recipes: "for 'show me anything' style requests: discover, pick, build — never ask which."
- **Clarify-as-data**: over-broad request → return `plan: "clarify"` with suggested options rather than an error.
