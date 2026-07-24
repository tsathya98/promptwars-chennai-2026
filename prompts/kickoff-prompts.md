# Day-of Kickoff Prompts (copy-paste, fill the blanks)

## 1. Problem-statement triage (first 10 minutes — run this before writing any code)

```
Problem statement (verbatim): """{PASTE}"""
Constraints: one-day hackathon, solo, must use Gemini API (gemini-3.6-flash), must be
deployed and demo-able by 4pm, judged on intent/speed/execution by industry experts.

Do this:
1. Restate the problem in one sentence as a user pain.
2. Propose 3 candidate solutions ranked by (wow-factor × buildability-in-4h). For each:
   the single "wow moment" a judge sees in a 90-second demo, the Gemini capability it
   showcases (structured output / search grounding / multimodal / function calling /
   Live API), and the biggest technical risk.
3. Recommend ONE. Define its walking skeleton: the thinnest end-to-end slice
   (UI → API route → Gemini → rendered result) I should have deployed within 40 minutes.
4. List what to explicitly NOT build (auth, settings, persistence, multi-user...).
5. Credibility check (web-search anything uncertain — do NOT answer from memory):
   verify every load-bearing assumption of the recommended design — the external
   API/dataset exists, is free/keyless or we have access, the library/model capability
   is real, and any domain claim the pitch will make is factually right. Kill or
   downgrade any candidate whose core assumption fails verification.
```

## 2. Scaffold + first deploy (give to Claude Code right after triage)

```
Read CLAUDE.md and docs/ in this repo first. We're building: {ONE-SENTENCE PITCH}.

Step 1: scaffold from starters/ (Next.js App Router + Tailwind + Vercel AI SDK +
@ai-sdk/google). Wire GEMINI_API_KEY. Health-check route that calls
gemini-3.5-flash-lite with "ping" so we verify quota works.
Step 2: deploy to Vercel immediately, even ugly. Give me the URL.
Step 3: only then start the walking skeleton: {DESCRIBE THE THINNEST SLICE}.
Work demo-first: after every change tell me what I can now show a judge.
```

## 3. Feature iteration loop (repeat all day)

```
Current demo state: {WHAT WORKS}. Time left: {N} hours.
Next: {FEATURE}. Constraints: must not break the deployed demo; if riskier than 30 min,
propose a seeded/simplified-scope version first (seeded demo data is a legitimate
strategy — but whatever ships must meet the rapid-mvp Definition of Done: functional
on the deployed URL, visually polished, error-resilient, documented in the README).
Implement, then give me the one-line demo script for this feature.
```

## 4. Structured-output UI (the generative-UI trick)

```
Add a Gemini call that returns JSON matching this zod schema, and a React component
that renders it: {DESCRIBE: e.g. dashboard cards / itinerary / diagnosis panel}.
Use generateObject from the AI SDK with google("gemini-3.6-flash").
Add one Skeleton loading state and stream if generateObject supports partial streaming
for this shape. Seed with a "Try example" button that uses a canned input.
```

## 5. Search-grounding feature (instant live-data credibility)

```
Add a mode that answers with Google Search grounding: tools: [{ googleSearch: {} }]
on gemini-3.6-flash. Render the grounding citations as small source chips under the
answer. This is our "live, real-world data" moment for judges.
```

## 6. Demo freeze & pitch (4:00 PM sharp)

```
FEATURE FREEZE. Do a demo-hardening pass:
1. Every user-visible error path → friendly fallback (never a red stack trace).
2. Add retry-once-with-backoff + model fallback (3.6-flash → 3.5-flash-lite) on 429/5xx.
3. Seed the exact demo inputs as one-click chips so I never type live on stage.
4. Write PITCH.md: 90-second script — pain (1 line), live demo beats (3 bullets with
   exact clicks), Google-stack slide (models + AI Studio + Antigravity + deploy),
   "what's next" (1 line). Then generate a QR code image for the deployed URL.
```

## 7. Emergency debug (when something breaks at 3:47 PM)

```
The demo is broken: {SYMPTOM}. We are {N} minutes from pitching.
Rules: smallest possible fix, no refactors, feature-flag or hide anything unfixable.
A hidden feature is invisible; a broken one loses the pitch. Find it, fix it, verify
against the deployed URL.
```
