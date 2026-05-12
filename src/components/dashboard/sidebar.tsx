import { Avatar } from "@/components/avatar";
import type { DashboardData } from "@/lib/dashboard-data";

function formatDeadline(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function weeksOut(iso: string) {
  if (!iso) return 0;
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)),
  );
}

export function Sidebar({
  team,
  mainGoal,
  members,
  myProfile,
}: {
  team: DashboardData["team"];
  mainGoal: DashboardData["mainGoal"];
  members: DashboardData["members"];
  myProfile: { display_name: string; avatar_color: string };
}) {
  const totalWeeks = mainGoal ? weeksOut(mainGoal.deadline) : 0;
  const memberCount = members.length;

  return (
    <aside className="flex w-[280px] shrink-0 flex-col bg-mist-soft px-[22px] py-7">
      {/* Brand + team name */}
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tracking-tight text-charcoal">
          zanshin
        </span>
        <span className="text-lg font-bold text-coral">.</span>
        <span className="text-linen">·</span>
        <span className="truncate text-xs italic text-linen">{team.name}</span>
      </div>

      {/* Main goal card */}
      <div className="mt-7 rounded-input border border-mist bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold tracking-[1.6px] text-coral uppercase">
              Main goal
            </span>
          </div>
          <span className="cursor-pointer text-xs text-linen hover:text-charcoal-soft">
            ✎
          </span>
        </div>
        <p className="mt-2 text-[13px] font-medium leading-snug text-charcoal">
          {mainGoal?.text ?? "Set a main goal in onboarding."}
        </p>
        {mainGoal && (
          <div className="mt-2.5 flex items-center justify-between text-[10px]">
            <span className="italic text-linen">
              by {formatDeadline(mainGoal.deadline)}
            </span>
            <span className="font-semibold text-charcoal">
              {totalWeeks} wk
            </span>
          </div>
        )}
      </div>

      {/* Team card */}
      <div className="mt-3.5 rounded-input border border-mist bg-white p-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[9px] font-bold tracking-[1.6px] text-coral uppercase">
            Team
          </span>
          <span className="text-[10px] italic text-linen">
            {memberCount} {memberCount === 1 ? "person" : "people"}
          </span>
        </div>
        <ul className="mt-2.5 space-y-0.5">
          {members.map((m) => {
            const label =
              m.display_name?.trim() ||
              (m.email ? m.email.split("@")[0] : "Member");
            return (
              <li
                key={m.user_id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
              >
                <Avatar name={label} color={m.avatar_color} size="sm" />
                <span
                  className={`text-xs truncate ${m.is_you ? "font-semibold text-charcoal" : "font-medium text-charcoal"}`}
                >
                  {label}
                </span>
                {m.is_you && (
                  <span className="text-[9px] italic text-coral">(you)</span>
                )}
                <span className="ml-auto h-1.5 w-1.5 rounded-pill bg-green" />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Spacer pushes the user pill + invite link to the bottom */}
      <div className="flex-1" />

      {/* User pill */}
      <div className="flex items-center gap-2.5 rounded-input border border-mist bg-white px-3 py-2.5">
        <Avatar
          name={myProfile.display_name}
          color={myProfile.avatar_color}
          size="md"
        />
        <span className="truncate text-[13px] font-medium text-charcoal">
          {myProfile.display_name}
        </span>
        <span className="ml-auto cursor-pointer text-xs text-linen hover:text-charcoal-soft">
          ⚙
        </span>
      </div>

      {/* Invite teammates link */}
      <button
        type="button"
        className="mt-1.5 flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium text-coral transition-colors hover:bg-coral/[.06]"
      >
        <span aria-hidden>+</span>
        <span>invite teammates</span>
      </button>
    </aside>
  );
}
