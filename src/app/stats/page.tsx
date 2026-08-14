import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { getSessions } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import {
  sessionsPerWeek,
  winLossByMonth,
  topProblemAreas,
  topStrengths,
} from "./aggregate";
import { SessionsPerWeekChart } from "./sessions-per-week-chart";
import { WinLossChart } from "./win-loss-chart";
import { HorizontalBarChart } from "./horizontal-bar-chart";

export default async function StatsPage() {
  const userId = await getCurrentUserId();
  const rows = await getSessions(userId);

  const weekly = sessionsPerWeek(rows);
  const winLoss = winLossByMonth(rows);
  const problems = topProblemAreas(rows);
  const strengths = topStrengths(rows);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/" aria-label="Back" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions per week</CardTitle>
        </CardHeader>
        <CardContent>
          {weekly.length > 0 ? (
            <SessionsPerWeekChart data={weekly} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Log a few sessions to see your training volume over time.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Win / loss</CardTitle>
        </CardHeader>
        <CardContent>
          {winLoss.length > 0 ? (
            <WinLossChart data={winLoss} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Log a match with a result to see your competitive trajectory.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recurring problem areas</CardTitle>
        </CardHeader>
        <CardContent>
          {problems.length > 0 ? (
            <HorizontalBarChart
              data={problems}
              color="var(--color-chart-3)"
              countLabel="Times mentioned"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Log what didn&apos;t work in a few sessions to see your most
              common issues.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What worked</CardTitle>
        </CardHeader>
        <CardContent>
          {strengths.length > 0 ? (
            <HorizontalBarChart
              data={strengths}
              color="var(--color-primary)"
              countLabel="Times mentioned"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Log what worked in a few sessions to see your most consistent
              strengths.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
