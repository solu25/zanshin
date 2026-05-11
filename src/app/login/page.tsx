"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type State =
  | { kind: "ready" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "ready" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || state.kind === "sending") return;

    setState({ kind: "sending" });
    const supabase = createClient();

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setState({ kind: "error", message: error.message });
      return;
    }
    setState({ kind: "sent", email });
  }

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

        {state.kind === "sent" ? <SentState email={state.email} /> : (
          <FormState
            email={email}
            setEmail={setEmail}
            onSubmit={handleSubmit}
            state={state}
          />
        )}

        <p className="mt-12 text-xs italic text-linen">
          No passwords. We email you a single-use link.
        </p>
      </div>
    </main>
  );
}

function FormState({
  email,
  setEmail,
  onSubmit,
  state,
}: {
  email: string;
  setEmail: (s: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  state: State;
}) {
  const sending = state.kind === "sending";
  const errorMsg = state.kind === "error" ? state.message : null;

  return (
    <>
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

      <form onSubmit={onSubmit} className="mt-8 space-y-3">
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
          disabled={sending}
          className="w-full rounded-input border border-mist bg-white px-4 py-3 text-base text-charcoal placeholder:text-linen focus:border-coral focus:outline-none focus:ring-0 disabled:opacity-50"
        />

        {errorMsg && (
          <p className="text-xs italic text-coral">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={sending || !email}
          className="w-full rounded-input bg-charcoal px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send magic link →"}
        </button>
      </form>
    </>
  );
}

function SentState({ email }: { email: string }) {
  return (
    <div className="mt-12 rounded-card border border-coral/30 bg-white p-6">
      <div className="inline-flex items-center gap-2">
        <span className="h-0.5 w-3 bg-coral" />
        <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
          Check your email
        </span>
      </div>
      <h2 className="mt-3 text-xl font-medium text-charcoal tracking-tight">
        Magic link sent.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
        We sent a sign-in link to{" "}
        <span className="font-medium text-charcoal">{email}</span>.
      </p>
      <p className="mt-3 text-xs italic text-linen leading-relaxed">
        The link is good for one click and expires in an hour. If it doesn't
        show up in a minute, check your spam folder.
      </p>
    </div>
  );
}
