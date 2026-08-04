"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SURFACES = ["hard", "clay", "carpet"] as const;

export default function NewEntryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<"training" | "match">("training");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [opponent, setOpponent] = useState("");
  const [score, setScore] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "">("");
  const [surface, setSurface] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [energy, setEnergy] = useState("");
  const [mood, setMood] = useState("");
  const [rawText, setRawText] = useState("");

  function handleSubmit() {
    startTransition(async () => {
      await createSession({
        type,
        date,
        opponent: type === "match" ? opponent || null : null,
        score: type === "match" ? score || null : null,
        result: type === "match" && result ? result : null,
        surface: surface ? (surface as (typeof SURFACES)[number]) : null,
        durationMinutes: duration ? Number(duration) : null,
        energy: energy ? Number(energy) : null,
        mood: mood ? Number(mood) : null,
        rawText,
      });
      router.push("/");
    });
  }

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">New entry</h1>

      <div className="flex gap-2">
        <Button
          variant={type === "training" ? "default" : "outline"}
          onClick={() => setType("training")}
        >
          Training
        </Button>
        <Button
          variant={type === "match" ? "default" : "outline"}
          onClick={() => setType("match")}
        >
          Match
        </Button>
      </div>

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {type === "match" && (
        <>
          <Input
            placeholder="Opponent"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          />
          <Input
            placeholder="Score, e.g. 6:4 3:6 7:6"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant={result === "win" ? "default" : "outline"}
              onClick={() => setResult(result === "win" ? "" : "win")}
            >
              Win
            </Button>
            <Button
              variant={result === "loss" ? "default" : "outline"}
              onClick={() => setResult(result === "loss" ? "" : "loss")}
            >
              Loss
            </Button>
          </div>
        </>
      )}

      <Select
        value={surface}
        onValueChange={(value) => setSurface(value ?? "")}
      >
        <SelectTrigger>
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

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Duration (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Input
          type="number"
          min={1}
          max={5}
          placeholder="Energy 1–5"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
        />
        <Input
          type="number"
          min={1}
          max={5}
          placeholder="Mood 1–5"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
      </div>

      <Textarea
        placeholder="What happened? What worked, what fell apart, what did the coach say?"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={6}
      />

      <Button onClick={handleSubmit} disabled={isPending || !rawText}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </main>
  );
}
