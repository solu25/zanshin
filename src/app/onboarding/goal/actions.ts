"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setMainGoal(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();

  if (!text) return { ok: false, error: "Goal text is required" } as const;
  if (!deadline)
    return { ok: false, error: "Deadline is required" } as const;
  if (text.length > 280)
    return { ok: false, error: "Keep it under 280 characters" } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find the user's team. Onboarding expects exactly one.
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);

  const teamId = memberships?.[0]?.team_id;
  if (!teamId) redirect("/onboarding/team");

  const { error } = await supabase
    .from("main_goals")
    .insert({
      team_id: teamId,
      text,
      deadline, // YYYY-MM-DD from <input type="date">
      created_by: user.id,
    });

  if (error) return { ok: false, error: error.message } as const;

  redirect("/onboarding/week");
}
