// Only the fields this function actually reads — lets callers pass either a
// full `Session` row or a narrower query projection (e.g. search results).
type SessionSummary = {
  type: string;
  date: string;
  opponent?: string | null;
  opponentDescription?: string | null;
  result?: string | null;
  score?: string | null;
  surface?: string | null;
  durationMinutes?: number | null;
  energy?: number | null;
  whatWorked?: string[] | null;
  whatFailed?: string[] | null;
  coachNotes?: string[] | null;
  opponentDetails?: string[] | null;
};

export function formatSessionsForPrompt(rows: SessionSummary[]): string {
  return rows
    .map((s) => {
      // The description is who this specific person is (disambiguates
      // opponents who share a name) — put it right next to the name, not
      // buried in the body, since that's the only place it's useful.
      const who =
        s.type === "match" && s.opponentDescription
          ? `${s.opponent ?? "unknown"} [${s.opponentDescription}]`
          : (s.opponent ?? "unknown");

      const header =
        s.type === "match"
          ? `${s.date} — MATCH vs ${who} (${s.result ?? "?"}) score ${s.score ?? "?"}`
          : s.type === "rally"
            ? `${s.date} — RALLY${s.opponent ? ` with ${s.opponent}` : ""}`
            : `${s.date} — TRAINING`;

      const whatWorked = s.whatWorked ?? [];
      const whatFailed = s.whatFailed ?? [];
      const coachNotes = s.coachNotes ?? [];
      const opponentDetails = s.opponentDetails ?? [];

      const lines = [
        s.surface ? `surface: ${s.surface}` : null,
        s.durationMinutes ? `duration: ${s.durationMinutes}min` : null,
        s.energy ? `energy: ${s.energy}/5` : null,
        whatWorked.length ? `worked: ${whatWorked.join("; ")}` : null,
        whatFailed.length ? `struggled: ${whatFailed.join("; ")}` : null,
        coachNotes.length ? `coach: ${coachNotes.join("; ")}` : null,
        opponentDetails.length
          ? `opponent notes: ${opponentDetails.join("; ")}`
          : null,
      ].filter(Boolean);

      return [header, ...lines].join("\n");
    })
    .join("\n\n");
}
