/**
 * User-facing description of how a response was produced. Rendered verbatim
 * next to every plan and never faked: verified protocol content must always
 * be distinguishable from live model output (a core disqualification rule).
 */
export const GENERATION_LABEL = {
  ai: "AI-personalized for you",
  "verified-protocol": "Verified guidance — not AI-generated",
  mixed: "AI-personalized · includes verified actions",
} as const;
