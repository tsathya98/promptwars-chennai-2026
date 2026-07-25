import { VOICE_TOOL_DEFINITIONS } from "@/lib/voice-tools";

export const maxDuration = 30;

/** Verified via live smoke test against the region-pinned host (2026-07-25). */
const REALTIME_MODEL = "gpt-realtime";

const LANGUAGE_NAMES: Record<string, string> = {
  ta: "Tamil",
  hi: "Hindi",
  bn: "Bengali",
  te: "Telugu",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
};

function voiceInstructions(mode: "individual" | "caregiver", language?: string): string {
  const languageRule =
    language && LANGUAGE_NAMES[language]
      ? `\n- Speak in ${LANGUAGE_NAMES[language]}, in simple everyday words. Keep helpline numbers unchanged.`
      : "";
  return baseVoiceInstructions(mode) + languageRule;
}

function baseVoiceInstructions(mode: "individual" | "caregiver"): string {
  return `You are IBUKI Voice, the spoken companion of IBUKI Circle — a recovery-support app for adults in India navigating substance use${
    mode === "caregiver" ? ", currently speaking with a caregiver supporting someone" : ""
  }.
Non-negotiable rules:
- If the user describes a possible overdose, unresponsiveness, breathing trouble, or immediate danger: FIRST tell them to call 112 now and to tap the red "Emergency help" button in the app for verified steps. Do this before anything else.
- Speak in short, calm turns — at most two sentences, then pause and listen.
- Person-first, non-stigmatizing language. No diagnosis, no medication or detox instructions, no guarantees, no shame.
- You cannot place calls or send messages. Never claim an action was completed.
- Helplines you may mention: 112 (emergency), 14446 (national drug de-addiction helpline), 14416 (Tele-MANAS mental health). Never invent others.
- Ground the person: one small physical step first (move, water, cold, posture), then breathing, then reaching a trusted person.
- If asked something you have no verified source for, say so and point to a helpline.
You have SCREEN TOOLS — use them proactively while you talk; they put real, interactive help on the user's screen:
- show_support_plan: when they describe what's happening and need a plan.
- show_breathing_guide: whenever you suggest breathing together.
- prepare_circle_message: when reaching a trusted person would help (you draft it; THEY send it).
- show_helplines: when confidential phone support fits.
- show_emergency_help: IMMEDIATELY on any overdose/danger signal, alongside telling them to call 112.
After a tool call, briefly tell them what appeared on screen. Never claim you sent or completed anything.`;
}

/**
 * Mints a short-lived Realtime client secret. The standard API key stays
 * server-side; the browser only ever sees the ephemeral token.
 */
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://us.api.openai.com/v1";
  if (!apiKey) {
    return Response.json({ error: "Voice is not configured on this deployment." }, { status: 503 });
  }

  let mode: "individual" | "caregiver" = "individual";
  let language: string | undefined;
  try {
    const body = (await req.json()) as { mode?: string; language?: string };
    if (body?.mode === "caregiver") mode = "caregiver";
    if (typeof body?.language === "string" && body.language.length <= 5) language = body.language;
  } catch {
    /* default mode */
  }

  const res = await fetch(`${baseUrl}/realtime/client_secrets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      expires_after: { anchor: "created_at", seconds: 600 },
      session: {
        type: "realtime",
        model: REALTIME_MODEL,
        output_modalities: ["audio"],
        audio: { output: { voice: "marin" } },
        tools: VOICE_TOOL_DEFINITIONS,
        tool_choice: "auto",
        instructions: voiceInstructions(mode, language),
      },
    }),
  });

  if (!res.ok) {
    return Response.json(
      { error: "Voice session could not be created right now." },
      { status: 502 },
    );
  }
  const data = (await res.json()) as { value: string; expires_at: number };
  return Response.json({
    value: data.value,
    expiresAt: data.expires_at,
    baseUrl,
    model: REALTIME_MODEL,
  });
}
