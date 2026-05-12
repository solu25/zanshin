"use server";

import { createClient } from "@/lib/supabase/server";
import { isoWeekMonday } from "@/lib/dates";

type Result = { ok: true } | { ok: false; error: string };

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, teamId: null as string | null };

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);
  return { supabase, user, teamId: memberships?.[0]?.team_id ?? null };
}

/**
 * Update the team's active main goal text and/or deadline.
 * Looks up the most recent active main_goal and overwrites it.
 */
export async function updateMainGoal({
  text,
  deadline,
}: {
  text: string;
  deadline: string;
}): Promise<Result> {
  const trimmedText = text.trim();
  if (!trimmedText) return { ok: false, error: "Goal text is required" };
  if (trimmedText.length > 280)
    return { ok: false, error: "Keep it under 280 characters" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline))
    return { ok: false, error: "Deadline must be a valid date" };

  const { supabase, user, teamId } = await authedClient();
  if (!user || !teamId) return { ok: false, error: "Not authenticated" };

  // Find the currently active main goal
  const { data: active, error: lookupErr } = await supabase
    .from("main_goals")
    .select("id")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupErr) return { ok: false, error: lookupErr.message };

  if (active) {
    const { error } = await supabase
      .from("main_goals")
      .update({ text: trimmedText, deadline })
      .eq("id", active.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("main_goals").insert({
      team_id: teamId,
      text: trimmedText,
      deadline,
      created_by: user.id,
    });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Upsert this week's goal for the user's team. Used by the inline-editable
 * banner on the dashboard — no redirect, returns a Result.
 */
export async function updateWeeklyGoal(text: string): Promise<Result> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Weekly goal is required" };
  if (trimmed.length > 280)
    return { ok: false, error: "Keep it under 280 characters" };

  const { supabase, user, teamId } = await authedClient();
  if (!user || !teamId) return { ok: false, error: "Not authenticated" };

  const weekStart = isoWeekMonday();
  const { error } = await supabase
    .from("weekly_goals")
    .upsert(
      { team_id: teamId, text: trimmed, week_start: weekStart, created_by: user.id },
      { onConflict: "team_id,week_start" },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
