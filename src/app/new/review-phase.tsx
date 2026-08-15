"use client";

import type { SessionParse } from "@/lib/ai/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { TagList } from "./tag-list";
import { OpponentPicker } from "./opponent-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = ["training", "match", "rally"] as const;
const SURFACES = ["hard", "clay", "carpet"] as const;

type OpponentProfile = {
  id: string;
  name: string;
  description: string | null;
};

type UpdateParsed = <K extends keyof SessionParse>(
  key: K,
  value: SessionParse[K],
) => void;

function TypeToggle({
  value,
  onChange,
}: {
  value: SessionParse["type"];
  onChange: (type: SessionParse["type"]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Type</Label>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => (
          <Button
            key={t}
            variant={value === t ? "default" : "outline"}
            onClick={() => onChange(t)}
            className="capitalize"
          >
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MatchFields({
  parsed,
  updateParsed,
  opponents,
}: {
  parsed: SessionParse;
  updateParsed: UpdateParsed;
  opponents: OpponentProfile[];
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label>Opponent</Label>
        <OpponentPicker
          opponents={opponents}
          opponentId={parsed.opponentId}
          onChange={({ opponentId, name, description }) => {
            updateParsed("opponentId", opponentId);
            updateParsed("opponent", name);
            updateParsed("opponentDescription", description);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="score">Score</Label>
        <Input
          id="score"
          placeholder="e.g. 6:4 3:6 7:6"
          value={parsed.score ?? ""}
          onChange={(e) => updateParsed("score", e.target.value || null)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Result</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={parsed.result === "win" ? "default" : "outline"}
            onClick={() =>
              updateParsed("result", parsed.result === "win" ? null : "win")
            }
          >
            Win
          </Button>
          <Button
            variant={parsed.result === "loss" ? "default" : "outline"}
            onClick={() =>
              updateParsed("result", parsed.result === "loss" ? null : "loss")
            }
          >
            Loss
          </Button>
        </div>
      </div>
    </>
  );
}

function SurfaceSelect({
  value,
  onChange,
}: {
  value: SessionParse["surface"];
  onChange: (surface: SessionParse["surface"]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Surface</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as SessionParse["surface"])}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Surface (optional)" />
        </SelectTrigger>
        <SelectContent>
          {SURFACES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RatingsRow({
  parsed,
  updateParsed,
}: {
  parsed: SessionParse;
  updateParsed: UpdateParsed;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="space-y-1.5">
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          type="number"
          placeholder="min"
          value={parsed.durationMinutes ?? ""}
          onChange={(e) =>
            updateParsed(
              "durationMinutes",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="energy">Energy</Label>
        <Input
          id="energy"
          type="number"
          min={1}
          max={5}
          placeholder="1–5"
          value={parsed.energy ?? ""}
          onChange={(e) =>
            updateParsed(
              "energy",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mood">Mood</Label>
        <Input
          id="mood"
          type="number"
          min={1}
          max={5}
          placeholder="1–5"
          value={parsed.mood ?? ""}
          onChange={(e) =>
            updateParsed(
              "mood",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        />
      </div>
    </div>
  );
}

export function ReviewPhase({
  parsed,
  updateParsed,
  date,
  onDateChange,
  rawText,
  onRawTextChange,
  isPending,
  onBack,
  onSave,
  opponents,
}: {
  parsed: SessionParse;
  updateParsed: UpdateParsed;
  date: string;
  onDateChange: (date: string) => void;
  rawText: string;
  onRawTextChange: (rawText: string) => void;
  isPending: boolean;
  onBack: () => void;
  onSave: () => void;
  opponents: OpponentProfile[];
}) {
  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <TypeToggle
            value={parsed.type}
            onChange={(type) => updateParsed("type", type)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          {parsed.type === "match" && (
            <MatchFields
              parsed={parsed}
              updateParsed={updateParsed}
              opponents={opponents}
            />
          )}

          <SurfaceSelect
            value={parsed.surface}
            onChange={(surface) => updateParsed("surface", surface)}
          />

          <RatingsRow parsed={parsed} updateParsed={updateParsed} />

          <div className="space-y-1.5">
            <Label htmlFor="rawText">Notes</Label>
            <Textarea
              id="rawText"
              value={rawText}
              onChange={(e) => onRawTextChange(e.target.value)}
              rows={6}
            />
          </div>

          <TagList
            label="What worked"
            values={parsed.whatWorked}
            onChange={(values) => updateParsed("whatWorked", values)}
            placeholder="Add something that worked"
          />
          <TagList
            label="What didn't work"
            values={parsed.whatFailed}
            onChange={(values) => updateParsed("whatFailed", values)}
            placeholder="Add something that didn't work"
          />
          {parsed.type === "match" ? (
            <TagList
              label="Opponent details"
              values={parsed.opponentDetails}
              onChange={(values) => updateParsed("opponentDetails", values)}
              placeholder="Add a weakness or habit to scout for next time"
            />
          ) : (
            <TagList
              label="Coach notes"
              values={parsed.coachNotes}
              onChange={(values) => updateParsed("coachNotes", values)}
              placeholder="Add a coach note"
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
}
