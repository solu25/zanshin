import type { DashboardData } from "@/lib/dashboard-data";
import { TodayCard } from "./today-card";
import { WeekTrail } from "./week-trail";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function weekNumber(today: Date = new Date()) {
  const start = new Date(today.getFullYear(), 0, 1);
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
}

export function MainColumn({
  user,
  weeklyGoal,
  members,
  myDailyOne,
  trail,
}: {
  user: DashboardData["user"];
  weeklyGoal: DashboardData["weeklyGoal"];
  members: DashboardData["members"];
  myDailyOne: DashboardData["myDailyOne"];
  trail: DashboardData["trail"];
}) {
  const me = members.find((m) => m.is_you);
  const myProfile = {
    display_name:
      me?.display_name?.trim() ||
      (me?.email ? me.email.split("@")[0] : user.email.split("@")[0]),
    avatar_color: me?.avatar_color ?? "coral",
  };

  const otherMembersUnset = members.filter(
    (m) => !m.is_you && !m.daily_one_today,
  ).length;

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-page">
      {/* Header — pinned at the top */}
      <div className="shrink-0 flex items-center justify-between border-b border-mist-soft px-10 py-5">
        <p className="text-[13px] font-medium text-charcoal">
          Today · {formatToday()} · day 1 · WEEK {weekNumber()}
        </p>
        <p className="text-xs italic text-linen">
          {myDailyOne
            ? "main set · bonuses optional"
            : "fresh — pick one to start"}
        </p>
      </div>

      {/* Scrollable content region */}
      <div className="flex-1 overflow-y-auto px-10 py-7">
        {/* Weekly slice */}
        <section>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-3.5 bg-coral" />
            <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
              This week&apos;s slice
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-medium leading-snug tracking-[-0.4px] text-charcoal">
            {weeklyGoal?.text ?? "No weekly goal set yet."}
          </h1>
        </section>

        {/* Today's mega-card */}
        <div className="mt-6">
          <TodayCard
            myProfile={myProfile}
            myDailyOne={myDailyOne}
            otherMembersUnset={otherMembersUnset}
          />
        </div>

        {/* Week trail */}
        <div className="mt-8">
          <WeekTrail trail={trail} currentUserId={user.id} />
        </div>
      </div>

      {/* Footer — pinned at the bottom */}
      <footer className="shrink-0 flex items-center justify-between border-t border-mist-soft px-10 py-3.5 text-[11px] italic text-linen">
        <span>
          {myDailyOne
            ? "Main is locked. Bonuses are optional and editable all day."
            : "One main thing — anything else is bonus."}
        </span>
        <span className="font-mono">
          {myDailyOne ? "⌘ N  add bonus  ·  ⌘ E  edit main" : "⌘ ↩  set main"}
        </span>
      </footer>
    </main>
  );
}
