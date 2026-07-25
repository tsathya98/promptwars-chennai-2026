<div align="center">

# IBUKI Circle

### One breath. One tap. Your circle responds.

**A multimodal recovery and prevention platform for people navigating substance use disorders and the caregivers standing beside them.**

[![Live Demo](https://img.shields.io/badge/TRY_LIVE_DEMO-IBUKI_CIRCLE-14B8A6?style=for-the-badge)](https://web-delta-three-92.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.11-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/Vitest-18_passing-6E9F18?style=for-the-badge&logo=vitest)](#engineering-evidence)
[![Model Agnostic](https://img.shields.io/badge/Model_Agnostic-OpenAI_%7C_Gemini-7A77FF?style=for-the-badge)](#model-agnostic-by-design)
[![Languages](https://img.shields.io/badge/Languages-8_Indian_languages-F5C84C?style=for-the-badge)](#multilingual-by-construction)

**[Launch the deployed application](https://web-delta-three-92.vercel.app)**

Built for the **PromptWars Chennai 2026 Recovery & Prevention challenge**.

</div>

---

## Executive summary

Most support tools expect a person in distress to explain what is happening, search through information, and decide what to do next. Those are exactly the tasks that become hardest during a craving, panic episode, return to use, or suspected overdose.

**IBUKI Circle turns one tap, a spoken phrase, or a short message into an immediate and actionable support flow.** It serves both the person seeking help and the caregiver supporting them. A model-agnostic generation layer personalizes recovery and caregiver guidance, while deterministic code controls emergency routing, verified resources, rendered UI, and every real-world action.

This is not a static information page and it is not an unrestricted chatbot. It is a working intervention pipeline with:

- **12 one-tap commands** across individual and caregiver modes;
- **two voice experiences**: speech-to-intervention and live speech-to-speech support;
- **five allow-listed live-voice screen tools** that can place interactive help on screen while the conversation continues;
- **eight response languages**: English, Tamil, Hindi, Bengali, Telugu, Marathi, Kannada, and Malayalam;
- **four specialist profiles** selected by a deterministic safety router;
- **six validated recovery widgets** rendered from a closed vocabulary;
- **five consent-based connector capabilities** for calls, messages, sharing, location, and speech;
- **two interchangeable structured-generation providers**, with automatic cross-provider fallback when both are configured;
- **India-first emergency and support resources** from reviewed registries;
- **a model-independent Level 1 emergency path** for immediate danger; and
- **visible, real pipeline activity** without exposing hidden chain-of-thought.

> **Name:** *IBUKI* (息吹) is a Japanese word associated with breath and renewed vitality. The circle represents the trusted people and services around a person in recovery.

## The problem, in plain language

Substance-use recovery is not only a long-term education problem. It is also a **right-now action problem**.

When cognitive load is high:

- a person experiencing a strong urge may not be able to type a detailed prompt;
- someone panicking needs one small physical step, not a wall of text;
- a person who has returned to use needs safety and dignity, not shame;
- a caregiver may know something is wrong but not know what to say;
- a suspected overdose cannot wait for an AI response; and
- finding a trustworthy phone number should not depend on model memory.

The challenge therefore requires one connected product that combines zero-typing access, personalized scripts, contextual safety, education, caregiver guidance, and multimodal interaction. IBUKI Circle implements that full journey rather than presenting disconnected AI demos.

## Demo access

The application build includes a lightweight demo access gate. Credential comparison happens in the server route; the evaluator credentials are deliberately public and printed in the login UI:

| Field | Value |
|---|---|
| Username | `ibuki-demo` |
| Password | `circle2026` |

The page provides a one-tap **Fill** button and a **Continue as guest** option, so an evaluator is never blocked by account setup. Successful entry creates a one-day `HttpOnly`, `Secure`, `SameSite=Lax` demo-session cookie. This is intentionally a hackathon access gate rather than a production identity system; the login screen keeps the 112 emergency link visible.

## What an evaluator can test immediately

| Scenario | What to do | Observable result | Runtime path |
|---|---|---|---|
| Evaluator entry | Choose **Continue as guest**, or fill the published demo credentials | Immediate access without registration, while the emergency number remains visible before entry | Server route → demo-session cookie → protected application page |
| Strong craving | Tap **I'm having a strong urge** | A personalized short plan, optional paced breathing, a prepared circle message, and verified human-support actions | Deterministic routing → Recovery Coach → strict structured output |
| Panic or overwhelm | Tap **I'm panicking or overwhelmed** | Low-cognitive-load grounding steps that can be read aloud | Recovery Coach → validated widget canvas → browser speech |
| Return to use | Tap **I returned to use** | Non-stigmatizing next steps focused on immediate safety | Recovery Coach with explicit person-first rules |
| Caregiver conversation | Select **I'm supporting someone**, then tap **Help me start a conversation** | What to say, what to avoid, warning signs, and verified caregiver resources | Caregiver Guide → caregiver-specific widgets |
| Suspected overdose | Tap **Possible overdose / danger** or **Possible overdose** | The UI switches to a focused emergency view with **Call 112 now** and reviewed response steps | Level 1 Safety Guardian → deterministic verified protocol; no model call |
| Spoken intervention | Tap the microphone and speak a situation | The transcript enters the same `/api/intervene` safety pipeline as typed text | Browser speech recognition → server safety router |
| Live voice + screen action | Open **Live voice**, describe an urge, and ask for breathing or a support message | The conversation continues while a validated breathing guide, editable message, helpline card, or full support plan appears on screen | Short-lived token → WebRTC → allow-listed tool call → Zod validation → deterministic React widget |
| Language adaptation | Choose Tamil, Hindi, Bengali, Telugu, Marathi, Kannada, or Malayalam, then tap or speak | The non-emergency plan is generated live in the selected language; speech input and read-aloud use the matching locale | Language preference → shared request schema → active model provider → localized widgets |
| Education or resources | Ask for a helpline, treatment resource, or explanation | Plain-language guidance with resources selected only from the verified catalog | Resource Navigator → allow-listed resource IDs |

## Direct alignment with all five functional pillars

| Official challenge pillar | IBUKI Circle implementation | Evidence in the product |
|---|---|---|
| **1. Zero-Typing Interventions** | Large one-tap commands, emergency macro, browser speech recognition, live speech-to-speech, voice-triggered screen tools, and read-aloud output | Every primary flow can begin without typing; controls are feature-detected and expose honest unsupported/error states |
| **2. Personalized Emergency Scripts** | The model creates structured intent using the selected specialist, actor mode, situation, and optional context | A single live model call produces short acknowledgements, steps, breathing parameters, caregiver guidance, and circle-message intent |
| **3. Contextual Safety Tools** | Three-level deterministic safety router, emergency phrase escalation, risk labels, verified protocols, and user-confirmed actions | Level 1 bypasses the model; urgent flows always add reviewed human-support options |
| **4. Education & Caregiver Support** | Dedicated Caregiver Guide and Resource Navigator with person-first prompts and source-restricted resources | Switch modes to receive non-blaming scripts, warning signs, self-care guidance, and official helplines |
| **5. Connected Multi-Modal Workflows** | Tap, text, voice transcript, live audio, visual widgets, speech synthesis, phone, messaging, share, and location work as connected journeys | Input is routed into a support plan; the plan becomes interactive widgets; live voice can place those widgets on screen; widgets expose explicit next actions |

## Model-agnostic by design

The recovery workflow does not depend on one model vendor. `lib/model-provider.ts` is the only provider-selection boundary used by the intervention orchestrator.

1. `MODEL_PROVIDER=openai|gemini` chooses the preferred structured-generation provider.
2. OpenAI and Gemini receive the same specialist instructions, resource catalog, user context, and strict intent contract.
3. Both providers must return the same seven-field JSON object.
4. The response is parsed through the same Zod schema.
5. The same deterministic compiler enforces specialist, widget, length, number, and resource allow-lists.
6. If the preferred provider fails and the second provider is configured, generation automatically retries through the second provider.
7. The final server response records the model that actually produced the intent, while the product UI remains provider-neutral.

| Capability | OpenAI adapter | Gemini adapter | Provider-independent boundary |
|---|---|---|---|
| Personalized intervention | Responses API using `gpt-5.6-terra` with low reasoning effort | `generateContent` using `gemini-3.6-flash` with low thinking | `generateIntent()` |
| Structured-output enforcement | Strict `json_schema` response format | `responseMimeType: application/json` plus `responseJsonSchema` | `MODEL_INTENT_JSON_SCHEMA` + `modelIntentSchema` |
| Runtime validation | Zod after API-level validation | Zod after API-level validation | Deterministic widget compiler |
| Failure handling | Automatic retry for selected transient errors, then optional Gemini fallback | Optional OpenAI fallback | Source-labelled verified guidance if no provider succeeds |
| Immediate emergency path | Not called | Not called | Deterministic Safety Guardian protocol |

The current **live speech-to-speech adapter** uses OpenAI Realtime because that is the verified realtime transport in this submission. It is isolated behind `/api/realtime/token` and the typed screen-tool boundary; the core tap, text, speech-transcript, safety, widget, connector, and personalized-intervention architecture remains provider-independent.

## Multilingual by construction

Language is part of the request and response schema rather than a UI-only translation layer.

| Language | Code | Browser speech locale |
|---|---:|---:|
| English | `en` | `en-IN` |
| Tamil | `ta` | `ta-IN` |
| Hindi | `hi` | `hi-IN` |
| Bengali | `bn` | `bn-IN` |
| Telugu | `te` | `te-IN` |
| Marathi | `mr` | `mr-IN` |
| Kannada | `kn` | `kn-IN` |
| Malayalam | `ml` | `ml-IN` |

- Non-emergency guidance is generated live in the selected language; it is not a bank of canned translations.
- The language selection is carried through one-tap, typed, speech-recognition, and live-voice requests.
- Browser speech recognition and read-aloud use the corresponding BCP-47 locale when supported.
- Live voice receives the selected language as a session instruction and keeps verified helpline numbers unchanged.
- The preference is the only item stored in `localStorage`; recovery content, transcripts, audio, and context are not persisted.
- Reviewed emergency protocols and verified AI-failure fallbacks intentionally remain in English until professionally reviewed translations exist. The application does not machine-translate medical emergency steps and pretend they were verified.

## Product architecture: three controlled libraries

IBUKI Circle separates AI reasoning from user interface and device actions. The orchestrator selects from three typed libraries instead of letting a model invent capabilities.

### 1. Specialist agent library

| Specialist | Selected for | May produce |
|---|---|---|
| **Safety Guardian** | Suspected overdose, breathing danger, unresponsiveness, self-harm language, or the emergency button | Verified safety actions, emergency script, circle message, and reviewed resources |
| **Recovery Coach** | Cravings, panic, feeling close to use, return to use, or needing someone | Immediate intervention steps, breathing guide, circle message, helplines, and recovery resources |
| **Caregiver Guide** | Distress support, conversation preparation, caregiver wellbeing, and warning signs | Say/avoid guidance, caregiver playbooks, support message, and safety actions |
| **Resource Navigator** | Education, treatment, helpline, and recovery-resource questions | Plain-language explanation and verified resource cards |

Each specialist declares an explicit widget allow-list and connector allow-list. A specialist cannot create a new UI type, invent a phone number, or execute an action.

### 2. Widget library

| Widget | Purpose | Guardrail |
|---|---|---|
| `intervention-script` | One acknowledgement plus one to three immediate steps | Length-bounded and source-labelled |
| `breathing-guide` | Timed inhale, hold, exhale, and cycle sequence | Numeric values are clamped to safe UI ranges |
| `safety-actions` | Prioritized verified calls and emergency actions | Resource IDs must resolve through the reviewed registry |
| `circle-message` | Editable message for a trusted person | Prepared only; the user reviews and sends it |
| `caregiver-guidance` | What to say, what to avoid, and warning signs | Dedicated caregiver schema with bounded lists |
| `verified-resource` | Official helpline or reviewed educational source | Must use a known resource ID and is always labelled verified |

### 3. Connector library

| Connector capability | What it does | What it never claims |
|---|---|---|
| Phone | Opens the device dialer with a verified number | That a call connected or help arrived |
| Circle message | Opens SMS or WhatsApp, or copies an editable message | That a message was sent or delivered |
| Consent-based location | Requests browser permission and prepares a Maps link for the message | That location was shared without the user sending it |
| Read aloud | Uses browser speech synthesis at a calm pace | That unsupported browsers played audio |
| Native share | Opens the device share sheet, with clipboard fallback | That the user completed a share |

Connector results use only observable states: `prepared`, `opened`, or `failed`.

### Live-voice screen tools

IBUKI Voice does more than speak. During a WebRTC conversation, the realtime model may request one of five named tools. `executeVoiceTool()` refuses unknown names, validates arguments, clamps numeric ranges, and translates the request into either an existing intervention request or a widget from the same closed vocabulary used everywhere else.

| Realtime tool | Deterministic application action | Safety boundary |
|---|---|---|
| `show_support_plan` | Sends a bounded situation summary through `/api/intervene` | Re-enters the normal server-side safety router before generation |
| `show_breathing_guide` | Renders the interactive breathing widget | Timing values are clamped and the widget passes `widgetSpecSchema` |
| `prepare_circle_message` | Renders an editable message with user-controlled share actions | Message is bounded; the app never sends it or claims delivery |
| `show_helplines` | Renders verified 14446 and 14416 call actions | IDs are fixed to the reviewed resource registry |
| `show_emergency_help` | Triggers the same Level 1 emergency path as the red button | Renders 112 and reviewed steps with no intervention-model dependency |

Tool results are returned to the voice session so it can narrate what appeared. The model never mounts React components, executes connector code, or bypasses the safety router.

## End-to-end architecture

```mermaid
flowchart TB
    tap["One-tap command"] --> intervene["POST /api/intervene"]
    transcript["Speech-recognition transcript"] --> intervene
    text["Typed situation"] --> intervene
    voicePlan["Voice tool: show support plan"] --> intervene

    intervene --> requestValidation["Request schema and size checks"]
    requestValidation --> safetyRouter["Deterministic safety router"]

    safetyRouter -->|"Level 1: immediate danger"| safetyGuardian["Safety Guardian"]
    safetyGuardian --> verifiedProtocol["Reviewed emergency protocol and India 112"]

    safetyRouter -->|"Levels 2 and 3"| specialist["Recovery Coach, Caregiver Guide, or Resource Navigator"]
    specialist --> provider["Model-provider boundary"]
    provider -->|"Preferred or fallback"| openai["OpenAI structured output"]
    provider -->|"Preferred or fallback"| gemini["Gemini structured output"]
    openai --> schema["Shared JSON Schema and Zod validation"]
    gemini --> schema
    schema --> compiler["Deterministic compiler and allow-lists"]
    compiler --> validatedWidgets["Validated widget specifications"]

    verifiedProtocol --> stream["NDJSON activity and response stream"]
    validatedWidgets --> stream
    stream --> canvas["Accessible fixed widget canvas"]
    canvas --> connectors["User-confirmed browser connectors"]

    liveVoice["Live speech-to-speech"] --> token["POST /api/realtime/token"]
    token --> ephemeral["Short-lived client token"]
    ephemeral --> realtime["WebRTC session"]
    realtime --> toolCall["One of five allow-listed screen tools"]
    toolCall --> toolValidation["Typed validation and numeric clamps"]
    toolValidation --> voiceWidgets["Breathing, message, or helpline widgets"]
    toolValidation --> voicePlan
    toolValidation -->|"Emergency tool"| safetyRouter
    voiceWidgets --> canvas
```

### Intervention request and stream

Every tap, speech-recognition transcript, and typed request uses the same compact contract:

```json
{
  "mode": "individual",
  "buttonId": "urge",
  "language": "ta",
  "context": {
    "alone": true,
    "setting": "home",
    "trustedContactLabel": "My support person"
  }
}
```

`POST /api/intervene` accepts either `buttonId` or bounded free text. It validates actor mode, language, optional context, maximum lengths, and the known request shape before orchestration. The endpoint then streams newline-delimited JSON:

```json
{"type":"activity","event":{"stage":"routing","status":"working","label":"Safety router assessing the situation"}}
{"type":"activity","event":{"stage":"generation","status":"complete","label":"Recovery Coach plan generated"}}
{"type":"response","response":{"agentId":"recovery-coach","riskLevel":"urgent","generation":"mixed","model":"<provider-selected model>","language":"ta","widgets":["<1-5 validated widget specs>"]}}
```

Activity frames report the real `routing`, `generation`, and `validation` stages; the client appends its real `rendering` stage when widgets mount. Connector controls report their own observable result beside the action. The final response contains the selected agent, risk level, generation provenance, actual model label or `null`, language, summary, and one to five validated widget specifications.

## Why this is safer than a general chatbot

### Deterministic safety boundary

Emergency buttons and explicit danger phrases are checked before any model call. A Level 1 request immediately returns the reviewed emergency protocol and India’s 112 action. AI latency, model availability, or malformed output cannot block that path.

### The model authors intent, not pixels or actions

For non-emergency support, the platform is **model-agnostic**: a provider layer (`lib/model-provider.ts`) selects the primary model via `MODEL_PROVIDER` (OpenAI default, Gemini option) and automatically falls back to the other verified provider on failure. Whichever model runs, it returns a strict intent object: the provider API enforces a JSON Schema, Zod validates the parsed object again, and deterministic application code converts approved fields into a closed set of widgets. Unknown resource IDs are rejected. Each response records which model actually produced it.

### Verified fallback instead of fake AI

If live generation fails, IBUKI explicitly says that personalization is unavailable and renders source-labelled reviewed guidance and helplines. It never presents hardcoded fallback content as a successful AI response.

### Honest real-world actions

The app can prepare a message or open a dialer, but only the user can send or call. The UI reports what was actually observable and never claims delivery, contact, rescue, or location sharing.

### Visible provenance

Each response is labelled as **AI-generated**, **verified protocol**, or **AI + verified resources**. The activity rail exposes operational stages and durations, not private chain-of-thought.

## Verified safety resources

Phone numbers and safety guidance come from a versioned in-code registry reviewed for this submission. The model sees catalog IDs and cannot supply arbitrary replacements.

| Resource | Use in IBUKI Circle |
|---|---|
| [Emergency Response Support System — 112](https://112.gov.in/) | Unified emergency action for immediate danger in India |
| [National Drug De-addiction Helpline — 14446](https://nmba.dosje.gov.in/) | Counselling and treatment-service referral |
| [Tele-MANAS — 14416](https://telemanas.mohfw.gov.in/) | 24×7 tele-mental-health support |
| [CDC: Responding to a suspected overdose](https://www.cdc.gov/stop-overdose/response/index.html) | Reviewed first-response steps, localized to India’s emergency number |
| [SMART Recovery](https://smartrecovery.org/) | Reviewed urge-grounding guidance |
| [SAMHSA caregiver guidance](https://www.samhsa.gov/find-support/helping-someone) | Conversation and caregiver-support guidance |

> **Important:** IBUKI Circle is a support and navigation tool, not a medical provider, diagnosis service, or replacement for emergency care. In immediate danger in India, call **112**.

## Privacy, security, and responsible AI

- **No application database:** this hackathon build does not persist transcripts, live audio, coordinates, phone numbers, circle messages, crisis history, or health information.
- **Server-side provider secrets:** standard OpenAI and Gemini API keys remain on the server.
- **Ephemeral live-voice access:** the browser receives only a 10-minute Realtime client token, never the standard OpenAI key; the user explicitly starts, mutes, and ends microphone access.
- **Consent at action time:** browser location is requested only when a user chooses to add it to a message.
- **Bounded input:** declared intervention bodies larger than 16 KB are rejected; request text is schema-capped at 2,000 characters and context fields have their own limits.
- **No response caching:** the intervention stream is returned with `Cache-Control: no-store`.
- **Defensive response handling:** strict schemas, length limits, numeric clamps, resource allow-lists, and widget allow-lists are applied before render.
- **Allow-listed voice tools:** unknown Realtime tool calls are refused; accepted arguments are validated before the app takes an action.
- **Security headers:** content-type sniffing, framing, referrer, camera, microphone, and geolocation policies are configured in Next.js.
- **Automated checks:** CI uses a frozen lockfile, production dependency audit, and full-history Gitleaks scan.
- **Person-first language:** model instructions prohibit stigmatizing labels, diagnosis, medication or detox instructions, guarantees, shame, and invented helplines.

## Accessibility and high-cognitive-load design

The interface is deliberately calm, high-contrast, and action-first:

- individual and caregiver modes use clear language rather than clinical jargon;
- primary controls meet a minimum 48 px touch target, with a larger emergency action;
- emergency mode removes visual distraction and promotes one primary call action;
- keyboard focus is always visible;
- status changes use `aria-live`, with assertive announcements in emergency mode;
- motion respects `prefers-reduced-motion` and coarse-pointer devices;
- voice and speech features degrade to explicit text/button alternatives;
- AI, verified, mixed, working, failed, and confirmation-required states are never represented by color alone; and
- editable messages keep the user in control before any external action.

## Evaluation-criteria evidence

| Judging parameter | Implementation evidence |
|---|---|
| **Code quality — high impact** | Typed specialist registry, one orchestrator, provider adapters behind one interface, closed widget/connector vocabularies, shared schemas, small focused modules, and deterministic compilation |
| **Problem alignment — high impact** | All five challenge pillars map to working evaluator flows: zero typing, personalized scripts, contextual safety, caregiver/education support, and connected multimodal actions |
| **Security — medium impact** | Server-only long-lived keys, short-lived Realtime credentials, no sensitive database, no response cache, explicit consent, safe connector states, security headers, production dependency audit, and Gitleaks |
| **Efficiency — medium impact** | One structured generation call for non-emergencies, low reasoning/thinking modes, streamed activity, provider failover without a second orchestration path, static page shell, and zero model latency on Level 1 |
| **Testing — tie-breaker** | 18 focused unit tests cover request and response schemas, safety routing, emergency independence, deterministic compilation, verified fallback behavior, resource rejection, and connector URL construction |
| **Accessibility — tie-breaker** | Keyboard focus, semantic controls, 48 px or larger primary targets, live status announcements, reduced-motion support, provider-neutral source labels, and simplified emergency presentation |

## GenAI and technology stack

| Layer | Technology | Why it is used |
|---|---|---|
| Personalized interventions | Model-agnostic provider layer: OpenAI Responses API (`gpt-5.6-terra`) or Google Gemini (`gemini-3.6-flash`) via `MODEL_PROVIDER`, with automatic cross-provider fallback | One structured model call per non-emergency intervention, optimized for latency; no single-vendor dependency |
| Live conversation | OpenAI Realtime (`gpt-realtime`) over WebRTC | Low-latency speech-to-speech with a short-lived browser credential |
| Voice-to-screen tools | Five typed Realtime function definitions plus `executeVoiceTool()` | Lets a spoken conversation render help while deterministic code retains control |
| Safety and orchestration | TypeScript deterministic router and typed specialist registry | Emergency independence, predictable routing, and reviewable policy |
| Structured output | Strict JSON Schema plus Zod 4 | API-level shape enforcement followed by runtime validation |
| Multilingual experience | Eight language codes with live generation and BCP-47 speech locales | One shared journey across text, browser speech, live voice, and read-aloud |
| Application | Next.js 16 App Router and React 19 | UI, server routes, streaming, and standalone deployment |
| Styling | Tailwind CSS 4 and semantic CSS tokens | Consistent high-contrast, low-cognitive-load presentation |
| Browser capabilities | Speech Recognition, Speech Synthesis, Web Share, Geolocation, `tel:`, SMS, and WhatsApp links | Multimodal input/output and explicit user-controlled actions |
| Workspace | Nx 23 and pnpm workspaces | Repeatable task execution and cacheable checks |
| Testing | Vitest 4 | Fast focused verification of schemas, routing, compilation, emergency behavior, and connector builders |
| Deployment | Vercel, with standalone Docker support | Public evaluator access and portable production builds |

## Engineering evidence

Verified locally against the current implementation:

| Check | Current result | What it covers |
|---|---|---|
| `pnpm nx test web` | **18 tests passing across 4 test files** | Safety routing, emergency independence, schema contracts, widget compilation, fallbacks, and connector URL builders |
| `pnpm nx lint web` | **0 errors** | Next.js, React, TypeScript, hooks, and accessibility linting; two non-blocking cursor-animation warnings remain |
| `pnpm nx build web` | **Passing production build** | Next.js 16 compilation, TypeScript checking, static generation, and route construction |
| `pnpm audit --prod --audit-level=high` | **No known vulnerabilities found** | Production dependency audit |
| GitHub Actions | **Configured** | Frozen install, guidance mirror check, lint, test, production audit, build, concurrency cancellation, and secret scan |

The production application exposes:

- `/` — intervention experience;
- `/api/intervene` — validated NDJSON intervention pipeline;
- `/api/realtime/token` — short-lived credential for live voice; and
- `/api/health` — live model, latency, specialist count, resource count, and registry version check.

## Repository structure

```text
apps/web/
├── app/
│   ├── api/intervene/        # validated streaming intervention endpoint
│   ├── api/realtime/token/   # ephemeral live-voice token endpoint
│   ├── api/health/           # live model and registry health check
│   └── page.tsx              # individual, caregiver, emergency, and voice UI
├── components/               # widget canvas, voice, activity, and motion UI
└── lib/
    ├── agents/               # typed specialist registry and orchestrator
    ├── safety-router.ts      # deterministic risk routing
    ├── schemas.ts            # closed vocabularies and validation contracts
    ├── resources.ts          # reviewed safety/resource registry
    ├── connectors.ts         # user-confirmed browser actions
    └── openai.ts             # Responses API wrapper and retry policy
```

The detailed product and architecture plan is available in [`docs/07-ibuki-circle-plan.md`](docs/07-ibuki-circle-plan.md).

## Run locally

### Prerequisites

- Node.js 22
- pnpm 10
- an OpenAI API key with access to the configured models

### Setup

```bash
pnpm install
cp .env.example apps/web/.env.local
# Add OPENAI_API_KEY to apps/web/.env.local
pnpm nx dev web
```

Open [http://localhost:3000](http://localhost:3000), then verify the model connection:

```bash
curl http://localhost:3000/api/health
```

### Quality checks

```bash
pnpm nx lint web
pnpm nx test web
pnpm nx build web
pnpm audit --prod --audit-level=high
```

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `OPENAI_API_KEY` | Yes | Server-side credential for structured interventions, health checks, and ephemeral Realtime tokens |
| `OPENAI_BASE_URL` | No | Defaults to the required region-pinned `https://us.api.openai.com/v1` host |

There is no mock mode and no authentication wall. Evaluators can use every workflow directly in the deployed application.

## Current scope and future vision

### Working in this submission

- connected one-tap, typed, speech-recognition, read-aloud, and live-voice experiences;
- deterministic emergency routing and reviewed fallback content;
- individual and caregiver journeys;
- specialist, widget, and connector libraries;
- official India-first helplines and reviewed educational resources;
- responsive, keyboard-aware, reduced-motion-aware UI; and
- public deployment, health endpoint, automated tests, CI, and security scanning.

### Intentionally not claimed

- IBUKI does not diagnose, prescribe, supervise detoxification, or replace professional care.
- It does not autonomously call, message, share location, or contact emergency services.
- It does not claim a dialer/composer action was completed.
- It does not persist profiles, health history, contacts, transcripts, or recovery records in this build.

### Post-hackathon direction

The three-library architecture is designed to grow safely: more reviewed specialist policies, localized widget packs, and consent-based connectors can be added without giving a model unrestricted UI or device control. Persistent care plans, authenticated circles, provider integrations, multilingual localization, and human-in-the-loop clinical review are future capabilities—not features claimed by this submission.

---

<div align="center">

Built with care at **PromptWars Chennai 2026** by **Sathya T** ([@tsathya98](https://github.com/tsathya98))

**[Try IBUKI Circle live](https://web-delta-three-92.vercel.app)**

</div>
