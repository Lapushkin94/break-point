import { getInsights } from "@/db/queries";
import { Card, CardContent } from "@/components/ui/card";
import { GenerateSummaryButton } from "./generate-summary-button";
import { formatDate } from "@/lib/utils";

export default async function InsightsPage() {
  const rows = await getInsights();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>

      <GenerateSummaryButton />

      {rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No summaries yet.</p>
        </div>
      )}

      {rows.map((insight) => (
        <Card key={insight.id}>
          <CardContent className="space-y-2">
            <span className="font-medium">
              {formatDate(insight.periodStart)} –{" "}
              {formatDate(insight.periodEnd)}
            </span>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {insight.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
