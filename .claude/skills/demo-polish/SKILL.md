---
name: demo-polish
description: Final-hour demo hardening, feature freeze, error-proofing, seeded input setup, pitch script creation, and QR code generation for PromptWars Chennai 2026. Trigger when the user says "freeze", "polish", "pitch prep", or when <90 minutes remain.
---

# Final-Hour Demo Polish & Feature Freeze

When feature freeze is called (or at 4:00 PM), immediately halt new feature development and execute the following 4-step hardening protocol in sequence.

## Step 1: Error-Proof All Visible User Paths

1. **Graceful Error Boundaries**: Wrap every Gemini call and API route in a try-catch block that renders a styled, friendly UI message on failure (never show unhandled stack traces, raw error JSON, or red Next.js dev overlays).
2. **Fallback Ladder Verification**: Test whichever fallback ladder the app actually uses locally by temporarily invalidating the primary key — e.g. `gemini-3.6-flash` → `gemini-3.5-flash-lite` → `GEMINI_API_KEY_FALLBACK` on the Gemini lane, or the equivalent retry-once-with-backoff in `lib/openai.ts` on the OpenAI lane.
3. **Empty State Guards**: Ensure every table, chart, list, and card component handles empty or null data gracefully without crashing or breaking layout.
4. **Console Hygiene**: Clear out all dev console errors, warnings, and unhandled rejections on the **deployed Vercel URL** (test on actual deployment, not localhost).

## Step 2: Seed the Demo Path

1. **One-Click Demo Chips**: Implement pre-populated input chips for the exact queries to be demonstrated on stage. The presenter should never have to manually type during a live pitch.
2. **Warmup Trigger**: Fire a lightweight warmup request (`/api/health`) on page load to initialize model connections and avoid cold-start delays during the pitch.
3. **Canned Fixture Backup**: If a live call encounters a rate limit (429) during the pitch, configure the UI to silently fall back to pre-cached fixtures (`fixtures/`) for seeded demo inputs.

## Step 3: Pitch Collateral & QR Code

1. **Web Fact-Check**: Search and verify every quantitative claim or statistic included in the pitch slides or demo script.
2. **Write `PITCH.md`**:
   - **Hook (1 line)**: Clear statement of the user pain point.
   - **Live Demo Script (3 beats, ≤60s)**:
     - *Beat 1*: Action taken → UI outcome → Why it matters.
     - *Beat 2*: Action taken → UI outcome → Why it matters.
     - *Beat 3*: Action taken → UI outcome → Why it matters.
   - **Tech Stack Bullet Points**: Name-check whichever models/providers actually power the app (e.g. **Gemini 3.6 Flash** + **Google Search Grounding** + **Antigravity**, or **GPT-5.6 Terra**, or a mix), plus **Structured Outputs** and **Vercel AI SDK** — no vendor is mandatory to mention, just be accurate about what's actually running.
   - **Next Steps & Contact**: One concluding line.
3. **Generate QR Code**:
   - Generate `public/qr.png` pointing to the live deployed Vercel URL using `pnpm dlx qrcode <DEPLOYED_URL> -o public/qr.png`.
   - Add a QR code toggle or footer link in the web app UI for judges to test on their mobile devices.

## Step 4: Insurance & Verification

1. **Screen Capture Backup**: Record a complete, high-resolution video walkthrough of the 90-second demo path as an emergency backup.
2. **Tag Git Release**:
   ```bash
   git tag demo-freeze && git push origin demo-freeze --tags
   ```
3. **Health Check Verification**: Confirm that `GET /api/health` returns `200 OK` (`{ ok: true }`) on the deployed URL immediately before taking the stage.
