import { activeProvider, pingModel, PROVIDER_MODELS } from "@/lib/model-provider";
import { REGISTRY_VERSION, VERIFIED_RESOURCES } from "@/lib/resources";
import { AGENT_IDS } from "@/lib/schemas";

/** Successful pings are cached briefly so polling can't burn model quota. */
let cachedPing: { at: number; reply: string } | null = null;
const PING_TTL_MS = 30_000;

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
    const cacheAge = cachedPing ? Date.now() - cachedPing.at : Infinity;
    if (!cachedPing || cacheAge > PING_TTL_MS) {
      const res = await pingModel();
      cachedPing = { at: Date.now(), reply: res.reply.slice(0, 40) };
    }
    return Response.json({
      ok: true,
      ...base,
      latencyMs: Date.now() - t0,
      reply: cachedPing.reply,
      pingAgeMs: Date.now() - cachedPing.at,
    });
  } catch {
    // Never leak provider error internals through a public endpoint.
    return Response.json(
      { ok: false, ...base, latencyMs: Date.now() - t0, error: "model ping failed" },
      { status: 500 },
    );
  }
}
