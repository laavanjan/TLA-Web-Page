-- Hiding a team page from visitors: a "hidden": true flag inside team_pages.data,
-- switched with the eye icon on /admin/teams. Main admins only.
--
-- Run once in Supabase → SQL Editor, AFTER team_pages.sql and team_editors.sql.
-- Safe to re-run.
--
-- 1. Editors can publish their team's page, but a trigger keeps them from
--    changing the hidden flag (their save keeps whatever it was).
-- 2. Switching it is logged as "hid / showed a team page", not as a publish.

create or replace function public.keep_team_hidden_flag()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.data := new.data - 'hidden';
  if tg_op = 'UPDATE' and old.data ? 'hidden' then
    new.data := new.data || jsonb_build_object('hidden', old.data -> 'hidden');
  end if;
  return new;
end;
$$;

drop trigger if exists team_pages_keep_hidden on public.team_pages;
create trigger team_pages_keep_hidden
  before insert or update on public.team_pages
  for each row execute function public.keep_team_hidden_flag();

create or replace function public.log_team_page_publish()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  was_hidden boolean := tg_op = 'UPDATE' and coalesce(old.data -> 'hidden' = 'true'::jsonb, false);
  is_hidden boolean := coalesce(new.data -> 'hidden' = 'true'::jsonb, false);
  only_flag boolean := case
    when tg_op = 'UPDATE' then (old.data - 'hidden') = (new.data - 'hidden')
    else (new.data - 'hidden') = '{}'::jsonb
  end;
begin
  -- Only the eye was clicked: not a publish.
  if only_flag and was_hidden is distinct from is_hidden then
    perform public.log_admin_activity(case when is_hidden then 'team_hidden' else 'team_shown' end, new.id, '{}'::jsonb);
    return new;
  end if;
  if only_flag and tg_op = 'INSERT' then
    return new;
  end if;

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
