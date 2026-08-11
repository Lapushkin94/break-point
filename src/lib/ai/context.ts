import type { Session } from "@/db/schema";

export function formatSessionsForPrompt(rows: Session[]): string {
  return rows
    .map((s) => {
      const header =
        s.type === "match"
          ? `${s.date} — MATCH vs ${s.opponent ?? "unknown"} (${s.result ?? "?"}) score ${s.score ?? "?"}`
          : s.type === "rally"
            ? `${s.date} — RALLY${s.opponent ? ` with ${s.opponent}` : ""}`
            : `${s.date} — TRAINING`;

      const whatWorked = s.whatWorked ?? [];
      const whatFailed = s.whatFailed ?? [];
      const coachNotes = s.coachNotes ?? [];

      const lines = [
        s.surface ? `surface: ${s.surface}` : null,
        s.durationMinutes ? `duration: ${s.durationMinutes}min` : null,
        s.energy ? `energy: ${s.energy}/5` : null,
        whatWorked.length ? `worked: ${whatWorked.join("; ")}` : null,
        whatFailed.length ? `struggled: ${whatFailed.join("; ")}` : null,
        coachNotes.length ? `coach: ${coachNotes.join("; ")}` : null,
      ].filter(Boolean);

      return [header, ...lines].join("\n");
    })
    .join("\n\n");
}
