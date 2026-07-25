import type { AgentId, RiskLevel } from "./schemas";

/**
 * Deterministic safety router. Level 1 (immediate danger) NEVER depends on a
 * model call: explicit emergency buttons and emergency phrases route straight
 * to the verified protocol. The model can personalize wording afterwards but
 * can never lower a safety level.
 */
/** 1 = immediate danger (no model), 2 = urgent support, 3 = ongoing support. */
export type SafetyLevel = 1 | 2 | 3;

/** Who is asking: the person themselves, or someone supporting them. */
export type ActorMode = "individual" | "caregiver";

/** One zero-typing command: its label, safety level, and owning specialist. */
export type CommandButton = {
  id: string;
  mode: ActorMode;
  label: string;
  description: string;
  level: SafetyLevel;
  riskLevel: RiskLevel;
  agentId: AgentId;
};

/** The twelve one-tap commands (six per mode) — the primary zero-typing surface. */
export const COMMAND_BUTTONS: readonly CommandButton[] = [
  // Individual mode
  {
    id: "urge",
    mode: "individual",
    label: "I'm having a strong urge",
    description: "Get an immediate plan to ride it out",
    level: 2,
    riskLevel: "urgent",
    agentId: "recovery-coach",
  },
  {
    id: "panic",
    mode: "individual",
    label: "I'm panicking or overwhelmed",
    description: "Ground yourself with calm, small steps",
    level: 2,
    riskLevel: "urgent",
    agentId: "recovery-coach",
  },
  {
    id: "close-to-using",
    mode: "individual",
    label: "I'm close to using",
    description: "One safe next action, right now",
    level: 2,
    riskLevel: "urgent",
    agentId: "recovery-coach",
  },
  {
    id: "returned-to-use",
    mode: "individual",
    label: "I returned to use",
    description: "No judgement — steady next steps",
    level: 2,
    riskLevel: "elevated",
    agentId: "recovery-coach",
  },
  {
    id: "need-someone",
    mode: "individual",
    label: "I need someone now",
    description: "Prepare a message to your circle",
    level: 2,
    riskLevel: "urgent",
    agentId: "recovery-coach",
  },
  {
    id: "overdose-danger",
    mode: "individual",
    label: "Possible overdose / danger",
    description: "Verified emergency help, immediately",
    level: 1,
    riskLevel: "emergency",
    agentId: "safety-guardian",
  },
  // Caregiver mode
  {
    id: "possible-overdose",
    mode: "caregiver",
    label: "Possible overdose",
    description: "Verified emergency steps, now",
    level: 1,
    riskLevel: "emergency",
    agentId: "safety-guardian",
  },
  {
    id: "they-are-distressed",
    mode: "caregiver",
    label: "They're distressed or agitated",
    description: "Calm de-escalation wording",
    level: 2,
    riskLevel: "urgent",
    agentId: "caregiver-guide",
  },
  {
    id: "start-conversation",
    mode: "caregiver",
    label: "Help me start a conversation",
    description: "Supportive, non-blaming script",
    level: 3,
    riskLevel: "steady",
    agentId: "caregiver-guide",
  },
  {
    id: "prepare-message",
    mode: "caregiver",
    label: "Prepare a supportive message",
    description: "Ready-to-send words of support",
    level: 3,
    riskLevel: "steady",
    agentId: "caregiver-guide",
  },
  {
    id: "caregiver-support",
    mode: "caregiver",
    label: "I need support as a caregiver",
    description: "Boundaries, self-care, and backup",
    level: 3,
    riskLevel: "steady",
    agentId: "caregiver-guide",
  },
  {
    id: "call-emergency",
    mode: "caregiver",
    label: "Call emergency help",
    description: "112 and verified next steps",
    level: 1,
    riskLevel: "emergency",
    agentId: "safety-guardian",
  },
] as const;

/**
 * Phrases that always escalate to Level 1 — checked BEFORE any model call on
 * the server, and available client-side for voice transcripts. Matched with
 * word boundaries to avoid false positives inside unrelated words.
 */
export const EMERGENCY_PHRASES: readonly string[] = [
  "overdose",
  "overdosed",
  "overdosing",
  "took too much",
  "unresponsive",
  "not breathing",
  "cannot breathe",
  "can't breathe",
  "stopped breathing",
  "barely breathing",
  "won't wake",
  "wont wake",
  "not waking",
  "unconscious",
  "passed out",
  "blue lips",
  "turning blue",
  "seizure",
  "immediate danger",
  "kill myself",
  "end my life",
  "suicide",
  "want to die",
  "hurt myself",
] as const;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const EMERGENCY_MATCHERS = EMERGENCY_PHRASES.map((phrase) => ({
  phrase,
  re: new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i"),
}));

const URGENT_HINTS: readonly string[] = [
  "urge",
  "craving",
  "crave",
  "relapse",
  "using again",
  "close to using",
  "about to use",
  "panic",
  "panicking",
  "overwhelmed",
  "can't cope",
  "cant cope",
  "shaking",
  "withdrawal",
  "need a drink",
  "need a hit",
  "want to use",
  "agitated",
  "distressed",
] as const;

const EDUCATION_HINTS: readonly string[] = [
  "what is",
  "what are",
  "how do",
  "how can",
  "where can",
  "explain",
  "learn",
  "resource",
  "helpline",
  "treatment",
  "rehab",
  "naloxone",
] as const;

/** Router input: the actor mode plus a command id and/or free text. */
export type RouteInput = { mode: ActorMode; buttonId?: string; text?: string };

/** Deterministic routing decision consumed by the orchestrator. */
export type RouteResult = {
  level: SafetyLevel;
  riskLevel: RiskLevel;
  agentId: AgentId;
  via: "button" | "text";
  matchedPhrase?: string;
};

/** Returns the matched emergency phrase (word-boundary match) or null. */
export function containsEmergencyPhrase(text: string): string | null {
  return EMERGENCY_MATCHERS.find((m) => m.re.test(text))?.phrase ?? null;
}

/** Looks up a command button, enforcing that it belongs to the actor's mode. */
export function getButton(mode: ActorMode, buttonId: string): CommandButton | undefined {
  return COMMAND_BUTTONS.find((b) => b.id === buttonId && b.mode === mode);
}

/**
 * Classifies a request into a safety level and specialist. Emergency signals
 * (buttons or phrases) always win; the model can never lower the result.
 */
export function route(input: RouteInput): RouteResult {
  if (input.buttonId) {
    const btn = getButton(input.mode, input.buttonId);
    if (btn) {
      return { level: btn.level, riskLevel: btn.riskLevel, agentId: btn.agentId, via: "button" };
    }
  }

  const text = input.text ?? "";
  const matched = containsEmergencyPhrase(text);
  if (matched) {
    return {
      level: 1,
      riskLevel: "emergency",
      agentId: "safety-guardian",
      via: "text",
      matchedPhrase: matched,
    };
  }

  const t = text.toLowerCase();
  const urgent = URGENT_HINTS.some((h) => t.includes(h));

  if (input.mode === "caregiver") {
    return {
      level: urgent ? 2 : 3,
      riskLevel: urgent ? "urgent" : "steady",
      agentId: "caregiver-guide",
      via: "text",
    };
  }
  if (urgent) {
    return { level: 2, riskLevel: "urgent", agentId: "recovery-coach", via: "text" };
  }
  if (EDUCATION_HINTS.some((h) => t.includes(h))) {
    return { level: 3, riskLevel: "steady", agentId: "resource-navigator", via: "text" };
  }
  return { level: 3, riskLevel: "steady", agentId: "recovery-coach", via: "text" };
}
