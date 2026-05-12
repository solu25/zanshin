"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import type { DashboardData } from "@/lib/dashboard-data";
import {
  addBonus,
  deleteBonus,
  setDailyOne,
  toggleBonus,
} from "@/app/actions/daily-actions";

// Starter chip suggestions for the empty state
const STARTER_CHIPS = [
  "Wire up the magic-link auth",
  "Push the date picker fix",
  "Design the empty Monday state",
  "Sync with Jenny on the spec",
  "Reach out to 3 beta candidates",
  "Write Loom for v1 walkthrough",
];

function todayLabel() {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();
}

export function TodayCard({
  myProfile,
  myDailyOne,
  otherMembersUnset,
}: {
  myProfile: { display_name: string; avatar_color: string };
  myDailyOne: DashboardData["myDailyOne"];
  otherMembersUnset: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Draft text for the main input when empty
  const [draftMain, setDraftMain] = useState("");

  // Editing state for an existing main
  const [editingMain, setEditingMain] = useState(false);
  const [editText, setEditText] = useState(myDailyOne?.text ?? "");

  // Bonus add row
  const [draftBonus, setDraftBonus] = useState("");

  const isEmpty = myDailyOne === null;

  // ---- handlers ----
  function commitMain(text: string) {
    setError(null);
    startTransition(async () => {
      const result = await setDailyOne(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraftMain("");
      setEditingMain(false);
      router.refresh();
    });
  }

  function handleMainSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draftMain.trim()) return;
    commitMain(draftMain);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editText.trim()) return;
    commitMain(editText);
  }

  function handleChipClick(chip: string) {
    setDraftMain(chip);
    commitMain(chip);
  }

  function handleAddBonus(e: React.FormEvent) {
    e.preventDefault();
    if (!draftBonus.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addBonus(draftBonus);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraftBonus("");
      router.refresh();
    });
  }

  function handleToggleBonus(bonusId: string, currentlyComplete: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleBonus(bonusId, !currentlyComplete);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDeleteBonus(bonusId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteBonus(bonusId);
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

  return (
    <section
      className="rounded-card border-[1.5px] border-coral bg-white p-6"
      style={{ boxShadow: "0 8px 24px rgba(237, 106, 90, 0.10)" }}
    >
      {/* Eyebrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            Today · {todayLabel()}
          </span>
        </div>
        {isEmpty ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-coral px-3 py-1 text-[10px] font-semibold tracking-[0.4px] text-white">
            <span className="text-[7px]">●</span> pick one to start
          </span>
        ) : (
          <span className="text-[10px] italic text-linen">
            main · {myDailyOne.bonuses.length} bonus ·{" "}
            {[...myDailyOne.bonuses].filter((x) => x.is_complete).length} done
          </span>
        )}
      </div>

      <h2 className="mt-3 text-2xl font-medium tracking-tight leading-tight text-charcoal">
        What&apos;s the one thing today?
      </h2>

      {/* Main input zone */}
      <div className="mt-4">
        {isEmpty ? (
          <form onSubmit={handleMainSubmit}>
            <input
              type="text"
              placeholder="type your one thing…"
              value={draftMain}
              onChange={(e) => setDraftMain(e.target.value)}
              onKeyDown={handleMainKeydown}
              disabled={pending}
              autoFocus
              maxLength={280}
              className="w-full rounded-input border border-mist bg-page px-4 py-3.5 text-base text-charcoal placeholder:text-linen focus:border-coral focus:outline-none disabled:opacity-50"
            />
            {draftMain.trim() && (
              <button
                type="submit"
                disabled={pending}
                className="mt-2 rounded-input bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {pending ? "Saving…" : "Set as today's main →"}
              </button>
            )}
          </form>
        ) : editingMain ? (
          <form onSubmit={handleEditSubmit}>
            <input
              type="text"
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              disabled={pending}
              maxLength={280}
              className="w-full rounded-input border-[1.5px] border-coral bg-page px-4 py-3.5 text-base text-charcoal focus:outline-none disabled:opacity-50"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-input bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingMain(false);
                  setEditText(myDailyOne.text);
                }}
                className="text-xs italic text-linen hover:text-charcoal-soft"
              >
                cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingMain(true);
              setEditText(myDailyOne.text);
            }}
            className="group flex w-full items-center gap-3 rounded-input border-[1.5px] border-coral bg-page px-4 py-3.5 text-left transition-colors hover:bg-coral/[.04]"
          >
            <span className="text-base font-medium text-charcoal">
              {myDailyOne.text}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-pill border border-mist bg-white px-2 py-0.5 text-[10px] font-medium text-charcoal-soft transition-colors group-hover:border-coral group-hover:bg-coral/[.06] group-hover:text-coral">
              <span>✎</span>
              <span>edit</span>
            </span>
          </button>
        )}
      </div>

      {/* Author meta */}
      <div className="mt-3 flex items-center gap-2.5">
        <Avatar name={myProfile.display_name} color={myProfile.avatar_color} size="xs" />
        <span className="text-[11px] italic text-linen">
          {isEmpty
            ? "Your main · pick one of the chips below or type your own"
            : otherMembersUnset > 0
              ? `Your main · ${otherMembersUnset} teammate${otherMembersUnset === 1 ? "" : "s"} haven't set theirs yet`
              : "Your main · everyone has set theirs"}
        </span>
      </div>

      {/* Pick-one-to-start chips (only when empty) */}
      {isEmpty && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-mist" />
            <span className="text-[9px] font-bold tracking-[1.6px] text-coral uppercase">
              Or pick one to start ↓
            </span>
            <div className="h-px flex-1 bg-mist" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {STARTER_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleChipClick(c)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-pill border border-coral bg-white px-3.5 py-2 text-xs font-medium text-charcoal transition-colors hover:bg-coral/[.06] disabled:opacity-50"
              >
                <span>{c}</span>
                <span className="text-coral text-[10px]">↗</span>
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="mt-3 text-xs italic text-coral">{error}</p>
      )}

      {/* Divider */}
      <div className="mt-6 h-px bg-mist-soft" />

      {/* ALSO TODAY */}
      <div className={`mt-4 ${isEmpty ? "opacity-50" : ""}`} aria-disabled={isEmpty}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-linen">↳</span>
            <span className="text-[10px] font-bold tracking-[1.6px] text-linen uppercase">
              Also today — small bonuses
            </span>
          </div>
          <span className="text-[10px] italic text-linen">
            {isEmpty
              ? "unlocks once main is set"
              : `${myDailyOne.bonuses.length} added · optional`}
          </span>
        </div>

        <div className="mt-2 space-y-1">
          {!isEmpty &&
            myDailyOne.bonuses.map((b) => (
              <div
                key={b.id}
                className="group flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-mist-soft"
              >
                <button
                  type="button"
                  onClick={() => handleToggleBonus(b.id, b.is_complete)}
                  disabled={pending}
                  aria-label={b.is_complete ? "Mark incomplete" : "Mark complete"}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                    b.is_complete
                      ? "border-coral bg-coral text-white"
                      : "border-mist bg-white hover:border-coral"
                  }`}
                >
                  {b.is_complete && <span className="text-[10px]">✓</span>}
                </button>
                <span
                  className={`text-sm font-medium flex-1 ${
                    b.is_complete ? "text-linen line-through" : "text-charcoal"
                  }`}
                >
                  {b.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteBonus(b.id)}
                  disabled={pending}
                  aria-label="Delete bonus"
                  className="text-xs text-linen opacity-0 group-hover:opacity-100 transition-opacity hover:text-coral"
                >
                  ✕
                </button>
              </div>
            ))}

          {/* Add bonus row */}
          {isEmpty ? (
            <div className="flex items-center gap-2.5 rounded-md border border-dashed border-mist px-3 py-2.5">
              <span className="text-sm font-semibold text-linen">+</span>
              <span className="text-xs italic text-linen">
                set the main thing first
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleAddBonus}
              className="flex items-center gap-2.5 rounded-md border border-dashed border-coral px-3 py-2.5 focus-within:bg-coral/[.04]"
            >
              <span className="text-sm font-semibold text-coral">+</span>
              <input
                type="text"
                placeholder="add another bonus for today"
                value={draftBonus}
                onChange={(e) => setDraftBonus(e.target.value)}
                disabled={pending}
                maxLength={200}
                className="flex-1 bg-transparent text-xs italic text-coral placeholder:text-linen focus:outline-none"
              />
              <span className="text-[10px] italic text-linen">enter</span>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
