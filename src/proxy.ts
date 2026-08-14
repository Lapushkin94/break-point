import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  // Starts as a plain pass-through; setAll below rebuilds it (from the
  // cookie-updated request) only if getClaims() actually refreshes a token.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, val]) =>
            response.headers.set(key, val),
          );
        },
      },
    },
  );

  // getClaims(), not getUser()/getSession() — the current Supabase-mandated
  // way to verify a session server-side (self-adapts to symmetric/asymmetric
  // signing keys); also what actually drives the refresh-and-rewrite above.
  // data can be null even when error is falsy — check both, same as
  // getCurrentUserId() in src/lib/auth.ts.
  const { data, error } = await supabase.auth.getClaims();
  const isAuthed = !error && data !== null;

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isAuthed && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
