"use server";

import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { sessionParseSchema, type SessionParse } from "./schemas";
import { getLanguageName } from "@/lib/language";
import { getUserLanguage } from "@/db/queries";
import { getCurrentUserId } from "@/lib/auth";

function buildSystemPrompt(languageName: string) {
  return `You extract structured data from a tennis player's notes about their training sessions and matches.
The player writes in ${languageName}, sometimes using English tennis terms (forehand, serve, etc.) — this is normal, interpret them naturally.
Rules:
- Extract only what is actually stated. Never invent details.
- If something is not mentioned, use null (or an empty array for lists).
- Keep list items short — a few words each, not full sentences.
- The player may write casually, with typos, or mix in slang. Interpret generously but do not add facts.
- Keep all free-text fields (opponent, whatWorked, whatFailed, coachNotes) in ${languageName}, exactly as the player would phrase them.
- Always map enum fields (type, result, surface) to the exact English schema values (training/match, win/loss, clay/hard/carpet), regardless of input language.`;
}

export async function parseSessionText(rawText: string): Promise<SessionParse> {
  const userId = await getCurrentUserId();
  const languageName = getLanguageName(await getUserLanguage(userId));

  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    output: Output.object({ schema: sessionParseSchema }),
    system: buildSystemPrompt(languageName),
    prompt: rawText,
  });
  return output;
}
