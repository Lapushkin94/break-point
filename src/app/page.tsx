import { Suspense } from "react";
import { getSessions } from "@/db/queries";
import { getCurrentUserId } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterBar } from "./filter-bar";
import { FocusPanel } from "./focus-panel";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  PencilEdit02Icon,
  Setting07Icon,
} from "@hugeicons/core-free-icons";
import { DeleteSessionButton } from "./delete-session-button";
import { SignOutButton } from "./sign-out-button";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; surface?: string; result?: string }>;
}) {
  const { type, surface, result } = await searchParams;
  const hasFilters = Boolean(type || surface || result);

  const userId = await getCurrentUserId();
  const rows = await getSessions(userId, { type, surface, result });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Break point</h1>
        <SignOutButton />
      </div>

      <div className="flex flex-col gap-4">
        <nav className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <FocusPanel />
            <Button
              render={<Link href="/briefing" />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              Briefing
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </Button>
            <Button
              render={<Link href="/insights" />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              Insights
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </Button>
            <Button
              render={<Link href="/chat" />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              Chat
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </Button>
          </div>
          <Button
            render={<Link href="/settings" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Settings
            <HugeiconsIcon icon={Setting07Icon} strokeWidth={2} />
          </Button>
        </nav>

        <div className="border-t border-border" />

        <div className="flex items-center justify-between gap-2">
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>
          <Button
            render={<Link href="/new" />}
            nativeButton={false}
            variant="secondary"
            size="sm"
            className="min-w-40 border-border border-foreground/20 font-semibold"
          >
            + New entry
          </Button>
        </div>
      </div>

      {rows.length === 0 && hasFilters && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">
            No sessions match these filters.
          </p>
        </div>
      )}

      {rows.length === 0 && !hasFilters && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No entries yet.</p>
          <Button
            render={<Link href="/new" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Log your first session
          </Button>
        </div>
      )}

      {rows.map((s) => (
        <Card key={s.id}>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{formatDate(s.date)}</span>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {s.surface && <Badge variant="outline">{s.surface}</Badge>}
                <Badge>{s.type}</Badge>
                <Button
                  render={
                    <Link href={`/edit/${s.id}`} aria-label="Edit entry" />
                  }
                  nativeButton={false}
                  variant="ghost"
                  size="icon-xs"
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                </Button>
                <DeleteSessionButton sessionId={s.id} />
              </div>
            </div>

            {s.type === "match" && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>
                  vs {s.opponent} — {s.score}
                </span>
                {s.result && (
                  <Badge
                    variant={s.result === "win" ? "default" : "destructive"}
                  >
                    {s.result}
                  </Badge>
                )}
              </div>
            )}

            {(s.durationMinutes || s.energy || s.mood) && (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {s.durationMinutes && <span>{s.durationMinutes} min</span>}
                {s.energy && <span>energy {s.energy}/5</span>}
                {s.mood && <span>mood {s.mood}/5</span>}
              </div>
            )}

            <p className="text-sm text-muted-foreground">{s.rawText}</p>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
