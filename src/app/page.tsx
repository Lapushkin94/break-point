import { db } from "@/db";
import { sessions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { and, eq, desc, type SQL } from "drizzle-orm";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; surface?: string; result?: string }>;
}) {
  const { type, surface, result } = await searchParams;

  const filters: SQL[] = [];
  if (type === "match" || type === "training")
    filters.push(eq(sessions.type, type));
  if (surface) filters.push(eq(sessions.surface, surface as any));
  if (result === "win" || result === "loss")
    filters.push(eq(sessions.result, result));

  const rows = await db
    .select()
    .from(sessions)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(sessions.date));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Break point</h1>
        <Button render={<Link href="/new" />} nativeButton={false} size="sm">
          + New entry
        </Button>
      </div>

      {rows.length === 0 && (
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
              <span className="font-medium">{s.date}</span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {s.surface && <Badge variant="outline">{s.surface}</Badge>}
                <Badge>{s.type}</Badge>
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
