"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";

const TYPES = ["training", "match", "rally"] as const;
const SURFACES = ["hard", "clay", "carpet"] as const;
const RESULTS = ["win", "loss"] as const;

function formatFilterValue(label: string, value: string | null) {
  return `${label}: ${value ?? "all"}`;
}

// The three selects render once for the desktop inline row and once for the
// mobile expand panel; the reset button is a separate instance in each of
// those two places (desktop: end of the inline row; mobile: top row next to
// the toggle, where it also closes the panel) since its position and effect
// differ slightly between them.
export function FilterBar({ newEntryButton }: { newEntryButton: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const type = searchParams.get("type") ?? "all";
  const surface = searchParams.get("surface") ?? "all";
  const result = searchParams.get("result") ?? "all";
  const hasFilters = type !== "all" || surface !== "all" || result !== "all";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function resetFilters() {
    router.replace(pathname);
  }

  const filterSelects = (
    <>
      <Select value={type} onValueChange={(v) => setParam("type", v ?? "all")}>
        <SelectTrigger size="sm" className="w-full sm:w-auto">
          <SelectValue>
            {(v: string) => formatFilterValue("type", v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">all types</SelectItem>
          {TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={surface}
        onValueChange={(v) => setParam("surface", v ?? "all")}
      >
        <SelectTrigger size="sm" className="w-full sm:w-auto">
          <SelectValue>
            {(v: string) => formatFilterValue("court", v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">all surfaces</SelectItem>
          {SURFACES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={result}
        onValueChange={(v) => setParam("result", v ?? "all")}
      >
        <SelectTrigger size="sm" className="w-full sm:w-auto">
          <SelectValue>
            {(v: string) => formatFilterValue("result", v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">all results</SelectItem>
          {RESULTS.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={hasFilters ? "default" : "outline"}
            size="sm"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="sm:hidden"
          >
            filters
            <HugeiconsIcon
              icon={open ? ArrowUp01Icon : ArrowDown01Icon}
              strokeWidth={2}
            />
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => {
                resetFilters();
                setOpen(false);
              }}
            >
              reset
            </Button>
          )}
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {filterSelects}
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                reset
              </Button>
            )}
          </div>
        </div>
        {newEntryButton}
      </div>
      {open && (
        <div className="flex flex-col gap-2 sm:hidden">{filterSelects}</div>
      )}
    </div>
  );
}
