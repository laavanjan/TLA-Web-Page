-- Team editors: people who can sign in to /admin but only manage the team
-- pages (and join applications) they're assigned to. Main admins keep full
-- access. Also adds an activity log of who changed what.
--
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Every account that exists when this runs becomes a MAIN ADMIN, so current
-- admins aren't locked out. Check Authentication → Users first and delete
-- any account you don't recognise.
--
-- Accounts are created and managed from /admin/editors, through the
-- `admin-users` Edge Function (it holds the service-role key needed to
-- create logins).

-- ---- Roles ------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  name text not null default '',
  email text not null default '',
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  password_changed_at timestamptz
);

create table if not exists public.admin_user_teams (
  user_id uuid not null references public.admin_users (user_id) on delete cascade,
  team_id smallint not null,
  primary key (user_id, team_id)
);

insert into public.admin_users (user_id, role, email)
select id, 'admin', coalesce(email, '')
from auth.users
on conflict (user_id) do nothing;

-- Passwords of team editors, encrypted by the admin-users function with the
-- PASSWORD_VAULT_KEY secret. No policies: browsers can never read this table,
-- only the function (service role) can.
create table if not exists public.admin_password_vault (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_user_teams enable row level security;
alter table public.admin_password_vault enable row level security;

-- ---- Permission helpers -------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where user_id = auth.uid() and role = 'admin' and not disabled
  );
$$;

create or replace function public.can_edit_team(t integer)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from admin_users u
    join admin_user_teams m on m.user_id = u.user_id
    where u.user_id = auth.uid() and u.role = 'editor' and not u.disabled and m.team_id = t
  );
$$;

-- Everyone signed in can read their own role (the admin panel needs it);
-- admins can read everyone's. All writes go through the admin-users function.
drop policy if exists "admin_users_read" on public.admin_users;
create policy "admin_users_read"
  on public.admin_users for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_user_teams_read" on public.admin_user_teams;
create policy "admin_user_teams_read"
  on public.admin_user_teams for select
  using (user_id = auth.uid() or public.is_admin());

-- ---- Team pages: admins, or that team's editors -------------------------------

drop policy if exists "team_pages_admin_insert" on public.team_pages;
create policy "team_pages_admin_insert"
  on public.team_pages for insert
  with check (public.can_edit_team(id));

drop policy if exists "team_pages_admin_update" on public.team_pages;
create policy "team_pages_admin_update"
  on public.team_pages for update
  using (public.can_edit_team(id))
  with check (public.can_edit_team(id));

-- ---- Site-wide settings: main admins only -------------------------------------

drop policy if exists "book_config_admin_write" on public.book_config;
create policy "book_config_admin_write"
  on public.book_config for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact_info_admin_write" on public.contact_info;
create policy "contact_info_admin_write"
  on public.contact_info for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "team_join_config_admin_write" on public.team_join_config;
create policy "team_join_config_admin_write"
  on public.team_join_config for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---- Join applications: admins see all, editors see their teams' ------------
-- Applications store the team the applicant picked by *name*, so each one is
-- tagged with a team id when it arrives. Names are matched against the team
-- page titles, then the built-in names below.

create table if not exists public.team_names (
  team_id smallint not null,
  name text primary key
);

insert into public.team_names (team_id, name) values
  (1, 'வலையமைப்பு அணி'),
  (2, 'ஊடக அணி'),
  (3, 'வடிவமைப்பு அணி'),
  (4, 'தொழில்நுட்ப அணி')
on conflict (name) do nothing;

alter table public.team_names enable row level security;

create or replace function public.team_id_for_name(t text)
returns smallint
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select id from team_pages where trim(data ->> 'title') = trim(t) limit 1),
    (select team_id from team_names where name = trim(t) limit 1)
  );
$$;

alter table public.team_join_applications add column if not exists team_id smallint;

create or replace function public.tag_application_team()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  new.team_id := public.team_id_for_name(new.answers ->> 'team');
  return new;
end;
$$;

drop trigger if exists team_join_applications_tag on public.team_join_applications;
create trigger team_join_applications_tag
  before insert on public.team_join_applications
  for each row execute function public.tag_application_team();

update public.team_join_applications
set team_id = public.team_id_for_name(answers ->> 'team')
where team_id is null;

drop policy if exists "team_join_applications_admin_read" on public.team_join_applications;
create policy "team_join_applications_admin_read"
  on public.team_join_applications for select
  using (public.is_admin() or (team_id is not null and public.can_edit_team(team_id)));

drop policy if exists "team_join_applications_admin_delete" on public.team_join_applications;
create policy "team_join_applications_admin_delete"
  on public.team_join_applications for delete
  using (public.is_admin() or (team_id is not null and public.can_edit_team(team_id)));

-- ---- Activity log -------------------------------------------------------------
-- Written by triggers and the admin-users function only, so it can't be
-- skipped or faked from a browser. Publishes keep the page before and after,
-- which the Activity page turns into a readable summary.

create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text not null default '',
  actor_name text not null default '',
  team_id smallint,
  action text not null,
  target_id uuid,
  target_email text not null default '',
  details jsonb not null default '{}'::jsonb
);

create index if not exists admin_activity_created_idx on public.admin_activity (created_at desc);
create index if not exists admin_activity_actor_idx on public.admin_activity (actor_id, created_at desc);

alter table public.admin_activity enable row level security;

drop policy if exists "admin_activity_admin_read" on public.admin_activity;
create policy "admin_activity_admin_read"
  on public.admin_activity for select
  using (public.is_admin());

create or replace function public.log_admin_activity(
  p_action text,
  p_team_id smallint,
  p_details jsonb
) returns void
language plpgsql security definer set search_path = public
as $$
declare
  me admin_users%rowtype;
begin
  select * into me from admin_users where user_id = auth.uid();
  insert into admin_activity (actor_id, actor_email, actor_name, team_id, action, details)
  values (
    auth.uid(),
    coalesce(nullif(me.email, ''), auth.jwt() ->> 'email', ''),
    coalesce(me.name, ''),
    p_team_id,
    p_action,
    coalesce(p_details, '{}'::jsonb)
  );
end;
$$;

-- Not callable from browsers; only the triggers below use it.
revoke execute on function public.log_admin_activity(text, smallint, jsonb) from public, anon, authenticated;

create or replace function public.log_team_page_publish()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  perform public.log_admin_activity(
    'publish',
    new.id,
    jsonb_build_object(
      'before', case when tg_op = 'UPDATE' then old.data else null end,
      'after', new.data
    )
  );
  return new;
end;
$$;

drop trigger if exists team_pages_log on public.team_pages;
create trigger team_pages_log
  after insert or update on public.team_pages
  for each row execute function public.log_team_page_publish();

create or replace function public.log_application_delete()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  perform public.log_admin_activity(
    'application_deleted',
    old.team_id,
    jsonb_build_object('name', old.name, 'team', old.answers ->> 'team')
  );
  return old;
end;
$$;

drop trigger if exists team_join_applications_log on public.team_join_applications;
create trigger team_join_applications_log
  after delete on public.team_join_applications
  for each row execute function public.log_application_delete();
