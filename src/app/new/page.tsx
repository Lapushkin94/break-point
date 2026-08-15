import { getCurrentUserId } from "@/lib/auth";
import { getOpponentProfiles } from "@/db/queries";
import { NewEntryForm } from "./new-entry-form";

export default async function NewEntryPage() {
  const userId = await getCurrentUserId();
  const opponents = await getOpponentProfiles(userId);

  return <NewEntryForm opponents={opponents} />;
}
