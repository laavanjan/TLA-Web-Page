-- Event pages (/events/…): one row per event holding the admin-managed page as
-- jsonb (name, card text, card illustration, home page group and an ordered
-- list of sections - introduction, programme, gallery, winners, rules, cards,
-- sponsors, contacts, key details, past years, …). Edited at /admin/events.
--
-- `id` is the event's address: the built-in events use their fixed ids
-- (thaipongal, sotkanai, ideathon, brammam-olisuvadu, …; see
-- src/Components/events/eventsRegistry.js), events made in the admin use the
-- address typed there. An event with no row simply shows its built-in content.
--
-- One special row, id `__layout`, says which events the home page lists and in
-- what order. Only main admins can write it.
--
-- Run once in Supabase → SQL Editor, AFTER team_editors.sql (it needs the
-- admin_users table and the is_admin() / log_admin_activity() functions).
-- Safe to re-run.
--
-- Who may do what:
--   everyone ........ read every event page
--   main admins ..... create, edit and delete any event page, arrange the home page
--   editors ......... edit (not create or delete) the events they are assigned
--                     in /admin/editors - as many as they are given

create table if not exists public.event_pages (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,48}$' or id = '__layout'),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.event_pages enable row level security;

-- ---- Which events an editor may edit ---------------------------------------------

create table if not exists public.admin_user_events (
  user_id uuid not null references public.admin_users (user_id) on delete cascade,
  event_id text not null check (event_id ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  primary key (user_id, event_id)
);

alter table public.admin_user_events enable row level security;

drop policy if exists "admin_user_events_read" on public.admin_user_events;
create policy "admin_user_events_read"
  on public.admin_user_events for select
  using (user_id = auth.uid() or public.is_admin());
-- Writes go through the admin-users Edge Function (service role), like teams.

create or replace function public.can_edit_event(e text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or (
    e <> '__layout' and exists (
      select 1
      from admin_users u
      join admin_user_events m on m.user_id = u.user_id
      where u.user_id = auth.uid() and u.role = 'editor' and not u.disabled and m.event_id = e
    )
  );
$$;

-- ---- Event pages: public read, assigned editors write -----------------------------

drop policy if exists "event_pages_public_read" on public.event_pages;
create policy "event_pages_public_read"
  on public.event_pages for select
  using (true);

-- Saving uses upsert, so both insert and update are needed.
drop policy if exists "event_pages_editor_insert" on public.event_pages;
create policy "event_pages_editor_insert"
  on public.event_pages for insert
  with check (public.can_edit_event(id));

drop policy if exists "event_pages_editor_update" on public.event_pages;
create policy "event_pages_editor_update"
  on public.event_pages for update
  using (public.can_edit_event(id))
  with check (public.can_edit_event(id));

-- Deleting a row deletes an event made in the admin, or sends a built-in
-- event back to its built-in content: main admins only.
drop policy if exists "event_pages_admin_delete" on public.event_pages;
create policy "event_pages_admin_delete"
  on public.event_pages for delete
  using (public.is_admin());

-- ---- Activity log ---------------------------------------------------------------------
-- Written by this trigger only, so it can't be skipped or faked from a
-- browser. Publishes keep the page before and after, which the Activity page
-- turns into a readable summary. Event entries carry no team id; the event is
-- in details->>'event_id'.

create or replace function public.log_event_page_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.log_admin_activity(
      'event_removed',
      null,
      jsonb_build_object('event_id', old.id, 'before', old.data)
    );
    return old;
  end if;

  perform public.log_admin_activity(
    case when new.id = '__layout' then 'event_layout' else 'event_publish' end,
    null,
    jsonb_build_object(
      'event_id', new.id,
      'before', case when tg_op = 'UPDATE' then old.data else null end,
      'after', new.data
    )
  );
  return new;
end;
$$;

drop trigger if exists event_pages_log on public.event_pages;
create trigger event_pages_log
  after insert or update or delete on public.event_pages
  for each row execute function public.log_event_page_change();
