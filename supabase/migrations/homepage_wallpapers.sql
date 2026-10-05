-- Home page wallpapers: the pictures that slide behind the home page heading.
-- Managed at /admin/wallpapers (add, hide, delete, reorder).
--
-- Run once in Supabase → SQL Editor, AFTER team_editors.sql (it needs the
-- is_admin() and log_admin_activity() functions). Safe to re-run.
-- Then redeploy the edge function: supabase functions deploy cloudinary-sign
--
-- Who may do what:
--   everyone ........ read the visible wallpapers
--   main admins ..... read all, add, hide, reorder, delete

create table if not exists public.homepage_wallpapers (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  public_id text not null default '',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.homepage_wallpapers enable row level security;

drop policy if exists "wallpapers_read" on public.homepage_wallpapers;
create policy "wallpapers_read"
  on public.homepage_wallpapers for select
  using (is_visible or public.is_admin());

drop policy if exists "wallpapers_admin_write" on public.homepage_wallpapers;
create policy "wallpapers_admin_write"
  on public.homepage_wallpapers for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- Activity log -----------------------------------------------------------------------
create or replace function public.log_wallpaper_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_admin_activity('wallpaper_added', null, jsonb_build_object('url', new.image_url));
  elsif tg_op = 'DELETE' then
    perform public.log_admin_activity('wallpaper_removed', null, jsonb_build_object('url', old.image_url));
  elsif old.is_visible is distinct from new.is_visible then
    perform public.log_admin_activity(
      case when new.is_visible then 'wallpaper_shown' else 'wallpaper_hidden' end,
      null,
      jsonb_build_object('url', new.image_url)
    );
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists homepage_wallpapers_log on public.homepage_wallpapers;
create trigger homepage_wallpapers_log
  after insert or delete or update of is_visible on public.homepage_wallpapers
  for each row execute function public.log_wallpaper_change();

-- ---- Text and colours (added later; safe to re-run) --------------------------------------
-- text_mode: 'default' = the shared text below, 'custom' = this wallpaper's own
-- text, 'none' = no heading on this wallpaper.
-- text_color / tint_color: '#rrggbb' or '' for the default. tint_opacity: 0-100.
alter table public.homepage_wallpapers add column if not exists text_mode text not null default 'default';
alter table public.homepage_wallpapers add column if not exists text text not null default '';
alter table public.homepage_wallpapers add column if not exists text_color text not null default '';
alter table public.homepage_wallpapers add column if not exists tint_color text not null default '';
alter table public.homepage_wallpapers add column if not exists tint_opacity integer not null default 0;

-- The text shared by every wallpaper that says "use the shared text". Empty
-- means the built-in verse.
create table if not exists public.homepage_wallpaper_settings (
  id smallint primary key default 1,
  default_text text not null default '',
  default_text_color text not null default '',
  constraint homepage_wallpaper_settings_singleton check (id = 1)
);

insert into public.homepage_wallpaper_settings (id) values (1) on conflict (id) do nothing;

alter table public.homepage_wallpaper_settings enable row level security;

drop policy if exists "wallpaper_settings_read" on public.homepage_wallpaper_settings;
create policy "wallpaper_settings_read"
  on public.homepage_wallpaper_settings for select
  using (true);

drop policy if exists "wallpaper_settings_admin_write" on public.homepage_wallpaper_settings;
create policy "wallpaper_settings_admin_write"
  on public.homepage_wallpaper_settings for update
  using (public.is_admin())
  with check (public.is_admin());
