import { describe, expect, it } from "vitest";

import {
  COMMAND_BUTTONS,
  containsEmergencyPhrase,
  EMERGENCY_PHRASES,
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

  it("escalates EVERY registered emergency phrase to Level 1", () => {
    for (const phrase of EMERGENCY_PHRASES) {
      const result = route({ mode: "individual", text: `my friend ${phrase} please help` });
      expect(result, `phrase: ${phrase}`).toMatchObject({
        level: 1,
        riskLevel: "emergency",
        agentId: "safety-guardian",
      });
    }
  });

  it("matches emergency phrases on word boundaries, not substrings", () => {
    expect(containsEmergencyPhrase("we discussed overdoses in a class reading")).toBeNull();
    expect(containsEmergencyPhrase("he may have overdosed")).toBe("overdosed");
  });

  it("defines exactly six one-tap commands per mode with unique ids", () => {
    for (const mode of ["individual", "caregiver"] as const) {
      const buttons = COMMAND_BUTTONS.filter((b) => b.mode === mode);
      expect(buttons).toHaveLength(6);
      expect(new Set(buttons.map((b) => b.id)).size).toBe(6);
    }
  });

  it("routes every Level 1 button to the model-independent Safety Guardian", () => {
    for (const btn of COMMAND_BUTTONS.filter((b) => b.level === 1)) {
      expect(btn.agentId).toBe("safety-guardian");
      expect(btn.riskLevel).toBe("emergency");
    }
  });

  it("matches urgency hints on word boundaries, not substrings", () => {
    // "encourage" contains "urge"; word-boundary matching must not trip it.
    const result = route({ mode: "individual", text: "I want to encourage my friend" });
    expect(result.riskLevel).toBe("steady");
  });

  it("keeps a craving urgent but never emergency", () => {
    const result = route({ mode: "individual", text: "the craving is unbearable right now" });
    expect(result.level).toBe(2);
    expect(result.riskLevel).toBe("urgent");
    expect(result.agentId).toBe("recovery-coach");
  });
});
