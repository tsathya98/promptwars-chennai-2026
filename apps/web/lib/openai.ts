import OpenAI from "openai";
import type { ZodType } from "zod";

/** Only model verified against this project's region-pinned key. */
export const MODELS = {
  main: "gpt-5.6-terra",
} as const;

let cachedClient: OpenAI | null = null;

/** Lazy so importing this module never requires credentials (tests, builds). */
function getClient(): OpenAI {
  cachedClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY,
    // The project key is region-pinned; the default api.openai.com host
    // rejects it with `incorrect_hostname`.
    baseURL: process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1",
    // Hard latency ceiling: a hung request must fail fast enough for the
    // cross-provider fallback to engage on a crisis endpoint. withRetry()
    // owns retries — SDK-internal retries would stretch worst-case failover.
    timeout: 15_000,
    maxRetries: 0,
  });
  return cachedClient;
}

const RETRYABLE_STATUS = new Set([429, 500, 503]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number }).status;
      if (!status || !RETRYABLE_STATUS.has(status)) throw err;
      await sleep(1000 * (attempt + 1));
    }
  }
  throw lastErr;
}

export type ReasoningEffort = "low" | "medium" | "high";

/** Plain-text generation via the Responses API (low effort = low latency). */
export async function generate(
  input: string,
  opts: { system?: string; model?: string; effort?: ReasoningEffort } = {},
) {
  const { model = MODELS.main, system, effort = "low" } = opts;
  const response = await withRetry(() =>
    getClient().responses.create({
      model,
      reasoning: { effort },
      ...(system ? { instructions: system } : {}),
      input,
    }),
  );
  return { output_text: response.output_text ?? "", usage: response.usage };
}

/**
 * Structured generation: a strict JSON schema is enforced at the API layer and
 * the parsed output is re-validated with zod before anything renders. No
 * markdown-fence stripping, no parse-and-pray.
 */
export async function generateStructured<T>(args: {
  schema: ZodType<T>;
  jsonSchema: Record<string, unknown>;
  name: string;
  input: string;
  system: string;
  model?: string;
  effort?: ReasoningEffort;
}): Promise<T> {
  const { schema, jsonSchema, name, input, system, model = MODELS.main, effort = "low" } = args;
  const response = await withRetry(() =>
    getClient().responses.create({
      model,
      reasoning: { effort },
      instructions: system,
      input,
      text: {
        format: { type: "json_schema", name, strict: true, schema: jsonSchema },
      },
    }),
  );
  return schema.parse(JSON.parse(response.output_text ?? ""));
}
