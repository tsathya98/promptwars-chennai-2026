"use client";

/**
 * IBUKI Circle home shell. Owns the session state (mode, language, situation
 * context, live-voice widgets) and composes the focused UI modules:
 *
 *   AppHeader → CommandDock → ContextChips → input row (speech + text) →
 *   LiveVoice panel → voice-widget canvas → ResultPanel | CrisisView →
 *   HowItWorks (idle) → footer.
 *
 * Every modality (tap, voice transcript, typed text, live-voice screen tool)
 * funnels through a single `run()` into POST /api/intervene, so the safety
 * router sees identical requests regardless of input method.
 */
import { useEffect, useRef, useState } from "react";
import { AudioLines, Send } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CommandDock } from "@/components/command-dock";
import { ContextChips, type SituationSetting } from "@/components/context-chips";
import { CrisisView } from "@/components/crisis-view";
import { CursorField } from "@/components/cursor-field";
import { HowItWorks } from "@/components/how-it-works";
import { LiveVoice } from "@/components/live-voice";
import { ResultPanel } from "@/components/result-panel";
import { VoiceControl } from "@/components/voice-control";
import { Widget } from "@/components/widget-renderer";
import { buildTelLink } from "@/lib/connectors";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";
import type { ActorMode } from "@/lib/safety-router";
import type { InterveneRequestInput, WidgetSpec } from "@/lib/schemas";
import { useIntervene } from "@/lib/use-intervene";
import type { VoiceToolAction } from "@/lib/voice-tools";

export default function HomeClient() {
  const [mode, setMode] = useState<ActorMode>("individual");
  const [draft, setDraft] = useState("");
  const [liveVoiceOpen, setLiveVoiceOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [voiceWidgets, setVoiceWidgets] = useState<WidgetSpec[]>([]);
  const [alone, setAlone] = useState<boolean | undefined>(undefined);
  const [setting, setSetting] = useState<SituationSetting | undefined>(undefined);
  const { events, response, status, error, intervene, reset } = useIntervene();
  const lastRequest = useRef<InterveneRequestInput | null>(null);

  // Language preference is the only thing persisted — and only on-device.
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

  /** Single entry point for every modality; injects language + situation context. */
  const run = (request: InterveneRequestInput) => {
    const withContext = {
      ...request,
      language,
      context: {
        ...(alone !== undefined && { alone }),
        ...(setting && { setting }),
        ...request.context,
      },
    };
    lastRequest.current = withContext;
    void intervene(withContext);
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
    <main id="main" className="relative min-h-screen overflow-x-hidden">
      {!crisis && <CursorField />}
      {!crisis && (
        <>
          <div aria-hidden className="orb fixed -top-36 right-[-110px]" />
          <div aria-hidden className="orb orb-violet fixed bottom-[-170px] left-[-140px]" />
        </>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 md:py-10">
        <AppHeader
          crisis={Boolean(crisis)}
          language={language}
          onLanguageChange={changeLanguage}
          onEmergency={emergencyNow}
        />

        {crisis && response ? (
          <CrisisView response={response} onExit={reset} />
        ) : (
          <>
            <CommandDock
              mode={mode}
              working={working}
              onModeChange={setMode}
              onCommand={(buttonId) => run({ mode, buttonId })}
            />

            <ContextChips
              alone={alone}
              setting={setting}
              onAloneChange={setAlone}
              onSettingChange={setSetting}
            />

            {/* Voice + text — same safety pipeline as the buttons */}
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
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)]/70 px-4 text-sm placeholder:text-[var(--text-soft)]/60 focus:border-[var(--teal)] focus:outline-none"
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
                key={`${mode}-${language}`}
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
                      <Widget spec={spec} speechLang={LANGUAGES[language].speech} language={language} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ResultPanel
              status={status}
              response={response}
              error={error}
              events={events}
              onRetry={() => lastRequest.current && run(lastRequest.current)}
            />

            {status === "idle" && <HowItWorks />}
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
