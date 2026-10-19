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
  is_returning boolean not null default false,
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
    kind, name, visitor_id, session_id, is_returning, path, title, referrer_host, source,
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

-- ---- Who is on the site right now ----------------------------------------------------------
-- One row per open session, refreshed by every page view and by a heartbeat
-- the site sends every 30 seconds while the tab is visible. Rows older than
-- an hour are cleared out by analytics_rollup().
create table if not exists public.analytics_live (
  session_id uuid primary key,
  path text not null default '/',
  title text not null default '',
  source text not null default 'direct',
  device text not null default 'desktop',
  country text not null default '',
  started_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create index if not exists analytics_live_seen_idx on public.analytics_live (last_seen);

alter table public.analytics_live enable row level security;
revoke all on public.analytics_live from anon, authenticated;

create or replace function public.analytics_ping(p_session uuid, p_path text, p_title text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  clean_path text := left(coalesce(nullif(trim(p_path), ''), '/'), 200);
begin
  if p_session is null or clean_path not like '/%' or clean_path like '/admin%' then
    return;
  end if;
  if exists (select 1 from admin_users where user_id = auth.uid()) then
    return;
  end if;
  -- Only sessions that recorded a page view can ping, so the live count
  -- can't be padded with made-up sessions.
  update analytics_live
  set path = clean_path, title = left(coalesce(trim(p_title), ''), 160), last_seen = now()
  where session_id = p_session;
end;
$$;

grant execute on function public.analytics_ping(uuid, text, text) to anon, authenticated;

-- Page views keep the live row up to date as well.
create or replace function public.touch_analytics_live()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.kind <> 'view' then
    return new;
  end if;
  insert into analytics_live (session_id, path, title, source, device, country)
  values (new.session_id, new.path, new.title, new.source, new.device, new.country)
  on conflict (session_id) do update
    set path = excluded.path, title = excluded.title, last_seen = now();
  return new;
end;
$$;

drop trigger if exists analytics_events_live on public.analytics_events;
create trigger analytics_events_live
  after insert on public.analytics_events
  for each row execute function public.touch_analytics_live();

-- ---- Daily totals (kept for good) ----------------------------------------------------------
-- One row per day (Sri Lanka time) with the totals and the day's breakdowns.
-- Raw events are deleted after 90 days, but these rows stay, so the charts
-- and the CSV export keep the whole history.
create table if not exists public.analytics_daily (
  day date primary key,
  visitors integer not null default 0,
  new_visitors integer not null default 0,
  sessions integer not null default 0,
  views integer not null default 0,
  bounces integer not null default 0,
  sources jsonb not null default '{}'::jsonb,    -- source → visitors
  pages jsonb not null default '{}'::jsonb,      -- path → views
  titles jsonb not null default '{}'::jsonb,     -- path → page title
  hours jsonb not null default '{}'::jsonb,      -- "0".."23" → views
  devices jsonb not null default '{}'::jsonb,    -- mobile/tablet/desktop → visitors
  browsers jsonb not null default '{}'::jsonb,   -- browser → visitors
  countries jsonb not null default '{}'::jsonb,  -- country code → visitors
  campaigns jsonb not null default '{}'::jsonb,  -- "source|medium|campaign" → visitors
  referrers jsonb not null default '{}'::jsonb,  -- referring site → visitors
  events jsonb not null default '{}'::jsonb,     -- form submissions etc. → count
  updated_at timestamptz not null default now()
);

alter table public.analytics_daily enable row level security;
revoke all on public.analytics_daily from anon, authenticated;

drop policy if exists "analytics_daily_admin_read" on public.analytics_daily;
create policy "analytics_daily_admin_read"
  on public.analytics_daily for select
  using (public.is_admin());
grant select on public.analytics_daily to authenticated;

-- Counts → {"key": n, ...}, biggest first is up to the reader.
create or replace function public.analytics_rollup_day(p_day date)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  t0 timestamptz := p_day::timestamp at time zone 'Asia/Colombo';
  t1 timestamptz := (p_day + 1)::timestamp at time zone 'Asia/Colombo';
begin
  if not exists (select 1 from analytics_events where created_at >= t0 and created_at < t1) then
    return;
  end if;

  create temporary table if not exists _day_events (like analytics_events) on commit drop;
  truncate _day_events;
  insert into _day_events select * from analytics_events where created_at >= t0 and created_at < t1;

  insert into analytics_daily as d (
    day, visitors, new_visitors, sessions, views, bounces,
    sources, pages, titles, hours, devices, browsers, countries, campaigns, referrers, events, updated_at
  )
  select
    p_day,
    (select count(distinct visitor_id) from _day_events where kind = 'view'),
    (select count(distinct visitor_id) from _day_events where kind = 'view' and not is_returning),
    (select count(distinct session_id) from _day_events where kind = 'view'),
    (select count(*) from _day_events where kind = 'view'),
    (select count(*) from (
      select session_id from _day_events where kind = 'view' group by session_id having count(*) = 1
    ) s),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select source k, count(distinct visitor_id) n from _day_events where kind = 'view' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select path k, count(*) n from _day_events where kind = 'view' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select path k, max(title) n from _day_events where kind = 'view' and title <> '' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select extract(hour from created_at at time zone 'Asia/Colombo')::int::text k, count(*) n
      from _day_events where kind = 'view' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select device k, count(distinct visitor_id) n from _day_events where kind = 'view' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select browser k, count(distinct visitor_id) n from _day_events where kind = 'view' and browser <> '' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select country k, count(distinct visitor_id) n from _day_events where kind = 'view' and country <> '' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select utm_source || '|' || utm_medium || '|' || utm_campaign k, count(distinct visitor_id) n
      from _day_events where kind = 'view' and utm_source <> '' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select referrer_host k, count(distinct visitor_id) n from _day_events where kind = 'view' and referrer_host <> '' group by 1) x),
    (select coalesce(jsonb_object_agg(k, n), '{}') from (
      select name k, count(*) n from _day_events where kind = 'event' group by 1) x),
    now()
  on conflict (day) do update set
    visitors = excluded.visitors, new_visitors = excluded.new_visitors, sessions = excluded.sessions,
    views = excluded.views, bounces = excluded.bounces, sources = excluded.sources, pages = excluded.pages,
    titles = excluded.titles, hours = excluded.hours, devices = excluded.devices, browsers = excluded.browsers,
    countries = excluded.countries, campaigns = excluded.campaigns, referrers = excluded.referrers,
    events = excluded.events, updated_at = now();
