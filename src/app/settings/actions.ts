"use server";

import { getCurrentUserId } from "@/lib/auth";
import {
  updateUserLanguage,
  updateUserTheme,
  clearFocusCache,
  clearBriefingCache,
} from "@/db/queries";
import type { LanguageCode } from "@/lib/language";
import type { ThemeMode } from "@/db/schema";

export async function updateSettings(language: LanguageCode, theme: ThemeMode) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  await Promise.all([
    updateUserLanguage(userId, language),
    updateUserTheme(userId, theme),
  ]);
  // Cached Focus/Briefing content was generated in the old language and
  // would otherwise look fresh (session recency hasn't changed) — clear it
  // so the next open regenerates in the current language.
  await Promise.all([clearFocusCache(userId), clearBriefingCache(userId)]);
}
