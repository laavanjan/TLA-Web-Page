-- Teams made in /admin/teams: a team page row with "custom": true inside its
-- data (ids start at 101; the four built-in teams are 1-4).
--
-- Run once in Supabase → SQL Editor, AFTER team_hidden.sql. Safe to re-run.
--
-- 1. Main admins may delete a custom team's page. The built-in teams can't be
--    deleted, only hidden.
-- 2. Deleting a team also removes it from every editor's assignments.
-- 3. Editors still can't change the "hidden" or "custom" flags.

drop policy if exists "team_pages_admin_delete" on public.team_pages;
create policy "team_pages_admin_delete"
  on public.team_pages for delete
  using (public.is_admin() and (data ->> 'custom') = 'true');

create or replace function public.forget_deleted_team()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.admin_user_teams where team_id = old.id;
  return old;
end;
$$;

drop trigger if exists team_pages_forget on public.team_pages;
create trigger team_pages_forget
  after delete on public.team_pages
  for each row execute function public.forget_deleted_team();

create or replace function public.keep_team_hidden_flag()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.data := new.data - 'hidden' - 'custom';
  if tg_op = 'UPDATE' then
    if old.data ? 'hidden' then
      new.data := new.data || jsonb_build_object('hidden', old.data -> 'hidden');
    end if;
    if old.data ? 'custom' then
      new.data := new.data || jsonb_build_object('custom', old.data -> 'custom');
    end if;
  end if;
  return new;
end;
$$;

-- Activity log: made / deleted.
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
  if tg_op = 'INSERT' and coalesce(new.data -> 'custom' = 'true'::jsonb, false) then
    perform public.log_admin_activity('team_created', new.id, jsonb_build_object('title', new.data ->> 'title'));
    return new;
  end if;
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

create or replace function public.log_team_page_delete()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  perform public.log_admin_activity('team_deleted', null, jsonb_build_object('title', old.data ->> 'title'));
  return old;
end;
$$;

drop trigger if exists team_pages_log_delete on public.team_pages;
create trigger team_pages_log_delete
  after delete on public.team_pages
  for each row execute function public.log_team_page_delete();
