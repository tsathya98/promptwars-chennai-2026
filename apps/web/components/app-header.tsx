"use client";

/**
 * Fixed safety shell header: brand, live status, response-language selector,
 * and the persistent emergency button. The emergency action is always one
 * tap away in every non-crisis state — a zero-typing requirement.
 */
import { Siren } from "lucide-react";
import { LANGUAGE_CODES, LANGUAGES, type LanguageCode } from "@/lib/languages";

type Props = {
  /** Crisis mode hides the controls; the crisis view carries its own actions. */
  crisis: boolean;
  language: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  onEmergency: () => void;
};

/** Renders the brand block and, outside crisis mode, language + emergency controls. */
export function AppHeader({ crisis, language, onLanguageChange, onEmergency }: Props) {
  return (
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
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
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
            onClick={onEmergency}
            className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-[var(--crisis)] bg-[var(--crisis)]/15 px-5 font-bold text-[var(--crisis-soft)] transition-colors hover:bg-[var(--crisis)]/30"
          >
            <Siren className="h-5 w-5" aria-hidden />
            Emergency help
          </button>
        </div>
      )}
    </header>
  );
}
