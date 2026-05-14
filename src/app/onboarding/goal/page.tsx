import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { GoalForm } from "./goal-form";

export default async function GoalStepPage({
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

  // Need a team first.
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);
  const teamId = memberships?.[0]?.team_id;
  if (!teamId) redirect("/onboarding/team");

  // If an active main goal already exists, skip ahead (unless revisiting via back).
  const { data: existingGoal } = await supabase
    .from("main_goals")
    .select("id")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .limit(1);
  if (!isEdit && existingGoal && existingGoal.length > 0)
    redirect("/onboarding/week");

  // Default deadline: ~3 months out (90 days)
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 90);
  const defaultDeadlineISO = defaultDeadline.toISOString().slice(0, 10);

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <OnboardingStepper current="goal" />

      <div className="mt-16 w-full max-w-xl">
        <Link
          href="/onboarding/team?edit=1"
          className="text-xs italic text-linen transition-colors hover:text-charcoal-soft"
        >
          ← back
        </Link>
        <div className="mt-6 inline-flex items-center gap-2">
          <span className="h-0.5 w-3 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            Step 2 of 4 · Main goal · ~3 months
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight leading-tight text-charcoal">
          What's the big thing you're working toward?
        </h1>
        <p className="mt-3 text-base italic text-linen leading-relaxed">
          This is the anchor. It'll live at the top of the app for the next few
          months. One specific outcome — something you'll know you've hit.
        </p>

        <GoalForm defaultDeadline={defaultDeadlineISO} />
      </div>
    </div>
  );
}
