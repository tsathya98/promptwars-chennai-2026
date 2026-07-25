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

export async function generate(input: string, opts: { effort?: "low" | "medium" | "high" } = {}) {
  return client.responses.create({
    model: MODELS.main,
    reasoning: { effort: opts.effort ?? "low" },
    input,
  });
}
```
- Retry-once with 1s backoff on 429/503/500 — same policy as the Gemini ladder.
- `MOCK=1` returns pre-baked JSON fixtures from `fixtures/`, same convention as
  `lib/gemini.ts`, but only during local development. Throw immediately if
  `MOCK=1` and `NODE_ENV=production`; never silently expose fixtures on a deployment.
- Response text lives at `response.output_text` (or walk `response.output[0].content[0].text`
  for the raw shape) — not `response.choices[0].message.content` (that's the older
  Chat Completions shape, not used here).

## 4. Structured output

When a route needs JSON (widget specs, agent responses, any machine-consumed shape),
NEVER parse markdown-fenced JSON out of free text by hand. Use the Responses API's
strict JSON-schema mode, then re-validate with zod:

1. **Hand-write a strict JSON schema**: every field listed in `required`,
   `additionalProperties: false` on every object level. Strict mode rejects schemas
   that don't meet this bar.
2. **Pass it via `text.format`**:
   ```ts
   const response = await client.responses.create({
     model: MODELS.main,
     reasoning: { effort: "low" },
     input,
     text: {
       format: {
         type: "json_schema",
         name: "agent_response",
         strict: true,
         schema, // the hand-written strict schema
       },
     },
   });
   const raw = JSON.parse(response.output_text);
   ```
3. **Re-validate with zod before use**: `const parsed = AgentResponseSchema.parse(raw);`
   The API guarantees shape, but zod is the trust boundary — it enforces our
   semantic rules (allow-listed IDs, enum values, string lengths) and gives typed
   output. Model output is never used un-validated.
4. **Handle non-answer states explicitly**: an incomplete response, refusal, empty
   `output_text`, JSON parse failure, or zod failure must become an honest typed
   error/degraded state. Never coerce it into a plausible success object.
5. **Keep authority in deterministic code**: structured output may recommend an
   allow-listed widget or connector intent, but it must not execute side effects or
   lower a safety classification already raised by deterministic logic.

## 5. Streaming & Vercel AI SDK

If interactive `useChat`-style streaming is needed on this provider, add
`@ai-sdk/openai` and use `streamText({ model: openai("gpt-5.6-terra"), ... })` —
same pattern as the Gemini `ai` + `@ai-sdk/google` route, just a different provider
package. Don't hand-roll SSE parsing against the raw Responses API.

## 6. Smoke Testing

Before wiring a route to this provider, verify the key + model + baseURL combo
with a one-line ping (mirrors the `gemini` skill's `/api/health` check):
```ts
await client.responses.create({ model: "gpt-5.6-terra", reasoning: { effort: "low" }, input: "ping" });
```

## 7. Model verification rule

Only `gpt-5.6-terra` is verified on this project's region-pinned key. Any OTHER
model ID — realtime, moderation, embeddings, audio, anything — must pass a live
smoke test against the region-pinned host (`https://us.api.openai.com/v1`) BEFORE
being written into application code. Region-pinned keys frequently lack access to
models the docs advertise. If the smoke test fails, descope the feature silently —
do not ship code that references an unverified model ID, and do not fall back to
faking the feature's output.
