import { describe, expect, it } from "vitest";

import { LANGUAGE_CODES, LANGUAGES } from "./languages";
import { agentResponseSchema, interveneRequestSchema } from "./schemas";

describe("language support", () => {
  it("defines label, English name, and speech locale for every code", () => {
    for (const code of LANGUAGE_CODES) {
      const entry = LANGUAGES[code];
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.speech).toMatch(/^[a-z]{2}-IN$/);
    }
  });

  it("defaults requests to English when no language is sent", () => {
    const parsed = interveneRequestSchema.parse({ mode: "individual", buttonId: "urge" });
    expect(parsed.language).toBe("en");
  });

  it("rejects unsupported language codes at the boundary", () => {
    expect(
      interveneRequestSchema.safeParse({ mode: "individual", buttonId: "urge", language: "xx" })
        .success,
    ).toBe(false);
  });

  it("keeps the response language enum in sync with the language registry", () => {
    const ok = agentResponseSchema.safeParse({
      agentId: "recovery-coach",
      riskLevel: "steady",
      summary: "Plan.",
      widgets: [
        {
          type: "intervention-script",
          source: "ai",
          acknowledgement: "You are not alone.",
          steps: ["Drink water."],
        },
      ],
      generation: "ai",
      model: "test",
      language: "ta",
    });
    expect(ok.success).toBe(true);
  });
});
