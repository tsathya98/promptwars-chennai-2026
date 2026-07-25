import { describe, expect, it } from "vitest";

import {
  containsEmergencyPhrase,
  getButton,
  route,
} from "./safety-router";

describe("deterministic safety router", () => {
  it("routes an emergency phrase to the verified safety guardian", () => {
    expect(route({ mode: "individual", text: "My friend is NOT BREATHING" })).toMatchObject({
      level: 1,
      riskLevel: "emergency",
      agentId: "safety-guardian",
      matchedPhrase: "not breathing",
    });
  });

  it("does not depend on a model to route an emergency button", () => {
    expect(route({ mode: "caregiver", buttonId: "possible-overdose" })).toEqual({
      level: 1,
      riskLevel: "emergency",
      agentId: "safety-guardian",
      via: "button",
    });
  });

  it("routes non-emergency caregiver distress to the caregiver guide", () => {
    expect(route({ mode: "caregiver", text: "They are distressed and agitated" })).toMatchObject({
      level: 2,
      riskLevel: "urgent",
      agentId: "caregiver-guide",
    });
  });

  it("does not route ordinary educational text as an emergency", () => {
    expect(containsEmergencyPhrase("Where can I learn about treatment?")).toBeNull();
    expect(route({ mode: "individual", text: "Where can I learn about treatment?" })).toMatchObject({
      level: 3,
      riskLevel: "steady",
      agentId: "resource-navigator",
    });
  });

  it("rejects a button from the wrong actor mode", () => {
    expect(getButton("individual", "possible-overdose")).toBeUndefined();
  });
});
