import { generate, MODELS } from "@/lib/gemini";
import { ThinkingLevel } from "@google/genai";

export async function GET() {
  const t0 = Date.now();
  try {
    const res = await generate({
      model: MODELS.fast,
      contents: "ping — reply with the single word: pong",
      config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
    });
    return Response.json({
      ok: true,
      model: MODELS.fast,
      latencyMs: Date.now() - t0,
      reply: res.text?.slice(0, 40),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err).slice(0, 200), latencyMs: Date.now() - t0 },
      { status: 500 },
    );
  }
}
