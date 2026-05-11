import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in client components ("use client").
 * Reads NEXT_PUBLIC_ env vars; respects Row Level Security via anon key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
