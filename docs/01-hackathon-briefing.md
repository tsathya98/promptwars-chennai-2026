# PromptWars Chennai — Event Briefing & Checklist

**Date:** Saturday, 25 July 2026, 9:00 AM – 5:00 PM
**Venue:** IndiQube Millenia, Campus-1a, RMZ Millenia Business Park-I, 9/1 MGR Main Rd, Perungudi, Chennai 600096
**Format:** One-day, offline, invite-only vibe-coding hackathon by Google for Developers × Hack2skill. Problem statement revealed at the venue. Build + deploy a functional AI prototype the same day, live pitch, winners on the spot. ₹50,000 prize pool.

**Judging signal (from the invite):** *intent, speed, and execution* — a working, deployed demo beats a clever half-built architecture.

## Physical checklist (night before)

- [ ] Laptop + charger
- [ ] Extension box / multi-plug
- [ ] Government photo ID (Aadhaar / PAN / DL)
- [ ] Invite email + QR code saved offline on phone (mandatory)
- [ ] Personal hotspot as venue-WiFi backup

## Environment checklist (night before — verify each one actually works)

- [ ] **Gemini API key**: create/verify at [Google AI Studio](https://aistudio.google.com) → export as `GEMINI_API_KEY` in `~/.zshrc`. Create a **second key on a second Google account** as a quota fallback.
- [ ] **Antigravity**: run `agy` in a real terminal, confirm login works (`agy auth status` needs a TTY). Desktop app installed and signed in too, if you plan to use it. **Do NOT burn quota tonight** — quota is shared across Antigravity desktop + CLI + SDK and resets on a rolling window; the invite explicitly says to reserve tokens for event day.
- [ ] **Claude Code** signed in (your dev copilot; submission code still targets Google models).
- [ ] Node 22 ✓ (v22.23.0), pnpm ✓ (10.33), Python 3.14 ✓, uv ✓ (0.11) — already verified. **pnpm for all JS, uv for all Python — never npm/pip** (matches takOS + agentic-central-reporting conventions).
- [ ] `pnpm dlx create-next-app@latest --help` runs once tonight so the package is in pnpm store (offline-resilience).
- [ ] Pre-cache heavy npm deps (run the starter scaffold in `starters/` once tonight, keep `node_modules` or at least the pnpm store warm).
- [ ] Vercel CLI logged in (`pnpm dlx vercel login`) — fastest public deploy path.
- [ ] GitHub: `tsathya98` account is wired for `~/Developer/projects/**` (done — commits & pushes here auto-use it).
- [ ] **Google OAuth client** (in case the app needs "Sign in with Google"): create the consent screen (External, test mode, add your accounts as test users) + a Web OAuth client with `http://localhost:3000` origins/redirects at console.cloud.google.com tonight — it's fiddly under pressure. Save client ID/secret in the password manager. Details: `google-auth` skill.
- [ ] Phone charged; carry a USB cable (demo from phone via QR code to deployed URL impresses judges).

## Quota strategy (critical — this decides your day)

1. **Two lanes, two quotas:** Use **Claude Code for building** (your own quota) and spend **Gemini quota only on the product runtime** (the app's API calls). Never let your dev tooling and your demo compete for the same tokens.
2. Antigravity CLI (`agy`) has *heavy* token overhead — a single goal can trigger 10+ nested model calls, and users report exhausting Pro quotas in ~2 hours. If you use `agy` at all, keep parallel subagents ≤3 and check `/usage` often. Prefer it for the "must show Google tooling" narrative, not bulk coding.
3. AI Studio free-tier is per **Google Cloud project**, resets midnight **Pacific** (12:30 PM IST — mid-hackathon reset works in your favor). Flash-Lite has the highest RPD; use `gemini-3.5-flash-lite` for high-frequency/background calls and `gemini-3.6-flash` for the star interactions.
4. Build a **model-fallback ladder** into the app from the start: `gemini-3.6-flash` → `gemini-3.5-flash-lite` → second API key. A 429 during the live pitch is the most preventable failure mode.
5. Cache/mock during development: record a few good responses to JSON and add a `MOCK=1` mode so UI iteration costs zero tokens.

## Day-of time budget (9:00–5:00, assume ~5–5.5h effective build window)

| Slot | What |
|---|---|
| 0:00–0:20 | Understand problem, pick the ONE demo-able wow moment, write it as a sentence |
| 0:20–0:40 | Scaffold from `starters/`, deploy "hello world" to Vercel **immediately** (deploy first, build second) |
| 0:40–3:00 | Core loop: Gemini call → structured output → UI. Demo-able every 30 min |
| 3:00–4:00 | Second feature OR polish, whichever the demo needs more |
| 4:00–4:30 | Freeze features. Seed demo data, rehearse the pitch twice, record a backup screen-capture video |
| 4:30– | Buffer. Something always breaks |

## Pitch rules of thumb

- Open with the user pain, show the live product within 30 seconds.
- Say "Gemini 3.6 Flash" and point at the Google-stack pieces explicitly — it's a Google event.
- Have the deployed URL on a QR code; let judges try it on their phones.
- Keep a recorded video as insurance; never demo a feature you didn't rehearse.
