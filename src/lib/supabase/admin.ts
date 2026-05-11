import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses the service_role key, BYPASSES Row Level
 * Security. Use ONLY in trusted server contexts (route handlers, server
 * actions, scripts). Never import this from a "use client" file or pass
 * the resulting client to the browser.
 *
 * Reserve for: signups, invitation acceptance, scheduled jobs, anything
 * that needs to mutate other users' rows.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing — admin client cannot be created.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
