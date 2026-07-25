import { NextResponse } from "next/server";
import { generate } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { triggerType = "INTENSE_CRAVING", userContext = "High stress moment" } = await req.json();

    const systemPrompt = `You are a real-time, low-latency crisis intervention AI for substance use recovery and caregiver emergency support.
Your goal is to provide immediate, zero-typing, high-clarity de-escalation scripts and grounding protocols when cognitive load is highest.

Return a JSON object matching this structure (strict JSON format only, no markdown wrapping):
{
  "headline": "A short, direct, 1-sentence grounding statement.",
  "deescalationSteps": [
    "Step 1: Immediate physical action (e.g. box breathing, cold water)",
    "Step 2: Cognitive grounding (e.g. 5-4-3-2-1 sensory focus)",
    "Step 3: Positive affirmation & coping mantra"
  ],
  "emergencyScript": "A 2-sentence script the user or caregiver can say aloud or text to their support contact.",
  "recommendedAction": "Single immediate high-impact action to take right now."
}`;

    const prompt = `Trigger Event: ${triggerType}. Context: ${userContext}. Produce the emergency response.`;

    const result = await generate(prompt, {
      system: systemPrompt,
      reasoningEffort: "low",
    });

    let data;
    try {
      // Clean JSON string if enclosed in markdown code blocks
      const cleanJson = result.output_text.replace(/```json\n?|\n?```/g, "").trim();
      data = JSON.parse(cleanJson);
    } catch {
      data = {
        headline: "Pause. Take a deep, slow breath right now.",
        deescalationSteps: [
          "Breathe in for 4 seconds, hold for 4, exhale for 6 seconds.",
          "Place one hand on your chest and feel the physical ground beneath your feet.",
          "Remind yourself: This craving or panic peak will pass in a few minutes."
        ],
        emergencyScript: "I am experiencing high distress right now and need a moment of quiet support. Please stay on the line with me.",
        recommendedAction: "Drink a cold glass of water and change your physical room."
      };
    }

    return NextResponse.json({ success: true, triggerType, data });
  } catch (error: unknown) {
    console.error("Emergency API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate emergency response",
        fallback: {
          headline: "Focus on your breath. You are safe in this moment.",
          deescalationSteps: [
            "Inhale slowly through your nose for 4 seconds.",
            "Hold for 4 seconds.",
            "Exhale slowly through your mouth for 6 seconds."
          ],
          emergencyScript: "I am taking a moment to ground myself. Please support me calmly.",
          recommendedAction: "Step outside or into a fresh environment."
        }
      },
      { status: 500 }
    );
  }
}
