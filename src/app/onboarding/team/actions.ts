"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Create a team for the current user. The on-insert trigger
 * `add_team_creator_as_owner` automatically creates the team_members
 * row for the creator, so we only need to insert into teams here.
 */
export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Team name is required" } as const;
  }
  if (name.length > 80) {
    return { ok: false, error: "Team name is too long (80 max)" } as const;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("teams")
    .insert({ name, created_by: user.id });

  if (error) {
    return { ok: false, error: error.message } as const;
  }

  redirect("/onboarding/goal");
}
