import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSessionsVsOpponent, getRecentSessions } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";

export async function POST(req: Request) {
  const { opponent, language = "English" } = await req.json();

  // probably should make this value generic
  const [history, recent] = await Promise.all([
    getSessionsVsOpponent(opponent),
    getRecentSessions(5),
  ]);

  const system = `You are a tennis coach preparing a player for a match.
Respond in ${language}.
Use ONLY the history provided — do not invent past results.
Give: (1) what has worked against this opponent, (2) what to avoid, (3) three concrete tactical instructions.
Be specific and cite dates when a point comes from a particular match. Keep it under 250 words.`;

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
