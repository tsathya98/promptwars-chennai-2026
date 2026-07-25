/**
 * Supported response languages. English is the default and primary language;
 * others are generated live by the model per request (never canned
 * translations). Verified protocol content intentionally stays English —
 * machine-translating emergency medical steps without professional validation
 * would be dishonest.
 */
export const LANGUAGE_CODES = ["en", "ta", "hi", "bn", "te", "mr", "kn", "ml"] as const;
/** Two-letter code of a supported response language. */
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

/** Per-language display label (native script), English name (for prompts), and speech locale. */
export const LANGUAGES: Record<
  LanguageCode,
  { label: string; name: string; speech: string }
> = {
  en: { label: "English", name: "English", speech: "en-IN" },
  ta: { label: "தமிழ்", name: "Tamil", speech: "ta-IN" },
  hi: { label: "हिन्दी", name: "Hindi", speech: "hi-IN" },
  bn: { label: "বাংলা", name: "Bengali", speech: "bn-IN" },
  te: { label: "తెలుగు", name: "Telugu", speech: "te-IN" },
  mr: { label: "मराठी", name: "Marathi", speech: "mr-IN" },
  kn: { label: "ಕನ್ನಡ", name: "Kannada", speech: "kn-IN" },
  ml: { label: "മലയാളം", name: "Malayalam", speech: "ml-IN" },
};
