import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  getSessionsVsOpponent,
  getRecentSessions,
  getBriefingCache,
  setBriefingCache,
  getUserLanguage,
} from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { briefingSystem } from "@/lib/ai/prompts";
import { getCurrentUserId } from "@/lib/auth";
import { getLanguageName } from "@/lib/language";
import { isFresh } from "@/lib/cache";

export async function POST(req: Request) {
  const { opponent } = await req.json();
  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Not authenticated", { status: 401 });
  }

  const cache = await getBriefingCache(userId);

  const isCacheFresh =
    cache && cache.opponent === opponent && isFresh(cache.generatedAt);

  if (isCacheFresh) {
    return new Response(cache.content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // probably should make this value generic
  const [history, recent, languageCode] = await Promise.all([
    getSessionsVsOpponent(opponent, userId),
    getRecentSessions(userId, 5),
    getUserLanguage(userId),
  ]);

  const system = briefingSystem(getLanguageName(languageCode));

  const prompt = `Upcoming opponent: ${opponent}

Past encounters with ${opponent}:
${formatSessionsForPrompt(history) || "No recorded matches against this opponent."}

Player's recent form (last 5 sessions):
${formatSessionsForPrompt(recent)}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system,
    prompt,
    onFinish: async ({ text }) => {
      await setBriefingCache(opponent, text, userId);
    },
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
