"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOpponentAction } from "@/app/actions";

const NEW_OPPONENT = "__new__";

type OpponentProfile = {
  id: string;
  name: string;
  description: string | null;
};

export function OpponentPicker({
  opponents,
  opponentId,
  onChange,
}: {
  opponents: OpponentProfile[];
  opponentId: string | null;
  onChange: (value: {
    opponentId: string | null;
    name: string | null;
    description: string | null;
  }) => void;
}) {
  const [localOpponents, setLocalOpponents] = useState(opponents);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSelect(value: string | null) {
    if (!value) return;
    if (value === NEW_OPPONENT) {
      setNewName("");
      setNewDescription("");
      setCreating(true);
      return;
    }
    const picked = localOpponents.find((o) => o.id === value);
    if (!picked) return;
    onChange({
      opponentId: picked.id,
      name: picked.name,
      description: picked.description,
    });
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      const created = await createOpponentAction(
        name,
        newDescription.trim() || null,
      );
      setLocalOpponents((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onChange({
        opponentId: created.id,
        name: created.name,
        description: created.description,
      });
      setCreating(false);
    });
  }

  if (creating) {
    return (
      <div className="space-y-3 rounded-xl border border-border p-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-opponent-name">New opponent name</Label>
          <Input
            id="new-opponent-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. George"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-opponent-description">
            Description
            <span className="font-normal text-muted-foreground">
              {" "}
              — who is this, if the name isn&apos;t unique
            </span>
          </Label>
          <Input
            id="new-opponent-description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="e.g. young guy with black hair, British accent"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCreating(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreate}
            disabled={isPending || !newName.trim()}
          >
            {isPending ? "Adding..." : "Add opponent"}
          </Button>
        </div>
      </div>
    );
  }

  function label(o: OpponentProfile) {
    return o.description ? `${o.name} — ${o.description}` : o.name;
  }

  return (
    // Always a defined string (never undefined) so the Select stays
    // controlled from the first render — switching from undefined to a real
    // value once something's picked would flip it from uncontrolled to
    // controlled mid-lifetime, which Base UI (rightly) warns against.
    <Select value={opponentId ?? ""} onValueChange={handleSelect}>
      <SelectTrigger className="w-full">
        {/* Base UI doesn't fall back to `placeholder` once a children
        render-prop is given — the function has to return the placeholder
        text itself when nothing's picked yet. */}
        <SelectValue placeholder="Pick an opponent">
          {(value: string | null) => {
            const picked = localOpponents.find((o) => o.id === value);
            return picked ? label(picked) : "Pick an opponent";
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {localOpponents.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {label(o)}
          </SelectItem>
        ))}
        <SelectItem value={NEW_OPPONENT}>+ Add new opponent</SelectItem>
      </SelectContent>
    </Select>
  );
}
