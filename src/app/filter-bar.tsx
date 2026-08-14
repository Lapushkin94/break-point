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
    setOpen(false);
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={hasFilters ? "default" : "outline"}
            size="sm"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            filters
            <HugeiconsIcon
              icon={open ? ArrowUp01Icon : ArrowDown01Icon}
              strokeWidth={2}
            />
          </Button>
          {/* Always rendered (just hidden when there's nothing to reset) so
          this row's width — and the panel below, which matches it — stays
          constant instead of shrinking when "reset" disappears. */}
          <Button
            variant="outline"
            size="sm"
            className={hasFilters ? undefined : "invisible"}
            onClick={resetFilters}
          >
            reset
          </Button>
        </div>

        {open && (
          <div className="flex flex-col gap-2">
            <Select
              value={type}
              onValueChange={(v) => setParam("type", v ?? "all")}
            >
              <SelectTrigger size="sm" className="w-full">
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
              <SelectTrigger size="sm" className="w-full">
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
              <SelectTrigger size="sm" className="w-full">
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
          </div>
        )}
      </div>
      {newEntryButton}
    </div>
  );
}
