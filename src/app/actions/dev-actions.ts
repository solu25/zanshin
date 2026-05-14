"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Dev affordance: reset the current user's onboarding state so they can
 * walk through the flow again. Form-action signature (returns void).
 *
 * - If the user is the SOLE member of a team, the team is deleted (everything
 *   cascades — main_goals, weekly_goals, daily_ones, bonuses, ships).
 * - If the team has other members, just removes the user's membership and
 *   their personal data (daily_ones, ships); the team and shared goals
 *   remain intact for teammates.
 *
 * Throws on DB errors. Redirects to /onboarding/team on success.
 */
export async function resetOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships, error: mErr } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id);

  if (mErr) throw new Error(mErr.message);

  for (const { team_id } of memberships ?? []) {
    const { count, error: cErr } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", team_id);

    if (cErr) throw new Error(cErr.message);

    if (count === 1) {
      const { error: delTeamErr } = await supabase
        .from("teams")
        .delete()
        .eq("id", team_id);
      if (delTeamErr) throw new Error(delTeamErr.message);
    } else {
      const { error: leaveErr } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", team_id)
        .eq("user_id", user.id);
      if (leaveErr) throw new Error(leaveErr.message);
    }
  }

  await supabase.from("daily_ones").delete().eq("user_id", user.id);
  await supabase.from("ships").delete().eq("user_id", user.id);

  redirect("/onboarding/team");
}
