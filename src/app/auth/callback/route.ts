import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/db/queries";
import type { EmailOtpType } from "@supabase/supabase-js";

// token_hash + verifyOtp, not exchangeCodeForSession(code) — the latter is
// PKCE, which requires the code verifier stored by the browser that
// requested the link. On mobile, tapping the email link commonly opens in a
// different browser/in-app webview than the one that requested it, so the
// verifier is missing and the exchange fails silently. token_hash carries
// everything needed in the URL itself, so it works from any browser/device.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error && data.user) {
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
