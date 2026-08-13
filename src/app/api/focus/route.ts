import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  getRecentSessions,
  getFocusCache,
  getLatestSessionCreatedAt,
  setFocusCache,
  getUserLanguage,
} from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { focusSystem } from "@/lib/ai/prompts";
import { getCurrentUserId } from "@/lib/auth";
import { getLanguageName } from "@/lib/language";
import { isFresh } from "@/lib/cache";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Not authenticated", { status: 401 });
  }

  const [cache, latestSessionAt, languageCode] = await Promise.all([
    getFocusCache(userId),
    getLatestSessionCreatedAt(userId),
    getUserLanguage(userId),
  ]);

  const isCacheFresh =
    cache &&
    isFresh(cache.generatedAt) &&
    (!latestSessionAt ||
      (cache.latestSessionAt && cache.latestSessionAt >= latestSessionAt));

  if (isCacheFresh) {
    return new Response(cache.content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // will make it generic later
  const recent = await getRecentSessions(userId, 7);

  const system = focusSystem(getLanguageName(languageCode));

  const prompt = `Recent sessions:\n${formatSessionsForPrompt(recent)}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system,
    prompt,
    onFinish: async ({ text }) => {
      await setFocusCache(text, latestSessionAt, userId);
    },
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
