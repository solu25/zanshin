"use client";

import { useState } from "react";

type State = "filled" | "empty";

export default function Dashboard({ state }: { state: State }) {
  const isFilled = state === "filled";

  return (
    <div className="flex h-[1080px] w-[1920px] bg-page overflow-hidden">
      <Sidebar isFilled={isFilled} />
      <Middle isFilled={isFilled} />
      <ShippedRail isFilled={isFilled} />
    </div>
  );
}

/* ---------- LEFT RAIL ---------- */

function Sidebar({ isFilled }: { isFilled: boolean }) {
  return (
    <aside className="flex w-[280px] flex-col bg-mist-soft px-[22px] pt-7 pb-[22px]">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-charcoal">[blank]</span>
        <span className="text-lg font-bold text-coral">.</span>
        <span className="text-sm text-linen">·</span>
        <span className="text-xs italic text-linen">Sundial Studio</span>
      </div>

      <div className="h-7" />

      {/* MAIN GOAL card */}
      <div className="rounded-input border border-mist bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[1.6px] text-coral">
            Main Goal
          </span>
          <span className="text-[11px] text-linen">✎</span>
        </div>
        <div className="h-2" />
        <p className="text-[13px] font-medium leading-snug text-charcoal">
          Ship the v1 of [blank] to 5 beta teams
        </p>
        <div className="h-2.5" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] italic text-linen">by Aug 13</span>
          <span className="text-[10px] font-semibold text-charcoal">wk 2 of 13</span>
        </div>
      </div>

      <div className="h-3.5" />

      {/* TEAM card */}
      <div className="rounded-input border border-mist bg-white px-2 pb-3 pt-3.5">
        <div className="flex items-center justify-between px-2">
          <span className="text-[9px] font-bold uppercase tracking-[1.6px] text-coral">
            Team
          </span>
          <span className="text-[10px] italic text-linen">2 people</span>
        </div>
        <div className="h-2.5" />
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-coral text-[11px] font-semibold text-white">
            H
          </span>
          <span className="text-xs font-medium text-charcoal">Hema</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green" />
        </div>
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-purple text-[11px] font-semibold text-white">
            J
          </span>
          <span className="text-xs font-semibold text-charcoal">Jenny</span>
          <span className="text-[9px] italic text-coral">(you)</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green" />
        </div>
        <div className="my-2 h-px bg-mist-soft" />
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="text-[13px] font-medium text-coral">+</span>
          <span className="text-xs font-medium text-coral">invite teammates</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* User footer */}
      <div className="flex items-center gap-2.5 rounded-input border border-mist bg-white p-3">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-purple text-[13px] font-semibold text-white">
          J
        </span>
        <span className="text-[13px] font-medium text-charcoal">Jenny</span>
        <span className="ml-auto text-[13px] text-linen">⚙</span>
      </div>
    </aside>
  );
}

/* ---------- MIDDLE ---------- */

function Middle({ isFilled }: { isFilled: boolean }) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(
    isFilled ? "Finish onboarding mocks and start beta-team outreach." : ""
  );

  return (
    <section className="flex flex-1 min-w-0 flex-col px-10 pt-7 pb-6">
      {/* Top header */}
      <div className="flex items-center justify-between border-b border-mist-soft pb-4">
        <p className="text-[13px] font-medium text-charcoal">
          Today · Monday, May 11 · day 1 · WEEK 1
        </p>
        <p className="text-xs italic text-linen">
          first week — week ahead, nothing behind
        </p>
      </div>

      <div className="h-[18px]" />

      {/* THIS WEEK'S GOAL banner */}
      <GoalBanner
        editing={editingGoal}
        setEditing={setEditingGoal}
        text={goalText}
        setText={setGoalText}
        isFilled={isFilled}
      />

      <div className="h-3" />

      {/* LAST WEEK card */}
      <LastWeekCard isFilled={isFilled} />

      <div className="h-3" />

      {/* Body: today + day rail */}
      <div className="flex flex-1 min-h-0 gap-4">
        <TodayCard isFilled={isFilled} />
        <DayRail isFilled={isFilled} />
      </div>
    </section>
  );
}

