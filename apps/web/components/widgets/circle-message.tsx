"use client";

/**
 * Circle message widget: an AI-prepared, fully editable support message the
 * USER sends through their own apps (WhatsApp/SMS/share/copy). Location is
 * attached only after an explicit consent tap and only into the message text.
 * The status line reports observable states ("opened"/"copied") — never
 * "sent", which the app cannot know.
 */
import { useState, type ComponentType, type SVGProps } from "react";
import { Copy, MapPin, MessageSquareText, Share2 } from "lucide-react";
import {
  copyText,
  openSms,
  openWhatsApp,
  requestLocationLink,
  shareText,
  type ConnectorResult,
} from "@/lib/connectors";
import type { WidgetSpec } from "@/lib/schemas";
import { SourceBadge } from "./source-badge";
import { WidgetShell } from "./widget-shell";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type Props = { spec: Extract<WidgetSpec, { type: "circle-message" }> };

/** Renders the editable message with user-confirmed send actions. */
export function CircleMessage({ spec }: Props) {
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
