import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { ToolsForm } from "./tools-form";

export default async function ToolsStepPage() {
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

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <OnboardingStepper current="tools" />

      <div className="mt-16 w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2">
          <span className="h-0.5 w-3 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            Step 4 of 4 · Connect your tools · optional
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight leading-tight text-charcoal">
          Hook up the tools you already use.
        </h1>
        <p className="mt-3 text-base italic text-linen leading-relaxed">
          Auto-suggest from commits. Pull context from meetings. Get morning
          nudges where you already are. All optional, all reversible.
        </p>

        <ToolsForm />
      </div>
    </div>
  );
}
