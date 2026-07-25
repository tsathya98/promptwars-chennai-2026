import { LANGUAGES } from "../languages";
import { generateIntent } from "../model-provider";
import { getResource, isResourceId, resourceCatalogForPrompt } from "../resources";
import { getButton, route, type RouteResult } from "../safety-router";
import {
  agentResponseSchema,
  MODEL_INTENT_JSON_SCHEMA,
  modelIntentSchema,
  type ActivityEvent,
  type AgentResponse,
  type InterveneFrame,
  type InterveneRequest,
  type ModelIntent,
  type WidgetSpec,
} from "../schemas";
import { getAgent } from "./registry";

type Emit = (frame: InterveneFrame) => void;

const LEVEL_LABEL = {
  1: "Level 1 — immediate danger protocol",
  2: "Level 2 — urgent support",
  3: "Level 3 — ongoing support",
} as const;

let seq = 0;

function beginStage(emit: Emit, stage: ActivityEvent["stage"], label: string) {
  const id = `evt-${Date.now().toString(36)}-${seq++}`;
  const startedAt = Date.now();
  emit({ type: "activity", event: { id, stage, label, status: "working", ts: startedAt } });
  const finish = (status: "complete" | "failed", finalLabel?: string, detail?: string) =>
    emit({
      type: "activity",
      event: {
        id,
        stage,
        label: finalLabel ?? label,
        status,
        ts: Date.now(),
        durationMs: Date.now() - startedAt,
        detail,
      },
    });
  return {
    done: (finalLabel?: string, detail?: string) => finish("complete", finalLabel, detail),
    fail: (finalLabel?: string, detail?: string) => finish("failed", finalLabel, detail),
  };
}

