import { z } from "zod";

/**
 * Closed vocabularies — agents select from validated IDs; deterministic
 * application code performs every real-world action.
 */
export const AGENT_IDS = [
  "safety-guardian",
  "recovery-coach",
  "caregiver-guide",
  "resource-navigator",
] as const;

export const CONNECTOR_IDS = [
  "phone",
  "circle-message",
  "location",
  "speech",
  "native-share",
] as const;

export const RISK_LEVELS = ["steady", "elevated", "urgent", "emergency"] as const;

export type AgentId = (typeof AGENT_IDS)[number];
export type ConnectorId = (typeof CONNECTOR_IDS)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];

/** Who authored a widget's content: a live model call, or the reviewed protocol registry. */
export const contentSourceSchema = z.enum(["ai", "verified"]);
export type ContentSource = z.infer<typeof contentSourceSchema>;

const shortSteps = z.array(z.string().min(1)).min(1).max(3);

export const widgetSpecSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("intervention-script"),
    source: contentSourceSchema,
    acknowledgement: z.string().min(1).max(160),
    steps: shortSteps,
  }),
  z.object({
    type: z.literal("breathing-guide"),
    source: contentSourceSchema,
    inhaleSeconds: z.number().int().min(2).max(8),
    holdSeconds: z.number().int().min(0).max(8),
    exhaleSeconds: z.number().int().min(2).max(10),
    cycles: z.number().int().min(1).max(10),
  }),
  z.object({
    type: z.literal("safety-actions"),
    source: contentSourceSchema,
    resourceIds: z.array(z.string()).min(1).max(4),
    note: z.string().max(200).nullable(),
  }),
  z.object({
    type: z.literal("circle-message"),
    source: contentSourceSchema,
    message: z.string().min(1).max(320),
    recipientLabel: z.string().max(60).nullable(),
    offerLocation: z.boolean(),
  }),
  z.object({
    type: z.literal("caregiver-guidance"),
    source: contentSourceSchema,
    sayThis: z.array(z.string().min(1)).min(1).max(4),
    avoidThis: z.array(z.string().min(1)).min(1).max(4),
    warningSigns: z.array(z.string().min(1)).min(1).max(5),
  }),
  z.object({
    type: z.literal("verified-resource"),
    source: z.literal("verified"),
    resourceId: z.string(),
    note: z.string().max(200).nullable(),
  }),
]);
export type WidgetSpec = z.infer<typeof widgetSpecSchema>;
export type WidgetType = WidgetSpec["type"];

export const activityEventSchema = z.object({
  id: z.string(),
  stage: z.enum(["routing", "generation", "validation", "rendering", "connector"]),
  label: z.string(),
  status: z.enum(["working", "complete", "needs-confirmation", "failed"]),
  ts: z.number(),
  detail: z.string().optional(),
  durationMs: z.number().optional(),
});
export type ActivityEvent = z.infer<typeof activityEventSchema>;

export const agentResponseSchema = z.object({
  agentId: z.enum(AGENT_IDS),
  riskLevel: z.enum(RISK_LEVELS),
  summary: z.string().min(1).max(240),
  widgets: z.array(widgetSpecSchema).min(1).max(5),
  /** How this response was produced — always shown to the user, never faked. */
  generation: z.enum(["ai", "verified-protocol", "mixed"]),
  model: z.string().nullable(),
});
export type AgentResponse = z.infer<typeof agentResponseSchema>;

/** NDJSON frames streamed by POST /api/intervene (one JSON object per line). */
export type InterveneFrame =
  | { type: "activity"; event: ActivityEvent }
  | { type: "response"; response: AgentResponse }
  | { type: "error"; message: string };

export const interveneContextSchema = z.object({
  alone: z.boolean().optional(),
  setting: z.enum(["home", "outside", "work", "social", "driving"]).optional(),
  trustedContactLabel: z.string().max(60).optional(),
  preferredCoping: z.string().max(60).optional(),
  preferredName: z.string().max(40).optional(),
});
export type InterveneContext = z.infer<typeof interveneContextSchema>;

export const interveneRequestSchema = z
  .object({
    mode: z.enum(["individual", "caregiver"]),
    buttonId: z.string().max(64).optional(),
    text: z.string().trim().min(1).max(2000).optional(),
    context: interveneContextSchema.optional(),
  })
  .refine((v) => Boolean(v.buttonId || v.text), {
    message: "Provide a buttonId (one-tap) or text (voice or typed transcript).",
  });
export type InterveneRequest = z.infer<typeof interveneRequestSchema>;

/**
 * What the model authors: intent, not pixels. Deterministic code compiles
 * this into widgets and enforces each agent's allow-list.
 */
export const modelIntentSchema = z.object({
  summary: z.string(),
  acknowledgement: z.string(),
  steps: z.array(z.string()),
  breathing: z
    .object({
      inhaleSeconds: z.number(),
      holdSeconds: z.number(),
      exhaleSeconds: z.number(),
      cycles: z.number(),
    })
    .nullable(),
  circleMessage: z.string().nullable(),
  caregiverGuidance: z
    .object({
      sayThis: z.array(z.string()),
      avoidThis: z.array(z.string()),
      warningSigns: z.array(z.string()),
    })
    .nullable(),
  resourceIds: z.array(z.string()),
});
export type ModelIntent = z.infer<typeof modelIntentSchema>;

/**
 * Strict JSON Schema handed to the OpenAI Responses API (structured outputs).
 * Kept in sync with modelIntentSchema — a unit test asserts the key parity —
 * and the parsed output is re-validated with zod before use.
 */
export const MODEL_INTENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "acknowledgement",
    "steps",
    "breathing",
    "circleMessage",
    "caregiverGuidance",
    "resourceIds",
  ],
  properties: {
    summary: {
      type: "string",
      description: "One calm sentence describing what this plan is for.",
    },
    acknowledgement: {
      type: "string",
      description: "Short validating first line, person-first, at most 12 words.",
    },
    steps: {
      type: "array",
      items: { type: "string" },
      description:
        "One to three immediate, concrete coping steps as short imperative sentences. The first should be physical or environmental.",
    },
    breathing: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["inhaleSeconds", "holdSeconds", "exhaleSeconds", "cycles"],
          properties: {
            inhaleSeconds: { type: "integer" },
            holdSeconds: { type: "integer" },
            exhaleSeconds: { type: "integer" },
            cycles: { type: "integer" },
          },
        },
        { type: "null" },
      ],
      description: "A paced-breathing spec only if breathing would genuinely help here, else null.",
    },
    circleMessage: {
      type: ["string", "null"],
      description:
        "A ready-to-send support message in first person, at most 240 characters, or null if reaching out is not the priority.",
    },
    caregiverGuidance: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["sayThis", "avoidThis", "warningSigns"],
          properties: {
            sayThis: { type: "array", items: { type: "string" } },
            avoidThis: { type: "array", items: { type: "string" } },
            warningSigns: { type: "array", items: { type: "string" } },
          },
        },
        { type: "null" },
      ],
      description: "Caregiver conversation guidance, or null for individual flows.",
    },
    resourceIds: {
      type: "array",
      items: { type: "string" },
      description:
        "IDs chosen ONLY from the provided verified-resource catalog that fit this situation. Empty array if none fit.",
    },
  },
} as const;
