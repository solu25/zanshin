"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function dropShip({
  description,
  link,
  needsEyes,
}: {
  description: string;
  link?: string;
  needsEyes?: boolean;
}): Promise<Result> {
  const trimmed = description.trim();
  if (!trimmed) return { ok: false, error: "Description is required" };
  if (trimmed.length > 1000)
    return { ok: false, error: "Keep it under 1000 characters" };

  const linkTrimmed = link?.trim() || null;
  if (linkTrimmed) {
    try {
      new URL(linkTrimmed);
    } catch {
      return { ok: false, error: "Link doesn't look like a URL" };
    }
  }

  const { supabase, user, teamId } = await authedClient();
  if (!user || !teamId) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("ships").insert({
    user_id: user.id,
    team_id: teamId,
    description: trimmed,
    link: linkTrimmed,
    needs_eyes: !!needsEyes,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reviewShip(shipId: string): Promise<Result> {
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("ship_reviews")
    .upsert(
      { ship_id: shipId, reviewer_id: user.id },
      { onConflict: "ship_id,reviewer_id" },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
