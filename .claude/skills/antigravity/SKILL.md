---
name: antigravity
description: Strategy and execution guidelines for using Google Antigravity (agy CLI, Antigravity 2.0, Python SDK, programmatic subscription wrappers). Use whenever executing tasks using Antigravity, running headless agy commands, managing token quotas, or setting up Antigravity multi-agent showcase workflows.
---

# Antigravity Execution & Quota Strategy (PromptWars Chennai 2026)

> **Provider note**: Antigravity/Google-model usage is now optional, not a submission
> requirement — the "must show Google tooling" scoring pressure is gone. Use it where
> it genuinely helps (local non-interactive batch generation, or one showcase task);
> skip it entirely if another provider fits the problem statement better.

## 1. Physical Surface Overview

- **Antigravity CLI (`agy` v1.1.6)**: Terminal-based agent execution. Signs in via Google Account OAuth.
- **Antigravity 2.0 Desktop / IDE**: UI-based multi-agent workspace with auxiliary panes (Artifacts, Subagents, Tasks, Terminals).
- **Antigravity Python SDK**: Programmatic SDK (`google-antigravity`). Requires API Key or Vertex ADC (does NOT use subscription OAuth directly).
- **Headless Subscription Wrapper (`agy -p`)**: CLI wrapper script providing programmatic access to Google account subscription quota.

## 2. Quota Management & Safety Rules

1. **Shared Quota Warning**: Token quota is shared across Antigravity CLI, Desktop IDE, and SDK. Antigravity carries significant agentic overhead (~10+ nested model calls per goal).
2. **Quota Conservation Rules**:
   - Keep parallel subagents ≤ 3 at all times.
   - Monitor token status frequently using `/usage`.
   - Use `/grill-me` before executing large, complex goals to align on plan specs before consuming model tokens.
   - Do NOT run heavy non-essential background loops tonight or during pre-hackathon setup.
3. **Mandatory `--sandbox` Flag**:
   - In headless/print mode (`agy -p`), `agy` automatically approves all tool calls (including file modifications).
   - ALWAYS pass `--sandbox`:
     ```bash
     agy -p "Generate fixture JSON for user analytics" --model gemini-3.6-flash-low --sandbox
     ```

## 3. Two-Lane Quota Strategy

| Development Lane | Tooling Used | Model Quota Spent | Purpose |
|---|---|---|---|
| **Dev / Coding Lane** | Antigravity CLI / Claude Code | Subscription Quota / Dev Quota | Building, refactoring, and scaffolding the hackathon app |
| **Product Runtime Lane** | Next.js API Routes (`@ai-sdk/google`) | Gemini API Key (`GEMINI_API_KEY`) | Live streaming app demo hit by judges |
| **Local Batch Lane** | `scripts/agy-batch.mjs` / `lib/antigravity.ts` | Subscription Quota | Generating seed fixtures, copy, mock data without spending API key quota |

## 4. Programmatic Local Execution (`lib/antigravity.ts` & `lib/llm.ts`)

For local heavyweight non-interactive tasks (report generation, mock data synthesis, summary compilation):
1. Use `lib/antigravity.ts` to call `agy -p` with validated Zod schema outputs.
2. `lib/llm.ts` acts as a unified facade: tries the local Antigravity subscription first, then automatically falls back to `GEMINI_API_KEY` if `agy` fails or rate-limits.
3. On production/Vercel deploys, `LLM_PROVIDER=api` forces the route to bypass `agy` and run strictly on the API key.

## 5. Judge Showcase Workflow

To score maximum points for Google tech stack integration during the pitch:
- Run **ONE high-visibility agentic task** live or recorded through Antigravity (e.g., automated test-and-fix loop or dynamic canvas compilation).
- Highlight the use of Gemini 3.6 Flash thinking modes and Antigravity multi-agent orchestration in your pitch (`PITCH.md`).
