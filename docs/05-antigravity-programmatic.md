# Programmatic Google-Model Access via Antigravity Subscription

**Priority order: subscription first, API key second** — but they serve different
physical situations, so this is a routing decision, not a preference toggle.

## What the subscription can and cannot do (verified locally, 24 July)

`agy` 1.1.6 headless mode works with your Google-account login — smoke-tested:
`agy -p "Reply with exactly one word: pong" --model gemini-3.5-flash-low --sandbox`
returned `pong` in ~14s.

**Models on the subscription** (`agy models` — suffix = reasoning effort):
`gemini-3.6-flash-{high,medium,low}`, `gemini-3.5-flash-{high,medium,low}`,
`gemini-3.1-pro-{high,low}` (+ claude/gpt-oss entries — do NOT use those at a Google
hackathon).

| | Antigravity subscription (`agy -p`) | Gemini API key |
|---|---|---|
| Auth | Google login (OAuth), no key | `GEMINI_API_KEY` |
| Where it runs | **Your laptop only** | Anywhere (incl. Vercel) |
| Latency | ~10–15s per call (heavy init) | ~1–3s |
| Streaming | No | Yes |
| Structured output | Prompt + parse (no schema enforcement) | Native `responseSchema` |
| Quota pool | Shared with Antigravity app/IDE | Per-project RPM/RPD |

The official SDK (`pip install google-antigravity`) authenticates with **API key or
Vertex ADC — not the subscription** ([repo](https://github.com/google-antigravity/antigravity-sdk-python)).
Community confirms OAuth-in-headless is CLI-only today
([issue #78](https://github.com/google-antigravity/antigravity-cli/issues/78)).
So subscription-programmatic = wrap `agy -p`. That's what the templates do.

## Routing rules for tomorrow

1. **Interactive streaming chat (deployed)** → API key (`streamText` + `@ai-sdk/google`).
   Physically the only option; don't fight it.
2. **Heavyweight non-interactive generation while demoing locally** (report compilation,
   long summaries, canvas content) → `generateText()` from `lib/llm.ts` — tries
   subscription, falls back to API key automatically.
3. **Dev-time / build-time generation** (seed data, fixtures, PITCH.md copy, README) →
   `scripts/agy-batch.mjs` — pure subscription quota, zero API-key spend. This is the
   biggest lever: generate all demo data through it.
4. **Coding agent work** → interactive `agy` / Antigravity desktop (subscription), or
   Claude Code (separate quota entirely).

If the demo runs from localhost (screen-share pitch), routes 2–3 mean the API keys stay
nearly untouched for the deployed URL judges hit on their phones.

## Template files

- `starters/templates/lib/antigravity.ts` — `agyGenerate` / `agyGenerateJSON` (zod-validated, one retry) / `agyAvailable`
- `starters/templates/lib/llm.ts` — unified facade with auto-fallback (subscription → API key); `LLM_PROVIDER=api` forces key path (set this on Vercel)
- `starters/templates/scripts/agy-batch.mjs` — CLI batch generator for fixtures/copy

### Python one-liner (if a Python sidecar appears)

```python
import subprocess
def agy(prompt: str, model: str = "gemini-3.6-flash-low") -> str:
    return subprocess.run(
        ["agy", "-p", prompt, "--model", model, "--sandbox"],
        capture_output=True, text=True, timeout=240, check=True,
    ).stdout.strip()
```

## Safety & quota notes

- Always pass `--sandbox` in print mode: `agy -p` **auto-approves all tool calls**
  (including file writes) — sandbox keeps a stray agentic impulse contained
  ([issue #45](https://github.com/google-antigravity/antigravity-cli/issues/45)).
- Prefer `-low` effort models; each `agy` call has fixed init overhead, so batch
  several items into ONE prompt rather than looping calls.
- Quota is shared with the desktop app — if you're also vibing in the Antigravity IDE,
  the wrapper's fallback to API key is your safety net (already automatic in `llm.ts`).
