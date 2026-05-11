"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Dev-mode passwordless sign-in helper.
 *
 * Runs server-side so it can use the service_role admin client to create
 * users with `email_confirm: true` — this skips Supabase's email send
 * entirely (no confirmation email, no welcome email, no rate-limit
 * consumption).
 *
 * After this returns ok, the client calls signInWithPassword() with the
 * same email + derived password to establish a session.
 *
 * NOT for production. Real auth (magic links or OAuth) replaces this
 * before public launch.
 */
export async function ensureDevUserExists(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!email || !password) {
    return { ok: false, error: "Email and password are required" };
  }

  const admin = createAdminClient();

  // Try to create the user. If they already exist, that's fine.
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // mark confirmed -> no email sent
  });

  if (!createError) return { ok: true };

  // Most common: "User already registered" -> we're done, sign-in will work
  const msg = createError.message.toLowerCase();
  if (
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("duplicate")
  ) {
    return { ok: true };
  }

  // Anything else is a real problem.
  return { ok: false, error: createError.message };
}