end;
$$;

-- Brings yesterday and today up to date, and clears out what isn't needed:
-- raw events after 90 days and live sessions idle for an hour. Run nightly by
-- pg_cron (below) and before every report, so the numbers are always current.
create or replace function public.analytics_rollup()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Colombo')::date;
begin
  perform analytics_rollup_day(today - 1);
  perform analytics_rollup_day(today);
  delete from analytics_events where created_at < now() - interval '90 days';
  delete from analytics_live where last_seen < now() - interval '1 hour';
end;
$$;

revoke execute on function public.analytics_rollup_day(date) from public, anon, authenticated;
revoke execute on function public.analytics_rollup() from public, anon, authenticated;

-- ---- Reports (main admins only) ------------------------------------------------------------
-- The Traffic page calls this first, then reads analytics_daily directly.
create or replace function public.analytics_refresh()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only main admins can see traffic.' using errcode = '42501';
  end if;
  perform analytics_rollup();
end;
$$;

grant execute on function public.analytics_refresh() to authenticated;

-- Visitors on the site in the last 5 minutes, and what they are looking at.
create or replace function public.analytics_live_now()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only main admins can see traffic.' using errcode = '42501';
  end if;
  with live as (
    select * from analytics_live where last_seen > now() - interval '5 minutes'
  )
  select jsonb_build_object(
    'count', (select count(*) from live),
    'pages', (select coalesce(jsonb_agg(p order by p.n desc, p.path), '[]') from (
      select path, max(title) as title, count(*) as n from live group by path limit 8) p),
    'sources', (select coalesce(jsonb_object_agg(source, n), '{}') from (
      select source, count(*) n from live group by source) s),
    'devices', (select coalesce(jsonb_object_agg(device, n), '{}') from (
      select device, count(*) n from live group by device) s),
    'countries', (select coalesce(jsonb_object_agg(country, n), '{}') from (
      select country, count(*) n from live where country <> '' group by country) s)
  ) into result;
  return result;
end;
$$;

grant execute on function public.analytics_live_now() to authenticated;

-- Funnel: how many sessions reached each step, in order. Steps look like
-- [{"path": "/teams"}, {"path": "/teams/join"}, {"event": "team_join_submitted"}];
-- a path step also matches the pages under it. Uses raw events, so it covers
-- the last 90 days at most.
create or replace function public.analytics_funnel(p_from date, p_to date, p_steps jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  t0 timestamptz := p_from::timestamp at time zone 'Asia/Colombo';
  t1 timestamptz := (p_to + 1)::timestamp at time zone 'Asia/Colombo';
  step jsonb;
  counts jsonb := '[]'::jsonb;
  first boolean := true;
begin
  if not public.is_admin() then
    raise exception 'Only main admins can see traffic.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_steps) <> 'array' or jsonb_array_length(p_steps) > 8 then
    raise exception 'Bad funnel steps.';
  end if;

  create temporary table if not exists _funnel (session_id uuid primary key, at timestamptz) on commit drop;
  create temporary table if not exists _funnel_next (session_id uuid primary key, at timestamptz) on commit drop;
  truncate _funnel;

  for step in select * from jsonb_array_elements(p_steps) loop
    truncate _funnel_next;
    insert into _funnel_next
    select e.session_id, min(e.created_at)
    from analytics_events e
    left join _funnel f on f.session_id = e.session_id
    where e.created_at >= t0 and e.created_at < t1
      and (first or (f.session_id is not null and e.created_at >= f.at))
      and case
        when step ? 'event' then e.kind = 'event' and e.name = step ->> 'event'
        else e.kind = 'view' and (
          e.path = step ->> 'path'
          or (step ->> 'path' <> '/' and starts_with(e.path, rtrim(step ->> 'path', '/') || '/'))
        )
      end
    group by e.session_id;

    truncate _funnel;
    insert into _funnel select * from _funnel_next;
    counts := counts || to_jsonb((select count(*) from _funnel));
    first := false;
  end loop;
  return counts;
end;
$$;

grant execute on function public.analytics_funnel(date, date, jsonb) to authenticated;
