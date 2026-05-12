"use server";

import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/dates";

type Result<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

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
  return {
    supabase,
    user,
    teamId: memberships?.[0]?.team_id ?? null,
  };
}

/**
 * Create or update a daily_one (main one-thing) for the current user on a
 * given date. Defaults to today. Idempotent: re-submitting overwrites.
 */
export async function setDailyOne(
  text: string,
  date?: string,
): Promise<Result<{ id: string }>> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Type something for the day" };
  if (trimmed.length > 280)
    return { ok: false, error: "Keep it under 280 characters" };

  const { supabase, user, teamId } = await authedClient();
  if (!user || !teamId) return { ok: false, error: "Not authenticated" };

  const targetDate = date ?? todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate))
    return { ok: false, error: "Invalid date" };

  const { data, error } = await supabase
    .from("daily_ones")
    .upsert(
      {
        user_id: user.id,
        team_id: teamId,
        text: trimmed,
        date: targetDate,
      },
      { onConflict: "user_id,date" },
    )
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data!.id } };
}

export async function deleteDailyOne(date?: string): Promise<Result> {
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Not authenticated" };

  const targetDate = date ?? todayISO();
  const { error } = await supabase
    .from("daily_ones")
    .delete()
    .eq("user_id", user.id)
    .eq("date", targetDate);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Add a bonus task under the current user's daily_one for today.
 */
export async function addBonus(text: string): Promise<Result> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Bonus needs text" };
  if (trimmed.length > 200)
    return { ok: false, error: "Keep it under 200 characters" };

  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Not authenticated" };

  const today = todayISO();

  // Need the daily_one id first
  const { data: dailyOne, error: lookupErr } = await supabase
    .from("daily_ones")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!dailyOne) return { ok: false, error: "Set the main thing first" };

  // Append at the end
  const { data: existing } = await supabase
    .from("bonuses")
    .select("order_index")
    .eq("daily_one_id", dailyOne.id)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

  const { error } = await supabase.from("bonuses").insert({
    daily_one_id: dailyOne.id,
    text: trimmed,
    order_index: nextIndex,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function toggleBonus(
  bonusId: string,
  complete: boolean,
): Promise<Result> {
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("bonuses")
    .update({
      is_complete: complete,
      completed_at: complete ? new Date().toISOString() : null,
    })
    .eq("id", bonusId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBonus(bonusId: string): Promise<Result> {
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("bonuses").delete().eq("id", bonusId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
