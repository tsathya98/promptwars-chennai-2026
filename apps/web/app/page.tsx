"use client";

import { useMemo, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
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
  Siren,
  Users,
  Waves,
} from "lucide-react";
import { ActivityRail } from "@/components/activity-rail";
import { CursorField } from "@/components/cursor-field";
import { VoiceControl } from "@/components/voice-control";
import { Widget, WidgetCanvas } from "@/components/widget-renderer";
import { AGENTS } from "@/lib/agents/registry";
import { buildTelLink } from "@/lib/connectors";
import { COMMAND_BUTTONS, type ActorMode } from "@/lib/safety-router";
import type { InterveneRequest } from "@/lib/schemas";
import { useIntervene } from "@/lib/use-intervene";

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
  ai: "AI-generated · gpt-5.6-terra",
  "verified-protocol": "Verified guidance — not AI-generated",
  mixed: "AI-personalized · includes verified actions",
} as const;

export default function Home() {
  const [mode, setMode] = useState<ActorMode>("individual");
  const [draft, setDraft] = useState("");
  const { events, response, status, error, intervene, reset } = useIntervene();
  const lastRequest = useRef<InterveneRequest | null>(null);

  const crisis = response?.riskLevel === "emergency";
  const working = status === "working";
  const buttons = useMemo(() => COMMAND_BUTTONS.filter((b) => b.mode === mode), [mode]);
  const agent = response ? AGENTS[response.agentId] : null;

  const run = (request: InterveneRequest) => {
    lastRequest.current = request;
    void intervene(request);
  };

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || working) return;
    run({ mode, text: trimmed });
    setDraft("");
  };

  const emergencyNow = () =>
    run({ mode, buttonId: mode === "caregiver" ? "possible-overdose" : "overdose-danger" });

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {!crisis && <CursorField />}

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
          </div>
          {!crisis && (
            <button
              type="button"
              onClick={emergencyNow}
              className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-[var(--crisis)] bg-[var(--crisis)]/15 px-5 font-bold text-[var(--crisis-soft)] transition-colors hover:bg-[var(--crisis)]/30"
            >
              <Siren className="h-5 w-5" aria-hidden />
              Emergency help
            </button>
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
              <h2 className="text-lg font-bold md:text-xl">What do you need right now?</h2>
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
                      className={`flex min-h-[76px] items-start gap-3 rounded-2xl border p-4 text-left transition-colors disabled:opacity-50 ${
                        isEmergency
                          ? "border-[var(--crisis)]/50 bg-[var(--crisis)]/10 hover:border-[var(--crisis)] hover:bg-[var(--crisis)]/20"
                          : "border-[var(--line)] bg-[var(--surface)]/70 hover:border-[var(--teal)]/60 hover:bg-[var(--surface-hi)]/70"
                      }`}
                    >
                      <ButtonIcon
                        aria-hidden
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          isEmergency ? "text-[var(--crisis-soft)]" : "text-[var(--teal)]"
                        }`}
                      />
                      <span>
                        <span className="block text-sm font-bold leading-snug">{btn.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-[var(--text-soft)]">
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
              <VoiceControl disabled={working} onTranscript={submitText} />
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
              <div className="surface flex flex-col items-center gap-2 p-8 text-center">
                <p className="text-base font-semibold">
                  Tap a button, speak, or type — whatever is easiest right now.
                </p>
                <p className="max-w-md text-sm text-[var(--text-soft)]">
                  A specialist prepares a personalized plan with real-time AI. Emergencies always
                  get verified guidance instantly, with no AI in the way.
                </p>
              </div>
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
