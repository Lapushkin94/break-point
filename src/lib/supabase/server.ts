import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For Server Components and Server Actions. setAll is wrapped in try/catch
// because Server Components can't set cookies during render — that's fine,
// proxy.ts refreshes the session and writes cookies back on every request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore, proxy.ts handles it.
          }
        },
      },
    },
  );
}
