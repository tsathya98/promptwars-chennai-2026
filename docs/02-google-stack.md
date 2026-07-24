# Google Stack Reference (verified 24 July 2026)

The submission must visibly run on Google AI. Two sanctioned paths: **Gemini API key** (AI Studio) or **Antigravity** login. Use the API key for the product; use Antigravity for narrative/tooling credibility.

## Models — current lineup (GA July 21, 2026)

| Model ID | Role | Context / Output | Pricing (per 1M) | When to use |
|---|---|---|---|---|
| `gemini-3.6-flash` | Workhorse; star of the demo | 1M / 64k | $1.50 in / $7.50 out | Main chat/agent calls, multimodal, coding |
| `gemini-3.5-flash-lite` | Fast + cheapest, highest free-tier RPD | 1M / 64k | $0.30 in / $2.50 out | Classification, extraction, background/high-frequency calls, fallback |
| `gemini-3.1-pro` | Heavier reasoning (stricter free limits) | — | — | Only if a single hard-reasoning step needs it |

Both Flash models support: **thinking** (3.6-flash defaults to medium — turn it down to `low`/`minimal` for latency-sensitive UI calls), **function calling, structured outputs (JSON schema), Computer Use, Live API**, and **built-in tools: Google Search grounding, Maps, code execution, File Search**.

> Built-in Google Search grounding is a hackathon cheat code: real-time data + citations with one config flag, no RAG pipeline needed.

## Gemini API — the calls you'll actually write

SDK: `pnpm add @google/genai` (JS/TS) or `uv add google-genai` (Python). Auth = `GEMINI_API_KEY` env var.

```ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY

// 1) Plain generation with thinking dialed down for speed
const res = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: prompt,
  config: { thinkingConfig: { thinkingLevel: "low" } },
});

// 2) Structured output — THE pattern for generative UI
const structured = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: userQuery,
  config: {
    responseMimeType: "application/json",
    responseSchema: { /* JSON schema of your UI component props */ },
  },
});

// 3) Google Search grounding — instant "live data + citations"
const grounded = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: userQuery,
  config: { tools: [{ googleSearch: {} }] },
});

// 4) Streaming
for await (const chunk of await ai.models.generateContentStream({...})) { ... }
```

### Vercel AI SDK route (recommended for the Next.js starter)

`pnpm add ai @ai-sdk/google` — gives `streamText`/`generateObject` + `useChat` React hook; provider reads `GOOGLE_GENERATIVE_AI_API_KEY` (set it to the same key). This is the fastest path from zero to a streaming chat UI with tool calling — see `starters/`.

```ts
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
const result = streamText({
  model: google("gemini-3.6-flash"),
  messages,
  tools: { /* zod-typed tools */ },
});
return result.toUIMessageStreamResponse();
```

## Free-tier limits (per Google Cloud project, reset midnight PT = 12:30 PM IST)

- 2.5-era published free limits: Flash ~10 RPM / 250 RPD; Flash-Lite ~15 RPM / 1,000 RPD; Pro ~5 RPM / 100 RPD. Verify tonight in [AI Studio rate-limits page](https://ai.google.dev/gemini-api/docs/rate-limits) for the 3.x models — limits tightened in Dec 2025 and are enforced on RPM + TPM + RPD (any one triggers 429).
- **Mitigations:** fallback ladder (3.6-flash → 3.5-flash-lite → key #2), retry-with-backoff on 429, `MOCK=1` dev mode, minimal thinking level, and trimming context (RPD is requests, but TPM bites on long contexts).
- If you can, enable billing on one project (Tier 1) as the emergency lane — costs during a demo day are pennies.

## Antigravity (`agy` 1.1.6 installed)

- Agent-first platform: desktop app + CLI (`agy`) + SDK + Managed Agents API. Replaced Gemini CLI (June 2026). Sign-in = Google account; generous free tier but **shared quota across desktop + CLI + SDK**.
- Known trap: very heavy token overhead per goal (10+ nested calls); community reports quota exhaustion in ~2h and a 5-hour rate-limit lockout. **Reserve it for event day**; watch `/usage`; keep subagents ≤3; use `/grill-me` to force planning before spending.
- Hackathon narrative use: run one flashy multi-agent task through Antigravity (e.g. scaffold, or a parallel test-fix pass) so you can honestly say the project used it, while Claude Code does the sustained development.

## Deployment (pick one, decide before the event)

1. **Vercel** — `pnpm dlx vercel --prod`, zero config for Next.js, env vars via dashboard/CLI. Fastest; use this by default.
2. **Cloud Run** — more "Google-native" story if judges care; needs gcloud CLI (NOT currently installed — install tonight only if you want this path: `brew install google-cloud-sdk`).
3. **AI Studio "Build" / apps** — AI Studio can scaffold and host small Gemini apps directly; fine for a backup toy, not for a real Next.js app.

## Sources

- [Gemini 3.6 Flash / 3.5 Flash-Lite announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/)
- [Latest models — Gemini API docs](https://ai.google.dev/gemini-api/docs/latest-model)
- [TechCrunch on the July 21 release](https://techcrunch.com/2026/07/21/google-releases-three-new-gemini-models-but-no-3-5-pro/)
- [Gemini CLI → Antigravity CLI transition](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
- [agy quota overhead discussion](https://github.com/google-gemini/gemini-cli/discussions/27307)
- [Antigravity 2.0 overview](https://thenextweb.com/news/google-antigravity-2-desktop-cli-sdk-io-2026)
- [Vercel AI SDK docs](https://ai-sdk.dev/docs/introduction) · [@ai-sdk/google](https://www.npmjs.com/package/@ai-sdk/google) · [Gemini × Vercel AI SDK example](https://ai.google.dev/gemini-api/docs/vercel-ai-sdk-example)
- [Free tier limit guides](https://pecollective.com/tools/gemini-free-tier-guide/)
