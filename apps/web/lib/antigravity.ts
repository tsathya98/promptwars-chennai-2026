// PRIORITY 1: Google models via Antigravity SUBSCRIPTION (OAuth login), no API key.
// Works by shelling out to the local `agy` CLI in headless print mode.
//
// CONSTRAINTS (read once, they shape when to use this):
// - Only works where `agy` is installed AND logged in → localhost / your laptop.
//   A Vercel deployment CANNOT use this — deployed runtime needs the API key path.
// - ~10-15s latency per call (heavy init) → good for report/content/batch generation,
//   bad for interactive chat. No token streaming.
// - Quota is shared with the Antigravity desktop app + IDE. Watch usage.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { z } from "zod";

const exec = promisify(execFile);

// From `agy models` — suffix = reasoning effort. Prefer -low for speed/quota.
export const AGY_MODELS = {
  main: "gemini-3.6-flash-low",
  mainThinking: "gemini-3.6-flash-high",
  fast: "gemini-3.5-flash-low",
  pro: "gemini-3.1-pro-low",
} as const;

export async function agyGenerate(
  prompt: string,
  opts: { model?: string; timeoutMs?: number } = {},
): Promise<string> {
  const { model = AGY_MODELS.main, timeoutMs = 120_000 } = opts;
  const { stdout } = await exec(
    "agy",
    ["-p", prompt, "--model", model, "--sandbox", "--print-timeout", "4m"],
    { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
  );
  return stdout.trim();
}

// JSON mode: instruct + parse + validate; one retry with the error appended.
export async function agyGenerateJSON<T>(
  prompt: string,
  schema: z.ZodType<T>,
  opts: { model?: string } = {},
): Promise<T> {
  const jsonPrompt = `${prompt}

Output ONLY a valid JSON object — no markdown fences, no prose before or after.`;
  let raw = await agyGenerate(jsonPrompt, opts);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const cleaned = raw.replace(/^```(json)?\s*/i, "").replace(/```\s*$/, "");
      return schema.parse(JSON.parse(cleaned));
    } catch (err) {
      if (attempt === 1) throw err;
      raw = await agyGenerate(
        `${jsonPrompt}\n\nYour previous output failed to parse (${String(err).slice(0, 200)}). Previous output:\n${raw.slice(0, 2000)}\n\nFix it and output only the corrected JSON.`,
        opts,
      );
    }
  }
  throw new Error("unreachable");
}

export async function agyAvailable(): Promise<boolean> {
  try {
    await exec("agy", ["models"], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}
