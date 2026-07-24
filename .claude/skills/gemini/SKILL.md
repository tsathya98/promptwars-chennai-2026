---
name: gemini
description: Gemini API integration patterns for the PromptWars hackathon — correct model IDs, quota-safe defaults, fallback ladder, structured output, search grounding. Use whenever writing or reviewing code that calls Gemini / @ai-sdk/google / @google/genai.
---

# Gemini Integration (hackathon build rules)

## Provider routing — Antigravity subscription FIRST, API key second

- **Non-interactive generation running locally** (reports, summaries, canvas content):
  `generateText()` from `lib/llm.ts` — uses `agy -p` on subscription quota, auto-falls
  back to API key. Details: `docs/05-antigravity-programmatic.md`.
- **Dev/build-time generation** (fixtures, seed data, copy): `scripts/agy-batch.mjs` —
  pure subscription quota.
- **Interactive streaming chat and anything deployed** (Vercel): API-key path only —
  `agy` doesn't exist there. Set `LLM_PROVIDER=api` in Vercel env.
- `agy` rules: always `--sandbox` in print mode (it auto-approves tool calls), prefer
  `-low` effort variants, batch items into one prompt (each call has ~10s init overhead).

## Models — use EXACTLY these IDs (verified July 2026)

- `gemini-3.6-flash` — main model: chat, agentic, multimodal, structured output.
- `gemini-3.5-flash-lite` — cheap/fast lane: classification, extraction, background calls, and the 429-fallback target.
- Never invent model names. Never use 1.5/2.x-era IDs.

## Non-negotiable patterns

1. **Every Gemini call goes through `lib/gemini.ts`** (single wrapper). No inline SDK calls scattered in routes. The wrapper implements:
   - retry once with 1s backoff on 429/503,
   - fallback ladder: `gemini-3.6-flash` → `gemini-3.5-flash-lite` → env `GEMINI_API_KEY_FALLBACK` if set,
   - `MOCK=1` mode returning canned fixtures from `fixtures/` (UI work must cost zero tokens).
2. **Vercel AI SDK first**: `streamText`/`generateObject` from `ai` + `google()` from `@ai-sdk/google`. Env var: `GOOGLE_GENERATIVE_AI_API_KEY` (mirror of `GEMINI_API_KEY`). Drop to raw `@google/genai` only for features the SDK lacks (Live API, code execution tool).
3. **Structured output**: `generateObject` + zod schema. Semantics in prompt, shape in schema. Validate; on parse failure retry once with the error appended.
4. **Search grounding**: raw `@google/genai` with `config.tools = [{ googleSearch: {} }]`; render citation chips from `groundingMetadata`.
5. **Thinking level**: `low`/`minimal` for anything user-facing and latency-bound; default only for planning-grade calls.
6. **Keep contexts short**: trim history to last ~10 messages; TPM limits bite before RPD.

## Smoke test

`GET /api/health` → calls flash-lite with "ping", returns `{model, latencyMs, ok}`. Run after every deploy and before the pitch.
