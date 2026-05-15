import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { TeamForm } from "./team-form";

export default async function TeamStepPage({
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

  // Already on a team? Skip to the next step (unless explicitly revisiting via back link).
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);
  if (!isEdit && memberships && memberships.length > 0)
    redirect("/onboarding/goal");

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <OnboardingStepper current="team" />

      <div className="mt-16 w-full max-w-xl">
        <div className="inline-flex items-center gap-2">
          <span className="h-0.5 w-3 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            Step 1 of 3 · Your team
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight leading-tight text-charcoal">
          What should we call your team?
        </h1>
        <p className="mt-3 text-base italic text-linen leading-relaxed">
          Just for context — yours and the people you invite. Change it whenever.
        </p>

        <TeamForm />
      </div>
    </div>
  );
}
