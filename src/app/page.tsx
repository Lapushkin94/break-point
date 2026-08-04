import { db } from "@/db";
import { sessions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <main>
      <div>
        <h1>Break point</h1>
        <Link href="/new">+ New entry</Link>
      </div>

      {rows.length === 0 && <p>No entries yet.</p>}

      {rows.map((s) => (
        <Card key={s.id}>
          <div>
            <span>{s.date}</span>
            <div>
              {s.surface && <Badge variant="outline">{s.surface}</Badge>}
              <Badge>{s.type}</Badge>
            </div>
          </div>

          {s.type === "match" && (
            <div>
              <span>
                vs {s.opponent} — {s.score}
              </span>
              {s.result && (
                <Badge variant={s.result === "win" ? "default" : "destructive"}>
                  {s.result}
                </Badge>
              )}
            </div>
          )}

          {(s.durationMinutes || s.energy || s.mood) && (
            <div>
              {s.durationMinutes && <span>{s.durationMinutes} min</span>}
              {s.energy && <span>energy {s.energy}/5</span>}
              {s.mood && <span>mood {s.mood}/5</span>}
            </div>
          )}

          <p>{s.rawText}</p>
        </Card>
      ))}
    </main>
  );
}
