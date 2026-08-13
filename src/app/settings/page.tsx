import { getCurrentUserId } from "@/lib/auth";
import { getUserLanguage, getUserTheme } from "@/db/queries";
import { SettingsForm } from "./settings-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import type { LanguageCode } from "@/lib/language";
import type { ThemeMode } from "@/db/schema";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  const [language, theme] = await Promise.all([
    getUserLanguage(userId),
    getUserTheme(userId),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/" aria-label="Back" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      </div>
      <SettingsForm
        currentLanguage={language as LanguageCode}
        currentTheme={theme as ThemeMode}
      />
    </main>
  );
}
