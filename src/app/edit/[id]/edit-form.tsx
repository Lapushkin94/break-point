"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSession } from "@/app/actions";
import type { Session } from "@/db/schema";
import type { SessionParse } from "@/lib/ai/schemas";
import { ReviewPhase } from "@/app/new/review-phase";

type OpponentProfile = {
  id: string;
  name: string;
  description: string | null;
};

function sessionToParsed(session: Session): SessionParse {
  return {
    type: session.type,
    opponent: session.opponent,
    opponentDescription: session.opponentDescription,
    opponentId: session.opponentId,
    score: session.score,
    result: session.result,
    surface: session.surface,
    durationMinutes: session.durationMinutes,
    energy: session.energy,
    mood: session.mood,
    whatWorked: session.whatWorked ?? [],
    whatFailed: session.whatFailed ?? [],
    coachNotes: session.coachNotes ?? [],
    opponentDetails: session.opponentDetails ?? [],
  };
}

function clampRating(value: number | null): number | null {
  if (value === null || !Number.isInteger(value) || value < 1 || value > 5)
    return null;
  return value;
}

export function EditForm({
  session,
  opponents,
}: {
  session: Session;
  opponents: OpponentProfile[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(session.date);
  const [rawText, setRawText] = useState(session.rawText);
  const [parsed, setParsed] = useState<SessionParse>(() =>
    sessionToParsed(session),
  );
  const [error, setError] = useState<string | null>(null);

  function updateParsed<K extends keyof SessionParse>(
    key: K,
    value: SessionParse[K],
  ) {
    setParsed((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateSession(session.id, {
          type: parsed.type,
          date,
          opponent: parsed.type === "match" ? parsed.opponent || null : null,
          opponentDescription:
            parsed.type === "match" ? parsed.opponentDescription || null : null,
          opponentId: parsed.type === "match" ? parsed.opponentId : null,
          score: parsed.type === "match" ? parsed.score || null : null,
          result: parsed.type === "match" ? parsed.result : null,
          surface: parsed.surface,
          durationMinutes: parsed.durationMinutes,
          energy: clampRating(parsed.energy),
          mood: clampRating(parsed.mood),
          rawText,
          whatWorked: parsed.whatWorked,
          whatFailed: parsed.whatFailed,
          coachNotes: parsed.coachNotes,
          opponentDetails: parsed.opponentDetails,
        });
        router.push("/");
      } catch (e) {
        console.error(e);
        setError("Couldn't save your changes. Try again.");
      }
    });
  }

  return (
    <>
      <ReviewPhase
        parsed={parsed}
        updateParsed={updateParsed}
        date={date}
        onDateChange={setDate}
        rawText={rawText}
        onRawTextChange={setRawText}
        isPending={isPending}
        onBack={() => router.push("/")}
        onSave={handleSave}
        opponents={opponents}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}
