import { generate, MODELS } from "@/lib/openai";

export async function GET() {
  const t0 = Date.now();
  try {
    const res = await generate("ping — reply with the single word: pong", {
      reasoningEffort: "minimal",
    });
    return Response.json({
      ok: true,
      model: MODELS.main,
      latencyMs: Date.now() - t0,
      reply: res.output_text?.slice(0, 40),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err).slice(0, 200), latencyMs: Date.now() - t0 },
      { status: 500 },
    );
  }
}
