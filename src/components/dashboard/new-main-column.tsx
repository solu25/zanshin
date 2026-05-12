"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { DashboardData } from "@/lib/dashboard-data";
import {
  addBonus,
  deleteBonus,
  deleteDailyOne,
  setDailyOne,
  toggleBonus,
} from "@/app/actions/daily-actions";
import { updateWeeklyGoal } from "@/app/actions/goal-actions";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function todayLabel() {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();
}

function weekNumber(today: Date = new Date()) {
  const start = new Date(today.getFullYear(), 0, 1);
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
}

function dayOfWeek(today: Date = new Date()) {
  return today.getDay() === 0 ? 7 : today.getDay(); // 1 = Mon ... 7 = Sun
}

export function NewMainColumn({
  weeklyGoal,
  myDailyOne,
}: {
  user: DashboardData["user"];
  weeklyGoal: DashboardData["weeklyGoal"];
  members: DashboardData["members"];
  myDailyOne: DashboardData["myDailyOne"];
  trail: DashboardData["trail"];
}) {
  const day = dayOfWeek();
  const dayInWorkWeek = Math.min(day, 5);

  return (
    <main className="flex flex-1 min-w-0 flex-col bg-page px-10 pt-7 pb-6">
      {/* Top header */}
      <div className="flex items-center justify-between border-b border-mist-soft pb-4">
        <p className="text-[13px] font-medium text-charcoal">
          Today · {formatToday()} · day {dayInWorkWeek} · WEEK {weekNumber()}
        </p>
        <p className="text-xs italic text-linen">
          {myDailyOne ? "main set · keep going" : "fresh — pick one to start"}
        </p>
      </div>

      <div className="h-[18px]" />

      {/* THIS WEEK'S GOAL banner */}
      <GoalBanner text={weeklyGoal?.text ?? ""} dayInWeek={dayInWorkWeek} />

      <div className="h-3" />

      {/* LAST WEEK card (mock for now) */}
      <LastWeekCardMock />

      <div className="h-3" />

      {/* Body: today + day rail */}
      <div className="flex flex-1 min-h-0 gap-4">
        <TodayCard myDailyOne={myDailyOne} />
        <DayRailMock />
      </div>
    </main>
  );
}

/* ---------- GOAL BANNER ---------- */

function GoalBanner({ text, dayInWeek }: { text: string; dayInWeek: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setEditing(false);
      setDraft(text);
      return;
    }
    if (trimmed === text) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateWeeklyGoal(trimmed);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setEditing(false);
      router.refresh();
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setDraft(text);
      setEditing(false);
      setError(null);
    }
  }

  return (
    <div className="flex items-center gap-[18px] rounded-input border-[1.5px] border-coral bg-page px-[18px] py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-[9px] font-bold uppercase tracking-[1.8px] text-coral">
          This Week&apos;s Goal
        </span>
        {editing ? (
          <input
            type="text"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder="what's the focus for this week?"
            disabled={pending}
            maxLength={280}
            className="w-full border-b-2 border-coral bg-transparent text-[15px] font-semibold tracking-[-0.2px] text-charcoal placeholder:italic placeholder:font-normal placeholder:text-linen focus:outline-none disabled:opacity-50"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(text);
              setEditing(true);
            }}
            className="w-full border-b border-transparent text-left text-[15px] font-semibold tracking-[-0.2px] text-charcoal hover:border-mist focus:border-coral focus:outline-none"
          >
            {text || (
              <span className="font-normal italic text-linen">
                what&apos;s the focus for this week?
              </span>
            )}
          </button>
        )}
        {error && (
          <span className="text-[10px] italic text-coral">{error}</span>
        )}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[11px] font-semibold text-charcoal">
          day {dayInWeek} of 5
        </span>
        <span className="text-[10px] italic text-linen">{todayLabel()}</span>
      </div>
    </div>
  );
}

/* ---------- LAST WEEK (mock for now) ---------- */

