import { notFound } from "next/navigation";
import { getSessionById, getOpponentProfiles } from "@/db/queries";
import { getCurrentUserId } from "@/lib/auth";
import { EditForm } from "./edit-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const [session, opponents] = await Promise.all([
    getSessionById(id, userId),
    getOpponentProfiles(userId),
  ]);

  if (!session) notFound();

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
        <h1 className="text-xl font-semibold tracking-tight">Edit entry</h1>
      </div>
      <EditForm session={session} opponents={opponents} />
    </main>
  );
}
