"use client";

/**
 * Zero-typing command dock: the individual/caregiver mode toggle and the six
 * large one-tap commands for the active mode. Buttons carry the cursor
 * spotlight (CSS-variable driven, disabled for reduced-motion/coarse
 * pointers) and Level-1 emergency commands get the crisis accent.
 */
import { useMemo, type ComponentType, type CSSProperties, type PointerEvent, type SVGProps } from "react";
import {
  Flame,
  HeartHandshake,
  HeartPulse,
  LifeBuoy,
  MessageSquareText,
  MessagesSquare,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
  Siren,
  Users,
  Waves,
} from "lucide-react";
import type { LanguageCode } from "@/lib/languages";
import { COMMAND_BUTTONS, type ActorMode } from "@/lib/safety-router";
import { t, type UIKey } from "@/lib/ui-strings";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Icon per command id — labels and routing live in the safety router. */
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

/** Feeds the cursor position into the card's spotlight CSS variables. */
function trackSpotlight(e: PointerEvent<HTMLButtonElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

type Props = {
  mode: ActorMode;
  working: boolean;
  /** UI language — labels come from the reviewed localization dictionary. */
  language: LanguageCode;
  onModeChange: (mode: ActorMode) => void;
  onCommand: (buttonId: string) => void;
};

/** Renders the mode toggle, hero prompt, and one-tap command grid. */
export function CommandDock({ mode, working, language, onModeChange, onCommand }: Props) {
  const buttons = useMemo(() => COMMAND_BUTTONS.filter((b) => b.mode === mode), [mode]);

  return (
    <>
      <div className="flex gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 p-1.5">
        {(
          [
            { id: "individual", label: t(language, "modeIndividual"), Ico: HeartHandshake },
            { id: "caregiver", label: t(language, "modeCaregiver"), Ico: Users },
          ] as const
        ).map(({ id, label, Ico }) => (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange(id)}
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

      <section aria-label="One-tap support commands" className="flex flex-col gap-3">
        <h2 className="hero-serif text-3xl leading-tight md:text-[42px]" lang={language}>
          {t(language, "heroLead")}
          <span className="text-[var(--teal)]">{t(language, "heroEmphasis")}</span>
          {t(language, "heroTail")}
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
                onClick={() => onCommand(btn.id)}
                onPointerMove={trackSpotlight}
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
                <span lang={language}>
                  <span className="block text-[15px] font-bold leading-snug">
                    {t(language, `cmd_${btn.id}_label` as UIKey)}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-[var(--text-soft)]">
                    {t(language, `cmd_${btn.id}_desc` as UIKey)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
