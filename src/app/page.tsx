import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
  const supabase = await createClient();

  // Not logged in → go to /login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Logged in but no team → finish onboarding
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user.id)
    .limit(1);
  if (!memberships || memberships.length === 0) redirect("/onboarding/team");

  // Logged in + has team → real dashboard goes here (coming in Phase 3)
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="w-full max-w-xl">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold tracking-tight text-charcoal">
            zanshin
          </span>
          <span className="text-xl font-bold text-coral">.</span>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-pill border border-mist bg-white px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="text-xs font-semibold tracking-widest text-charcoal-soft uppercase">
            Phase 2 · authed
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-medium tracking-tight text-charcoal">
          You're in.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-charcoal-soft">
          Signed in as{" "}
          <span className="font-medium text-charcoal">{user.email}</span>.
        </p>
        <p className="mt-2 text-sm italic text-linen">
          The real dashboard (today's one thing + bonuses + week trail) lands in
          Phase 3.
        </p>

        <div className="mt-10">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
