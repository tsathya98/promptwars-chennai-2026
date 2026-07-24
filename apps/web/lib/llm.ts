// Unified facade: Antigravity subscription FIRST, Gemini API key as fallback.
//
// Decision logic per call:
//   1. LLM_PROVIDER=antigravity (or unset locally) AND agy usable → subscription quota
//   2. otherwise, or on any agy failure → API key path (lib/gemini.ts ladder)
//
// On Vercel/production, set LLM_PROVIDER=api (agy does not exist there).
import { agyAvailable, agyGenerate, AGY_MODELS } from "./antigravity";
import { generate as apiGenerate, MODELS } from "./gemini";
import { ThinkingLevel } from "@google/genai";

let agyOk: boolean | null = null;

async function useAntigravity(): Promise<boolean> {
  if (process.env.LLM_PROVIDER === "api") return false;
  if (process.env.VERCEL) return false; // deployed runtime: agy not present
  agyOk ??= await agyAvailable();
  return agyOk;
}

// Non-streaming text generation with automatic provider selection.
// tier "main" = gemini-3.6-flash, "fast" = cheaper/quicker lane.
export async function generateText(
  prompt: string,
  opts: { tier?: "main" | "fast"; systemPrompt?: string } = {},
): Promise<{ text: string; provider: "antigravity" | "api" }> {
  const { tier = "main", systemPrompt } = opts;
  const full = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;

  if (await useAntigravity()) {
    try {
      const text = await agyGenerate(full, { model: AGY_MODELS[tier] });
      return { text, provider: "antigravity" };
    } catch (err) {
      console.warn("[llm] antigravity failed, falling back to API key:", String(err).slice(0, 200));
      agyOk = false; // don't retry agy this process
    }
  }

  const res = await apiGenerate({
    model: MODELS[tier],
    contents: full,
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
  });
  return { text: res.text ?? "", provider: "api" };
}

// NOTE ON STREAMING/CHAT: agy print mode cannot stream tokens. Interactive chat
// (useChat + streamText) should stay on the API-key path — that's not a downgrade,
// it's the only option for a deployed streaming UI. Use generateText() for the
// heavyweight non-interactive calls (report compilation, summaries, seed content)
// so those burn subscription quota instead of your API keys.