/* ---------- GOAL BANNER ---------- */

function GoalBanner({
  editing,
  setEditing,
  text,
  setText,
  isFilled,
}: {
  editing: boolean;
  setEditing: (v: boolean) => void;
  text: string;
  setText: (v: string) => void;
  isFilled: boolean;
}) {
  return (
    <div className="flex items-center gap-[18px] rounded-input border-[1.5px] border-coral bg-page px-[18px] py-3">
      <div className="flex flex-col gap-[3px] flex-1 min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-[1.8px] text-coral">
          This Week&apos;s Goal
        </span>
        {editing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            autoFocus
            placeholder="what's the focus for this week?"
            className="w-full border-b-2 border-coral bg-transparent text-[15px] font-semibold tracking-[-0.2px] text-charcoal placeholder:italic placeholder:font-normal placeholder:text-linen focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group w-full border-b border-transparent text-left text-[15px] font-semibold tracking-[-0.2px] text-charcoal hover:border-mist focus:outline-none focus:border-coral"
          >
            {text || (
              <span className="font-normal italic text-linen">
                what&apos;s the focus for this week?
              </span>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[11px] font-semibold text-charcoal">day 1 of 5</span>
        <span className="text-[10px] italic text-linen">MON · MAY 11</span>
      </div>
    </div>
  );
}

/* ---------- LAST WEEK ---------- */

function LastWeekCard({ isFilled }: { isFilled: boolean }) {
  const days = isFilled
    ? [
        { day: "FRI · MAY 8", count: "12", text: "shipped onboarding v2", active: true },
        { day: "THU · MAY 7", count: "9", text: "sent investor update" },
        { day: "WED · MAY 6", count: "22", text: "outreach · 22 emails" },
        { day: "TUE · MAY 5", count: "3", text: "drafted checklist" },
        { day: "MON · MAY 4", count: "1", text: "kickoff · set goal" },
      ]
    : [
        { day: "FRI · MAY 8", count: "—", text: "before you started" },
        { day: "THU · MAY 7", count: "—", text: "before you started" },
        { day: "WED · MAY 6", count: "—", text: "before you started" },
        { day: "TUE · MAY 5", count: "—", text: "before you started" },
        { day: "MON · MAY 4", count: "—", text: "before you started" },
      ];

  return (
    <div className="rounded-input border border-mist bg-page px-[18px] py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-2.5 bg-linen" />
          <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-linen">
            Last Week
          </span>
          <span className="text-[10px] italic text-linen">
            ·  {isFilled ? "reminder for Monday morning" : "first week here"}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold text-charcoal">
            {isFilled ? "47 logged" : "0 logged"}
          </span>
          {isFilled && (
            <span className="text-[10px] font-medium text-coral">see full week →</span>
          )}
        </div>
      </div>
      <div className="h-2.5" />
      <div className="grid grid-cols-5 gap-2">
        {days.map((d, i) => (
          <div
            key={d.day}
            className={`flex flex-col gap-1 rounded-input border border-mist bg-white px-3 py-2.5 ${
              isFilled ? "" : "opacity-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] font-bold uppercase tracking-[1.2px] ${
                  i === 0 && isFilled ? "text-coral" : "text-linen"
                }`}
              >
                {d.day}
              </span>
              <span
                className={`text-[13px] font-semibold ${
                  isFilled ? "text-charcoal" : "text-linen"
                }`}
              >
                {d.count}
              </span>
            </div>
            <span
              className={`text-[11px] leading-snug ${
                isFilled ? "text-charcoal" : "italic text-linen"
              }`}
            >
              {d.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- TODAY CARD ---------- */

type ListItem = {
  id: string;
  text: string;
  done?: boolean;
  doneAt?: string;
  badge?: "count" | "link" | "duration";
  count?: string;
  countProgress?: number;
  link?: string;
  duration?: string;
};

function strikeThrough(text: string) {
  return text
    .split("")
    .map((c) => c + "̶")
    .join("");
}

function TodayCard({ isFilled }: { isFilled: boolean }) {
  const [focusedAdd, setFocusedAdd] = useState(false);

  const items: ListItem[] = isFilled
    ? [
        {
          id: "done1",
          text: "ship draft outreach email",
          done: true,
          doneAt: "10:22",
        },
        {
          id: "act1",
          text: "send outreach emails to beta teams",
          badge: "count",
          count: "5 / 15",
          countProgress: 33,
        },
        {
          id: "act2",
          text: "fix onboarding mocks v3",
          badge: "link",
          link: "figma.com/.../v3",
        },
        {
          id: "act3",
          text: "pair with Hema at 3pm",
          badge: "duration",
          duration: "60m",
        },
      ]
    : [];

  return (
    <div
      className="flex w-[720px] flex-col rounded-input border-[1.5px] border-coral bg-white px-[22px] py-[18px]"
      style={{ boxShadow: "0 8px 24px rgba(237, 106, 90, 0.1)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-coral" />
          <span className="text-[11px] font-bold uppercase tracking-[1.8px] text-coral">
            Mon · May 11 · Today
          </span>
        </div>
        <span className="text-[10px] italic text-linen">day 1</span>
      </div>

      <div className="h-3" />

      <h2 className="text-[22px] font-medium leading-snug tracking-[-0.4px] text-charcoal">
        What&apos;s the work for today?
      </h2>

      <div className="h-[18px]" />

      {/* List */}
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}

        {/* Add row — focuses inline */}
        <AddRow
          focused={focusedAdd}
          setFocused={setFocusedAdd}
          isEmpty={!isFilled}
        />
      </div>
    </div>
  );
}

function Row({ item }: { item: ListItem }) {
  if (item.done) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="w-4 text-[13px] font-bold text-coral">✓</span>
        <span
          className="flex-1 text-[13px] italic text-linen opacity-60"
          style={{ textDecoration: "line-through" }}
        >
          {item.text}
        </span>
        <span className="text-[10px] italic text-linen">done {item.doneAt}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-4 text-[13px] text-linen">—</span>
      <span
        className={`flex-1 text-[13px] ${
          item.badge === "duration" ? "italic text-linen" : "text-charcoal"
        }`}
      >
        {item.text}
      </span>
      {item.badge === "count" && (
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold text-coral">{item.count}</span>
          <div className="h-[3px] w-20 rounded-sm bg-mist-soft">
            <div
              className="h-[3px] rounded-sm bg-coral"
              style={{ width: `${item.countProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}
      {item.badge === "link" && (
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-mist px-2 py-[3px] text-[10px] text-linen">
          <span>↗</span>
          <span>{item.link}</span>
        </span>
      )}
      {item.badge === "duration" && (
        <span className="text-[10px] text-linen">{item.duration}</span>
      )}
    </div>
  );
}

function AddRow({
  focused,
  setFocused,
  isEmpty,
}: {
  focused: boolean;
  setFocused: (v: boolean) => void;
  isEmpty: boolean;
}) {
  const placeholder = isEmpty
    ? "log your first thing today"
    : "type or paste a link — start with a verb";

  if (!focused) {
    return (
      <button
        type="button"
        onClick={() => setFocused(true)}
        className="group flex items-center gap-2.5 text-left"
      >
        <span className="w-4 text-[13px] text-linen">+</span>
        <span className="text-xs italic text-linen group-hover:text-charcoal-soft">
          {isEmpty ? "log your first thing today" : "add another"}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 rounded-input border-[1.5px] border-coral bg-page px-3 py-2.5">
        <span className="text-sm font-semibold text-coral">+</span>
        <input
          type="text"
          autoFocus
          placeholder={placeholder}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-[13px] text-charcoal placeholder:italic placeholder:text-linen focus:outline-none"
        />
        <span className="text-[10px] italic text-linen">⌘ ↩</span>
      </div>
      <div className="flex items-center gap-2 px-3">
        <span className="text-[10px] italic text-linen">shapes</span>
        {["draft", "review", "ship", "email", "call"].map((c) => (
          <span
            key={c}
            className="rounded-pill border border-mist px-2.5 py-0.5 text-[10px] text-linen"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- DAY RAIL ---------- */

function DayRail({ isFilled }: { isFilled: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  const days = [
    { id: "tue", label: "TUE · MAY 12" },
    { id: "wed", label: "WED · MAY 13" },
    { id: "thu", label: "THU · MAY 14" },
    { id: "fri", label: "FRI · MAY 15" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      {days.map((d) => (
        <DayPill
          key={d.id}
          label={d.label}
          selected={selected === d.id}
          onSelect={() => setSelected(selected === d.id ? null : d.id)}
        />
      ))}
    </div>
  );
}

function DayPill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  if (selected) {
    return (
      <div className="flex flex-col items-start rounded-input border-[1.5px] border-coral bg-page px-4 py-3.5">
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-coral">
            {label}
          </span>
          <button
            type="button"
            onClick={onSelect}
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
            placeholder={`plan one thing for ${label.split(" ")[0].toLowerCase()}`}
            autoFocus
            className="flex-1 bg-transparent text-xs italic text-charcoal placeholder:italic placeholder:text-linen focus:outline-none"
          />
          <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-coral" />
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
      type="button"
      onClick={onSelect}
      className="flex items-center justify-between rounded-input border border-mist bg-page px-3.5 py-3 hover:border-coral/40"
    >
      <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-linen">
        {label}
      </span>
      <span className="text-[10px] italic text-linen">+ add</span>
    </button>
  );
}

/* ---------- SHIPPED RAIL ---------- */

function ShippedRail({ isFilled }: { isFilled: boolean }) {
  return (
    <aside className="flex w-[380px] flex-col bg-mist-soft px-[22px] pt-7 pb-[22px]">
      <div className="flex items-center gap-2">
        <span className="h-0.5 w-3.5 bg-coral" />
        <span className="text-[11px] font-bold uppercase tracking-[2.2px] text-coral">
          Shipped
        </span>
      </div>

      <div className="h-3.5" />

      {/* Drop a ship form */}
      <div className="rounded-input border border-mist bg-white p-3.5">
        <span className="text-[9px] font-bold uppercase tracking-[1.6px] text-coral">
          Drop A Ship
        </span>
        <div className="h-2.5" />
        <div className="rounded-[8px] border border-mist bg-page px-3 py-2.5">
          <span className="text-xs italic text-linen">What did you ship?</span>
        </div>
        <div className="h-2.5" />
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-charcoal-soft">+ link</span>
          <span className="text-[11px] font-medium text-charcoal-soft">👁️ needs eyes</span>
        </div>
        <div className="h-2.5" />
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-[8px] bg-charcoal py-2.5 text-xs font-semibold text-white hover:opacity-90"
        >
          Ship it →
        </button>
      </div>

      <div className="h-3.5" />

      {/* Ship card or empty state */}
      {isFilled ? (
        <div className="rounded-input border border-mist bg-white px-3.5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple text-[9px] font-semibold text-white">
                J
              </span>
              <span className="text-[11px] font-semibold text-charcoal">Jenny</span>
            </div>
            <span className="text-[10px] italic text-linen">Tue</span>
          </div>
          <div className="h-1.5" />
          <p className="text-xs leading-snug text-charcoal">
            Finished sign-in + name team screens.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-input border border-mist px-3.5 py-4">
          <span className="text-xs italic text-linen">Nothing shipped yet</span>
          <span className="text-[10px] italic text-linen">drop your first one above ↑</span>
        </div>
      )}
    </aside>
  );
}
