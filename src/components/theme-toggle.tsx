"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      variant="ghost"
      size="icon"
      className="relative size-11 border-border [&_svg]:absolute [&_svg]:transition-transform"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={Sun01Icon}
        strokeWidth={2}
        className="scale-100 dark:scale-0"
      />
      <HugeiconsIcon
        icon={Moon01Icon}
        strokeWidth={2}
        className="scale-0 dark:scale-100"
      />
    </Button>
  );
}
