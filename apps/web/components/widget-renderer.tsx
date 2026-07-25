"use client";

/**
 * Closed-vocabulary widget renderer — the Widget Library's single entry
 * point. The model authors intent; the orchestrator compiles it into typed
 * WidgetSpec values; this switch maps each spec onto exactly one deterministic
 * React component. Unknown nodes surface as a visible error block, never
 * silently — new visuals mean a new compiler output, the renderer never grows
 * behind the model's back.
 */
import { LANGUAGES } from "@/lib/languages";
import type { AgentResponse, WidgetSpec } from "@/lib/schemas";
import { BreathingGuide } from "./breathing-guide";
import { CaregiverGuidance } from "./widgets/caregiver-guidance";
import { CircleMessage } from "./widgets/circle-message";
import { InterventionScript } from "./widgets/intervention-script";
import { SafetyActions } from "./widgets/safety-actions";
import { SourceBadge } from "./widgets/source-badge";
import { VerifiedResourceCard } from "./widgets/verified-resource";
import { WidgetShell } from "./widgets/widget-shell";

type WidgetProps = {
  spec: WidgetSpec;
  /** Escalates call-action styling in Level-1 emergency responses. */
  emergency?: boolean;
  /** BCP-47 speech locale for read-aloud (browser fallback). */
  speechLang?: string;
  /** Response language code steering the server TTS voice. */
  language?: string;
};

/** Maps one validated WidgetSpec onto its deterministic component. */
export function Widget({ spec, emergency = false, speechLang = "en-IN", language }: WidgetProps) {
  switch (spec.type) {
    case "intervention-script":
      return <InterventionScript spec={spec} speechLang={speechLang} language={language} />;
    case "breathing-guide":
      return (
        <WidgetShell>
          <div className="mb-2">
            <SourceBadge source={spec.source} />
          </div>
          <BreathingGuide
            inhaleSeconds={spec.inhaleSeconds}
            holdSeconds={spec.holdSeconds}
            exhaleSeconds={spec.exhaleSeconds}
            cycles={spec.cycles}
          />
        </WidgetShell>
      );
    case "safety-actions":
      return <SafetyActions spec={spec} emergency={emergency} />;
    case "circle-message":
      return <CircleMessage spec={spec} />;
    case "caregiver-guidance":
      return <CaregiverGuidance spec={spec} />;
    case "verified-resource":
      return <VerifiedResourceCard spec={spec} />;
    default:
      return (
        <pre className="overflow-x-auto rounded-xl border border-[var(--crisis)] p-3 text-xs text-[var(--crisis-soft)]">
          ▲ unknown widget node: {JSON.stringify(spec)}
        </pre>
      );
  }
}

/** Widgets that read better spanning the full canvas width on desktop. */
const FULL_WIDTH_TYPES = new Set<WidgetSpec["type"]>(["intervention-script", "caregiver-guidance"]);

/**
 * Lays out a validated AgentResponse as a staggered widget grid. The grid is
 * marked with the response language so screen readers pronounce generated
 * content correctly.
 */
export function WidgetCanvas({ response }: { response: AgentResponse }) {
  const emergency = response.riskLevel === "emergency";
  const speechLang = LANGUAGES[response.language]?.speech ?? "en-IN";
  return (
    <div className="grid gap-4 md:grid-cols-2" lang={response.language}>
      {response.widgets.map((spec, i) => (
        <div
          key={`${spec.type}-${i}`}
          className={`reveal ${FULL_WIDTH_TYPES.has(spec.type) ? "md:col-span-2" : ""}`}
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <Widget spec={spec} emergency={emergency} speechLang={speechLang} language={response.language} />
        </div>
      ))}
    </div>
  );
}
