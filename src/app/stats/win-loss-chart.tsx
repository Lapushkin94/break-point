"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WinLossPoint } from "./aggregate";

// Reuses the same colors the win/loss Badges already use on session cards
// (default/primary for a win, destructive for a loss), so this chart reads
// consistently with the rest of the app rather than introducing new meaning
// for a color.
const chartConfig = {
  wins: { label: "Wins", color: "var(--color-primary)" },
  losses: { label: "Losses", color: "var(--color-destructive)" },
} satisfies ChartConfig;

export function WinLossChart({ data }: { data: WinLossPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ left: -20 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={30}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="wins" fill="var(--color-wins)" radius={4} />
        <Bar dataKey="losses" fill="var(--color-losses)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
