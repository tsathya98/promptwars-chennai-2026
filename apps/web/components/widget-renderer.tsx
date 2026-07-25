"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import {
  BadgeCheck,
  Bot,
  Check,
  Copy,
  ExternalLink,
  ListMinus,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Share2,
  TriangleAlert,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  buildTelLink,
  copyText,
  openSms,
  openWhatsApp,
  requestLocationLink,
  shareText,
  speak,
  stopSpeaking,
  type ConnectorResult,
} from "@/lib/connectors";
import { LANGUAGES } from "@/lib/languages";
import { getResource } from "@/lib/resources";
import type { AgentResponse, WidgetSpec } from "@/lib/schemas";
import { SpotlightCard } from "./spotlight-card";
import { BreathingGuide } from "./breathing-guide";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Every widget declares who authored it — shown to the user, never faked. */
function SourceBadge({ source }: { source: "ai" | "verified" }) {
  const verified = source === "verified";
  const Badge: Icon = verified ? BadgeCheck : Bot;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        verified
          ? "border-[var(--indigo)]/40 text-[var(--indigo)]"
          : "border-[var(--teal)]/40 text-[var(--teal)]"
      }`}
    >
      <Badge className="h-3 w-3" aria-hidden />
      {verified ? "Verified guidance — not AI" : "AI-generated · gpt-5.6-terra"}
    </span>
  );
}

function WidgetShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <SpotlightCard
      radius={180}
      className={`h-full p-5 ${className}`}
      style={{
        background: "color-mix(in oklab, var(--surface) 94%, transparent)",
        borderColor: "var(--line)",
      }}
    >
      {children}
    </SpotlightCard>
  );
}

function InterventionScript({
  spec,
  speechLang,
}: {
  spec: Extract<WidgetSpec, { type: "intervention-script" }>;
  speechLang: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [fewerWords, setFewerWords] = useState(false);
  const fullText = `${spec.acknowledgement} ${spec.steps.join(". ")}`;

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      const result = speak(fullText, { lang: speechLang, onEnd: () => setSpeaking(false) });
      setSpeaking(result.status !== "failed");
    }
  };

  return (
    <WidgetShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SourceBadge source={spec.source} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFewerWords((v) => !v)}
            aria-pressed={fewerWords}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)]"
          >
            <ListMinus className="h-3.5 w-3.5" aria-hidden />
            Fewer words
          </button>
          <button
            type="button"
            onClick={toggleSpeak}
            aria-pressed={speaking}
            className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
              speaking
                ? "bg-[var(--teal)]/20 text-[var(--teal)]"
                : "bg-[var(--teal)]/10 text-[var(--teal)] hover:bg-[var(--teal)]/20"
            }`}
          >
            {speaking ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
            {speaking ? "Stop" : "Read aloud"}
          </button>
        </div>
      </div>
      {!fewerWords && (
        <p className="hero-serif mb-4 text-xl font-semibold leading-snug md:text-2xl">
          {spec.acknowledgement}
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {spec.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--teal)]/15 font-mono text-sm font-bold text-[var(--teal)]"
            >
              {i + 1}
            </span>
            <p className={`leading-relaxed ${fewerWords ? "text-lg font-semibold" : "text-base"}`}>{step}</p>
          </li>
        ))}
      </ol>
    </WidgetShell>
  );
}

