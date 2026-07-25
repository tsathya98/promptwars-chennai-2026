"use client";

/**
 * Optional situation context ("alone / with someone" + setting). Selected
 * values flow into every generation request so plans are situation-aware
 * (e.g. no "step outside" advice while driving). All chips are one-tap
 * toggles — context never requires typing.
 */
import type { LanguageCode } from "@/lib/languages";
import { t, type UIKey } from "@/lib/ui-strings";

export type SituationSetting = "home" | "outside" | "work" | "social" | "driving";

const SETTINGS: readonly SituationSetting[] = ["home", "outside", "work", "social", "driving"];

type Props = {
  alone: boolean | undefined;
  setting: SituationSetting | undefined;
  language: LanguageCode;
  onAloneChange: (value: boolean | undefined) => void;
  onSettingChange: (value: SituationSetting | undefined) => void;
};

/** Renders the one-tap context chips; tapping an active chip clears it. */
export function ContextChips({ alone, setting, language, onAloneChange, onSettingChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Optional situation context" lang={language}>
      <span className="kicker">[ {t(language, "ctxKicker")} ]</span>
      {[
        { label: t(language, "ctxAlone"), active: alone === true, next: alone === true ? undefined : true },
        { label: t(language, "ctxWithSomeone"), active: alone === false, next: alone === false ? undefined : false },
      ].map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onAloneChange(chip.next)}
          aria-pressed={chip.active}
          className={`min-h-12 rounded-full border px-4 text-xs font-semibold transition-colors ${
            chip.active
              ? "border-[var(--indigo)]/60 bg-[var(--indigo)]/15 text-[var(--indigo)]"
              : "border-[var(--line)] text-[var(--text-soft)] hover:border-[var(--line-hi)]"
          }`}
        >
          {chip.label}
        </button>
      ))}
      <span aria-hidden className="h-4 w-px bg-[var(--line)]" />
      {SETTINGS.map((place) => (
        <button
          key={place}
          type="button"
          onClick={() => onSettingChange(setting === place ? undefined : place)}
          aria-pressed={setting === place}
          className={`min-h-12 rounded-full border px-4 text-xs font-semibold capitalize transition-colors ${
            setting === place
              ? "border-[var(--teal)]/60 bg-[var(--teal)]/12 text-[var(--teal)]"
              : "border-[var(--line)] text-[var(--text-soft)] hover:border-[var(--line-hi)]"
          }`}
        >
          {t(language, `setting_${place}` as UIKey)}
        </button>
      ))}
    </div>
  );
}
