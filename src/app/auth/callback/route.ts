import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Best-effort: getUserLanguage() already falls back to "en" when no
      // profile row exists, so a hiccup here shouldn't block signing in.
      try {
        await getOrCreateProfile(data.user.id);
      } catch (e) {
        console.error("Failed to provision profile:", e);
      }
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
