import { createClient } from "@/lib/supabase/server";
import { isoWeekMonday, todayISO, weekTrailDates } from "@/lib/dates";

export type Member = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_color: string;
  role: string;
  is_you: boolean;
  daily_one_today: { id: string; text: string; is_complete: boolean } | null;
};

export type DashboardData = {
  user: { id: string; email: string };
  team: { id: string; name: string };
  mainGoal: { text: string; deadline: string } | null;
  weeklyGoal: { text: string; week_start: string } | null;
  members: Member[];
  myDailyOne: {
    id: string;
    text: string;
    is_complete: boolean;
    bonuses: Array<{
      id: string;
      text: string;
      is_complete: boolean;
      order_index: number;
    }>;
  } | null;
  recentShips: Array<{
    id: string;
    description: string;
    link: string | null;
    needs_eyes: boolean;
    shipped_at: string;
    author: {
      user_id: string;
      display_name: string | null;
      avatar_color: string;
      is_you: boolean;
    };
    reviews: Array<{ reviewer_id: string; reviewed_at: string }>;
  }>;
  trail: Array<{
    date: string;
    is_today: boolean;
    is_past: boolean;
    is_future: boolean;
    entries: Array<{
      user_id: string;
      display_name: string | null;
      avatar_color: string;
      text: string;
      is_complete: boolean;
    }>;
  }>;
};

/**
 * Load everything the dashboard needs in one place.
 *
 * Returns null if the user has no team (caller should redirect to onboarding).
 * Throws on actual DB errors so the page-level catch can surface them.
 */
