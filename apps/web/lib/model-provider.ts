import type { ZodType } from "zod";

import { GEMINI_MODELS, geminiAvailable, geminiGenerate, geminiGenerateStructured } from "./gemini";
import { generate as openaiGenerate, generateStructured as openaiGenerateStructured, MODELS as OPENAI_MODELS } from "./openai";

/**
 * Model-agnostic provider layer. The app never depends on a single vendor:
 * MODEL_PROVIDER=openai|gemini picks the primary; the other verified provider
 * is the automatic fallback when the primary errors. Both run the same
 * strict-schema + zod contract, so the rest of the app is provider-blind.
 */
/** The two verified structured-generation providers. */
export type ProviderName = "openai" | "gemini";

const openaiAvailable = () =>
  Boolean(process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY);

/** Primary provider from MODEL_PROVIDER (defaults to OpenAI when unset/unavailable). */
export function activeProvider(): ProviderName {
  return process.env.MODEL_PROVIDER === "gemini" && geminiAvailable() ? "gemini" : "openai";
}

function providerOrder(): ProviderName[] {
  return activeProvider() === "gemini" ? ["gemini", "openai"] : ["openai", "gemini"];
}

const available: Record<ProviderName, () => boolean> = {
  openai: openaiAvailable,
  gemini: geminiAvailable,
};

/** Verified model id used by each provider. */
export const PROVIDER_MODELS: Record<ProviderName, string> = {
  openai: OPENAI_MODELS.main,
  gemini: GEMINI_MODELS.main,
};

/** Arguments shared by both providers' structured-generation calls. */
export type StructuredArgs<T> = {
  schema: ZodType<T>;
  jsonSchema: Record<string, unknown>;
  name: string;
  system: string;
  input: string;
};

/** A validated intent plus the provider/model that actually produced it. */
export type StructuredResult<T> = { value: T; provider: ProviderName; model: string };

/** Structured intent generation with automatic cross-provider fallback. */
export async function generateIntent<T>(args: StructuredArgs<T>): Promise<StructuredResult<T>> {
  let lastError: unknown;
  for (const provider of providerOrder()) {
    if (!available[provider]()) continue;
    try {
      if (provider === "gemini") {
        const value = await geminiGenerateStructured<T>(args);
        return { value, provider, model: PROVIDER_MODELS.gemini };
      }
      const value = await openaiGenerateStructured<T>(args);
      return { value, provider, model: PROVIDER_MODELS.openai };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("No model provider is configured.");
}

/** Health-check ping against the active provider. */
export async function pingModel(): Promise<{ provider: ProviderName; model: string; reply: string }> {
  const provider = activeProvider();
  const input = "ping — reply with the single word: pong";
  const result =
    provider === "gemini" && geminiAvailable()
      ? await geminiGenerate(input)
      : await openaiGenerate(input, { effort: "low" });
  return { provider, model: PROVIDER_MODELS[provider], reply: result.output_text };
}
