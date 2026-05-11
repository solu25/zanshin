import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth cookie on every request. Defensive: if
 * Supabase or env config has any trouble, we fall through with a plain
 * NextResponse.next() so the page still renders rather than 500-ing.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No env vars? Skip auth refresh, let the page handle it.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh the session cookie. If it errors, swallow it — the page-level
    // auth check in src/app/page.tsx will catch unauthenticated users.
    await supabase.auth.getUser();
  } catch (error) {
    console.error("[middleware] Supabase auth refresh failed:", error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT static assets and the auth callback. The
     * auth callback handles its own session exchange so we skip it here.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
