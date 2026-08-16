import { getOpponentProfiles, getBriefingCache } from "@/db/queries";
import { getCurrentUserId } from "@/lib/auth";
import { isFresh } from "@/lib/cache";
import { BriefingForm } from "./briefing-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default async function BriefingPage() {
  const userId = await getCurrentUserId();
  const [opponents, cache] = await Promise.all([
    getOpponentProfiles(userId),
    getBriefingCache(userId),
  ]);

  // opponentId is null for cache rows written before that column existed —
  // treat those as stale rather than pre-populating a picker with nothing.
  const isCacheFresh =
    cache !== null && cache.opponentId !== null && isFresh(cache.generatedAt);

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
        <h1 className="text-xl font-semibold tracking-tight">Match briefing</h1>
      </div>
      <BriefingForm
        opponents={opponents}
        initialOpponentId={
          isCacheFresh ? (cache.opponentId ?? undefined) : undefined
        }
        initialCompletion={isCacheFresh ? cache.content : undefined}
      />
    </main>
  );
}
