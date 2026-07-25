import { describe, expect, it } from "vitest";

import {
  agentResponseSchema,
  interveneRequestSchema,
  MODEL_INTENT_JSON_SCHEMA,
  modelIntentSchema,
  widgetSpecSchema,
} from "./schemas";

describe("intervention schemas", () => {
  it("requires one-tap or text input", () => {
    expect(interveneRequestSchema.safeParse({ mode: "individual" }).success).toBe(false);
    expect(
      interveneRequestSchema.safeParse({
        mode: "individual",
        buttonId: "urge",
      }).success,
    ).toBe(true);
  });

  it("rejects model-authored widget types outside the closed vocabulary", () => {
    expect(
      widgetSpecSchema.safeParse({
        type: "send-message-now",
        source: "ai",
      }).success,
    ).toBe(false);
  });

  it("caps intervention scripts at three immediate steps", () => {
    expect(
      widgetSpecSchema.safeParse({
        type: "intervention-script",
        source: "ai",
        acknowledgement: "You are not alone.",
        steps: ["One", "Two", "Three", "Four"],
      }).success,
    ).toBe(false);
  });

  it("rejects an unregistered specialist agent", () => {
    expect(
      agentResponseSchema.safeParse({
        agentId: "unregistered-agent",
        riskLevel: "steady",
        summary: "A safe next step.",
        widgets: [
          {
            type: "intervention-script",
            source: "ai",
            acknowledgement: "You are not alone.",
            steps: ["Move to a safer place."],
          },
        ],
        generation: "ai",
        model: "test-model",
      }).success,
    ).toBe(false);
  });

  it("keeps the structured-output JSON schema aligned with the Zod intent schema", () => {
    const validIntent = {
      summary: "A short plan.",
      acknowledgement: "You are not alone.",
      steps: ["Move to a safer place."],
      breathing: null,
      circleMessage: null,
      caregiverGuidance: null,
      resourceIds: [],
    };

    expect(modelIntentSchema.safeParse(validIntent).success).toBe(true);
    expect([...MODEL_INTENT_JSON_SCHEMA.required].sort()).toEqual(
      Object.keys(MODEL_INTENT_JSON_SCHEMA.properties).sort(),
    );
  });
});
