import { describe, expect, it } from "vitest";

import type { ModelIntent } from "../schemas";
import { route } from "../safety-router";
import { compileResponse, emergencyResponse, verifiedFallback } from "./orchestrate";

const baseIntent: ModelIntent = {
  summary: "A short plan for this moment.",
  acknowledgement: "This urge is strong, and it will pass.",
  steps: ["Step away from the room.", "Drink a glass of cold water."],
  breathing: { inhaleSeconds: 4, holdSeconds: 2, exhaleSeconds: 6, cycles: 4 },
  circleMessage: "Can you call me for a few minutes? I need support right now.",
  caregiverGuidance: null,
  resourceIds: ["urge-grounding"],
};

describe("deterministic widget compiler", () => {
  it("compiles a recovery-coach intent into allow-listed widgets", () => {
    const routed = route({ mode: "individual", buttonId: "urge" });
    const response = compileResponse(
      { mode: "individual", buttonId: "urge", language: "en" },
      routed,
      baseIntent,
    );
    const types = response.widgets.map((w) => w.type);
    expect(types).toContain("intervention-script");
    expect(types).toContain("breathing-guide");
    expect(types).toContain("circle-message");
    expect(response.generation).toBe("mixed"); // urgent flows always add verified safety actions
    expect(response.model).toBe("gpt-5.6-terra");
  });

  it("rejects resource ids outside the verified registry instead of substituting", () => {
    const routed = route({ mode: "individual", buttonId: "urge" });
    const intent = { ...baseIntent, resourceIds: ["fake-helpline-999", "urge-grounding"] };
    const response = compileResponse(
      { mode: "individual", buttonId: "urge", language: "en" },
      routed,
      intent,
    );
    const resourceWidgets = response.widgets.filter((w) => w.type === "verified-resource");
    expect(resourceWidgets.map((w) => w.resourceId)).toEqual(["urge-grounding"]);
  });

  it("never lets the model add widgets outside the agent allow-list", () => {
    const routed = route({ mode: "caregiver", buttonId: "start-conversation" });
    // resource-navigator/caregiver-guide have no breathing-guide in their allow-list
    const response = compileResponse(
      { mode: "caregiver", buttonId: "start-conversation", language: "en" },
      routed,
      { ...baseIntent, caregiverGuidance: { sayThis: ["I care about you."], avoidThis: ["Blame."], warningSigns: ["Unresponsive."] } },
    );
    expect(response.widgets.some((w) => w.type === "breathing-guide")).toBe(false);
    expect(response.widgets.some((w) => w.type === "caregiver-guidance")).toBe(true);
  });

  it("builds the emergency response with zero model dependency", () => {
    const response = emergencyResponse({
      mode: "caregiver",
      buttonId: "possible-overdose",
      language: "en",
    });
    expect(response.generation).toBe("verified-protocol");
    expect(response.model).toBeNull();
    expect(response.riskLevel).toBe("emergency");
    expect(response.widgets.every((w) => w.source === "verified")).toBe(true);
  });

  it("falls back to labelled verified protocol when generation fails", () => {
    const routed = route({ mode: "individual", buttonId: "urge" });
    const response = verifiedFallback(
      { mode: "individual", buttonId: "urge", language: "en" },
      routed,
    );
    expect(response.generation).toBe("verified-protocol");
    expect(response.widgets.every((w) => w.source === "verified")).toBe(true);
    expect(response.summary.toLowerCase()).toContain("unavailable");
  });
});
