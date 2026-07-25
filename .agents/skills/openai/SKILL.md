---
name: openai
description: OpenAI API integration patterns for PromptWars Chennai 2026 — model (gpt-5.6-terra, low reasoning effort), the region-pinned base URL quirk, Responses API usage, fallback/retry, and MOCK mode. Use whenever creating, modifying, or reviewing OpenAI model calls or AI route handlers.
---

# OpenAI API Integration (PromptWars Chennai 2026)

## 1. Verified Model Lineup

- **`gpt-5.6-terra`**: main model for this project. Use the Responses API with
  `reasoning: { effort: "low" }` for latency-sensitive UI calls; raise to `"medium"`/
  `"high"` only for a genuinely hard reasoning step.
- **Rule**: NEVER invent model IDs — verify against a real response before shipping.

## 2. Region-pinned key — the one gotcha

This project's OpenAI key is pinned to a specific region. A request to the default
`https://api.openai.com/v1` host fails with:
```json
{"error": {"code": "incorrect_hostname", "message": "Attempted to access resource with incorrect regional hostname. Please make your request to us.api.openai.com"}}
```
Every client MUST set `baseURL` explicitly — never rely on the SDK default:
```ts
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1",
});
```
Both env vars live in `.env` / `.env.example`. If a call ever 40x's with
`incorrect_hostname`, this is the first thing to check — not the API key itself.

## 3. Core Implementation Pattern (`lib/openai.ts`)

All direct OpenAI calls MUST flow through `lib/openai.ts`, mirroring the shape of
`lib/gemini.ts`:
```ts
import OpenAI from "openai";

export const MODELS = { main: "gpt-5.6-terra" } as const;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1",
});

export async function generate(input: string, opts: { reasoningEffort?: "minimal" | "low" | "medium" | "high" } = {}) {
  return client.responses.create({
    model: MODELS.main,
    reasoning: { effort: opts.reasoningEffort ?? "low" },
    input,
  });
}
```
- Retry-once with 1s backoff on 429/503/500 — same policy as the Gemini ladder.
- `MOCK=1` returns pre-baked JSON fixtures from `fixtures/`, same convention as
  `lib/gemini.ts`.
- Response text lives at `response.output_text` (or walk `response.output[0].content[0].text`
  for the raw shape) — not `response.choices[0].message.content` (that's the older
  Chat Completions shape, not used here).

## 4. Streaming & Vercel AI SDK

If interactive `useChat`-style streaming is needed on this provider, add
`@ai-sdk/openai` and use `streamText({ model: openai("gpt-5.6-terra"), ... })` —
same pattern as the Gemini `ai` + `@ai-sdk/google` route, just a different provider
package. Don't hand-roll SSE parsing against the raw Responses API.

## 5. Smoke Testing

Before wiring a route to this provider, verify the key + model + baseURL combo
with a one-line ping (mirrors the `gemini` skill's `/api/health` check):
```ts
await client.responses.create({ model: "gpt-5.6-terra", reasoning: { effort: "low" }, input: "ping" });
```
