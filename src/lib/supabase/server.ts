import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in server components, route handlers, and
 * server actions. Reads the user's session from Next.js cookies, so
 * the same user identity that's authenticated in the browser is
 * respected here. Honors Row Level Security via the anon key.
 */
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
            // setAll was called from a Server Component (no response yet).
            // Middleware refreshes the session, so this is safe to swallow.
          }
        },
      },
    },
  );
}
