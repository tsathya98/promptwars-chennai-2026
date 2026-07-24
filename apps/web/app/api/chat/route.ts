// Streaming chat with tools via Vercel AI SDK. Pair with useChat() on the client.
import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const SYSTEM = `You are the assistant inside this app.
- Prefer calling tools over guessing; if a tool fails, say what you tried.
- Answers: 2-4 sentences, then data. Markdown tables for lists >3 items.
- Never mention tool names or internals to the user.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-3.6-flash"),
    system: SYSTEM,
    messages: await convertToModelMessages(messages.slice(-10)), // trim: TPM bites first
    tools: {
      // Replace with problem-specific tools. Every tool returns a verifiable
      // result the model must check (the emptySections pattern).
      getData: tool({
        description: "Fetch data for the user's query.",
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          return { rows: [], empty: true, note: `no data source wired yet for: ${query}` };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
