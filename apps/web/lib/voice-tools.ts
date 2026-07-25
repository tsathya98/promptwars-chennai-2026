import { z } from "zod";

import { widgetSpecSchema, type WidgetSpec } from "./schemas";

/**
 * Screen tools for IBUKI Voice (Realtime). The voice model never emits UI —
 * it calls these allow-listed tools with typed arguments; deterministic client
 * code validates (zod + clamps) and renders widgets from the same closed
 * vocabulary as every other modality. Unknown tools are refused.
 */
export const VOICE_TOOL_DEFINITIONS = [
  {
    type: "function",
    name: "show_support_plan",
    description:
      "Render a full personalized support plan on the user's screen (grounding steps, breathing, helplines). Use when the person describes a craving, panic, distress, or asks for a plan. Summarize the situation in one sentence.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["situation"],
      properties: {
        situation: {
          type: "string",
          description: "One-sentence summary of what the person is going through, in English.",
        },
      },
    },
  },
  {
    type: "function",
    name: "show_breathing_guide",
    description:
      "Put an interactive paced-breathing guide on screen. Use when you suggest breathing together.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["inhaleSeconds", "holdSeconds", "exhaleSeconds", "cycles"],
      properties: {
        inhaleSeconds: { type: "integer", description: "2-8" },
        holdSeconds: { type: "integer", description: "0-8" },
        exhaleSeconds: { type: "integer", description: "2-10" },
        cycles: { type: "integer", description: "1-10" },
      },
    },
  },
  {
    type: "function",
    name: "prepare_circle_message",
    description:
      "Put an editable, ready-to-send support message on screen that the user can send to a trusted person via WhatsApp/SMS/share. Use when reaching a real person would help. Write it in the user's language, first person, under 240 characters.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["message"],
      properties: {
        message: { type: "string", description: "The ready-to-send message, first person." },
      },
    },
  },
  {
    type: "function",
    name: "show_helplines",
    description:
      "Show verified Indian helpline call buttons on screen (14446 de-addiction, 14416 Tele-MANAS). Use when professional or confidential phone support would help.",
    parameters: { type: "object", additionalProperties: false, required: [], properties: {} },
  },
  {
    type: "function",
    name: "show_emergency_help",
    description:
      "Immediately show the verified emergency protocol (call 112, overdose response steps). Use the MOMENT the person describes a possible overdose, unresponsiveness, breathing trouble, or immediate danger.",
    parameters: { type: "object", additionalProperties: false, required: [], properties: {} },
  },
] as const;

export type VoiceToolName = (typeof VOICE_TOOL_DEFINITIONS)[number]["name"];

/** What a tool call asks the app to do — executed by deterministic page code. */
export type VoiceToolAction =
  | { kind: "widgets"; widgets: WidgetSpec[] }
  | { kind: "intervention"; text: string }
  | { kind: "emergency" };

export type VoiceToolResult = {
  /** Sent back to the model as the function_call_output. */
  output: { status: "rendered" | "refused"; detail: string };
  action?: VoiceToolAction;
};

const clampInt = (n: unknown, min: number, max: number, fallback: number) =>
  typeof n === "number" && Number.isFinite(n)
    ? Math.min(max, Math.max(min, Math.round(n)))
    : fallback;

const situationSchema = z.object({ situation: z.string().trim().min(1).max(500) });
const messageSchema = z.object({ message: z.string().trim().min(1).max(320) });

/**
 * Validate + translate a voice tool call into a typed action. Every widget
 * passes the same widgetSpecSchema as the orchestrator's compiler output.
 */
export function executeVoiceTool(name: string, rawArgs: unknown): VoiceToolResult {
  switch (name as VoiceToolName) {
    case "show_support_plan": {
      const parsed = situationSchema.safeParse(rawArgs);
      if (!parsed.success) return refuse("situation text was missing");
      return {
        output: {
          status: "rendered",
          detail:
            "A personalized plan is being generated on screen (safety-routed, may take a few seconds). Tell the user it's appearing.",
        },
        action: { kind: "intervention", text: parsed.data.situation },
      };
    }
    case "show_breathing_guide": {
      const args = (rawArgs ?? {}) as Record<string, unknown>;
      const widget = widgetSpecSchema.parse({
        type: "breathing-guide",
        source: "ai",
        inhaleSeconds: clampInt(args.inhaleSeconds, 2, 8, 4),
        holdSeconds: clampInt(args.holdSeconds, 0, 8, 2),
        exhaleSeconds: clampInt(args.exhaleSeconds, 2, 10, 6),
        cycles: clampInt(args.cycles, 1, 10, 4),
      });
      return {
        output: { status: "rendered", detail: "Breathing guide is on screen with a Start button." },
        action: { kind: "widgets", widgets: [widget] },
      };
    }
    case "prepare_circle_message": {
      const parsed = messageSchema.safeParse(rawArgs);
      if (!parsed.success) return refuse("message text was missing");
      const widget = widgetSpecSchema.parse({
        type: "circle-message",
        source: "ai",
        message: parsed.data.message,
        recipientLabel: null,
        offerLocation: true,
      });
      return {
        output: {
          status: "rendered",
          detail:
            "Editable message is on screen with WhatsApp/SMS/share buttons. The user sends it themselves — never say it was sent.",
        },
        action: { kind: "widgets", widgets: [widget] },
      };
    }
    case "show_helplines": {
      const widget = widgetSpecSchema.parse({
        type: "safety-actions",
        source: "verified",
        resourceIds: ["deaddiction-14446", "telemanas-14416"],
        note: "Free, confidential helplines — talking to a person helps.",
      });
      return {
        output: { status: "rendered", detail: "Verified helpline call buttons are on screen." },
        action: { kind: "widgets", widgets: [widget] },
      };
    }
    case "show_emergency_help":
      return {
        output: {
          status: "rendered",
          detail:
            "Verified emergency protocol is on screen: Call 112 button and overdose response steps. Tell them to call 112 now.",
        },
        action: { kind: "emergency" },
      };
    default:
      return refuse(`unknown tool "${name}" — refused by the allow-list`);
  }
}

function refuse(detail: string): VoiceToolResult {
  return { output: { status: "refused", detail } };
}
