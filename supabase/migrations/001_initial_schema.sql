-- ============================================================================
-- ZANSHIN — Initial schema (001)
--
-- Run this once via Supabase SQL Editor on the `zanshin` project.
-- Idempotent within reason; safe to re-run on a fresh database.
--
-- Tables:        profiles, teams, team_members, main_goals, weekly_goals,
--                daily_ones, bonuses, ships, ship_reviews, team_tools,
--                invitations
-- RLS:           on for all public.* tables; team members can see each
--                other's stuff in the same team
-- Triggers:      auto-create profile on signup, auto-add team creator as
--                owner, keep updated_at columns in sync
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
-- pgcrypto provides gen_random_uuid(); enabled by default on Supabase but
-- declaring it explicitly is safer.
create extension if not exists "pgcrypto";


-- ----------------------------------------------------------------------------
-- 2. TABLES
-- ----------------------------------------------------------------------------

-- profiles · extends auth.users with app-specific data
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_color  text not null default 'coral'
                check (avatar_color in ('coral','purple','green','linen','charcoal')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- teams · a group doing async standup together (no size cap)
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- team_members · join table; one user may belong to many teams later
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  team_id       uuid not null references public.teams(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'member'
                check (role in ('owner','admin','member')),
  avatar_color  text not null default 'coral'
                check (avatar_color in ('coral','purple','green','linen','charcoal')),
  joined_at     timestamptz not null default now(),
  unique (team_id, user_id)
);

-- main_goals · the ~3-month anchor goal per team
create table if not exists public.main_goals (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  text        text not null,
  deadline    date not null,
  is_active   boolean not null default true,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- weekly_goals · one per team per ISO week
create table if not exists public.weekly_goals (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  text        text not null,
  week_start  date not null,  -- Monday of the ISO week
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (team_id, week_start)
);

-- daily_ones · today's one thing (main task) per user per day
create table if not exists public.daily_ones (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  team_id      uuid not null references public.teams(id) on delete cascade,
  text         text not null,
  date         date not null default current_date,
  is_complete  boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, date)
);

-- bonuses · ALSO TODAY items below the daily one-thing
create table if not exists public.bonuses (
  id            uuid primary key default gen_random_uuid(),
  daily_one_id  uuid not null references public.daily_ones(id) on delete cascade,
  text          text not null,
  is_complete   boolean not null default false,
  completed_at  timestamptz,
  order_index   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ships · chronological log of "what got finished" — description always required
create table if not exists public.ships (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  team_id          uuid not null references public.teams(id) on delete cascade,
  description      text not null,
  link             text,
  needs_eyes       boolean not null default false,
  shipped_at       timestamptz not null default now(),
  edit_locked_at   timestamptz not null default (now() + interval '24 hours'),
  last_edited_at   timestamptz,
  last_edited_note text,  -- e.g. "Hema edited 2h after posting"
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ship_reviews · "I saw this" on a needs-eyes ship
create table if not exists public.ship_reviews (
  id          uuid primary key default gen_random_uuid(),
  ship_id     uuid not null references public.ships(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewed_at timestamptz not null default now(),
  unique (ship_id, reviewer_id)
);

-- team_tools · connected integrations (slack, granola, etc.) per team
create table if not exists public.team_tools (
  id            uuid primary key default gen_random_uuid(),
  team_id       uuid not null references public.teams(id) on delete cascade,
  tool_name     text not null
                check (tool_name in ('slack','granola','linear','google_cal','github','notion')),
  connected_at  timestamptz not null default now(),
  connected_by  uuid not null references auth.users(id),
  unique (team_id, tool_name)
);

-- invitations · pending email invites to join a team
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  email       text not null,
  invited_by  uuid not null references auth.users(id),
  token       text not null unique default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now(),
  unique (team_id, email)
);


-- ----------------------------------------------------------------------------
-- 3. INDEXES (performance)
-- ----------------------------------------------------------------------------
create index if not exists idx_team_members_user_id      on public.team_members(user_id);
create index if not exists idx_team_members_team_id      on public.team_members(team_id);
create index if not exists idx_main_goals_team_active    on public.main_goals(team_id, is_active);
create index if not exists idx_weekly_goals_team_week    on public.weekly_goals(team_id, week_start desc);
create index if not exists idx_daily_ones_team_date      on public.daily_ones(team_id, date desc);
create index if not exists idx_daily_ones_user_date      on public.daily_ones(user_id, date desc);
create index if not exists idx_bonuses_daily_one_id      on public.bonuses(daily_one_id);
create index if not exists idx_ships_team_shipped_at     on public.ships(team_id, shipped_at desc);
create index if not exists idx_ships_user_shipped_at     on public.ships(user_id, shipped_at desc);
create index if not exists idx_ship_reviews_ship_id      on public.ship_reviews(ship_id);
create index if not exists idx_invitations_token         on public.invitations(token);
create index if not exists idx_invitations_team_email    on public.invitations(team_id, email);


-- ----------------------------------------------------------------------------
-- 4. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- is_team_member(team_id) · used inside RLS policies to check membership
-- SECURITY DEFINER so it can read team_members regardless of caller's RLS
create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
  );
$$;

-- is_team_role(team_id, role) · checks if current user has a specific role
create or replace function public.is_team_role(p_team_id uuid, p_role text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and role = p_role
  );
$$;

-- set_updated_at() · trigger function to refresh updated_at on row update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- 5. TRIGGERS
-- ----------------------------------------------------------------------------

-- 5a · Auto-create a profile row whenever a new Supabase auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'coral'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 5b · Auto-add the team creator as owner with coral color
create or replace function public.add_team_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id, role, avatar_color)
  values (new.id, new.created_by, 'owner', 'coral')
  on conflict (team_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_team_created on public.teams;
create trigger on_team_created
  after insert on public.teams
  for each row execute function public.add_team_creator_as_owner();


-- 5c · updated_at triggers on every table that has the column
create trigger set_updated_at_profiles      before update on public.profiles      for each row execute function public.set_updated_at();
create trigger set_updated_at_teams         before update on public.teams         for each row execute function public.set_updated_at();
create trigger set_updated_at_main_goals    before update on public.main_goals    for each row execute function public.set_updated_at();
create trigger set_updated_at_weekly_goals  before update on public.weekly_goals  for each row execute function public.set_updated_at();
create trigger set_updated_at_daily_ones    before update on public.daily_ones    for each row execute function public.set_updated_at();
create trigger set_updated_at_bonuses       before update on public.bonuses       for each row execute function public.set_updated_at();
create trigger set_updated_at_ships         before update on public.ships         for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY — turn it on everywhere
-- ----------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.teams         enable row level security;
alter table public.team_members  enable row level security;
alter table public.main_goals    enable row level security;
alter table public.weekly_goals  enable row level security;
alter table public.daily_ones    enable row level security;
alter table public.bonuses       enable row level security;
alter table public.ships         enable row level security;
alter table public.ship_reviews  enable row level security;
alter table public.team_tools    enable row level security;
alter table public.invitations   enable row level security;


-- ----------------------------------------------------------------------------
-- 7. RLS POLICIES
-- ----------------------------------------------------------------------------

-- profiles · anyone authenticated can read; only own profile can be updated
create policy "profiles: read all" on public.profiles
  for select to authenticated using (true);

create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());


-- teams · members can read; any auth user can create; owners can update/delete
create policy "teams: read if member" on public.teams
  for select to authenticated using (is_team_member(id));

create policy "teams: create" on public.teams
  for insert to authenticated with check (created_by = auth.uid());

create policy "teams: update if owner" on public.teams
  for update to authenticated using (is_team_role(id, 'owner'));

create policy "teams: delete if owner" on public.teams
  for delete to authenticated using (is_team_role(id, 'owner'));


-- team_members · members can read each other; owners add/remove; you can leave
create policy "team_members: read if member" on public.team_members
  for select to authenticated using (is_team_member(team_id));

create policy "team_members: insert if owner or self" on public.team_members
  for insert to authenticated with check (
    is_team_role(team_id, 'owner') or user_id = auth.uid()
  );

create policy "team_members: update if owner" on public.team_members
  for update to authenticated using (is_team_role(team_id, 'owner'));

create policy "team_members: delete if owner or self" on public.team_members
  for delete to authenticated using (
    is_team_role(team_id, 'owner') or user_id = auth.uid()
  );


-- main_goals · team members can read/write
create policy "main_goals: all if member" on public.main_goals
  for all to authenticated using (is_team_member(team_id)) with check (is_team_member(team_id));


-- weekly_goals · team members can read/write
create policy "weekly_goals: all if member" on public.weekly_goals
  for all to authenticated using (is_team_member(team_id)) with check (is_team_member(team_id));


-- daily_ones · members can read; only YOU can write your own
create policy "daily_ones: read if member" on public.daily_ones
  for select to authenticated using (is_team_member(team_id));

create policy "daily_ones: insert own" on public.daily_ones
  for insert to authenticated with check (user_id = auth.uid() and is_team_member(team_id));

create policy "daily_ones: update own" on public.daily_ones
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "daily_ones: delete own" on public.daily_ones
  for delete to authenticated using (user_id = auth.uid());


-- bonuses · members can read all; only owner of parent daily_one can write
create policy "bonuses: read if member of parent team" on public.bonuses
  for select to authenticated using (
    exists (
      select 1 from public.daily_ones d
      where d.id = bonuses.daily_one_id and is_team_member(d.team_id)
    )
  );

create policy "bonuses: insert if own parent" on public.bonuses
  for insert to authenticated with check (
    exists (
      select 1 from public.daily_ones d
      where d.id = bonuses.daily_one_id and d.user_id = auth.uid()
    )
  );

create policy "bonuses: update if own parent" on public.bonuses
  for update to authenticated using (
    exists (
      select 1 from public.daily_ones d
      where d.id = bonuses.daily_one_id and d.user_id = auth.uid()
    )
  );

create policy "bonuses: delete if own parent" on public.bonuses
  for delete to authenticated using (
    exists (
      select 1 from public.daily_ones d
      where d.id = bonuses.daily_one_id and d.user_id = auth.uid()
    )
  );


-- ships · members can read; you can only write your own; edit window enforced
create policy "ships: read if member" on public.ships
  for select to authenticated using (is_team_member(team_id));

create policy "ships: insert own" on public.ships
  for insert to authenticated with check (user_id = auth.uid() and is_team_member(team_id));

create policy "ships: update own within edit window" on public.ships
  for update to authenticated
  using (user_id = auth.uid() and now() < edit_locked_at)
  with check (user_id = auth.uid() and now() < edit_locked_at);

create policy "ships: delete own within edit window" on public.ships
  for delete to authenticated using (user_id = auth.uid() and now() < edit_locked_at);


-- ship_reviews · members can read; only team members (other than the ship author) can mark reviewed
create policy "ship_reviews: read if member" on public.ship_reviews
  for select to authenticated using (
    exists (
      select 1 from public.ships s
      where s.id = ship_reviews.ship_id and is_team_member(s.team_id)
    )
  );

create policy "ship_reviews: insert if team member but not author" on public.ship_reviews
  for insert to authenticated with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.ships s
      where s.id = ship_reviews.ship_id
        and is_team_member(s.team_id)
        and s.user_id <> auth.uid()
    )
  );

