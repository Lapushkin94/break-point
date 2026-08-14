"use client";

import { useState, useTransition, type FormEvent } from "react";
import { sendMagicLink } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialError);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await sendMagicLink(email);
        setSent(true);
      } catch (e) {
        console.error(e);
        setError("Couldn't send the link. Try again.");
      }
    });
  }

  if (sent) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-2 px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a sign-in link to {email}. Click it to continue.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6 sm:py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Break point</h1>
        <p className="text-sm text-muted-foreground">
          Your personal tennis training journal. Log a session in your own words
          and AI turns it into structured data — type, score, what worked, what
          to fix. From there: a quick focus suggestion before you head out, a
          tactical briefing before a rematch (built from your own notes on that
          opponent), and a monthly progress review.
        </p>
        <p className="text-sm text-muted-foreground">
          Sign in with just your email — no password. We&apos;ll send a one-time
          link; click it and you&apos;re in.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending || !email}>
          {isPending ? "Sending..." : "Send sign-in link"}
        </Button>
      </form>
    </main>
  );
}
