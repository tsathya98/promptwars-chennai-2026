import { orchestrate } from "@/lib/agents/orchestrate";
import { interveneRequestSchema, type InterveneFrame } from "@/lib/schemas";

export const maxDuration = 60;

const MAX_BODY_BYTES = 16_000;

/**
 * Single intervention endpoint for every modality (one-tap button, voice
 * transcript, typed text). Streams NDJSON: activity events for each real
 * pipeline stage, then the final validated AgentResponse.
 */
export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Request body too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = interveneRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (frame: InterveneFrame) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(frame)}\n`));
      try {
        await orchestrate(input, emit);
      } catch {
        emit({
          type: "error",
          message:
            "Something went wrong on our side. The verified helplines below still work — 112 for emergencies.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
