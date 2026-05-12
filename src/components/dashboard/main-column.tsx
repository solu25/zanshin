import type { DashboardData } from "@/lib/dashboard-data";
import { TodayCard } from "./today-card";
import { WeekTrail } from "./week-trail";

function formatToday() {
  return new Date()
    .toLocaleDateString("en-US", {
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

  // Are there other team members who haven't set their daily one yet?
  const otherMembersUnset = members.filter(
    (m) => !m.is_you && !m.daily_one_today,
  ).length;

  return (
    <main className="flex-1 bg-page px-10 py-7 flex flex-col">
      {/* Header row */}
      <div className="flex items-center justify-between pb-4 border-b border-mist-soft">
        <p className="text-[13px] font-medium text-charcoal">
          Today · {formatToday()} · day 1 · WEEK {weekNumber()}
        </p>
        <p className="text-xs italic text-linen">
          {myDailyOne
            ? "main set · bonuses optional"
            : "fresh — pick one to start"}
        </p>
      </div>

      {/* Weekly slice */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-coral" />
          <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
            This week&apos;s slice
          </span>
        </div>
        <h1 className="mt-2 text-[22px] font-medium leading-snug tracking-[-0.4px] text-charcoal">
          {weeklyGoal?.text ?? "No weekly goal set yet."}
        </h1>
      </div>

      {/* Today's mega-card */}
      <div className="mt-6">
        <TodayCard
          myProfile={myProfile}
          myDailyOne={myDailyOne}
          otherMembersUnset={otherMembersUnset}
        />
      </div>

      {/* Spacer that pushes trail to bottom if there's room */}
      <div className="mt-6" />

      {/* Week trail */}
      <WeekTrail trail={trail} currentUserId={user.id} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer hint */}
      <footer className="pt-4 mt-6 border-t border-mist-soft flex items-center justify-between text-[11px] italic text-linen">
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

