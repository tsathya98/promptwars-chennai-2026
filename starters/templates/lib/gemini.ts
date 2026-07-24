// Single Gemini wrapper — ALL model calls go through here.
// Implements: model constants, retry-once with backoff, fallback ladder, MOCK mode.
import { GoogleGenAI } from "@google/genai";

export const MODELS = {
  main: "gemini-3.6-flash",
  fast: "gemini-3.5-flash-lite",
} as const;

const primary = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const fallbackKey = process.env.GEMINI_API_KEY_FALLBACK;
const fallback = fallbackKey ? new GoogleGenAI({ apiKey: fallbackKey }) : null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type GenArgs = Parameters<typeof primary.models.generateContent>[0];

// Ladder: main model → fast model → fallback key (main model).
export async function generate(args: GenArgs) {
  if (process.env.MOCK === "1") return mockResponse(args);
  const attempts: Array<{ client: GoogleGenAI; model: string }> = [
    { client: primary, model: args.model ?? MODELS.main },
    { client: primary, model: MODELS.fast },
    ...(fallback ? [{ client: fallback, model: args.model ?? MODELS.main }] : []),
  ];
  let lastErr: unknown;
  for (const [i, a] of attempts.entries()) {
    try {
      return await a.client.models.generateContent({ ...args, model: a.model });
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number }).status;
      if (status !== 429 && status !== 503 && status !== 500) throw err;
      await sleep(1000 * (i + 1));
    }
  }
  throw lastErr;
}

// Grounded answer with Google Search — instant live-data + citations.
export async function generateGrounded(model: string, contents: string) {
  return generate({ model, contents, config: { tools: [{ googleSearch: {} }] } });
}

async function mockResponse(args: GenArgs) {
  const { readFile } = await import("node:fs/promises");
  try {
    const raw = await readFile("fixtures/last-good.json", "utf8");
    return JSON.parse(raw);
  } catch {
    return { text: `[MOCK] response for: ${JSON.stringify(args.contents).slice(0, 80)}` };
  }
}
