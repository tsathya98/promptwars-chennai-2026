import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { ZodType } from "zod";

/** Verified live against this project's AI Studio key (2026-07-25). */
export const GEMINI_MODELS = {
  main: "gemini-3.6-flash",
} as const;

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  cachedClient ??= new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    // Hard latency ceiling so the cross-provider fallback engages on hangs.
    httpOptions: { timeout: 15_000 },
  });
  return cachedClient;
}

export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Plain-text generation (health checks). Low thinking = low latency. */
export async function geminiGenerate(input: string, opts: { system?: string } = {}) {
  const response = await getClient().models.generateContent({
    model: GEMINI_MODELS.main,
    contents: input,
    config: {
      ...(opts.system ? { systemInstruction: opts.system } : {}),
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });
  return { output_text: response.text ?? "" };
}

/**
 * Structured generation: JSON schema enforced at the API layer, zod
 * re-validation at ours — the same contract as the OpenAI provider.
 */
export async function geminiGenerateStructured<T>(args: {
  schema: ZodType<T>;
  jsonSchema: Record<string, unknown>;
  system: string;
  input: string;
  model?: string;
}): Promise<T> {
  const { schema, jsonSchema, system, input, model = GEMINI_MODELS.main } = args;
  const response = await getClient().models.generateContent({
    model,
    contents: input,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchema,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });
  return schema.parse(JSON.parse(response.text ?? ""));
}
