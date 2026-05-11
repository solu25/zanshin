import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

/**
 * Shared chrome for /onboarding/* pages. Mirrors Pencil P2-P5:
 *
 *   ┌─────────────────────────────────────────────┐
 *   │  zanshin.                       [sign out]  │  ← header
 *   ├─────────────────────────────────────────────┤
 *   │              [stepper bar here]              │  ← inside each page
 *   │                                              │
 *   │             {children — page form}           │
 *   │                                              │
 *   └─────────────────────────────────────────────┘
 *
 * Auth is enforced here once for every nested route.
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-10 py-6 border-b border-mist-soft">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold tracking-tight text-charcoal">
            zanshin
          </span>
          <span className="text-lg font-bold text-coral">.</span>
        </div>
        <SignOutButton />
      </header>
      <main className="flex flex-1 flex-col items-center px-10 py-16">
        {children}
      </main>
    </div>
  );
}
