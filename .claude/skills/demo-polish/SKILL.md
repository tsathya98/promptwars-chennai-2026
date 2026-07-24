---
name: demo-polish
description: Final-hour demo hardening and pitch prep for the hackathon — error-proofing, seeded demo paths, pitch script, QR code. Use when the user says "freeze", "polish", "pitch prep", or when <90 min remain.
---

# Demo Polish Pass (feature freeze)

Run these in order; skip nothing. No new features from this point.

## 1. Error-proof every visible path

- Wrap all Gemini calls: on failure show a friendly styled message, never a stack trace or raw JSON.
- Verify retry + model fallback (3.6-flash → 3.5-flash-lite → fallback key) actually fires: simulate a 429 by pointing at an invalid key locally.
- Unknown/empty states: every list, chart, and card must render something sane with empty data.
- Kill all console errors and Next.js dev overlays; verify on the **deployed** URL, not localhost.

## 2. Seed the demo path

- One-click example chips for the exact inputs the pitch uses — the presenter never free-types on stage.
- Preload/warm any slow first call (fire a warmup request on page load).
- `fixtures/` fallback: if a live call fails during the pitch, the UI silently serves the last good response for the seeded inputs (cache them at build time).

## 3. Pitch collateral

Web-verify every factual claim the pitch makes (statistics, market numbers, domain
facts) — cut or soften anything unverifiable. Then write `PITCH.md`:
1. **Hook** (1 line): the user pain, concrete.
2. **Live demo script** (3 beats, exact clicks, ≤60s total): each beat = what I click → what appears → one-line why it's impressive.
3. **Google-stack slide bullet list**: Gemini 3.6 Flash (star calls), 3.5 Flash-Lite (background), AI Studio key, Antigravity usage, structured outputs / search grounding — name-check them explicitly, it's a Google event.
4. **What's next** (1 line) + team/contact.

Then generate `public/qr.png` — QR code of the deployed URL (`npx qrcode <url> -o public/qr.png` or a tiny script) and add a footer link to it.

## 4. Insurance

- Record a full walkthrough screen capture (remind the user — they must do this manually).
- `git tag demo-freeze && git push --tags`.
- Confirm `/api/health` is green on the deployed URL one last time.
