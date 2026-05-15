"use client";

import { useState, useTransition } from "react";
import { setWeeklyGoal } from "./actions";

const EXAMPLE_SLICES = [
  "Design onboarding end-to-end",
  "Wire up magic-link auth",
  "Polish the empty Monday state",
  "Build the Friday wrap flow",
  "Get 3 friends to alpha-test",
  "Schedule 5 user interviews",
];

export function WeekForm({
  initialText = "",
  carriedFromLastWeek = false,
}: {
  initialText?: string;
  carriedFromLastWeek?: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setWeeklyGoal(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      <div>
        <input
          name="text"
          type="text"
          required
          autoFocus
          maxLength={280}
          placeholder="Design the onboarding end-to-end and have it in code by Friday."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
          className="w-full rounded-input border border-coral bg-white px-4 py-3.5 text-lg text-charcoal placeholder:text-linen focus:outline-none disabled:opacity-50"
        />
        {carriedFromLastWeek && (
          <p className="mt-2 text-xs italic text-linen">
            ↻ Carried over from last week — keep it or rewrite it.
          </p>
        )}
      </div>

      <div className="rounded-card border border-mist bg-white p-5">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-2 bg-coral" />
          <span className="text-[9px] font-bold tracking-[1.4px] text-coral uppercase">
            Slices of your main goal · tap any
          </span>
          <span className="text-[10px] italic text-linen">· week-sized chunks</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_SLICES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              disabled={pending}
              className="rounded-pill border border-mist bg-page px-3 py-1.5 text-xs font-medium text-charcoal-soft transition-colors hover:border-coral hover:text-charcoal disabled:opacity-50"
            >
              {s} <span className="text-linen">↗</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs italic text-coral">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] italic text-linen">
          <kbd className="rounded-sm border border-mist bg-mist-soft px-1.5 py-0.5 font-mono text-[10px] text-charcoal-soft">
            ↩
          </kbd>{" "}
          enter to continue — you'll set a new one each Monday
        </p>
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="rounded-input bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Next →"}
        </button>
      </div>
    </form>
  );
}
