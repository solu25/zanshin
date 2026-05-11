import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler.
 *
 * Supabase redirects here after the user clicks their magic-link email.
 * The URL looks like /auth/callback?code=<one-time-code>.
 *
 * We:
 *   1. Exchange the code for a session (sets cookies via the server client)
 *   2. Look up whether the user is already in a team
 *   3. Redirect: new user (no team) → /onboarding/team
 *               returning user (has team) → /
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Allow an explicit ?next= override to support deep-linking later.
  const next = searchParams.get("next") ?? null;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing-code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Where to send them next.
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no-session`);
  }

  // Look up team membership to decide first-time vs returning.
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);

  const hasTeam = (memberships?.length ?? 0) > 0;

  return NextResponse.redirect(
    `${origin}${hasTeam ? "/" : "/onboarding/team"}`,
  );
}
