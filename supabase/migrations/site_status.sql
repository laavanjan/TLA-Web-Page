-- Maintenance mode: a single settings row that says whether visitors see the
-- "under maintenance" page instead of the site, what it says, and when the
-- site reopens by itself. Edited at /admin/maintenance.
--
-- data = { "enabled": bool, "title": text, "message": text, "reopensAt": ISO time or "" }
--
-- Run once in Supabase → SQL Editor, AFTER team_editors.sql (it needs the
-- is_admin() and log_admin_activity() functions). Safe to re-run.
--
-- Who may do what:
--   everyone ........ read it (the public site checks it on every visit)
--   main admins ..... change it
-- Signed-in admins and editors keep seeing the normal site while it is on.

create table if not exists public.site_status (
  id smallint primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_status_singleton check (id = 1)
);

insert into public.site_status (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_status enable row level security;

drop policy if exists "site_status_public_read" on public.site_status;
create policy "site_status_public_read"
  on public.site_status for select
  using (true);

drop policy if exists "site_status_admin_write" on public.site_status;
create policy "site_status_admin_write"
  on public.site_status for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---- Activity log ---------------------------------------------------------------------
-- Turning it on or off, and changing its text or reopening time, are logged
-- by this trigger, so it can't be skipped from a browser.

create or replace function public.log_site_status_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  was_on boolean := coalesce(old.data -> 'enabled' = 'true'::jsonb, false);
  is_on boolean := coalesce(new.data -> 'enabled' = 'true'::jsonb, false);
begin
  if old.data is not distinct from new.data then
    return new;
  end if;

  perform public.log_admin_activity(
    case
      when is_on and not was_on then 'maintenance_on'
      when was_on and not is_on then 'maintenance_off'
      else 'maintenance_updated'
    end,
    null,
    jsonb_build_object('before', old.data, 'after', new.data)
  );
  return new;
end;
$$;

drop trigger if exists site_status_log on public.site_status;
create trigger site_status_log
  after update on public.site_status
  for each row execute function public.log_site_status_change();
