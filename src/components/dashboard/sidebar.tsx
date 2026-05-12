"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import type { DashboardData } from "@/lib/dashboard-data";
import { InviteModal } from "./invite-modal";
import { EditMainGoalModal } from "./edit-main-goal-modal";

const STORAGE_KEY = "zanshin.sidebar.collapsed";

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
  pendingInvites,
  myProfile,
}: {
  team: DashboardData["team"];
  mainGoal: DashboardData["mainGoal"];
  members: DashboardData["members"];
  pendingInvites: number;
  myProfile: { display_name: string; avatar_color: string };
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate collapse state from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setCollapsed(stored === "1");
    } catch {
      /* private browsing, ignore */
    }
    setMounted(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // Render skeleton matching collapsed state default to avoid flash before hydration.
  const width = collapsed ? 56 : 280;

  return (
    <>
      <aside
        style={{ width, transition: mounted ? "width 200ms ease" : undefined }}
        className="relative shrink-0 bg-mist-soft py-7 overflow-hidden"
      >
        {/* Collapse toggle, anchored top-right */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-3.5 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-linen hover:bg-mist hover:text-charcoal-soft transition-colors"
        >
          <span aria-hidden className="text-sm">
            {collapsed ? "›" : "‹"}
          </span>
        </button>

        {collapsed ? (
          <CollapsedRail
            members={members}
            myProfile={myProfile}
            onInvite={() => setInviteOpen(true)}
          />
        ) : (
          <ExpandedSidebar
            team={team}
            mainGoal={mainGoal}
            members={members}
            pendingInvites={pendingInvites}
            myProfile={myProfile}
            onInvite={() => setInviteOpen(true)}
            onEditGoal={() => setEditGoalOpen(true)}
          />
        )}
      </aside>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        teamName={team.name}
      />

      <EditMainGoalModal
        open={editGoalOpen}
        onClose={() => setEditGoalOpen(false)}
        initialText={mainGoal?.text ?? ""}
        initialDeadline={mainGoal?.deadline ?? ""}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Expanded (280px) — full sidebar with main goal, team card, user pill
// ---------------------------------------------------------------------------
function ExpandedSidebar({
  team,
  mainGoal,
  members,
  pendingInvites,
  myProfile,
  onInvite,
  onEditGoal,
}: {
  team: DashboardData["team"];
  mainGoal: DashboardData["mainGoal"];
  members: DashboardData["members"];
  pendingInvites: number;
  myProfile: { display_name: string; avatar_color: string };
  onInvite: () => void;
  onEditGoal: () => void;
}) {
  const totalWeeks = mainGoal ? weeksOut(mainGoal.deadline) : 0;
  const memberCount = members.length;

  return (
    <div className="flex h-full flex-col px-[22px]">
      {/* Brand */}
      <div className="flex items-baseline gap-2 pr-8">
        <span className="text-lg font-semibold tracking-tight text-charcoal">
          zanshin
        </span>
        <span className="text-lg font-bold text-coral">.</span>
        <span className="text-linen">·</span>
        <span className="truncate text-xs italic text-linen">{team.name}</span>
      </div>

      {/* Main goal card */}
      <button
        type="button"
        onClick={onEditGoal}
        aria-label="Edit main goal"
        className="group mt-7 w-full rounded-input border border-mist bg-white p-4 text-left transition-all hover:border-coral hover:shadow-[0_2px_8px_rgba(237,106,90,0.08)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-[1.6px] text-coral uppercase">
            Main goal
          </span>
          <span className="inline-flex items-center gap-1 rounded-pill border border-mist bg-mist-soft px-2 py-0.5 text-[9px] font-medium text-charcoal-soft transition-colors group-hover:border-coral group-hover:bg-coral/[.08] group-hover:text-coral">
            <span>✎</span>
            <span>edit</span>
          </span>
        </div>
        <p className="mt-2 text-[13px] font-medium leading-snug text-charcoal">
          {mainGoal?.text ?? "Set a main goal."}
        </p>
        {mainGoal && (
          <div className="mt-2.5 flex items-center justify-between text-[10px]">
            <span className="italic text-linen">
              by {formatDeadline(mainGoal.deadline)}
            </span>
            <span className="font-semibold text-charcoal">{totalWeeks} wk</span>
          </div>
        )}
      </button>

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

        {/* Hairline divider + invite link inside the team card */}
        <div className="mt-1 mx-2 h-px bg-mist-soft" />
        <button
          type="button"
          onClick={onInvite}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-[12px] font-medium text-coral transition-colors hover:bg-coral/[.06]"
        >
          <span aria-hidden className="text-sm">
            +
          </span>
          <span>invite teammates</span>
          {pendingInvites > 0 && (
            <span className="ml-auto rounded-pill bg-coral/15 px-1.5 py-0.5 text-[9px] font-bold text-coral">
              {pendingInvites} pending
            </span>
          )}
        </button>
      </div>

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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsed (56px) — narrow rail with vertical avatars + invite icon
// ---------------------------------------------------------------------------
function CollapsedRail({
  members,
  myProfile,
  onInvite,
}: {
  members: DashboardData["members"];
  myProfile: { display_name: string; avatar_color: string };
  onInvite: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-between pt-12 pb-3">
      {/* Brand mark only */}
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold text-coral">.</span>
      </div>

      {/* Team avatars stacked */}
      <div className="flex flex-col items-center gap-2 mt-3">
        {members.map((m) => {
          const label =
            m.display_name?.trim() ||
            (m.email ? m.email.split("@")[0] : "Member");
          return (
            <div key={m.user_id} className="relative" title={label}>
              <Avatar name={label} color={m.avatar_color} size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-pill bg-green ring-2 ring-mist-soft" />
            </div>
          );
        })}

        {/* + invite — same visual rhythm as avatars */}
        <button
          type="button"
          onClick={onInvite}
          aria-label="Invite teammates"
          className="flex h-8 w-8 items-center justify-center rounded-pill border border-dashed border-coral text-coral transition-colors hover:bg-coral/[.06]"
        >
          <span aria-hidden className="text-sm">
            +
          </span>
        </button>
      </div>

      {/* Bottom: user avatar */}
      <div className="flex flex-col items-center gap-2">
        <Avatar
          name={myProfile.display_name}
          color={myProfile.avatar_color}
          size="md"
        />
      </div>
    </div>
  );
}
