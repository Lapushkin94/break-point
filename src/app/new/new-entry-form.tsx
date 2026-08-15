"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/actions";
import { parseSessionText } from "@/lib/ai/parse";
import type { SessionParse } from "@/lib/ai/schemas";
import { Button } from "@/components/ui/button";
import { InputPhase } from "./input-phase";
import { ReviewPhase } from "./review-phase";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

type Phase = "input" | "review";

type OpponentProfile = {
  id: string;
  name: string;
  description: string | null;
};

function clampRating(value: number | null): number | null {
  if (value === null || !Number.isInteger(value) || value < 1 || value > 5)
    return null;
  return value;
}

export function NewEntryForm({ opponents }: { opponents: OpponentProfile[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>("input");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<SessionParse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateParsed<K extends keyof SessionParse>(
    key: K,
    value: SessionParse[K],
  ) {
    setParsed((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleParse() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await parseSessionText(rawText);
        setParsed({ ...result, opponentId: null });
        setPhase("review");
      } catch (e) {
        console.error(e);
        setError(
          "Couldn't parse that. You can still save it as a plain note below.",
        );
      }
    });
  }

  function handleSaveWithoutAI() {
    startTransition(async () => {
      await createSession({
        type: "training",
        date,
        rawText,
      });
      router.push("/");
    });
  }

  function handleSave() {
    if (!parsed) return;
    startTransition(async () => {
      await createSession({
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
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/" aria-label="Back" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New entry</h1>
      </div>

      {phase === "input" && (
        <InputPhase
          date={date}
          onDateChange={setDate}
          rawText={rawText}
          onRawTextChange={setRawText}
          error={error}
          isPending={isPending}
          onParse={handleParse}
          onSaveWithoutAI={handleSaveWithoutAI}
        />
      )}

      {phase === "review" && parsed && (
        <ReviewPhase
          parsed={parsed}
          updateParsed={updateParsed}
          date={date}
          onDateChange={setDate}
          rawText={rawText}
          onRawTextChange={setRawText}
          isPending={isPending}
          onBack={() => setPhase("input")}
          onSave={handleSave}
          opponents={opponents}
        />
      )}
    </main>
  );
}
