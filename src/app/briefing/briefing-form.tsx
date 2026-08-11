"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BriefingForm({
  opponents,
  userLanguage = "English",
  initialOpponent,
  initialCompletion,
}: {
  opponents: string[];
  userLanguage?: string;
  initialOpponent?: string;
  initialCompletion?: string;
}) {
  const [opponent, setOpponent] = useState<string>(initialOpponent ?? "");

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/briefing",
    streamProtocol: "text",
    initialCompletion: initialCompletion ?? "",
  });

  function handleBrief() {
    if (!opponent) return;
    complete("", { body: { opponent, language: userLanguage } });
  }

  return (
    <div className="space-y-4">
      <Select value={opponent} onValueChange={(v) => setOpponent(v ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pick an opponent" />
        </SelectTrigger>
        <SelectContent>
          {opponents.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="w-full"
        onClick={handleBrief}
        disabled={!opponent || isLoading}
      >
        {isLoading ? "Analyzing..." : "Brief me"}
      </Button>

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
