import { activeProvider, pingModel, PROVIDER_MODELS } from "@/lib/model-provider";
import { REGISTRY_VERSION, VERIFIED_RESOURCES } from "@/lib/resources";
import { AGENT_IDS } from "@/lib/schemas";

export async function GET() {
  const t0 = Date.now();
  const base = {
    provider: activeProvider(),
    model: PROVIDER_MODELS[activeProvider()],
    registryVersion: REGISTRY_VERSION,
    verifiedResources: VERIFIED_RESOURCES.length,
    agents: AGENT_IDS.length,
  };
  try {
    const res = await pingModel();
    return Response.json({
      ok: true,
      ...base,
      latencyMs: Date.now() - t0,
      reply: res.reply.slice(0, 40),
    });
  } catch (err) {
    return Response.json(
      { ok: false, ...base, latencyMs: Date.now() - t0, error: String(err).slice(0, 200) },
      { status: 500 },
    );
  }
}
