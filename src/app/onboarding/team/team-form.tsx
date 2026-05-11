"use client";

import { useState, useTransition } from "react";
import { createTeam } from "./actions";

export function TeamForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTeam(formData);
      // Successful submit redirects server-side; we only get here on error.
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="name"
          className="block text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase"
        >
          Team name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoFocus
          maxLength={80}
          placeholder="Sundial Studio"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          className="mt-2 w-full rounded-input border border-mist bg-white px-4 py-3.5 text-lg text-charcoal placeholder:text-linen focus:border-coral focus:outline-none disabled:opacity-50"
        />
      </div>

      {error && <p className="text-xs italic text-coral">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] italic text-linen">
          <kbd className="rounded-sm border border-mist bg-mist-soft px-1.5 py-0.5 font-mono text-[10px] text-charcoal-soft">
            ↩
          </kbd>{" "}
          press enter to continue
        </p>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="rounded-input bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Creating…" : "Next →"}
        </button>
      </div>
    </form>
  );
}
