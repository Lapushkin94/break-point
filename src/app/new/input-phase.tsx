"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { VoiceRecorder } from "@/components/voice-recorder";

export function InputPhase({
  date,
  onDateChange,
  rawText,
  onRawTextChange,
  error,
  isPending,
  onParse,
  onSaveWithoutAI,
}: {
  date: string;
  onDateChange: (date: string) => void;
  rawText: string;
  onRawTextChange: (rawText: string) => void;
  error: string | null;
  isPending: boolean;
  onParse: () => void;
  onSaveWithoutAI: () => void;
}) {
  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          <VoiceRecorder
            onTranscript={(text) =>
              onRawTextChange(rawText ? `${rawText} ${text}` : text)
            }
          />

          <div className="space-y-1.5">
            <Label htmlFor="rawText">Notes</Label>
            <Textarea
              id="rawText"
              placeholder="Speak or type — match, rally, or training; who, score, what worked, what didn't, what the coach said."
              value={rawText}
              onChange={(e) => onRawTextChange(e.target.value)}
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        size="lg"
        onClick={onParse}
        disabled={isPending || !rawText}
      >
        {isPending ? "Reading..." : "Parse with AI"}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={onSaveWithoutAI}
        disabled={isPending || !rawText}
      >
        Save without AI
      </Button>
    </>
  );
}
