import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getRecentSessions } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";

export async function POST(req: Request) {
  const { language = "English" } = await req.json();

  // will make it generic later
  const recent = await getRecentSessions(7);

  const system = `You are a tennis coach. Respond in ${language}.
Based on the player's recent sessions, pick 1-2 things to focus on in today's session.
Reference specific dates and the coach's past notes where relevant.
Be concrete and brief — a few sentences, not a lecture.`;

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