const clampText = (s: string, max: number) => s.trim().slice(0, max);
const clampInt = (n: number, min: number, max: number, fallback: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
const clampList = (xs: string[], max: number) =>
  xs.map((x) => x.trim()).filter(Boolean).slice(0, max);

/**
 * Full intervention pipeline. Streams real pipeline stages as activity events
 * (never fabricated reasoning), then the final validated AgentResponse.
 */
export async function orchestrate(input: InterveneRequest, emit: Emit): Promise<void> {
  const routing = beginStage(emit, "routing", "Safety router assessing the situation");
  const routed = route({ mode: input.mode, buttonId: input.buttonId, text: input.text });
  const agent = getAgent(routed.agentId);
  routing.done(
    `${agent.label} selected — ${LEVEL_LABEL[routed.level]}`,
    routed.matchedPhrase ? `matched emergency phrase "${routed.matchedPhrase}"` : undefined,
  );

  // Level 1: verified protocol only. No model call stands between the user
  // and emergency guidance.
  if (routed.level === 1) {
    const validation = beginStage(emit, "validation", "Loading verified emergency protocol");
    const response = emergencyResponse(input);
    validation.done("Verified emergency protocol ready — no AI dependency");
    emit({ type: "response", response });
    return;
  }

  const generation = beginStage(emit, "generation", `${agent.label} personalizing your plan`);
  let intent: ModelIntent | null = null;
  let modelUsed: string | null = null;
  try {
    const result = await generateIntent<ModelIntent>({
      schema: modelIntentSchema,
      jsonSchema: MODEL_INTENT_JSON_SCHEMA as unknown as Record<string, unknown>,
      name: "ibuki_intervention_intent",
      system: agent.systemPrompt,
      input: buildUserPrompt(input, routed),
    });
    intent = result.value;
    modelUsed = result.model;
    generation.done(`${agent.label} plan generated`);
  } catch (err) {
    generation.fail(
      "AI generation unavailable — falling back to verified guidance",
      err instanceof Error ? err.message.slice(0, 140) : undefined,
    );
  }

  const validation = beginStage(emit, "validation", "Validating widgets against the safety policy");
  const response =
    intent && modelUsed
      ? compileResponse(input, routed, intent, modelUsed)
      : verifiedFallback(input, routed);
  validation.done(`${response.widgets.length} widgets approved for ${agent.label}`);
  emit({ type: "response", response });
}

function buildUserPrompt(input: InterveneRequest, routed: RouteResult): string {
  const audience = input.mode === "caregiver" ? "caregiver" : "individual";
  const btn = input.buttonId ? getButton(input.mode, input.buttonId) : undefined;
  const ctx = input.context;
  const lines = [
    `Mode: ${input.mode}. Assessed urgency: ${routed.riskLevel}.`,
    btn ? `They tapped the one-tap button: "${btn.label}" (${btn.description}).` : "",
    input.text ? `They said (voice or typed): "${input.text}"` : "",
    ctx?.preferredName ? `Preferred name: ${ctx.preferredName}.` : "",
    ctx?.alone !== undefined ? `They are ${ctx.alone ? "alone" : "with someone"}.` : "",
    ctx?.setting ? `Current setting: ${ctx.setting}.` : "",
    ctx?.trustedContactLabel
      ? `Their trusted contact is saved as "${ctx.trustedContactLabel}".`
      : "",
    ctx?.preferredCoping ? `Coping style that works for them: ${ctx.preferredCoping}.` : "",
    input.language !== "en"
      ? `Write EVERY user-facing sentence in ${LANGUAGES[input.language].name}, using simple everyday words a stressed reader understands. Keep phone numbers, helpline names, and resource ids unchanged.`
      : "",
    "",
    "Verified resource catalog — resourceIds may ONLY come from here:",
    resourceCatalogForPrompt(audience),
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Deterministic compiler: the model authors intent, this code authors widgets.
 * Everything outside the agent's allow-list is rejected — never substituted.
 * Exported for unit tests.
 */
export function compileResponse(
  input: InterveneRequest,
  routed: RouteResult,
  intent: ModelIntent,
  modelUsed: string,
): AgentResponse {
  const agent = getAgent(routed.agentId);
  const allow = new Set(agent.allowedWidgets);
  const widgets: WidgetSpec[] = [];

  const steps = clampList(intent.steps, 3).map((s) => clampText(s, 200));
  if (allow.has("intervention-script") && steps.length > 0) {
    widgets.push({
      type: "intervention-script",
      source: "ai",
      acknowledgement:
        clampText(intent.acknowledgement, 160) || "You did the right thing by reaching out.",
      steps,
    });
  }

  if (allow.has("breathing-guide") && intent.breathing) {
    widgets.push({
      type: "breathing-guide",
      source: "ai",
      inhaleSeconds: clampInt(intent.breathing.inhaleSeconds, 2, 8, 4),
      holdSeconds: clampInt(intent.breathing.holdSeconds, 0, 8, 2),
      exhaleSeconds: clampInt(intent.breathing.exhaleSeconds, 2, 10, 6),
      cycles: clampInt(intent.breathing.cycles, 1, 10, 4),
    });
  }

  if (allow.has("caregiver-guidance") && intent.caregiverGuidance) {
    const sayThis = clampList(intent.caregiverGuidance.sayThis, 4);
    const avoidThis = clampList(intent.caregiverGuidance.avoidThis, 4);
    const warningSigns = clampList(intent.caregiverGuidance.warningSigns, 5);
    if (sayThis.length && avoidThis.length && warningSigns.length) {
      widgets.push({ type: "caregiver-guidance", source: "ai", sayThis, avoidThis, warningSigns });
    }
  }

  if (allow.has("circle-message") && intent.circleMessage?.trim()) {
    widgets.push({
      type: "circle-message",
      source: "ai",
      message: clampText(intent.circleMessage, 320),
      recipientLabel: input.context?.trustedContactLabel ?? null,
      offerLocation: true,
    });
  }

  // Urgent flows always carry verified human-support actions.
  if (routed.riskLevel === "urgent" && allow.has("safety-actions")) {
    widgets.push({
      type: "safety-actions",
      source: "verified",
      resourceIds: ["deaddiction-14446", "telemanas-14416"],
      note: "Free, confidential helplines — talking to a person helps.",
    });
  }

  // Unknown resource ids are rejected here, not silently substituted.
  if (allow.has("verified-resource")) {
    for (const id of intent.resourceIds.filter(isResourceId).slice(0, 2)) {
      widgets.push({ type: "verified-resource", source: "verified", resourceId: id, note: null });
    }
  }

  if (widgets.length === 0) return verifiedFallback(input, routed);

  const generation = widgets.every((w) => w.source === "ai")
    ? "ai"
    : widgets.every((w) => w.source === "verified")
      ? "verified-protocol"
      : "mixed";

  return agentResponseSchema.parse({
    agentId: agent.id,
    riskLevel: routed.riskLevel,
    summary: clampText(intent.summary, 240) || "A short plan for right now.",
    widgets: widgets.slice(0, 5),
    generation,
    model: modelUsed,
    language: input.language,
  });
}

/** Level-1 response: reviewed protocol content only, clearly labelled. Exported for unit tests. */
export function emergencyResponse(input: InterveneRequest): AgentResponse {
  const widgets: WidgetSpec[] = [
    {
      type: "safety-actions",
      source: "verified",
      resourceIds: ["erss-112"],
      note: "If someone may be overdosing or is in danger, calling 112 comes first.",
    },
    { type: "verified-resource", source: "verified", resourceId: "overdose-response", note: null },
    {
      type: "circle-message",
      source: "verified",
      message:
        "Emergency — I need help right now. Please call me or come to me. If you can't reach me, call 112.",
      recipientLabel: input.context?.trustedContactLabel ?? null,
      offerLocation: true,
    },
  ];
  return agentResponseSchema.parse({
    agentId: "safety-guardian",
    riskLevel: "emergency",
    summary: "Verified emergency guidance — these steps never depend on AI.",
    widgets,
    generation: "verified-protocol",
    model: null,
    language: "en",
  });
}

/**
 * Honest degraded state when generation fails: verified protocol content,
 * clearly labelled — never canned text presented as AI output.
 */
export function verifiedFallback(input: InterveneRequest, routed: RouteResult): AgentResponse {
  const agent = getAgent(routed.agentId);
  const widgets: WidgetSpec[] = [];

  const protocol =
    input.mode === "caregiver" ? getResource("caregiver-conversation") : getResource("urge-grounding");
  if (protocol?.steps) {
    widgets.push({
      type: "intervention-script",
      source: "verified",
      acknowledgement: "Personalized AI guidance is temporarily unavailable.",
      steps: [...protocol.steps].slice(0, 3),
    });
    widgets.push({ type: "verified-resource", source: "verified", resourceId: protocol.id, note: null });
  }
  widgets.push({
    type: "safety-actions",
    source: "verified",
    resourceIds: ["deaddiction-14446", "telemanas-14416"],
    note: "These verified helplines work even when AI generation doesn't.",
  });

  return agentResponseSchema.parse({
    agentId: agent.id,
    riskLevel: routed.riskLevel,
    summary:
      "AI generation is temporarily unavailable, so these are verified (non-AI) steps and helplines.",
    widgets,
    generation: "verified-protocol",
    model: null,
    language: "en",
  });
}
