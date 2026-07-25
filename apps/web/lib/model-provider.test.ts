import { afterEach, describe, expect, it, vi } from "vitest";

import { activeProvider, PROVIDER_MODELS } from "./model-provider";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("model-agnostic provider selection", () => {
  it("defaults to OpenAI when MODEL_PROVIDER is unset", () => {
    vi.stubEnv("MODEL_PROVIDER", "");
    expect(activeProvider()).toBe("openai");
  });

  it("selects Gemini only when both requested AND configured", () => {
    vi.stubEnv("MODEL_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    expect(activeProvider()).toBe("gemini");
  });

  it("falls back to OpenAI when Gemini is requested but unconfigured", () => {
    vi.stubEnv("MODEL_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(activeProvider()).toBe("openai");
  });

  it("maps each provider to a single verified model id", () => {
    expect(PROVIDER_MODELS.openai).toBe("gpt-5.6-terra");
    expect(PROVIDER_MODELS.gemini).toBe("gemini-3.6-flash");
  });
});
