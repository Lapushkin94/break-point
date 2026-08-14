import type { Session } from "@/db/schema";

const MAX_WEEKS = 12;

function mondayOf(dateStr: string): Date {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type SessionsPerWeekPoint = { week: string; count: number };

// Fills gaps with zero-count weeks (capped at the last MAX_WEEKS) rather than
// only plotting weeks that had a session — the whole point of this chart is
// making inconsistency visible, so a skipped week needs to show as a gap,
// not silently disappear from the x-axis.
export function sessionsPerWeek(sessions: Session[]): SessionsPerWeekPoint[] {
  if (sessions.length === 0) return [];

  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = mondayOf(s.date).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = mondayOf(new Date().toISOString().slice(0, 10));
  const earliestLogged = new Date(
    Math.min(...sessions.map((s) => mondayOf(s.date).getTime())),
  );
  const start = new Date(
    Math.max(
      earliestLogged.getTime(),
      today.getTime() - (MAX_WEEKS - 1) * 7 * 24 * 60 * 60 * 1000,
    ),
  );

  const points: SessionsPerWeekPoint[] = [];
  for (
    let d = new Date(start);
    d.getTime() <= today.getTime();
    d.setUTCDate(d.getUTCDate() + 7)
  ) {
    const key = d.toISOString().slice(0, 10);
    points.push({ week: shortDate(d), count: counts.get(key) ?? 0 });
  }
  return points;
}

export type WinLossPoint = { month: string; wins: number; losses: number };

// Unlike sessions-per-week, months without a match are simply omitted rather
// than padded with zeroes — matches are opportunistic, not something you'd
// expect on a regular cadence, so an empty month isn't a meaningful gap the
// way an empty training week is.
export function winLossByMonth(sessions: Session[]): WinLossPoint[] {
  const buckets = new Map<string, { wins: number; losses: number }>();
  for (const s of sessions) {
    if (s.type !== "match" || !s.result) continue;
    const key = s.date.slice(0, 7); // YYYY-MM
    const bucket = buckets.get(key) ?? { wins: 0, losses: 0 };
    if (s.result === "win") bucket.wins++;
    else bucket.losses++;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { wins, losses }]) => {
      const d = new Date(`${key}-01T00:00:00Z`);
      return {
        month: d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
        wins,
        losses,
      };
    });
}

export type TextOccurrence = { label: string; count: number };

// Literal string counting, not fuzzy matching — "wrong toss" and "bad toss"
// count separately. Normalizes only trivial variation (case, whitespace).
// Shared by topProblemAreas (whatFailed) and topStrengths (whatWorked) —
// same counting logic, different source array.
function topOccurrences(
  sessions: Session[],
  pick: (s: Session) => string[] | null,
  limit: number,
): TextOccurrence[] {
  const counts = new Map<string, { display: string; count: number }>();
  for (const s of sessions) {
    for (const raw of pick(s) ?? []) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { display: trimmed, count: 1 });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ display, count }) => ({ label: display, count }));
}

export function topProblemAreas(
  sessions: Session[],
  limit = 6,
): TextOccurrence[] {
  return topOccurrences(sessions, (s) => s.whatFailed, limit);
}

export function topStrengths(sessions: Session[], limit = 6): TextOccurrence[] {
  return topOccurrences(sessions, (s) => s.whatWorked, limit);
}
