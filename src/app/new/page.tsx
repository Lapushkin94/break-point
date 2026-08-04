"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

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

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {type === "match" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  placeholder="Opponent"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  placeholder="e.g. 6:4 3:6 7:6"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Result</Label>
                <div className="grid grid-cols-2 gap-2">
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
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Surface</Label>
            <Select
              value={surface}
              onValueChange={(value) => setSurface(value ?? "")}
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

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                type="number"
                placeholder="min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
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
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rawText">Notes</Label>
            <Textarea
              id="rawText"
              placeholder="What happened? What worked, what fell apart, what did the coach say?"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={isPending || !rawText}
      >
        {isPending ? "Saving..." : "Save"}
      </Button>
    </main>
  );
}
