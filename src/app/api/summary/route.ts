import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSessionsSince, getUserLanguage } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";
import { summarySystem } from "@/lib/ai/prompts";
import { getLanguageName } from "@/lib/language";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const { since } = await req.json();
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const [rows, languageCode] = await Promise.all([
    getSessionsSince(since, userId),
    getUserLanguage(userId),
  ]);

  const system = summarySystem(getLanguageName(languageCode));

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
    userId,
  });

  return NextResponse.json({ content: text });
}
