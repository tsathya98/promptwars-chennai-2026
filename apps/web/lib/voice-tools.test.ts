import { describe, expect, it } from "vitest";

import { executeVoiceTool, VOICE_TOOL_DEFINITIONS } from "./voice-tools";

describe("voice screen tools (allow-listed, deterministic)", () => {
  it("refuses tools outside the allow-list instead of rendering anything", () => {
    const result = executeVoiceTool("delete_all_data", { anything: true });
    expect(result.output.status).toBe("refused");
    expect(result.action).toBeUndefined();
  });

  it("clamps breathing parameters into the safe widget range", () => {
    const result = executeVoiceTool("show_breathing_guide", {
      inhaleSeconds: 99,
      holdSeconds: -5,
      exhaleSeconds: 0,
      cycles: 1000,
    });
    expect(result.output.status).toBe("rendered");
    expect(result.action).toEqual({
      kind: "widgets",
      widgets: [
        {
          type: "breathing-guide",
          source: "ai",
          inhaleSeconds: 8,
          holdSeconds: 0,
          exhaleSeconds: 2,
          cycles: 10,
        },
      ],
    });
  });

  it("routes a support-plan request through the full intervention pipeline", () => {
    const result = executeVoiceTool("show_support_plan", { situation: "strong urge after work" });
    expect(result.action).toEqual({ kind: "intervention", text: "strong urge after work" });
  });

  it("refuses a support-plan call with missing arguments", () => {
    expect(executeVoiceTool("show_support_plan", {}).output.status).toBe("refused");
  });

  it("escalates the emergency tool to the deterministic protocol", () => {
    expect(executeVoiceTool("show_emergency_help", {}).action).toEqual({ kind: "emergency" });
  });

  it("prepares an editable circle message but never claims sending", () => {
    const result = executeVoiceTool("prepare_circle_message", { message: "Please call me." });
    expect(result.action?.kind).toBe("widgets");
    expect(result.output.detail).toContain("never say it was sent");
  });

  it("only shows verified helpline resources", () => {
    const result = executeVoiceTool("show_helplines", {});
    if (result.action?.kind !== "widgets") throw new Error("expected widgets");
    const widget = result.action.widgets[0];
    if (widget.type !== "safety-actions") throw new Error("expected safety-actions");
    expect(widget.source).toBe("verified");
    expect(widget.resourceIds).toEqual(["deaddiction-14446", "telemanas-14416"]);
  });

  it("declares every tool with a strict function schema", () => {
    for (const tool of VOICE_TOOL_DEFINITIONS) {
      expect(tool.type).toBe("function");
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.parameters.type).toBe("object");
      expect(tool.parameters.additionalProperties).toBe(false);
    }
  });
});
