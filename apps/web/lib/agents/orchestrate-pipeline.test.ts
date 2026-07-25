import { describe, expect, it, vi, type Mock } from "vitest";

import type { InterveneFrame, InterveneRequest, ModelIntent } from "../schemas";

vi.mock("../model-provider", () => ({ generateIntent: vi.fn() }));

import { generateIntent } from "../model-provider";
import { orchestrate } from "./orchestrate";

const mockedGenerate = generateIntent as Mock;

const intent: ModelIntent = {
  summary: "A short plan.",
  acknowledgement: "You are not alone.",
  steps: ["Drink a glass of water.", "Step outside for two minutes."],
  breathing: null,
  circleMessage: null,
  caregiverGuidance: null,
  resourceIds: [],
};

/** Runs the pipeline and captures every streamed frame. */
async function collectFrames(input: InterveneRequest): Promise<InterveneFrame[]> {
  const frames: InterveneFrame[] = [];
  await orchestrate(input, (frame) => frames.push(frame));
  return frames;
}

describe("orchestrate() pipeline (provider mocked)", () => {
  it("streams routing → generation → validation stages, then the validated response", async () => {
    mockedGenerate.mockResolvedValueOnce({ value: intent, provider: "openai", model: "mock-model" });
    const frames = await collectFrames({ mode: "individual", buttonId: "urge", language: "en" });

    const stages = frames
      .filter((f): f is Extract<InterveneFrame, { type: "activity" }> => f.type === "activity")
      .map((f) => `${f.event.stage}:${f.event.status}`);
    expect(stages).toEqual([
      "routing:working",
      "routing:complete",
      "generation:working",
      "generation:complete",
      "validation:working",
      "validation:complete",
    ]);

    const last = frames.at(-1);
    if (last?.type !== "response") throw new Error("expected a response frame last");
    expect(last.response.model).toBe("mock-model");
    expect(last.response.generation).toMatch(/ai|mixed/);
  });

  it("emits a failed generation stage and an honest verified fallback on provider error", async () => {
    mockedGenerate.mockRejectedValueOnce(new Error("provider down"));
    const frames = await collectFrames({ mode: "individual", buttonId: "urge", language: "en" });

    const failed = frames.find(
      (f) => f.type === "activity" && f.event.stage === "generation" && f.event.status === "failed",
    );
    expect(failed).toBeDefined();

    const last = frames.at(-1);
    if (last?.type !== "response") throw new Error("expected a response frame last");
    expect(last.response.generation).toBe("verified-protocol");
    expect(last.response.model).toBeNull();
  });

  it("never calls the model for a Level 1 emergency", async () => {
    mockedGenerate.mockClear();
    const frames = await collectFrames({
      mode: "caregiver",
      buttonId: "possible-overdose",
      language: "en",
    });
    expect(mockedGenerate).not.toHaveBeenCalled();
    const last = frames.at(-1);
    if (last?.type !== "response") throw new Error("expected a response frame last");
    expect(last.response.riskLevel).toBe("emergency");
    expect(last.response.generation).toBe("verified-protocol");
  });
});
