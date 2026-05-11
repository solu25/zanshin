"use client";

import { useState, useTransition } from "react";
import { setMainGoal } from "./actions";

const EXAMPLE_GOALS = [
  "Ship v1 to 5 beta teams",
  "Get to $10k MRR",
  "Hire two senior engineers",
  "Launch the redesigned site",
  "Run 10 user interviews",
  "Close $50k in new revenue",
];

export function GoalForm({ defaultDeadline }: { defaultDeadline: string }) {
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setMainGoal(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  // Weeks until deadline (used in the meta label)
  const weeksOut = (() => {
    const target = new Date(deadline);
    const today = new Date();
    const diff = Math.max(0, Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    return diff;
  })();

  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="text"
          className="block text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase"
        >
          The outcome
        </label>
        <input
          id="text"
          name="text"
          type="text"
          required
          autoFocus
          maxLength={280}
          placeholder="Ship the v1 of Zanshin to 5 beta teams"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
          className="mt-2 w-full rounded-input border border-coral bg-white px-4 py-3.5 text-lg text-charcoal placeholder:text-linen focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Date row */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase">
          By when?
        </span>
        <input
          name="deadline"
          type="date"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={pending}
          className="rounded-pill border border-mist bg-mist-soft px-3 py-1.5 text-xs font-medium text-charcoal focus:border-coral focus:outline-none disabled:opacity-50"
        />
        <span className="text-[11px] italic text-linen">
          · {weeksOut} weeks out · click the date to change it
        </span>
      </div>

      {/* Example chips */}
      <div className="rounded-card border border-mist bg-white p-5">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-2 bg-linen" />
          <span className="text-[9px] font-bold tracking-[1.4px] text-linen uppercase">
            Need a start? · tap any
          </span>
          <span className="text-[10px] italic text-linen">· popular shapes</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setText(g)}
              disabled={pending}
              className="rounded-pill border border-mist bg-page px-3 py-1.5 text-xs font-medium text-charcoal-soft transition-colors hover:border-coral hover:text-charcoal disabled:opacity-50"
            >
              {g} <span className="text-linen">↗</span>
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
          enter to continue · pick the date to change it
        </p>
        <button
          type="submit"
          disabled={pending || !text.trim() || !deadline}
          className="rounded-input bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Next →"}
        </button>
      </div>
    </form>
  );
}
