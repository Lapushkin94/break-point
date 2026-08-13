import { languageCode } from "@/db/schema";

export type LanguageCode = (typeof languageCode.enumValues)[number];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  ru: "Russian",
  el: "Greek",
};

export const LANGUAGE_OPTIONS = languageCode.enumValues;

export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code as LanguageCode] ?? LANGUAGE_NAMES.en;
}
