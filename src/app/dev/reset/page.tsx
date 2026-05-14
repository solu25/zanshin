import Link from "next/link";
import { resetOnboarding } from "@/app/actions/dev-actions";

export const metadata = {
  title: "Zanshin · Reset onboarding",
};

export default function ResetOnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="w-full max-w-md text-center">
        <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-coral">
          Dev · reset
        </span>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-charcoal">
          Reset onboarding
        </h1>
        <p className="mt-3 text-sm italic text-linen leading-relaxed">
          Wipes your personal data (today&apos;s entries + ships) and leaves
          (or deletes) your team so you can walk through onboarding again.
          If you&apos;re the sole member of your team, the whole team and
          its goals are removed. If teammates exist, only your membership
          and personal data are cleared.
        </p>
      </div>

      <form action={resetOnboarding} className="flex flex-col items-center gap-4">
        <button
          type="submit"
          className="rounded-input border-[1.5px] border-coral bg-white px-6 py-3 text-sm font-semibold text-coral transition-colors hover:bg-coral hover:text-white"
        >
          Reset and go to onboarding →
        </button>
        <Link
          href="/"
          className="text-xs italic text-linen hover:text-charcoal-soft"
        >
          ← back to dashboard
        </Link>
      </form>
    </main>
  );
}