create policy "ship_reviews: delete own" on public.ship_reviews
  for delete to authenticated using (reviewer_id = auth.uid());


-- team_tools · members can read/write
create policy "team_tools: read if member" on public.team_tools
  for select to authenticated using (is_team_member(team_id));

create policy "team_tools: insert if member" on public.team_tools
  for insert to authenticated with check (
    is_team_member(team_id) and connected_by = auth.uid()
  );

create policy "team_tools: delete if member" on public.team_tools
  for delete to authenticated using (is_team_member(team_id));


-- invitations · members can read; owners/admins can create; only via server action to accept
create policy "invitations: read if member" on public.invitations
  for select to authenticated using (is_team_member(team_id));

create policy "invitations: insert if owner or admin" on public.invitations
  for insert to authenticated with check (
    (is_team_role(team_id, 'owner') or is_team_role(team_id, 'admin'))
    and invited_by = auth.uid()
  );

create policy "invitations: delete if owner or admin" on public.invitations
  for delete to authenticated using (
    is_team_role(team_id, 'owner') or is_team_role(team_id, 'admin')
  );


-- ============================================================================
-- DONE.
--
-- After running this, the database has all tables, RLS is enforced, and
-- new auth signups automatically get a profile row. Creating a team
-- automatically adds the creator as an owner member.
--
-- Next step (in the app): generate TypeScript types with
--   npx supabase gen types typescript --project-id cxiliaaqngamntmbwlaw \
--     > src/lib/supabase/types.ts
-- (after running `npm install supabase --save-dev` and logging in).
-- ============================================================================
