import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Every caller scopes its query/cache by this value. cache() dedupes repeat
// calls within one render/request pass — getClaims() is a real network round
// trip unless the project uses asymmetric JWT signing keys.
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;
  return data.claims.sub;
});
