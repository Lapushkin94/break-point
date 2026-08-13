import { getInsights } from "@/db/queries";
import { getCurrentUserId } from "@/lib/auth";
import { Streamdown } from "streamdown";
import { Card, CardContent } from "@/components/ui/card";
import { GenerateSummaryButton } from "./generate-summary-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default async function InsightsPage() {
  const userId = await getCurrentUserId();
  const rows = await getInsights(userId);

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
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
      </div>

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
            <Streamdown mode="static" className="prose prose-sm max-w-none">
              {insight.content}
            </Streamdown>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
