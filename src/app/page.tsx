import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardData } from "@/lib/dashboard-data";
import { Sidebar } from "@/components/dashboard/sidebar";
import { NewMainColumn } from "@/components/dashboard/new-main-column";
import { ShippedColumn } from "@/components/dashboard/shipped-column";

export default async function Home() {
  // Wrap in try/catch so DB failures show a debug screen rather than 500ing.
  let data: Awaited<ReturnType<typeof loadDashboardData>> = null;
  let debugError: string | null = null;
  let needsLogin = false;
  let needsOnboarding = false;

  try {
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();

    if (authError && !/Auth session missing/i.test(authError.message)) {
      throw new Error(`auth.getUser: ${authError.message}`);
    }
    if (!auth.user) {
      needsLogin = true;
    } else {
      data = await loadDashboardData();
      if (!data) needsOnboarding = true;
    }
  } catch (e) {
    debugError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  if (needsLogin) redirect("/login");
  if (needsOnboarding) redirect("/onboarding/team");
  if (debugError) return <DebugScreen error={debugError} />;
  if (!data) return null;

  const me = data.members.find((m) => m.is_you);
  const myProfile = {
    display_name:
      me?.display_name?.trim() ||
      (me?.email ? me.email.split("@")[0] : data.user.email.split("@")[0]),
    avatar_color: me?.avatar_color ?? "coral",
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-page">
      <Sidebar
        team={data.team}
        mainGoal={data.mainGoal}
        members={data.members}
        pendingInvites={data.pendingInvites}
        myProfile={myProfile}
      />
      <NewMainColumn
        user={data.user}
        weeklyGoal={data.weeklyGoal}
        members={data.members}
        myDailyOne={data.myDailyOne}
        trail={data.trail}
      />
      <ShippedColumn ships={data.recentShips} currentUserId={data.user.id} />
    </div>
  );
}

function DebugScreen({ error }: { error: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="w-full max-w-2xl">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold tracking-tight text-charcoal">
            zanshin
          </span>
          <span className="text-xl font-bold text-coral">.</span>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-pill border border-coral bg-coral/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          <span className="text-xs font-semibold tracking-widest text-coral uppercase">
            Debug · dashboard
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-medium tracking-tight text-charcoal">
          Couldn&apos;t load your dashboard.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
          Something threw while reading from Supabase. Showing the error here
          so we can fix it:
        </p>

        <pre className="mt-6 overflow-auto rounded-card border border-mist bg-mist-soft p-4 text-xs leading-relaxed text-charcoal font-mono whitespace-pre-wrap">
          {error}
        </pre>
      </div>
    </main>
  );
}