function LastWeekCardMock() {
  return (
    <div className="rounded-input border border-mist bg-page px-[18px] py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-2.5 bg-linen" />
          <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-linen">
            Last Week
          </span>
          <span className="text-[10px] italic text-linen">
            ·  reminder for Monday morning
          </span>
        </div>
        <span className="text-[10px] italic text-linen">no trail yet</span>
      </div>
      <div className="h-2.5" />
      <div className="grid grid-cols-5 gap-2">
        {["FRI", "THU", "WED", "TUE", "MON"].map((d) => (
          <div
            key={d}
            className="flex flex-col gap-1 rounded-input border border-mist bg-white px-3 py-2.5 opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[1.2px] text-linen">
                {d}
              </span>
              <span className="text-[13px] font-semibold text-linen">—</span>
            </div>
            <span className="text-[11px] italic leading-snug text-linen">
              before you started
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- TODAY CARD ---------- */

function strikeThroughStyle() {
  return { textDecoration: "line-through" } as const;
}

function TodayCard({
  myDailyOne,
}: {
  myDailyOne: DashboardData["myDailyOne"];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [draftMain, setDraftMain] = useState("");
  const [draftAdd, setDraftAdd] = useState("");
  const [focusedAdd, setFocusedAdd] = useState(false);

  const [editingMain, setEditingMain] = useState(false);
  const [editMainText, setEditMainText] = useState("");

  const isEmpty = myDailyOne === null;

  function commitMain(text: string) {
    setError(null);
    startTransition(async () => {
      const result = await setDailyOne(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraftMain("");
      router.refresh();
    });
  }

  function handleMainSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draftMain.trim()) return;
    commitMain(draftMain);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draftAdd.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addBonus(draftAdd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraftAdd("");
      setFocusedAdd(false);
      router.refresh();
    });
  }

  function handleToggle(id: string, currentlyDone: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleBonus(id, !currentlyDone);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteBonus(id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleMainKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (draftMain.trim()) commitMain(draftMain);
    }
  }

  function commitEditMain() {
    const trimmed = editMainText.trim();
    if (!trimmed || trimmed === myDailyOne?.text) {
      setEditingMain(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setDailyOne(trimmed);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditingMain(false);
      router.refresh();
    });
  }

  function handleEditMainKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEditMain();
    } else if (e.key === "Escape") {
      setEditingMain(false);
      setEditMainText(myDailyOne?.text ?? "");
    }
  }

  function handleDeleteMain() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDailyOne();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditingMain(false);
      router.refresh();
    });
  }

  return (
    <div
      className="flex w-[720px] flex-col rounded-input border-[1.5px] border-coral bg-white px-[22px] py-[18px]"
      style={{ boxShadow: "0 8px 24px rgba(237, 106, 90, 0.1)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-coral" />
          <span className="text-[11px] font-bold uppercase tracking-[1.8px] text-coral">
            {todayLabel()} · Today
          </span>
        </div>
        <span className="text-[10px] italic text-linen">
          {isEmpty
            ? "pick one"
            : `${myDailyOne!.bonuses.length} also`}
        </span>
      </div>

      <div className="h-3" />

      <h2 className="text-[22px] font-medium leading-snug tracking-[-0.4px] text-charcoal">
        What&apos;s the work for today?
      </h2>

      <div className="h-[18px]" />

      {/* Empty state: input + chips to set main */}
      {isEmpty ? (
        <form onSubmit={handleMainSubmit} className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-input border-[1.5px] border-coral bg-page px-3 py-2.5">
            <span className="text-sm font-semibold text-coral">+</span>
            <input
              type="text"
              autoFocus
              placeholder="log your first thing today"
              value={draftMain}
              onChange={(e) => setDraftMain(e.target.value)}
              onKeyDown={handleMainKeydown}
              disabled={pending}
              maxLength={280}
              className="flex-1 bg-transparent text-[14px] text-charcoal placeholder:italic placeholder:text-linen focus:outline-none disabled:opacity-50"
            />
            <span className="text-[10px] italic text-linen">⌘ ↩</span>
          </div>
          {draftMain.trim() && (
            <button
              type="submit"
              disabled={pending}
              className="rounded-input bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              {pending ? "Saving…" : "Set as today's main →"}
            </button>
          )}
        </form>
      ) : (
        /* Filled: list of main + bonuses */
        <div className="flex flex-col gap-2.5">
          {/* Main row */}
          <div className="group flex items-center gap-2.5">
            <span className="w-4 text-[13px] text-coral">★</span>
            {editingMain ? (
              <input
                type="text"
                autoFocus
                value={editMainText}
                onChange={(e) => setEditMainText(e.target.value)}
                onBlur={commitEditMain}
                onKeyDown={handleEditMainKeydown}
                disabled={pending}
                maxLength={280}
                className="flex-1 border-b-2 border-coral bg-transparent text-[14px] font-medium text-charcoal placeholder:italic placeholder:text-linen focus:outline-none disabled:opacity-50"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditMainText(myDailyOne!.text);
                  setEditingMain(true);
                }}
                className="flex-1 border-b border-transparent text-left text-[14px] font-medium text-charcoal hover:border-mist focus:border-coral focus:outline-none"
              >
                {myDailyOne!.text}
              </button>
            )}
            {!editingMain && (
              <button
                type="button"
                onClick={handleDeleteMain}
                disabled={pending}
                aria-label="Delete main"
                className="text-[11px] text-linen opacity-0 transition-opacity hover:text-coral group-hover:opacity-100"
              >
                ✕
              </button>
            )}
            <span className="text-[10px] italic text-linen">main</span>
          </div>

          {/* Bonus rows */}
          {myDailyOne!.bonuses.map((b) => (
            <div key={b.id} className="group flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleToggle(b.id, b.is_complete)}
                disabled={pending}
                className="w-4 text-left text-[13px] hover:opacity-80 disabled:opacity-40"
                aria-label={b.is_complete ? "Mark incomplete" : "Mark complete"}
              >
                {b.is_complete ? (
                  <span className="font-bold text-coral">✓</span>
                ) : (
                  <span className="text-linen">—</span>
                )}
              </button>
              <span
                className={`flex-1 text-[13px] ${
                  b.is_complete
                    ? "italic text-linen opacity-60"
                    : "text-charcoal"
                }`}
                style={b.is_complete ? strikeThroughStyle() : undefined}
              >
                {b.text}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(b.id)}
                disabled={pending}
                aria-label="Delete"
                className="text-[11px] text-linen opacity-0 transition-opacity hover:text-coral group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add row */}
          {!focusedAdd ? (
            <button
              type="button"
              onClick={() => setFocusedAdd(true)}
              className="group flex items-center gap-2.5 text-left"
            >
              <span className="w-4 text-[13px] text-linen">+</span>
              <span className="text-xs italic text-linen group-hover:text-charcoal-soft">
                add another
              </span>
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="space-y-2">
              <div className="flex items-center gap-2.5 rounded-input border-[1.5px] border-coral bg-page px-3 py-2.5">
                <span className="text-sm font-semibold text-coral">+</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="type or paste a link — start with a verb"
                  value={draftAdd}
                  onChange={(e) => setDraftAdd(e.target.value)}
                  onBlur={() => {
                    if (!draftAdd.trim()) setFocusedAdd(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setFocusedAdd(false);
                  }}
                  disabled={pending}
                  maxLength={200}
                  className="flex-1 bg-transparent text-[13px] text-charcoal placeholder:italic placeholder:text-linen focus:outline-none disabled:opacity-50"
                />
                <span className="text-[10px] italic text-linen">⌘ ↩</span>
              </div>
              <div className="flex items-center gap-2 px-3">
                <span className="text-[10px] italic text-linen">shapes</span>
                {["draft", "review", "ship", "email", "call"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setDraftAdd(c + " ")}
                    className="rounded-pill border border-mist px-2.5 py-0.5 text-[10px] text-linen hover:border-coral hover:text-coral"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </form>
          )}

          {error && (
            <p className="mt-1 text-xs italic text-coral">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- DAY RAIL (mock for now) ---------- */

function DayRailMock() {
  const [selected, setSelected] = useState<string | null>(null);

  const days = [
    { id: "tue", label: "TUE" },
    { id: "wed", label: "WED" },
    { id: "thu", label: "THU" },
    { id: "fri", label: "FRI" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      {days.map((d) => {
        const isSelected = selected === d.id;
        if (isSelected) {
          return (
            <div
              key={d.id}
              className="flex flex-col items-start rounded-input border-[1.5px] border-coral bg-page px-4 py-3.5"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-coral">
                  {d.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-[9px] italic text-coral"
                >
                  selected
                </button>
              </div>
              <div className="h-2.5 w-full" />
              <div className="flex w-full items-center gap-2 rounded-[8px] border border-mist bg-white px-2.5 py-2">
                <span className="text-[13px] font-semibold text-coral">+</span>
                <input
                  type="text"
                  placeholder={`plan one thing for ${d.label.toLowerCase()}`}
                  className="flex-1 bg-transparent text-xs italic text-charcoal placeholder:italic placeholder:text-linen focus:outline-none"
                />
              </div>
              <div className="h-2 w-full" />
              <div className="flex w-full items-center gap-1.5">
                {["draft", "review", "ship"].map((c) => (
                  <span
                    key={c}
                    className="rounded-pill border border-mist px-2 py-0.5 text-[9px] text-linen"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d.id)}
            className="flex items-center justify-between rounded-input border border-mist bg-page px-3.5 py-3 hover:border-coral/40"
          >
            <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-linen">
              {d.label}
            </span>
            <span className="text-[10px] italic text-linen">+ add</span>
          </button>
        );
      })}
    </div>
  );
}
