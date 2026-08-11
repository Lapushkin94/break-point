import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSessionsSince } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { since, language = "English" } = await req.json();
  const rows = await getSessionsSince(since);

  const system = `You are a tennis coach writing a monthly progress review. Respond in ${language}.
Identify: trends improving, issues recurring across multiple sessions (call out how many times / how many weeks),
patterns in matches (e.g. tiebreaks, second serve, specific opponents or surfaces), and 2-3 goals for next month.
Ground every claim in the data and reference dates. Use ONLY the sessions provided.`;

  const prompt = `Sessions in this period:\n${formatSessionsForPrompt(rows)}`;

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    system,
    prompt,
  });

  const today = new Date().toISOString().slice(0, 10);
  await db.insert(insights).values({
    periodStart: since,
    periodEnd: today,
    content: text,
  });

  return NextResponse.json({ content: text });
}
