"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { updateSettings } from "./actions";
import {
  LANGUAGE_NAMES,
  LANGUAGE_OPTIONS,
  type LanguageCode,
} from "@/lib/language";
import type { ThemeMode } from "@/db/schema";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsForm({
  currentLanguage,
  currentTheme,
}: {
  currentLanguage: LanguageCode;
  currentTheme: ThemeMode;
}) {
  const { setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>(currentLanguage);
  const [theme, setDraftTheme] = useState<ThemeMode>(currentTheme);

  // next-themes' setTheme is re-created (useCallback keyed on the current
  // theme) every time the theme changes, so depending on it directly would
  // re-fire the cleanup below — and revert the preview — on every toggle
  // instead of only on unmount. Capture it once instead: it never reads its
  // own closure for a plain string argument (only for the functional-updater
  // form, which this component never uses), so an old reference behaves
  // identically to a fresh one.
  const setThemeRef = useRef(setTheme);

  // The theme switch previews live (setTheme fires on every click), but
  // nothing is persisted until Save. If the user navigates away first,
  // revert to whatever was last actually saved (or the original, if never
  // saved this visit) rather than leaving the preview applied.
  const lastSavedThemeRef = useRef<ThemeMode>(currentTheme);
  useEffect(() => {
    const applyTheme = setThemeRef.current;
    return () => {
      applyTheme(lastSavedThemeRef.current);
    };
  }, []);

  function handleLanguageChange(value: string | null) {
    if (!value) return;
    setLanguage(value as LanguageCode);
    setSaved(false);
  }

  function handleThemeToggle(checked: boolean) {
    const next: ThemeMode = checked ? "dark" : "light";
    setDraftTheme(next);
    setTheme(next);
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateSettings(language, theme);
        lastSavedThemeRef.current = theme;
        setSaved(true);
      } catch (e) {
        console.error(e);
        setError("Couldn't save. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="language">AI response language</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger id="language" className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((code) => (
              <SelectItem key={code} value={code}>
                {LANGUAGE_NAMES[code]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex max-w-xs items-center justify-between gap-4">
        <Label htmlFor="theme-switch">Dark mode</Label>
        <Switch
          id="theme-switch"
          checked={theme === "dark"}
          onCheckedChange={handleThemeToggle}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} className="w-fit">
          {isPending ? "Saving..." : "Save"}
        </Button>
        {saved && !isPending && (
          <p className="text-sm text-muted-foreground">Saved.</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
