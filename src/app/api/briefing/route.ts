import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSessionsVsOpponent, getRecentSessions } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { briefingSystem } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  const { opponent, language = "English" } = await req.json();

  // probably should make this value generic
  const [history, recent] = await Promise.all([
    getSessionsVsOpponent(opponent),
    getRecentSessions(5),
  ]);

  const system = briefingSystem(language);

  const prompt = `Upcoming opponent: ${opponent}

Past encounters with ${opponent}:
${formatSessionsForPrompt(history) || "No recorded matches against this opponent."}

Player's recent form (last 5 sessions):
${formatSessionsForPrompt(recent)}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system,
    prompt,
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
