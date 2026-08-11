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

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const { language = "English" } = await req.json();

  const [cache, latestSessionAt] = await Promise.all([
    getFocusCache(),
    getLatestSessionCreatedAt(),
  ]);

  const isCacheFresh =
    cache &&
    Date.now() - cache.generatedAt.getTime() < CACHE_TTL_MS &&
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
      await setFocusCache(text, latestSessionAt);
    },
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
