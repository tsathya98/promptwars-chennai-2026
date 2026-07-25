---
name: gemini
description: Gemini API integration patterns for PromptWars Chennai 2026 — model selection (gemini-3.6-flash, gemini-3.5-flash-lite), provider routing (Antigravity subscription first, API key second), Vercel AI SDK integration, fallback ladders, structured output, search grounding, and generative UI specs. Use whenever creating, modifying, or reviewing Gemini model calls or AI route handlers.
---

# Gemini API Integration (PromptWars Chennai 2026)

> **Provider note**: the event's original "Google models only" rule has been lifted —
> any vendor is now allowed. This skill still applies whenever Gemini is the model
> in use for a given call; see the `openai` skill for the active IBUKI submission.
> The current app does not contain a Gemini wrapper or route, so do not assume the
> historical scaffold paths below exist. Introduce this lane only after a live model
> smoke test and an explicit provider decision.

## 1. Verified Model Lineup (July 2026)

- **`gemini-3.6-flash`**: Main workhorse for chat, structured outputs, agentic tools, multimodal intake, and interactive UI generation.
- **`gemini-3.5-flash-lite`**: Fast/cheap lane for background extraction, classification, heavy volume calls, and primary 429 fallback target.
- **`gemini-3.1-pro`**: Deep reasoning fallback only if a single hard reasoning step requires it.
- **Rule**: NEVER invent model IDs. Never use legacy 1.5 or 2.x model strings in code.

## 2. Dual Provider Routing Strategy

| Physical Path | Auth Mechanism | Best For | Required implementation |
|---|---|---|---|
| **Antigravity Subscription** | Google OAuth (`agy -p`) | Optional local non-interactive generation | Add a dedicated local-only adapter |
| **Unified Facade** | Subscription → API Key fallback | Optional mixed-provider routing | Add one server-only provider facade |
| **Gemini API Key** | `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Deployed routes and interactive calls | Add one centralized server-only Gemini wrapper |

- **Routing Rule**: If Gemini is selected, deployed paths must use an API key
  available to the server runtime. Keep subscription-only tooling local.

## 3. Core Implementation Patterns

### A. Vercel AI SDK First (`ai` + `@ai-sdk/google`)
Use for all streaming chat API routes and structured object generation:
```ts
import { google } from "@ai-sdk/google";
import { streamText, generateObject } from "ai";

// 1. Streaming Chat Route
export async function POST(req: Request) {
  const { messages } = await req.parse();
  const result = streamText({
    model: google("gemini-3.6-flash"),
    messages,
    tools: { /* zod tools */ },
  });
  return result.toUIMessageStreamResponse();
}

// 2. Structured Generative UI Object
const { object } = await generateObject({
  model: google("gemini-3.6-flash"),
  schema: dashboardWidgetSchema,
  prompt: "Generate section specs for...",
});
```

### B. Single Wrapper & Fallback Ladder
If Gemini is selected, route all direct model calls through one server-only wrapper:
- Retry once with 1s exponential backoff on 429/503.
- Model Fallback Ladder: `gemini-3.6-flash` → `gemini-3.5-flash-lite` → `GEMINI_API_KEY_FALLBACK`.
- Optional fixture mode may be used locally, but must throw or remain unreachable
  in production.

### C. Search Grounding & Multimodal (Raw `@google/genai`)
Drop to `@google/genai` when leveraging native Google Search grounding or Live API:
```ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({}); // Reads GEMINI_API_KEY

const res = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: userQuery,
  config: {
    tools: [{ googleSearch: {} }],
    thinkingConfig: { thinkingLevel: "low" }, // Minimize latency for UI responses
  },
});
```

### D. Server-Driven Generative UI (SDUI)
- Model emits typed **Section Specs** (`{ kind: "trend", metricName: "..." }`), NOT raw HTML or component pixels.
- Server-side compiler validates specs, runs query logic, and constructs a deterministic **WidgetTree JSON** (closed vocabulary: card, row, col, chart, table, metric).
- `WidgetRenderer` component renders the closed vocabulary cleanly without hallucinated styling or invalid DOM trees.

## 4. Latency & Quota Optimization

- **Thinking Level**: Set `thinkingLevel: "low"` or `"minimal"` on latency-sensitive user calls.
- **Context Pruning**: Trim message history to the last ~10 turns before invoking Gemini.
- **Tool Output Budgeting**: Enforce per-call character limits (~4k chars) on tool outputs with truncation markers.

## 5. Smoke Testing
- When Gemini powers the deployed app, maintain `GET /api/health` with a small
  live call to the selected verified model so the route checks real quota and
  credentials.
