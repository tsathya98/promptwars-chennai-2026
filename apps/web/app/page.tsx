"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ComponentType,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  SVGProps,
} from "react";
import {
  AudioLines,
  Flame,
  HeartHandshake,
  HeartPulse,
  LifeBuoy,
  MessageSquareText,
  MessagesSquare,
  PhoneCall,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";
import { ActivityRail } from "@/components/activity-rail";
import { CursorField } from "@/components/cursor-field";
import { LiveVoice } from "@/components/live-voice";
import { VoiceControl } from "@/components/voice-control";
import { Widget, WidgetCanvas } from "@/components/widget-renderer";
import { AGENTS } from "@/lib/agents/registry";
import { buildTelLink } from "@/lib/connectors";
import { LANGUAGE_CODES, LANGUAGES, type LanguageCode } from "@/lib/languages";
import { COMMAND_BUTTONS, type ActorMode } from "@/lib/safety-router";
import type { InterveneRequestInput, WidgetSpec } from "@/lib/schemas";
import { useIntervene } from "@/lib/use-intervene";
import type { VoiceToolAction } from "@/lib/voice-tools";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const BUTTON_ICONS: Record<string, Icon> = {
  urge: Flame,
  panic: Waves,
  "close-to-using": ShieldAlert,
  "returned-to-use": RotateCcw,
  "need-someone": Users,
  "overdose-danger": Siren,
  "possible-overdose": Siren,
  "they-are-distressed": HeartPulse,
  "start-conversation": MessagesSquare,
  "prepare-message": MessageSquareText,
  "caregiver-support": LifeBuoy,
  "call-emergency": PhoneCall,
};

const ACCENT: Record<string, string> = {
  teal: "var(--teal)",
  indigo: "var(--indigo)",
  crimson: "var(--crisis)",
  amber: "var(--amber)",
};

const GENERATION_LABEL = {
  ai: "AI-personalized for you",
  "verified-protocol": "Verified guidance — not AI-generated",
  mixed: "AI-personalized · includes verified actions",
} as const;

const HOW_IT_WORKS = [
  {
    kicker: "route",
    title: "Deterministic safety first",
    body: "Every tap, sentence, or voice note passes a safety router. Emergencies get verified 112 guidance instantly — no AI in the path.",
    icon: ShieldCheck,
  },
  {
    kicker: "generate",
    title: "One specialist, one plan",
    body: "A recovery specialist personalizes your plan with live AI — checked twice against our safety rules before anything reaches your screen.",
    icon: Sparkles,
  },
  {
    kicker: "act",
    title: "Real actions, honestly reported",
    body: "Call, message, breathe, share — every action opens your own apps and says “opened”, never “sent”.",
    icon: HeartHandshake,
  },
] as const;

const VERIFIED_CHIPS = [
  "112 · Emergency (ERSS)",
  "14446 · De-addiction helpline",
  "14416 · Tele-MANAS",
] as const;

export default function Home() {
  const [mode, setMode] = useState<ActorMode>("individual");
  const [draft, setDraft] = useState("");
  const [liveVoiceOpen, setLiveVoiceOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [voiceWidgets, setVoiceWidgets] = useState<WidgetSpec[]>([]);
  const { events, response, status, error, intervene, reset } = useIntervene();
  const lastRequest = useRef<InterveneRequestInput | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("ibuki-language");
    if (saved && saved in LANGUAGES) setLanguage(saved as LanguageCode);
  }, []);

  const changeLanguage = (code: LanguageCode) => {
    setLanguage(code);
    window.localStorage.setItem("ibuki-language", code);
  };

  const crisis = response?.riskLevel === "emergency";
  const working = status === "working";
  const buttons = useMemo(() => COMMAND_BUTTONS.filter((b) => b.mode === mode), [mode]);
  const agent = response ? AGENTS[response.agentId] : null;

  const run = (request: InterveneRequestInput) => {
    const withLanguage = { ...request, language };
    lastRequest.current = withLanguage;
    void intervene(withLanguage);
  };

  const spot = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || working) return;
    run({ mode, text: trimmed });
    setDraft("");
  };

  const emergencyNow = () =>
    run({ mode, buttonId: mode === "caregiver" ? "possible-overdose" : "overdose-danger" });

  /** IBUKI Voice screen tools land here — deterministic code does the work. */
  const handleVoiceTool = (action: VoiceToolAction) => {
    if (action.kind === "emergency") {
      emergencyNow();
    } else if (action.kind === "intervention") {
      run({ mode, text: action.text });
    } else {
      setVoiceWidgets((prev) => [...action.widgets, ...prev].slice(0, 4));
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {!crisis && <CursorField />}
      {!crisis && (
        <>
          <div aria-hidden className="orb absolute -top-36 right-[-110px]" />
          <div aria-hidden className="orb orb-violet absolute bottom-[-170px] left-[-140px]" />
        </>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 md:py-10">
        {/* Fixed safety shell: brand + always-available emergency action */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-5">
          <div>
            <p className="kicker mb-1">[ Recovery &amp; prevention platform ]</p>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              IBUKI <span className="hero-serif font-semibold text-[var(--teal)]">Circle</span>
            </h1>
            <p className="mt-1 text-sm text-[var(--text-soft)]">
              One breath. One tap. Your circle responds.
            </p>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-soft)] opacity-80">
              <span aria-hidden className="dot-working h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
              specialists online · private by design
            </p>
          </div>
          {!crisis && (
            <div className="flex items-center gap-2.5">
              <label className="sr-only" htmlFor="language-select">
                Response language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => changeLanguage(e.target.value as LanguageCode)}
                className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2.5 text-sm text-[var(--text-soft)] focus:border-[var(--teal)] focus:outline-none"
              >
                {LANGUAGE_CODES.map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGES[code].label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={emergencyNow}
                className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-[var(--crisis)] bg-[var(--crisis)]/15 px-5 font-bold text-[var(--crisis-soft)] transition-colors hover:bg-[var(--crisis)]/30"
              >
                <Siren className="h-5 w-5" aria-hidden />
                Emergency help
              </button>
            </div>
          )}
        </header>

        {crisis && response ? (
          /* Crisis mode: one primary action, no decoration, explicit exit. */
          <section
            aria-live="assertive"
            className="flex flex-col gap-5 rounded-2xl border-2 border-[var(--crisis)] bg-[#1d1315] p-5 md:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-[var(--crisis-soft)]">
                <Siren className="h-6 w-6" aria-hidden />
                Emergency support
              </h2>
              <span className="rounded-full border border-[var(--indigo)]/40 px-3 py-1 text-xs font-medium text-[var(--indigo)]">
                {GENERATION_LABEL[response.generation]}
              </span>
            </div>
            <a
              href={buildTelLink("112")}
              className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-[var(--crisis)] text-xl font-extrabold text-white transition-colors hover:bg-[#a10f35]"
            >
              <PhoneCall className="h-6 w-6" aria-hidden />
              Call 112 now
            </a>
            <p className="text-sm text-[var(--text-soft)]">{response.summary}</p>
            <WidgetCanvas response={response} />
            <button
              type="button"
              onClick={reset}
              className="mt-1 self-start rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)]"
            >
              I&apos;m safe — leave emergency view
            </button>
          </section>
        ) : (
          <>
            {/* Mode selection */}
            <div className="flex gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 p-1.5">
              {(
                [
                  { id: "individual", label: "I need support", Ico: HeartHandshake },
                  { id: "caregiver", label: "I'm supporting someone", Ico: Users },
                ] as const
              ).map(({ id, label, Ico }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    mode === id
                      ? id === "caregiver"
                        ? "bg-[var(--indigo)]/20 text-[var(--indigo)]"
                        : "bg-[var(--teal)]/15 text-[var(--teal)]"
                      : "text-[var(--text-soft)] hover:bg-[var(--surface-hi)]/60 hover:text-[var(--text)]"
                  }`}
                >
                  <Ico className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            {/* Zero-typing command dock */}
            <section aria-label="One-tap support commands" className="flex flex-col gap-3">
              <h2 className="hero-serif text-3xl leading-tight md:text-[42px]">
                What do you need <span className="text-[var(--teal)]">right now</span>?
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {buttons.map((btn) => {
                  const ButtonIcon = BUTTON_ICONS[btn.id] ?? ShieldAlert;
                  const isEmergency = btn.level === 1;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      disabled={working}
                      onClick={() => run({ mode, buttonId: btn.id })}
                      onPointerMove={spot}
                      style={
                        {
                          "--r": "170px",
                          ...(isEmergency ? { "--accent": "var(--crisis)" } : {}),
                        } as CSSProperties
                      }
                      className={`spotlight relative flex min-h-[84px] items-start gap-3.5 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
                        isEmergency
                          ? "border-[var(--crisis)]/50 bg-[var(--crisis)]/10 hover:border-[var(--crisis)]"
                          : "border-[var(--line)] bg-[var(--surface)]/80 hover:border-[var(--teal)]/50"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isEmergency
                            ? "bg-[var(--crisis)]/20 text-[var(--crisis-soft)]"
                            : "bg-[var(--teal)]/12 text-[var(--teal)]"
                        }`}
                      >
                        <ButtonIcon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-bold leading-snug">{btn.label}</span>
                        <span className="mt-1 block text-xs leading-snug text-[var(--text-soft)]">
                          {btn.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Voice + text — same pipeline as the buttons */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitText(draft);
              }}
              className="flex items-center gap-2"
            >
              <VoiceControl
                disabled={working}
                lang={LANGUAGES[language].speech}
                onTranscript={submitText}
              />
              <button
                type="button"
                onClick={() => setLiveVoiceOpen((v) => !v)}
                aria-pressed={liveVoiceOpen}
                aria-label="Open live voice conversation"
                className={`flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                  liveVoiceOpen
                    ? "border-[var(--indigo)] bg-[var(--indigo)]/15 text-[var(--indigo)]"
                    : "border-[var(--line)] text-[var(--text-soft)] hover:border-[var(--line-hi)] hover:text-[var(--text)]"
                }`}
              >
                <AudioLines className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Live voice</span>
              </button>
              <label htmlFor="free-text" className="sr-only">
                Describe what is happening, or use the buttons above
              </label>
              <input
                id="free-text"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="…or speak / type what's happening (optional)"
                maxLength={2000}
                className="min-h-12 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)]/70 px-4 text-sm placeholder:text-[var(--text-soft)]/60 focus:border-[var(--teal)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={working || !draft.trim()}
                aria-label="Send"
                className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-[var(--teal)]/15 text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/25 disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>

            {liveVoiceOpen && (
              <LiveVoice
                mode={mode}
                language={language}
                onToolAction={handleVoiceTool}
                onClose={() => setLiveVoiceOpen(false)}
              />
            )}

            {voiceWidgets.length > 0 && (
              <section aria-label="Prepared by IBUKI Voice" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="kicker">[ Put on screen by IBUKI Voice ]</span>
                  <button
                    type="button"
                    onClick={() => setVoiceWidgets([])}
                    className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)]"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {voiceWidgets.map((spec, i) => (
                    <div key={`voice-${spec.type}-${i}`} className="reveal">
                      <Widget spec={spec} speechLang={LANGUAGES[language].speech} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Result canvas + activity rail */}
            {(working || response || error) && (
              <div className="grid gap-4 md:grid-cols-[1fr_270px]">
                <div className="flex flex-col gap-4">
                  {working && (
                    <div aria-label="Preparing your support plan" className="flex flex-col gap-3">
                      <div className="shimmer h-36" />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="shimmer h-28" />
                        <div className="shimmer h-28" />
                      </div>
                    </div>
                  )}

                  {status === "done" && response && agent && (
                    <>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className="rounded-full border px-3 py-1 text-xs font-bold"
                          style={{
                            color: ACCENT[agent.accent],
                            borderColor: `color-mix(in oklab, ${ACCENT[agent.accent]} 40%, transparent)`,
                          }}
                        >
                          {agent.label}
                        </span>
                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)]">
                          {GENERATION_LABEL[response.generation]}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-soft)]">{response.summary}</p>
                      <WidgetCanvas response={response} />
                    </>
                  )}

                  {status === "error" && (
                    <div className="flex flex-col gap-4">
                      <div className="surface flex flex-col gap-3 border-[var(--amber)]/40 p-5">
                        <p className="font-semibold text-[var(--amber)]">
                          Personalized AI guidance is temporarily unavailable.
                        </p>
                        <p className="text-sm text-[var(--text-soft)]">{error}</p>
                        <button
                          type="button"
                          onClick={() => lastRequest.current && run(lastRequest.current)}
                          className="self-start rounded-xl bg-[var(--teal)]/15 px-4 py-2.5 text-sm font-bold text-[var(--teal)] hover:bg-[var(--teal)]/25"
                        >
                          Try again
                        </button>
                      </div>
                      <Widget
                        spec={{
                          type: "safety-actions",
                          source: "verified",
                          resourceIds: ["erss-112", "deaddiction-14446", "telemanas-14416"],
                          note: "Verified helplines — available even when AI is not.",
                        }}
                      />
                    </div>
                  )}
                </div>

                <ActivityRail events={events} />
              </div>
            )}

            {status === "idle" && (
              <section aria-label="How IBUKI Circle works" className="flex flex-col gap-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {HOW_IT_WORKS.map((step, i) => {
                    const StepIcon = step.icon;
                    return (
                      <div
                        key={step.kicker}
                        className="surface reveal p-5"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        <p className="kicker mb-3">
                          0{i + 1} · {step.kicker}
                        </p>
                        <p className="mb-2 flex items-center gap-2 text-[15px] font-bold">
                          <StepIcon className="h-4 w-4 text-[var(--teal)]" aria-hidden />
                          {step.title}
                        </p>
                        <p className="text-sm leading-relaxed text-[var(--text-soft)]">{step.body}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="kicker">[ Verified sources ]</span>
                  {VERIFIED_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="mt-auto flex flex-col gap-1.5 border-t border-[var(--line)] pt-5 text-xs text-[var(--text-soft)]">
          <p>
            IBUKI Circle complements professional and human care — it is not a diagnosis,
            treatment, or emergency service. In immediate danger, call{" "}
            <a href={buildTelLink("112")} className="font-bold text-[var(--crisis-soft)] underline">
              112
            </a>
            .
          </p>
          <p className="opacity-75">
            Privacy: what you tap, say, or type is used only to generate this response — never
            stored on our servers, never shared without your action.
          </p>
        </footer>
      </div>
    </main>
  );
}
