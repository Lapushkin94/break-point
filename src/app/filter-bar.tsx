"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = ["training", "match", "rally"] as const;
const SURFACES = ["hard", "clay", "carpet"] as const;
const RESULTS = ["win", "loss"] as const;

function formatFilterValue(label: string, value: string | null) {
  return `${label}: ${value ?? "all"}`;
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={type} onValueChange={(v) => setParam("type", v ?? "all")}>
        <SelectTrigger size="sm">
          <SelectValue>
            {(v: string) => formatFilterValue("type", v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
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
        <SelectTrigger size="sm">
          <SelectValue>
            {(v: string) => formatFilterValue("court", v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All surfaces</SelectItem>
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
        <SelectTrigger size="sm">
          <SelectValue>
            {(v: string) => formatFilterValue("result", v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All results</SelectItem>
          {RESULTS.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.replace(pathname)}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
