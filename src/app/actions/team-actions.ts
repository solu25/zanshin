"use server";

import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function getUserTeam() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, teamId: null as string | null };

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user.id)
    .limit(1);
  const teamId = memberships?.[0]?.team_id ?? null;
  return { supabase, user, teamId };
}

export async function sendInvite(email: string): Promise<Result> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Email is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return { ok: false, error: "That doesn't look like a valid email" };

  const { supabase, user, teamId } = await getUserTeam();
  if (!user || !teamId)
    return { ok: false, error: "You're not signed in to a team" };

  const { error } = await supabase
    .from("invitations")
    .upsert(
      { team_id: teamId, email: trimmed, invited_by: user.id },
      { onConflict: "team_id,email" },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
