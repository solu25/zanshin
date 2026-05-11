import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function OnboardingTeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="w-full max-w-xl">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold tracking-tight text-charcoal">
            zanshin
          </span>
          <span className="text-xl font-bold text-coral">.</span>
        </div>

        <div className="mt-10 inline-flex items-center gap-2">
          <span className="h-0.5 w-3 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            Step 1 of 4 · Your team
          </span>
        </div>

        <h1 className="mt-3 text-4xl font-medium tracking-tight leading-tight text-charcoal">
          Welcome,{" "}
          <span className="text-coral">{user.email?.split("@")[0]}</span>.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-charcoal-soft">
          You signed in successfully. The real onboarding form lands next — name
          your team, set your 3-month main goal, pick this week's slice.
        </p>
        <p className="mt-2 text-xs italic text-linen">
          Magic-link auth round-trip · verified.
        </p>

        <div className="mt-10">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
