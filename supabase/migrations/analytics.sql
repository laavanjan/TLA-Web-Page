-- Traffic analytics shown at /admin/traffic: daily visitors, who is on the
-- site right now, where visitors come from, the most visited pages, the
-- busiest hours and the visit → form funnels.
--
-- Run once in Supabase → SQL Editor, AFTER team_editors.sql (it needs the
-- is_admin() function). Safe to re-run.
--
-- What is stored, and what isn't:
--   * one row per page view or form submission, with the page, where the
--     visitor came from, the kind of device and the country
--   * a random visitor id that changes every day, so nobody can be followed
--     from one day to the next
--   * NO IP addresses, names or emails
-- Bots, signed-in admins/editors and browsers that send "Do Not Track" are
-- skipped by the site before anything is sent.
--
-- Who may do what:
--   everyone ........ add a page view through track_page_view() (nothing else)
--   main admins ..... read the reports

-- ---- Raw events ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null default 'view' check (kind in ('view', 'event')),
  name text not null default '',
  visitor_id uuid not null,
  session_id uuid not null,
  returning boolean not null default false,
  path text not null default '/',
  title text not null default '',
  referrer_host text not null default '',
  source text not null default 'direct',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  device text not null default 'desktop',
  browser text not null default '',
  os text not null default '',
  country text not null default ''
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id, created_at);

-- Browsers can't read or write the table directly: page views go through
-- track_page_view() and reports through the admin-only functions below.
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;

-- ---- Recording a visit ------------------------------------------------------------------
-- Called by the site on every page view (p_kind 'view') and on form
-- submissions (p_kind 'event', with p_name like 'team_join_submitted').
-- Everything is trimmed and capped here, so a browser can't stuff the table
-- with junk; a session can add at most 300 rows a day.
create or replace function public.track_page_view(
  p_kind text,
  p_name text,
  p_visitor uuid,
  p_session uuid,
  p_returning boolean,
  p_path text,
  p_title text,
  p_referrer_host text,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_device text,
  p_browser text,
  p_os text,
  p_country text
) returns void
language plpgsql security definer set search_path = public
as $$
declare
  clean_path text := left(coalesce(nullif(trim(p_path), ''), '/'), 200);
begin
  if p_visitor is null or p_session is null or p_kind not in ('view', 'event') then
    return;
  end if;
  -- Signed-in admins and editors are never counted, even if the site misses it.
  if exists (select 1 from admin_users where user_id = auth.uid()) then
    return;
  end if;
  if clean_path not like '/%' or clean_path like '/admin%' then
    return;
  end if;
  if (select count(*) from analytics_events
      where session_id = p_session and created_at > now() - interval '1 day') >= 300 then
    return;
  end if;

  insert into analytics_events (
    kind, name, visitor_id, session_id, returning, path, title, referrer_host, source,
    utm_source, utm_medium, utm_campaign, device, browser, os, country
  ) values (
    p_kind,
    left(coalesce(trim(p_name), ''), 60),
    p_visitor,
    p_session,
    coalesce(p_returning, false),
    clean_path,
    left(coalesce(trim(p_title), ''), 160),
    left(lower(coalesce(trim(p_referrer_host), '')), 120),
    left(lower(coalesce(nullif(trim(p_source), ''), 'direct')), 40),
    left(lower(coalesce(trim(p_utm_source), '')), 60),
    left(lower(coalesce(trim(p_utm_medium), '')), 60),
    left(lower(coalesce(trim(p_utm_campaign), '')), 80),
    case when p_device in ('mobile', 'tablet', 'desktop') then p_device else 'desktop' end,
    left(coalesce(trim(p_browser), ''), 30),
    left(coalesce(trim(p_os), ''), 30),
    upper(left(coalesce(trim(p_country), ''), 2))
  );
end;
$$;

grant execute on function public.track_page_view(text, text, uuid, uuid, boolean, text, text, text, text, text, text, text, text, text, text, text)
  to anon, authenticated;
