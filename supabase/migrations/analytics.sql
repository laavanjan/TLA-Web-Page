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
