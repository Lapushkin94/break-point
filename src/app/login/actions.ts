"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function sendMagicLink(email: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) throw new Error(error.message);
}
