-- "Join our teams" feature: a singleton config row (feature on/off, the full
-- list of admin-managed form fields with their own options, per-team
-- WhatsApp group links) and the submitted applications themselves.
--
-- NOTE: this version replaces an earlier one that gave team_join_applications
-- fixed columns (faculty/batch/district/team/detail). Fields are now fully
-- admin-editable, so answers are stored as a flexible jsonb blob instead.
-- Re-running this file drops and recreates team_join_applications — fine for
-- a fresh setup, but it will erase any rows saved under the old schema.

create table if not exists public.team_join_config (
  id smallint primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint team_join_config_singleton check (id = 1)
);

insert into public.team_join_config (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.team_join_config enable row level security;

drop policy if exists "team_join_config_public_read" on public.team_join_config;
create policy "team_join_config_public_read"
  on public.team_join_config for select
  using (true);

drop policy if exists "team_join_config_admin_write" on public.team_join_config;
create policy "team_join_config_admin_write"
  on public.team_join_config for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Submitted applications — recreated with a flexible `answers` blob so
-- admin-added fields don't require a schema change.
drop table if exists public.team_join_applications cascade;

create table public.team_join_applications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  answers jsonb not null default '{}'::jsonb
);

alter table public.team_join_applications enable row level security;

-- Anyone can submit an application — no login required to apply.
create policy "team_join_applications_public_insert"
  on public.team_join_applications for insert
  with check (true);

-- Only signed-in admins can view or remove submitted applications.
create policy "team_join_applications_admin_read"
  on public.team_join_applications for select
  using (auth.role() = 'authenticated');

create policy "team_join_applications_admin_delete"
  on public.team_join_applications for delete
  using (auth.role() = 'authenticated');
