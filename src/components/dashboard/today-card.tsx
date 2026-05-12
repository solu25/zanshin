import { Avatar } from "@/components/avatar";
import type { DashboardData } from "@/lib/dashboard-data";

// The locked M0c chip suggestions — these come from the design memory.
// In a real product they'd be pulled from a "popular shapes" library or
// AI-suggested from the weekly goal. For now: a hand-picked starter set.
const STARTER_CHIPS = [
  "Wire up the magic-link auth",
  "Push the date picker fix",
  "Design the empty Monday state",
  "Sync with Jenny on the spec",
  "Reach out to 3 beta candidates",
  "Write Loom for v1 walkthrough",
];

export function TodayCard({
  myProfile,
  myDailyOne,
  otherMembersUnset,
}: {
  myProfile: { display_name: string; avatar_color: string };
  myDailyOne: DashboardData["myDailyOne"];
  otherMembersUnset: number;
}) {
  const isEmpty = myDailyOne === null;

  return (
    <section
      className="rounded-card border-[1.5px] border-coral bg-white p-6"
      style={{ boxShadow: "0 8px 24px rgba(237, 106, 90, 0.10)" }}
    >
      {/* Eyebrow row */}
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
            {[myDailyOne, ...myDailyOne.bonuses].filter((x) => x.is_complete)
              .length}{" "}
            done
          </span>
        )}
      </div>

      {/* Headline */}
      <h2 className="mt-3 text-2xl font-medium tracking-tight leading-tight text-charcoal">
        What&apos;s the one thing today?
      </h2>

      {/* Main input zone */}
      <div className="mt-4">
        {isEmpty ? (
          <div className="flex items-center gap-3 rounded-input border border-mist bg-page px-4 py-3.5">
            <span className="italic text-linen">type your one thing…</span>
            <span className="ml-auto text-[10px] italic text-linen">
              start with a verb
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-input border-[1.5px] border-coral bg-page px-4 py-3.5">
            <span className="text-base font-medium text-charcoal">
              {myDailyOne.text}
            </span>
            <span className="ml-auto text-xs text-linen">✎</span>
          </div>
        )}
      </div>

      {/* Author meta */}
      <div className="mt-3 flex items-center gap-2.5">
        <Avatar
          name={myProfile.display_name}
          color={myProfile.avatar_color}
          size="xs"
        />
        <span className="text-[11px] italic text-linen">
          {isEmpty
            ? "Your main · pick one of the chips to start"
            : otherMembersUnset > 0
              ? `Your main · ${otherMembersUnset} teammate${otherMembersUnset === 1 ? "" : "s"} haven't set theirs yet`
              : "Your main · everyone has set theirs"}
        </span>
      </div>

      {/* Pick-one-to-start divider + chips (only when empty) */}
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
                className="inline-flex items-center gap-1.5 rounded-pill border border-coral bg-white px-3.5 py-2 text-xs font-medium text-charcoal transition-colors hover:bg-coral/[.06]"
              >
                <span>{c}</span>
                <span className="text-coral text-[10px]">↗</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] italic text-linen">
              tap any chip to fill the input → press{" "}
              <kbd className="rounded-sm border border-mist bg-mist-soft px-1 py-0.5 font-mono text-[9px] text-charcoal-soft">
                ⌘ ↩
              </kbd>{" "}
              to confirm
            </span>
            <span className="text-[10px] italic text-linen">
              ⌘ R refresh chips
            </span>
          </div>
        </>
      )}

      {/* Divider before ALSO TODAY */}
      <div className="mt-6 h-px bg-mist-soft" />

      {/* ALSO TODAY zone */}
      <div
        className={`mt-4 ${isEmpty ? "opacity-50" : ""}`}
        aria-disabled={isEmpty}
      >
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
                className="flex items-center gap-3 rounded-md px-3 py-2.5"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                    b.is_complete
                      ? "border-coral bg-coral text-white"
                      : "border-mist bg-white"
                  }`}
                >
                  {b.is_complete && <span className="text-[10px]">✓</span>}
                </span>
                <span
                  className={`text-sm font-medium ${
                    b.is_complete
                      ? "text-linen line-through"
                      : "text-charcoal"
                  }`}
                >
                  {b.text}
                </span>
                <span className="ml-auto text-xs text-linen">✕</span>
              </div>
            ))}

          <div
            className={`flex items-center gap-2.5 rounded-md border border-dashed border-mist px-3 py-2.5 ${
              isEmpty ? "" : "border-coral"
            }`}
          >
            <span
              className={`text-sm font-semibold ${isEmpty ? "text-linen" : "text-coral"}`}
            >
              +
            </span>
            <span
              className={`text-xs italic ${isEmpty ? "text-linen" : "text-coral"}`}
            >
              {isEmpty
                ? "set the main thing first"
                : "add another bonus for today"}
            </span>
            <span className="ml-auto text-[10px] italic text-linen">enter</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function todayLabel() {
  const d = new Date();
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();
}
