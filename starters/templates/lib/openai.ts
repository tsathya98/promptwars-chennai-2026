// OpenAI wrapper — same shape as lib/gemini.ts, kept as a separate provider lane.
// Uses the Responses API. NOTE: this key is region-pinned — the default
// api.openai.com host returns `incorrect_hostname`; baseURL must be explicit.
import OpenAI from "openai";

export const MODELS = {
  main: "gpt-5.6-terra",
} as const;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1",
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retry-once-with-backoff on 429/503/500, same policy as the Gemini ladder.
export async function generate(
  input: string,
  opts: { model?: string; reasoningEffort?: "minimal" | "low" | "medium" | "high" } = {},
) {
  if (process.env.MOCK === "1") return mockResponse(input);
  const { model = MODELS.main, reasoningEffort = "low" } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await client.responses.create({
        model,
        reasoning: { effort: reasoningEffort },
        input,
      });
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number }).status;
      if (status !== 429 && status !== 503 && status !== 500) throw err;
      await sleep(1000 * (attempt + 1));
    }
  }
  throw lastErr;
}

async function mockResponse(input: string) {
  const { readFile } = await import("node:fs/promises");
  try {
    const raw = await readFile("fixtures/last-good.json", "utf8");
    return JSON.parse(raw);
  } catch {
    return { output_text: `[MOCK] response for: ${input.slice(0, 80)}` };
  }
}