function SafetyActions({
  spec,
  emergency,
}: {
  spec: Extract<WidgetSpec, { type: "safety-actions" }>;
  emergency: boolean;
}) {
  const resources = spec.resourceIds
    .map((id) => getResource(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  return (
    <WidgetShell>
      <div className="mb-3 flex items-center justify-between gap-2">
        <SourceBadge source={spec.source} />
      </div>
      {spec.note && <p className="mb-4 text-sm text-[var(--text-soft)]">{spec.note}</p>}
      <div className="flex flex-col gap-3">
        {resources.map((r) =>
          r.phone ? (
            <a
              key={r.id}
              href={buildTelLink(r.phone)}
              className={`flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 font-bold transition-colors ${
                emergency || r.id === "erss-112"
                  ? "bg-[var(--crisis)] text-white hover:bg-[#c73a44]"
                  : "bg-[var(--teal)]/12 text-[var(--teal)] hover:bg-[var(--teal)]/20"
              }`}
            >
              <PhoneCall className="h-5 w-5 shrink-0" aria-hidden />
              <span className="flex flex-col text-left">
                <span className="text-base leading-tight">Call {r.phone}</span>
                <span className="text-xs font-medium opacity-85">{r.title}</span>
              </span>
            </a>
          ) : (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)]"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              {r.title}
            </a>
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--text-soft)] opacity-80">
        Calls open your dialler — nothing is placed automatically.
      </p>
    </WidgetShell>
  );
}

function CircleMessage({ spec }: { spec: Extract<WidgetSpec, { type: "circle-message" }> }) {
  const [message, setMessage] = useState(spec.message);
  const [status, setStatus] = useState<ConnectorResult | null>(null);
  const [locating, setLocating] = useState(false);

  const attachLocation = async () => {
    setLocating(true);
    const result = await requestLocationLink();
    if (result.link) setMessage((m) => `${m}\nMy location: ${result.link}`);
    setStatus(result);
    setLocating(false);
  };

  const actions: Array<{ label: string; icon: Icon; run: () => ConnectorResult | Promise<ConnectorResult> }> = [
    { label: "WhatsApp", icon: MessageSquareText, run: () => openWhatsApp(message) },
    { label: "SMS", icon: MessageSquareText, run: () => openSms(message) },
    { label: "Share", icon: Share2, run: () => shareText(message) },
    { label: "Copy", icon: Copy, run: () => copyText(message) },
  ];

  return (
    <WidgetShell>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SourceBadge source={spec.source} />
        {spec.recipientLabel && (
          <span className="rounded-full bg-[var(--indigo)]/15 px-2.5 py-1 text-xs font-medium text-[var(--indigo)]">
            For: {spec.recipientLabel}
          </span>
        )}
      </div>
      <label className="kicker mb-2 block" htmlFor="circle-message">
        Message to your circle — edit before sending
      </label>
      <textarea
        id="circle-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        maxLength={500}
        className="mb-3 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--bg)]/60 p-3 text-sm leading-relaxed focus:border-[var(--indigo)] focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        {actions.map(({ label, icon: ActionIcon, run }) => (
          <button
            key={label}
            type="button"
            onClick={async () => setStatus(await run())}
            className="flex min-h-12 items-center gap-1.5 rounded-xl bg-[var(--indigo)]/12 px-4 text-sm font-semibold text-[var(--indigo)] transition-colors hover:bg-[var(--indigo)]/22"
          >
            <ActionIcon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
        {spec.offerLocation && (
          <button
            type="button"
            onClick={attachLocation}
            disabled={locating}
            className="flex min-h-12 items-center gap-1.5 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            {locating ? "Locating…" : "Attach location"}
          </button>
        )}
      </div>
      <p role="status" className="mt-3 min-h-5 text-xs text-[var(--text-soft)]">
        {status ? status.message : "Nothing is sent until you press send in your own app."}
      </p>
    </WidgetShell>
  );
}

function CaregiverGuidance({ spec }: { spec: Extract<WidgetSpec, { type: "caregiver-guidance" }> }) {
  const sections: Array<{ title: string; items: string[]; icon: Icon; tone: string }> = [
    { title: "Say this", items: spec.sayThis, icon: Check, tone: "text-[var(--teal)]" },
    { title: "Avoid this", items: spec.avoidThis, icon: X, tone: "text-[var(--amber)]" },
    { title: "Warning signs", items: spec.warningSigns, icon: TriangleAlert, tone: "text-[var(--crisis-soft)]" },
  ];
  return (
    <WidgetShell>
      <div className="mb-4">
        <SourceBadge source={spec.source} />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {sections.map(({ title, items, icon: SectionIcon, tone }) => (
          <div key={title}>
            <h3 className={`mb-2.5 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide ${tone}`}>
              <SectionIcon className="h-4 w-4" aria-hidden />
              {title}
            </h3>
            <ul className="flex flex-col gap-2">
              {items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-[var(--text-soft)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--crisis)]/30 bg-[var(--crisis)]/10 p-3">
        <p className="text-sm font-semibold text-[var(--crisis-soft)]">
          If any warning sign is present:
        </p>
        <a
          href={buildTelLink("112")}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-[var(--crisis)] px-4 text-sm font-bold text-white hover:bg-[#c73a44]"
        >
          <PhoneCall className="h-4 w-4" aria-hidden />
          Call 112 now
        </a>
      </div>
    </WidgetShell>
  );
}

function VerifiedResourceCard({ spec }: { spec: Extract<WidgetSpec, { type: "verified-resource" }> }) {
  const resource = getResource(spec.resourceId);
  if (!resource) {
    return (
      <pre className="overflow-x-auto rounded-xl border border-[var(--crisis)] p-3 text-xs text-[var(--crisis-soft)]">
        ▲ unknown resource: {spec.resourceId}
      </pre>
    );
  }
  return (
    <WidgetShell>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SourceBadge source="verified" />
        <span className="text-xs text-[var(--text-soft)] opacity-70">
          Reviewed {resource.reviewedOn}
        </span>
      </div>
      <h3 className="mb-1 text-lg font-bold leading-snug">{resource.title}</h3>
      <p className="mb-2 text-xs text-[var(--text-soft)] opacity-80">{resource.organization}</p>
      <p className="mb-3 text-sm leading-relaxed text-[var(--text-soft)]">{resource.summary}</p>
      {resource.steps && (
        <ol className="mb-3 flex list-decimal flex-col gap-1.5 pl-5">
          {resource.steps.map((step, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      )}
      {spec.note && <p className="mb-3 text-sm text-[var(--text-soft)]">{spec.note}</p>}
      <div className="flex flex-wrap gap-2">
        {resource.phone && (
          <a
            href={buildTelLink(resource.phone)}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--teal)]/12 px-4 text-sm font-bold text-[var(--teal)] hover:bg-[var(--teal)]/20"
          >
            <PhoneCall className="h-4 w-4" aria-hidden />
            Call {resource.phone}
          </a>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text-soft)] hover:border-[var(--line-hi)] hover:text-[var(--text)]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Source
        </a>
      </div>
    </WidgetShell>
  );
}

/** Closed-vocabulary renderer: unknown nodes surface visibly, never silently. */
export function Widget({
  spec,
  emergency = false,
  speechLang = "en-IN",
}: {
  spec: WidgetSpec;
  emergency?: boolean;
  speechLang?: string;
}) {
  switch (spec.type) {
    case "intervention-script":
      return <InterventionScript spec={spec} speechLang={speechLang} />;
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

const FULL_WIDTH_TYPES = new Set<WidgetSpec["type"]>(["intervention-script", "caregiver-guidance"]);

export function WidgetCanvas({ response }: { response: AgentResponse }) {
  const emergency = response.riskLevel === "emergency";
  const speechLang = LANGUAGES[response.language]?.speech ?? "en-IN";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {response.widgets.map((spec, i) => (
        <div
          key={`${spec.type}-${i}`}
          className={`reveal ${FULL_WIDTH_TYPES.has(spec.type) ? "md:col-span-2" : ""}`}
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <Widget spec={spec} emergency={emergency} speechLang={speechLang} />
        </div>
      ))}
    </div>
  );
}
