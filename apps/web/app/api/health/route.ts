import { generate, MODELS } from "@/lib/openai";
import { REGISTRY_VERSION, VERIFIED_RESOURCES } from "@/lib/resources";
import { AGENT_IDS } from "@/lib/schemas";

export async function GET() {
  const t0 = Date.now();
  const base = {
    model: MODELS.main,
    registryVersion: REGISTRY_VERSION,
    verifiedResources: VERIFIED_RESOURCES.length,
    agents: AGENT_IDS.length,
  };
  try {
    const res = await generate("ping — reply with the single word: pong", { effort: "low" });
    return Response.json({
      ok: true,
      ...base,
      latencyMs: Date.now() - t0,
      reply: res.output_text.slice(0, 40),
    });
  } catch (err) {
    return Response.json(
      { ok: false, ...base, latencyMs: Date.now() - t0, error: String(err).slice(0, 200) },
      { status: 500 },
    );
  }
}
