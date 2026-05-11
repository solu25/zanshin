import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
  // Defensive: catch anything thrown during Supabase SSR setup so we can
  // see the real error instead of a generic 500 page. Note that redirect()
  // works by throwing a special error — we re-throw any error whose
  // message contains NEXT_REDIRECT so the framework can handle it.
  let user: { id: string; email?: string } | null = null;
  let memberships: Array<{ team_id: string; role: string }> | null = null;
  let debugError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    // AuthSessionMissingError is expected when there's no logged-in user —
    // treat it as null user (the page will redirect to /login below).
    // Only surface other auth errors as real bugs.
    if (authError && !/Auth session missing/i.test(authError.message)) {
      debugError = `auth.getUser: ${authError.message}`;
    } else {
      user = data.user
        ? { id: data.user.id, email: data.user.email }
        : null;
    }

    if (user) {
      const { data: rows, error: dbError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id)
        .limit(1);
      if (dbError) {
        debugError = `team_members query: ${dbError.message}`;
      } else {
        memberships = rows;
      }
    }
  } catch (e) {
    debugError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  // Show the debug error visually instead of crashing.
  if (debugError) {
    return <DebugScreen error={debugError} />;
  }

  // Standard flow — same redirects as before.
  if (!user) redirect("/login");
  if (!memberships || memberships.length === 0) redirect("/onboarding/team");

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
            Debug · home page
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-medium tracking-tight text-charcoal">
          Server error caught (no longer crashing).
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
          The home page tried to fetch your auth + team membership and
          something threw. Showing the error here so we can debug:
        </p>

        <pre className="mt-6 overflow-auto rounded-card border border-mist bg-mist-soft p-4 text-xs leading-relaxed text-charcoal font-mono whitespace-pre-wrap">
          {error}
        </pre>

        <p className="mt-6 text-xs italic text-linen">
          Send this string to Claude so it can fix the underlying issue.
        </p>

        <div className="mt-6">
          <a
            href="/login"
            className="inline-block rounded-input border border-mist bg-white px-4 py-2 text-sm font-medium text-charcoal-soft hover:bg-mist-soft"
          >
            Go to /login
          </a>
        </div>
      </div>
    </main>
  );
}
