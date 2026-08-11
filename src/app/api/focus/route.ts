import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getRecentSessions } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { focusSystem } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  const { language = "English" } = await req.json();

  // will make it generic later
  const recent = await getRecentSessions(7);

  const system = focusSystem(language);

  const prompt = `Recent sessions:\n${formatSessionsForPrompt(recent)}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system,
    prompt,
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
