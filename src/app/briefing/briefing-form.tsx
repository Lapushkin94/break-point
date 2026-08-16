"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { OpponentPicker } from "@/app/new/opponent-picker";

type OpponentProfile = {
  id: string;
  name: string;
  description: string | null;
};

export function BriefingForm({
  opponents,
  initialOpponentId,
  initialCompletion,
}: {
  opponents: OpponentProfile[];
  initialOpponentId?: string;
  initialCompletion?: string;
}) {
  const [opponentId, setOpponentId] = useState<string | null>(
    initialOpponentId ?? null,
  );

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/briefing",
    streamProtocol: "text",
    initialCompletion: initialCompletion ?? "",
  });

  function handleBrief() {
    if (!opponentId) return;
    complete("", { body: { opponentId } });
  }

  return (
    <div className="space-y-4">
      <OpponentPicker
        opponents={opponents}
        opponentId={opponentId}
        onChange={(value) => setOpponentId(value.opponentId)}
      />

      <Button
        className="w-full"
        onClick={handleBrief}
        disabled={!opponentId || isLoading}
      >
        {isLoading ? "Analyzing..." : "Brief me"}
      </Button>

      {error && (
        <p className="text-sm text-destructive">
          Couldn&apos;t generate a briefing. Try again.
        </p>
      )}

      {completion && (
        <div className="rounded-lg border border-border p-4">
          <Streamdown
            mode={isLoading ? "streaming" : "static"}
            className="prose prose-sm max-w-none"
          >
            {completion}
          </Streamdown>
        </div>
      )}
    </div>
  );
}
