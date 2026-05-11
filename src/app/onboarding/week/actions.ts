"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isoWeekMonday } from "@/lib/dates";

export async function setWeeklyGoal(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { ok: false, error: "Weekly goal is required" } as const;
  if (text.length > 280)
    return { ok: false, error: "Keep it under 280 characters" } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);
  const teamId = memberships?.[0]?.team_id;
  if (!teamId) redirect("/onboarding/team");

  // Upsert by (team_id, week_start) — if they edit and resubmit, replace.
  const weekStart = isoWeekMonday();
  const { error } = await supabase
    .from("weekly_goals")
    .upsert(
      { team_id: teamId, text, week_start: weekStart, created_by: user.id },
      { onConflict: "team_id,week_start" },
    );

  if (error) return { ok: false, error: error.message } as const;

  redirect("/onboarding/tools");
}
