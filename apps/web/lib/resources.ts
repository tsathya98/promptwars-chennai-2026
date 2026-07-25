/**
 * Verified resource registry — the only source of helpline numbers, emergency
 * protocols, and educational claims in the app. Reviewed by a human before the
 * submission; the model may reference these by id but can never invent one.
 */
export type VerifiedResource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  phone?: string;
  audience: "individual" | "caregiver" | "both";
  summary: string;
  /** Reviewed, deterministic guidance steps — rendered as-is, never model-generated. */
  steps?: readonly string[];
  reviewedOn: string;
};

export const REGISTRY_VERSION = "2026-07-25.1";

export const VERIFIED_RESOURCES: readonly VerifiedResource[] = [
  {
    id: "erss-112",
    title: "Emergency services (India) — 112",
    organization: "Emergency Response Support System, Government of India",
    url: "https://112.gov.in/",
    phone: "112",
    audience: "both",
    summary:
      "India's unified emergency number for medical, police, and fire emergencies, available nationwide, 24x7.",
    reviewedOn: "2026-07-25",
  },
  {
    id: "deaddiction-14446",
    title: "National Drug De-addiction Helpline — 14446",
    organization: "Ministry of Social Justice and Empowerment (NMBA), Government of India",
    url: "https://nmba.dosje.gov.in/",
    phone: "14446",
    audience: "both",
    summary:
      "Free national helpline offering counselling and referral to de-addiction and treatment services.",
    reviewedOn: "2026-07-25",
  },
  {
    id: "telemanas-14416",
    title: "Tele-MANAS mental health support — 14416",
    organization: "Ministry of Health and Family Welfare, Government of India",
    url: "https://telemanas.mohfw.gov.in/",
    phone: "14416",
    audience: "both",
    summary: "Free 24x7 tele-mental-health counselling in multiple Indian languages.",
    reviewedOn: "2026-07-25",
  },
  {
    id: "overdose-response",
    title: "Responding to a suspected overdose",
    organization: "U.S. CDC — Stop Overdose (emergency call localized to India's 112)",
    url: "https://www.cdc.gov/stop-overdose/response/index.html",
    audience: "both",
    summary: "Verified first-response steps while waiting for emergency help.",
    steps: [
      "Call 112 now and say someone may have overdosed.",
      "Give naloxone if it is available.",
      "Try to keep the person awake and breathing.",
      "Lay them on their side so they cannot choke.",
      "Stay with them until help arrives.",
    ],
    reviewedOn: "2026-07-25",
  },
  {
    id: "urge-grounding",
    title: "Riding out an urge",
    organization: "SMART Recovery",
    url: "https://smartrecovery.org/",
    audience: "individual",
    summary:
      "Urges rise, peak, and pass on their own. Delaying and distracting for even a few minutes weakens them.",
    steps: [
      "Pause. Name what you are feeling, out loud if you can.",
      "Change your surroundings: another room, or outside if it is safe.",
      "Breathe slowly, or hold something cold, for two full minutes.",
    ],
    reviewedOn: "2026-07-25",
  },
  {
    id: "caregiver-conversation",
    title: "Starting the conversation",
    organization: "SAMHSA",
    url: "https://www.samhsa.gov/",
    audience: "caregiver",
    summary:
      "Choose a calm moment, describe what you observe without blame, listen without judgement, and offer help.",
    steps: [
      "Pick a calm, private moment — not mid-crisis.",
      "Describe what you have seen, without blame or labels.",
      "Listen more than you speak; offer to help find support together.",
    ],
    reviewedOn: "2026-07-25",
  },
  {
    id: "caregiver-selfcare",
    title: "Caring for yourself as a caregiver",
    organization: "SAMHSA",
    url: "https://www.samhsa.gov/find-support/helping-someone/caring-for-yourself",
    audience: "caregiver",
    summary:
      "Supporting someone through substance use is heavy. Your own rest, boundaries, and support network are part of their safety net too.",
    reviewedOn: "2026-07-25",
  },
] as const;

export function getResource(id: string): VerifiedResource | undefined {
  return VERIFIED_RESOURCES.find((r) => r.id === id);
}

export function isResourceId(id: string): boolean {
  return VERIFIED_RESOURCES.some((r) => r.id === id);
}

/** Compact catalog injected into agent prompts so the model can pick valid ids. */
export function resourceCatalogForPrompt(audience: "individual" | "caregiver"): string {
  return VERIFIED_RESOURCES.filter((r) => r.audience === audience || r.audience === "both")
    .map((r) => `- ${r.id}: ${r.title} (${r.organization}) — ${r.summary}`)
    .join("\n");
}
