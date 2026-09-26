-- Team pages (/teams/:id): one row per team holding the admin-managed page
-- as jsonb (title, tagline, card summary, cover image and an ordered list of
-- sections — text, people, timeline, members, YouTube, Instagram,
-- competitions, gallery). Edited at /admin/teams.
--
-- `id` matches the team id in src/Components/teams/teamsData.js. A team with
-- no row simply shows its built-in default content.

create table if not exists public.team_pages (
  id smallint primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.team_pages enable row level security;

drop policy if exists "team_pages_public_read" on public.team_pages;
create policy "team_pages_public_read"
  on public.team_pages for select
  using (true);

-- Saving uses upsert, so admins need both insert and update.
drop policy if exists "team_pages_admin_insert" on public.team_pages;
create policy "team_pages_admin_insert"
  on public.team_pages for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "team_pages_admin_update" on public.team_pages;
create policy "team_pages_admin_update"
  on public.team_pages for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
