---
name: demo-polish
description: Final-hour demo hardening, feature freeze, error-proofing, seeded input setup, pitch script creation, and QR code generation for PromptWars Chennai 2026. Trigger when the user says "freeze", "polish", "pitch prep", or when 90 minutes or less remain.
---

# Final-Hour Demo Polish & Feature Freeze

When feature freeze is called or the configured submission deadline is approaching, immediately halt new feature development and execute the following 4-step hardening protocol in sequence.

## Step 1: Error-Proof All Visible User Paths

1. **Graceful Error Boundaries**: Wrap every Gemini call and API route in a try-catch block that renders a styled, friendly UI message on failure (never show unhandled stack traces, raw error JSON, or red Next.js dev overlays).
2. **Fallback Verification**: Test the retry-once behavior in
   `apps/web/lib/openai.ts` and the source-labelled verified fallback with a
   controlled local or preview-deployment failure. Never invalidate or rotate the
   production key immediately before the pitch.
3. **Empty State Guards**: Ensure every table, chart, list, and card component handles empty or null data gracefully without crashing or breaking layout.
4. **Console Hygiene**: Clear out all dev console errors, warnings, and unhandled rejections on the **deployed Vercel URL** (test on actual deployment, not localhost).

## Step 2: Seed the Demo Path

1. **One-Click Demo Chips**: Implement pre-populated input chips for the exact queries to be demonstrated on stage. The presenter should never have to manually type during a live pitch.
2. **Warmup Trigger**: Fire a lightweight warmup request (`/api/health`) on page load to initialize model connections and avoid cold-start delays during the pitch.
3. **Honest Degraded State (never fixtures-as-AI)**: If a live call encounters a rate limit (429) or any model failure during the pitch, the UI must show an honest degraded state: a styled error message, a one-tap retry, and — where a verified deterministic protocol exists — that content clearly labelled as verified (non-AI) guidance. NEVER present canned/fixture output as model output: mock or hallucinated AI responses are instant disqualification per docs/00.

## Step 2.5: DQ Audit (run before freeze)

Disqualification rules (docs/00) are zero-tolerance — audit for them explicitly before tagging the freeze:

1. **Grep the app** for DQ hazards and remove every hit that is reachable in production:
   - `alert(` — fake success/confirmation dialogs.
   - Hardcoded response objects in `catch` blocks that are presented as AI output.
   - `MOCK` usage reachable in a deployed environment (MOCK is local-dev-only).
2. **Evaluator walkthrough on the DEPLOYED URL**: walk through every normal judged
   flow exactly as an evaluator would, then run a **permission-denied pass** (deny
   mic/location/notification permissions and confirm the flow still completes via
   button fallbacks). Run the **AI-failure pass** on a controlled preview deployment
   or local failure-injection path; confirm the honest degraded state without
   weakening the production deployment.

## Step 3: Pitch Collateral & QR Code

1. **Web Fact-Check**: Search and verify every quantitative claim or statistic included in the pitch slides or demo script.
2. **Write `PITCH.md`**:
   - **Hook (1 line)**: Clear statement of the user pain point.
   - **Live Demo Script (3 beats, ≤60s)**:
     - *Beat 1*: Action taken → UI outcome → Why it matters.
     - *Beat 2*: Action taken → UI outcome → Why it matters.
     - *Beat 3*: Action taken → UI outcome → Why it matters.
   - **Tech Stack Bullet Points**: Name the models and services that actually power
     the app: **GPT-5.6 Terra**, **gpt-realtime**, **Structured Outputs**, and the
     deterministic safety/widget/connector libraries. Mention only installed and
     working technology.
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
