# Distilled Patterns from the Takeda Repos

Deep-dive summaries of the four reference repos, filtered to what transfers to a one-day Gemini hackathon. Full architecture details live in the repos themselves; file paths below are the "golden files" to crib from.

## 1. `agentic-central-reporting` — the POC formula (highest-value reference)

Polyglot Nx monorepo: Next.js 15 + React 19 + Tailwind 4 frontend, FastAPI agent orchestrator (OpenAI Agents SDK + self-hosted ChatKit), FastMCP servers, and a Claude Agent SDK lane. What made it impressive:

- **Backend-driven SDUI (the crown jewel)**: the LLM emits typed *section specs* (`{kind:"trend", metricName,...}`); a server-side compiler (`canvas_builder.py`, 2119 lines) validates them, runs the SQL, computes analytics, and ships a **closed-vocabulary widget tree** (11 node types) that a **130-line recursive renderer** (`components/WidgetRenderer.tsx`) draws. New chart kinds = backend work only; the renderer never grows; nothing hallucinates. → Ported to `starters/templates/` in this kit.
- **Agent-legible failure signals**: every canvas call returns `emptySections`/`hasEmptySections` that the prompt forces the model to check before claiming success.
- **Routing-table system prompt** (~640 lines): "question shape → first move" table, guardrails ("Discover before guessing"), and *per-demo-scenario recipes* ("for demo-style 'random metrics' requests: discover, pick — never ask the user"). Demos never dead-end.
- **Live activity feed** (SSE panel showing every tool call/RAG search live) — "the centerpiece of the MCP demo"; makes agentic behavior visible to judges.
- **Client-tool bridge**: server proxy tools set a `client_tool_call` so one agent drives browser state (canvas, navigation) from text *or* voice with one shared tool schema.
- **Persist queries, not results**: saved dashboards store section specs + tiny params, re-render live on open — stale-proof.
- **Live-bound narrative**: markdown notes with `{placeholder}` bindings recomputed per render so prose numbers never go stale.
- **Provider seam**: `provider.py` protocol = "yield chat events", letting OpenAI and Claude providers swap under the same UI. (Tomorrow: your seam is `lib/gemini.ts`.)
- **Demo polish tricks**: particle-canvas login page, one-click demo scenarios, jsPDF export, command palette.

Golden files: `apps/frontend/components/WidgetRenderer.tsx`, `GenericChart.tsx`, `StudioCanvas.tsx`, `apps/agent-orchestrator/src/central_reporting_agent/{canvas_builder.py, agent_definition.py, provider.py, chat_server.py}`, `components/AgentActivity.tsx`.

## 2. `insight-center-dev-ai-agentic-chat` — production agent-loop reliability

Python 3.13 / FastAPI / OpenAI Agents SDK multi-agent chat backend (9 domain agents, DynamoDB persistence). Transferable gold:

- **Two-tier tool-output budget** (`agents/tool_output_limit.py`) — per-call char cap + cumulative per-turn budget; truncation markers tell the model *how to narrow the request*. Biggest reliability-per-line win in the codebase; port almost verbatim.
- **Prompts as markdown files per agent** (`agent_definition.py` + `agent_instructions.md` folders) with precedence-ordered strict rules, scope guards, and "retry once with fallback flag, then stop" policies.
- **`[resolved-scope]` hidden memory**: tools record what they resolved (batch, doc ids) into a compact hidden thread item; the prompt teaches reuse on elliptical follow-ups ("what about moisture content?") — makes follow-ups feel magical in a demo.
- **Widgets as tools**: `RenderSimpleChart` etc. push UI cards mid-stream and return only a status dict to the model — with anti-hallucination guardrails *enforced in tool code* (placeholder titles silently rejected).
- **Hidden-signal markers**: the model appends `[[DOWNLOAD_ANSWER]]` only for substantive answers; backend strips it and toggles a UI affordance. Cheap self-classification channel.
- **Belt-and-braces citations**: regex fallback parses `Source [1]: … Page N` lines and synthesizes the citation widget if the model forgot the tool.
- **Explicit assistant selection over LLM routing** at the top level (persisted in thread metadata) — demo-reliable routing.
- **Whole-item history trimming** that never orphans a tool-call/output pair (Gemini also rejects orphaned function responses).
- Async fire-and-forget thread-title generation with structured output.

## 3. `insight-center-dev-ai-mcp-services` — tool/API design for LLM consumers

9 FastMCP servers (streamable HTTP) + shared platform package. Even without MCP tomorrow, its *tool-design* discipline applies to AI SDK tools directly:

- **Stable error envelope** `{code, message, details, retryable}` via a decorator on every tool — agents recover from typed envelopes far better than stack traces.
- **Forgiving inputs, strict internals**: liberal union types (`list[int|str]|int|str|None`) + normalizers and clamps (`top_n ≤ 20`) — never reject LLM sloppiness, sanitize it.
- **Clarify-as-data**: planner responses (`plan: timeseries|refine|clarify_entity|…`) where over-broad queries return candidates and the exact reply format, instead of erroring.
- **Presentation contracts in responses**: `display_hint`, prebuilt `table_markdown`, `notes` to reproduce verbatim — polished output with zero client work.
- **Entity catalog as a resource**: a DB-generated markdown lookup injected into context so the model never guesses filter values — the #1 hackathon failure mode, pre-killed. (Tomorrow: generate a data-catalog string from your seeded data at boot and put it in the system prompt.)
- **Prompt-injection hardening**: DB-derived values escaped and fenced as "Untrusted Catalog Data".
- **Request coalescing + 30s micro-cache** for duplicate expensive tool calls (agents love firing the same call twice).
- Server `instructions` as a full agent playbook: resolution order, formatting mandates, when-NOT-to-use guidance, "call these in parallel" hints.

## 4. `takOS` — monorepo & design-system discipline (architecture only)

**Surprise: it's Angular 21** (zoneless, signals, native federation MFEs), so the code doesn't transfer to React — but the patterns do:

- **Design tokens, 3-tier** (primitive → semantic → component) with dark mode as a single class flip. Tomorrow's version: ~20 semantic CSS variables in `globals.css` + `.dark` block, done in 15 minutes.
- **cva + cn component anatomy** (shadcn gives this for free in React).
- **Typed registry patterns**: routes/features declared as one typed array with `featureFlag` fall-through to "coming soon" — cheap way to stub unfinished demo features.
- **Typed query-key scheme** (scope enum + key builder) if TanStack Query enters the picture.
- **Agent-native repo**: `AGENTS.md` + `.agents/skills/**/SKILL.md` codifying conventions *for coding agents* — this kit's `.claude/skills/` + `CLAUDE.md` is exactly that pattern, applied.
- Everything else (federation, release trains, token pipelines, governance lint, S3 Nx cache) is scale infrastructure — skip.

## Cross-repo meta-lessons for tomorrow

1. **Determinism at the edges, LLM in the middle**: validated typed specs in, compiled artifacts out. Every Takeda system that demos well does this.
2. **Design tool *results* for the model**: verifiable markers (`emptySections`), typed errors with `retryable`, truncation guidance, clarify-as-data. The model is your API consumer — write for it.
3. **Prompts are routing tables + recipes**, not essays. Include the demo scenarios explicitly.
4. **Make agency visible** (activity feed) and **failure invisible** (fallbacks, hidden features, seeded paths).
5. **Codify conventions for your coding agent** (CLAUDE.md/skills) — the repos that did this scaled fastest.