export async function loadDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the user's team
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);

  const teamId = memberships?.[0]?.team_id;
  if (!teamId) return null;

  // 2. Team meta
  const { data: teamRow } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", teamId)
    .single();

  // 3. Main goal + weekly goal in parallel
  const today = todayISO();
  const weekStart = isoWeekMonday();
  const trailDates = weekTrailDates();

  const [
    mainGoalQ,
    weeklyGoalQ,
    membersQ,
    myDailyOneQ,
    shipsQ,
    trailEntriesQ,
  ] = await Promise.all([
    supabase
      .from("main_goals")
      .select("text, deadline")
      .eq("team_id", teamId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weekly_goals")
      .select("text, week_start")
      .eq("team_id", teamId)
      .eq("week_start", weekStart)
      .maybeSingle(),
    // All members in the team + their profiles
    supabase
      .from("team_members")
      .select("user_id, role, avatar_color, profiles!inner(display_name, email)")
      .eq("team_id", teamId),
    // Your daily_one for today + bonuses
    supabase
      .from("daily_ones")
      .select("id, text, is_complete, bonuses(id, text, is_complete, order_index)")
      .eq("user_id", user.id)
      .eq("team_id", teamId)
      .eq("date", today)
      .maybeSingle(),
    // Recent ships for this team (last 20)
    supabase
      .from("ships")
      .select(
        "id, user_id, description, link, needs_eyes, shipped_at, ship_reviews(reviewer_id, reviewed_at)",
      )
      .eq("team_id", teamId)
      .order("shipped_at", { ascending: false })
      .limit(20),
    // All daily_ones in the trail date range, for any team member
    supabase
      .from("daily_ones")
      .select("user_id, date, text, is_complete")
      .eq("team_id", teamId)
      .in("date", trailDates),
  ]);

  // ---- Members (with my-flag, with today's daily_one) ----
  // Supabase types !inner joins as arrays — flatten the first row.
  type RawMember = {
    user_id: string;
    role: string;
    avatar_color: string;
    profiles:
      | { display_name: string | null; email: string | null }
      | Array<{ display_name: string | null; email: string | null }>;
  };
  const rawMembers = ((membersQ.data ?? []) as RawMember[]).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    avatar_color: m.avatar_color,
    profiles: Array.isArray(m.profiles)
      ? (m.profiles[0] ?? { display_name: null, email: null })
      : m.profiles,
  }));

  // Build a lookup of today's daily_ones per user for showing on member rows
  const todayEntries = new Map(
    (trailEntriesQ.data ?? [])
      .filter((r: { date: string }) => r.date === today)
      .map((r: { user_id: string; text: string; is_complete: boolean }) => [
        r.user_id,
        { text: r.text, is_complete: r.is_complete },
      ]),
  );

  const members: Member[] = rawMembers
    .map((m) => ({
      user_id: m.user_id,
      display_name: m.profiles.display_name,
      email: m.profiles.email,
      avatar_color: m.avatar_color,
      role: m.role,
      is_you: m.user_id === user.id,
      daily_one_today: todayEntries.has(m.user_id)
        ? { id: "", ...todayEntries.get(m.user_id)! }
        : null,
    }))
    .sort((a, b) => {
      if (a.is_you !== b.is_you) return a.is_you ? -1 : 1;
      return (a.display_name ?? "").localeCompare(b.display_name ?? "");
    });

  // ---- Ships (resolve author info, sort bonuses) ----
  const profilesByUserId = new Map(
    rawMembers.map((m) => [
      m.user_id,
      {
        display_name: m.profiles.display_name,
        avatar_color: m.avatar_color,
      },
    ]),
  );

  type RawShip = {
    id: string;
    user_id: string;
    description: string;
    link: string | null;
    needs_eyes: boolean;
    shipped_at: string;
    ship_reviews: Array<{ reviewer_id: string; reviewed_at: string }>;
  };

  const recentShips = (shipsQ.data ?? []).map((s: RawShip) => {
    const authorProfile = profilesByUserId.get(s.user_id);
    return {
      id: s.id,
      description: s.description,
      link: s.link,
      needs_eyes: s.needs_eyes,
      shipped_at: s.shipped_at,
      author: {
        user_id: s.user_id,
        display_name: authorProfile?.display_name ?? null,
        avatar_color: authorProfile?.avatar_color ?? "coral",
        is_you: s.user_id === user.id,
      },
      reviews: s.ship_reviews ?? [],
    };
  });

  // ---- Trail (for each date, gather entries by user) ----
  type RawTrailEntry = {
    user_id: string;
    date: string;
    text: string;
    is_complete: boolean;
  };
  const trailEntriesByDate = new Map<string, RawTrailEntry[]>();
  for (const e of (trailEntriesQ.data ?? []) as RawTrailEntry[]) {
    if (!trailEntriesByDate.has(e.date)) trailEntriesByDate.set(e.date, []);
    trailEntriesByDate.get(e.date)!.push(e);
  }

  const trail = trailDates.map((date) => {
    const entries = (trailEntriesByDate.get(date) ?? []).map((e) => {
      const p = profilesByUserId.get(e.user_id);
      return {
        user_id: e.user_id,
        display_name: p?.display_name ?? null,
        avatar_color: p?.avatar_color ?? "coral",
        text: e.text,
        is_complete: e.is_complete,
      };
    });
    return {
      date,
      is_today: date === today,
      is_past: date < today,
      is_future: date > today,
      entries,
    };
  });

  // ---- My daily_one for today (if any) ----
  const myRaw = myDailyOneQ.data as
    | {
        id: string;
        text: string;
        is_complete: boolean;
        bonuses: Array<{
          id: string;
          text: string;
          is_complete: boolean;
          order_index: number;
        }>;
      }
    | null;

  return {
    user: { id: user.id, email: user.email ?? "" },
    team: teamRow ? { id: teamRow.id, name: teamRow.name } : { id: teamId, name: "Team" },
    mainGoal: mainGoalQ.data ?? null,
    weeklyGoal: weeklyGoalQ.data ?? null,
    members,
    myDailyOne: myRaw
      ? {
          id: myRaw.id,
          text: myRaw.text,
          is_complete: myRaw.is_complete,
          bonuses: (myRaw.bonuses ?? []).sort(
            (a, b) => a.order_index - b.order_index,
          ),
        }
      : null,
    recentShips,
    trail,
  };
}
