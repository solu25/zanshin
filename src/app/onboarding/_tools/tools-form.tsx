"use client";

import { useState, useTransition } from "react";
import { connectTools, skipTools } from "./actions";

type Tool = {
  key: string;
  label: string;
  desc: string;
  recommended?: boolean;
  icon: string;
  iconBg: string;
};

const TOOLS: Tool[] = [
  {
    key: "slack",
    label: "Slack",
    desc: "Morning nudges + cross-post intentions.",
    recommended: true,
    icon: "#",
    iconBg: "#611F69",
  },
  {
    key: "granola",
    label: "Granola",
    desc: "Pull yesterday's context from meetings.",
    recommended: true,
    icon: "G",
    iconBg: "#3E8A4F",
  },
  {
    key: "linear",
    label: "Linear",
    desc: "Suggest today's intent from your inbox.",
    icon: "L",
    iconBg: "#5E6AD2",
  },
  {
    key: "google_cal",
    label: "Google Cal",
    desc: "Know what's on your plate before you commit.",
    icon: "G",
    iconBg: "#4285F4",
  },
  {
    key: "github",
    label: "GitHub",
    desc: "Auto-suggest ships from merged PRs.",
    icon: "GH",
    iconBg: "#181717",
  },
  {
    key: "notion",
    label: "Notion",
    desc: "Drop notes and decisions into your docs.",
    icon: "N",
    iconBg: "#000000",
  },
];

export function ToolsForm() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [skipping, startSkipping] = useTransition();

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await connectTools(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  function handleSkip() {
    startSkipping(async () => {
      await skipTools();
    });
  }

  const busy = pending || skipping;

  return (
    <form action={handleSubmit} className="mt-10 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOOLS.map((t) => {
          const isSelected = selected.has(t.key);
          return (
            <label
              key={t.key}
              className={`flex items-center gap-4 rounded-card border p-4 cursor-pointer transition-colors ${
                isSelected
                  ? "border-coral bg-coral/[.04]"
                  : "border-mist bg-white hover:border-charcoal-soft/30"
              } ${busy ? "opacity-50 cursor-wait" : ""}`}
            >
              <input
                type="checkbox"
                name={`tool_${t.key}`}
                checked={isSelected}
                onChange={() => toggle(t.key)}
                disabled={busy}
                className="sr-only"
              />
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input text-sm font-bold text-white"
                style={{ backgroundColor: t.iconBg }}
                aria-hidden
              >
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal">
                    {t.label}
                  </span>
                  {t.recommended && (
                    <span className="text-[9px] font-bold tracking-[1.2px] text-coral uppercase">
                      recommended
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-charcoal-soft leading-snug">
                  {t.desc}
                </p>
              </div>
              <span
                className={`text-xs font-semibold ${
                  isSelected ? "text-coral" : "text-linen"
                }`}
              >
                {isSelected ? "✓ Connected" : "Connect →"}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-center text-xs italic text-coral">{error}</p>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-input bg-charcoal px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Done — take me in →"}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={busy}
          className="text-xs italic text-linen hover:text-charcoal-soft disabled:opacity-50"
        >
          {skipping ? "Skipping…" : "Skip — I'll connect tools later"}
        </button>
      </div>
    </form>
  );
}
