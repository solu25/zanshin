"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ToolName = "slack" | "granola" | "linear" | "google_cal" | "github" | "notion";

const VALID_TOOLS: ToolName[] = [
  "slack",
  "granola",
  "linear",
  "google_cal",
  "github",
  "notion",
];

export async function connectTools(formData: FormData) {
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

  const selected = VALID_TOOLS.filter(
    (t) => formData.get(`tool_${t}`) === "on",
  );

  if (selected.length > 0) {
    const { error } = await supabase
      .from("team_tools")
      .upsert(
        selected.map((tool_name) => ({
          team_id: teamId,
          tool_name,
          connected_by: user.id,
        })),
        { onConflict: "team_id,tool_name" },
      );

    if (error) return { ok: false, error: error.message } as const;
  }

  redirect("/");
}

export async function skipTools() {
  redirect("/");
}
