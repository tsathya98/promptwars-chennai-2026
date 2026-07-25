import { z } from "zod";

import { LANGUAGES, type LanguageCode } from "@/lib/languages";

export const maxDuration = 30;

/** Verified via live smoke test against the region-pinned host (2026-07-25). */
const TTS_MODEL = "gpt-4o-mini-tts";

const speechRequestSchema = z.object({
  text: z.string().trim().min(1).max(800),
  language: z.string().max(5).optional(),
});

/**
 * Natural read-aloud: server-side TTS so the API key never reaches the
 * browser. The client falls back to browser speechSynthesis if this fails.
 * Text is converted and streamed back — never logged or stored.
 */
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1";
  if (!apiKey) {
    return Response.json({ error: "Read-aloud is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = speechRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Text is required (max 800 characters)." }, { status: 400 });
  }

  const languageName =
    parsed.data.language && parsed.data.language in LANGUAGES
      ? LANGUAGES[parsed.data.language as LanguageCode].name
      : "English";

  const res = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: TTS_MODEL,
      voice: "coral",
      input: parsed.data.text,
      instructions: `Speak slowly and warmly, like a calm, steady supportive companion. The text is in ${languageName}. Never rush; leave small pauses between sentences.`,
    }),
  });

  if (!res.ok || !res.body) {
    return Response.json({ error: "Voice generation is unavailable right now." }, { status: 502 });
  }

  return new Response(res.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
