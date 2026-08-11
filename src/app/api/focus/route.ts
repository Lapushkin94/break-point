import { streamText, toTextStream, createTextStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  getRecentSessions,
  getFocusCache,
  getLatestSessionCreatedAt,
  setFocusCache,
} from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { focusSystem } from "@/lib/ai/prompts";
import { getCurrentUserId } from "@/lib/auth";
import { isFresh } from "@/lib/cache";

export async function POST(req: Request) {
  const { language = "English" } = await req.json();
  const userId = await getCurrentUserId();

  const [cache, latestSessionAt] = await Promise.all([
    getFocusCache(userId),
    getLatestSessionCreatedAt(),
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
  const recent = await getRecentSessions(7);

  const system = focusSystem(language);

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
