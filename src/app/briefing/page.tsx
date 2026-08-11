import { getOpponents } from "@/db/queries";
import { BriefingForm } from "./briefing-form";

export default async function BriefingPage() {
  const opponents = await getOpponents();

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">Match briefing</h1>
      <BriefingForm opponents={opponents} />
    </main>
  );
}
