import { NextResponse } from "next/server";
import { generate } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages?.[messages.length - 1]?.content || "Help me navigate recovery.";

    const system = `You are a compassionate, expert AI recovery coach and caregiver assistant for individuals navigating substance use disorders.
Keep your responses direct, empathetic, actionable (2-4 paragraphs max), and focused on immediate de-escalation, safety, and evidence-based recovery strategies.`;

    const response = await generate(lastUserMessage, {
      system,
      reasoningEffort: "low",
    });

    return NextResponse.json({
      role: "assistant",
      content: response.output_text,
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "I am here with you. Take a slow, deep breath. Focus on your grounding, drink water, and reach out to your support contact if you feel overwhelmed.",
      },
      { status: 500 }
    );
  }
}
