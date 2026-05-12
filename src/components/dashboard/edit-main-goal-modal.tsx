"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMainGoal } from "@/app/actions/goal-actions";

export function EditMainGoalModal({
  open,
  onClose,
  initialText,
  initialDeadline,
}: {
  open: boolean;
  onClose: () => void;
  initialText: string;
  initialDeadline: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [deadline, setDeadline] = useState(initialDeadline);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form + focus on open
  useEffect(() => {
    if (open) {
      setText(initialText);
      setDeadline(initialDeadline);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialText, initialDeadline]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await updateMainGoal({ text, deadline });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  // Weeks remaining preview
  const weeksOut = (() => {
    if (!deadline) return 0;
    const [y, m, d] = deadline.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(
      0,
      Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)),
    );
  })();

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit main goal"
    >
      <div className="w-full max-w-md rounded-card border border-mist bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="h-0.5 w-3 bg-coral" />
              <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
                Edit · main goal
              </span>
            </div>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-charcoal">
              What's the big thing?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-linen hover:text-charcoal-soft"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="goal-text"
              className="block text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase"
            >
              The outcome
            </label>
            <input
              id="goal-text"
              ref={inputRef}
              type="text"
              required
              maxLength={280}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={pending}
              className="mt-2 w-full rounded-input border border-coral bg-white px-4 py-3 text-base text-charcoal placeholder:text-linen focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="goal-deadline"
              className="block text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase"
            >
              By when?
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="goal-deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={pending}
                className="rounded-input border border-mist bg-white px-3 py-2 text-sm text-charcoal focus:border-coral focus:outline-none disabled:opacity-50"
              />
              <span className="text-[11px] italic text-linen">
                · {weeksOut} weeks out
              </span>
            </div>
          </div>

          {error && <p className="text-xs italic text-coral">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="text-sm font-medium text-linen hover:text-charcoal-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !text.trim() || !deadline}
              className="rounded-input bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {pending ? "Saving…" : "Save →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
