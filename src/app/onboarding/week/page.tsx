import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { isoWeekMonday, addDaysISO } from "@/lib/dates";
import { WeekForm } from "./week-form";

export default async function WeekStepPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const isEdit = sp.edit === "1";

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

  const { data: mainGoals } = await supabase
    .from("main_goals")
    .select("text, deadline")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);
  const mainGoal = mainGoals?.[0];
  if (!mainGoal) redirect("/onboarding/goal");

  // If a weekly goal already exists for THIS week, onboarding is done — go to
  // the dashboard (unless revisiting via back).
  const weekStart = isoWeekMonday();
  const { data: existingWeekly } = await supabase
    .from("weekly_goals")
    .select("id, text")
    .eq("team_id", teamId)
    .eq("week_start", weekStart)
    .limit(1);
  if (!isEdit && existingWeekly && existingWeekly.length > 0)
    redirect("/");

  // Pre-fill the input: this week's goal if revisiting, otherwise carry over
  // last week's goal so a multi-week effort doesn't need retyping.
  const { data: lastWeekly } = await supabase
    .from("weekly_goals")
    .select("text")
    .eq("team_id", teamId)
    .eq("week_start", addDaysISO(weekStart, -7))
    .limit(1);
  const thisWeekText = existingWeekly?.[0]?.text ?? "";
  const lastWeekText = lastWeekly?.[0]?.text ?? "";
  const initialText = thisWeekText || lastWeekText;
  const carriedFromLastWeek = !thisWeekText && !!lastWeekText;

  // Format deadline for display
  const deadlineLabel = new Date(mainGoal.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <OnboardingStepper current="week" />

      <div className="mt-12 w-full max-w-xl">
        {/* Main goal context strip (mist-soft, faded) — lifted from Pencil P4 */}
        <div className="rounded-card border border-mist bg-mist-soft px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-3 bg-linen" />
              <span className="text-[9px] font-bold tracking-[1.4px] text-linen uppercase">
                Against this · main goal
              </span>
            </div>
            <span className="text-[11px] italic text-linen">
              by {deadlineLabel}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug text-charcoal">
            {mainGoal.text}
          </p>
        </div>

        <div className="mt-6 text-center text-coral">↓</div>

        <div className="mt-6 inline-flex items-center gap-2">
          <span className="h-0.5 w-3 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            Step 3 of 3 · This week
          </span>
        </div>

        <h1 className="mt-3 text-4xl font-medium tracking-tight leading-tight text-charcoal">
          What are you trying to get done this week?
        </h1>
        <p className="mt-3 text-base italic text-linen leading-relaxed">
          One concrete thing — specific enough that on Friday you'll know if
          you got it done.
        </p>

        <WeekForm
          initialText={initialText}
          carriedFromLastWeek={carriedFromLastWeek}
        />
      </div>
    </div>
  );
}
