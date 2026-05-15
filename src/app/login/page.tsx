"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureDevUserExists } from "./actions";

type State =
  | { kind: "ready" }
  | { kind: "signing-in" }
  | { kind: "error"; message: string };

/**
 * Dev-mode passthrough login.
 *
 * Magic-link auth requires email delivery to work end-to-end, which
 * adds external dependencies we don't want to debug while building
 * out the product flow. This flow uses a derived password under the
 * hood:
 *   - Try signInWithPassword(email, devPasswordFor(email))
 *   - If that fails with "Invalid login credentials", signUp the user
 *   - Either way the user is instantly authed and routed to onboarding
 *
 * Requires "Confirm email" toggled OFF in Supabase → Auth → Providers
 * → Email so signUp lands you in a session immediately.
 *
 * Before public launch we swap this back to signInWithOtp() (magic
 * links) or wire up a real password / OAuth flow.
 */
function devPasswordFor(email: string) {
  return `zanshin-dev-${email}-2026`;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "ready" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || state.kind === "signing-in") return;

    setState({ kind: "signing-in" });
    const supabase = createClient();
    const password = devPasswordFor(email);

    // Step 1 (server-side): make sure a user row exists with this email
    // and password. Uses the admin client with email_confirm: true so no
    // email is ever sent — avoids hitting Supabase's email rate limit.
    const ensured = await ensureDevUserExists(email, password);
    if (!ensured.ok) {
      setState({ kind: "error", message: ensured.error });
      return;
    }

    // Step 2 (client-side): actually sign in to establish a session cookie.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setState({ kind: "error", message: signInError.message });
      return;
    }

    // Route to the home page — it sends new users to onboarding and
    // onboarded users straight to the dashboard.
    router.push("/");
    router.refresh();
  }

  const busy = state.kind === "signing-in";
  const errorMsg = state.kind === "error" ? state.message : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold tracking-tight text-charcoal">
            zanshin
          </span>
          <span className="text-xl font-bold text-coral">.</span>
        </div>
        <p className="mt-1 text-xs italic text-linen">
          残心 · the mind that remains
        </p>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2">
            <span className="h-0.5 w-3 bg-coral" />
            <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
              Sign in
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-medium text-charcoal tracking-tight leading-tight">
            Welcome to Zanshin.
          </h1>
          <p className="mt-2 text-sm italic text-linen leading-relaxed">
            The mind that stays with what matters. Sign in to set today's one
            thing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <label
            htmlFor="email"
            className="block text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            inputMode="email"
            placeholder="you@team.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="w-full rounded-input border border-mist bg-white px-4 py-3 text-base text-charcoal placeholder:text-linen focus:border-coral focus:outline-none focus:ring-0 disabled:opacity-50"
          />

          {errorMsg && (
            <p className="text-xs italic text-coral">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={busy || !email}
            className="w-full rounded-input bg-charcoal px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Signing in…" : "Continue →"}
          </button>
        </form>

        <p className="mt-12 text-xs italic text-linen">
          Dev mode · no password, no email check. Real auth lands before launch.
        </p>
      </div>
    </main>
  );
}
