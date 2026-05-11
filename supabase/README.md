# Zanshin · Supabase

Source of truth for the Zanshin database. Migrations live in `migrations/` and run against the live Supabase project at `https://cxiliaaqngamntmbwlaw.supabase.co`.

## How to run a migration

1. Open the Supabase dashboard → SQL Editor.
2. Click "New query".
3. Copy the contents of the migration file (e.g. `migrations/001_initial_schema.sql`).
4. Paste, then click "Run".
5. Confirm the success message — no rows should be returned.

For the first migration, you'll see a bunch of `CREATE` and `ALTER` statements in the output. As long as none of them say `ERROR`, you're good.

## What's in the database

After running `001_initial_schema.sql`:

| Table          | What it holds                                    |
|----------------|--------------------------------------------------|
| `profiles`     | Display name + avatar color, one per auth user   |
| `teams`        | A group of people doing async standup together    |
| `team_members` | Many-to-many join between users and teams         |
| `main_goals`   | The 3-month anchor per team                       |
| `weekly_goals` | The weekly slice — one per team per ISO week     |
| `daily_ones`   | Today's one thing, per user per day               |
| `bonuses`      | ALSO TODAY items under a daily one                |
| `ships`        | Chronological log of finished work                |
| `ship_reviews` | "I saw this" on needs-eyes ships                  |
| `team_tools`   | Connected integrations (Slack, Granola, etc.)     |
| `invitations`  | Pending email invites to join a team              |

Row Level Security is enforced on every table. Rule of thumb: **team members can see each other's stuff within the same team; only you can modify your own daily one, bonuses, and ships.** Ships have an additional 24-hour edit window after which they're locked.

## Generating TypeScript types

Once the schema is live, generate matching TypeScript types so the app gets full autocomplete:

```bash
npm install supabase --save-dev
npx supabase login
npx supabase gen types typescript --project-id cxiliaaqngamntmbwlaw > src/lib/supabase/types.ts
```

Re-run this whenever the schema changes.
