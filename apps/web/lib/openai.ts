import OpenAI from "openai";

export const MODELS = {
  main: "gpt-5.6-terra",
} as const;

const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY;

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1",
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generate(
  input: string,
  opts: {
    system?: string;
    model?: string;
    reasoningEffort?: "minimal" | "low" | "medium" | "high";
  } = {},
) {
  if (process.env.MOCK === "1") return mockResponse(input);
  const {
    model = MODELS.main,
    system = "You are an empathetic, real-time crisis intervention and de-escalation AI supporting individuals navigating substance use disorders and their caregivers.",
    reasoningEffort = "low",
  } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: input },
        ],
        reasoning_effort: (reasoningEffort === "minimal" ? "low" : reasoningEffort) as "low" | "medium" | "high",
      });
      return {
        output_text: response.choices[0]?.message?.content || "",
        usage: response.usage,
      };
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
  return {
    output_text: `[RECOVERY AI RESPONSE] De-escalation plan generated for: ${input.slice(0, 80)}`,
  };
}
