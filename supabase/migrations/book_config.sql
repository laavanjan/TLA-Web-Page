-- Singleton settings row for the /admin/books submission-form config
-- (work types, faculties, deadline, announcement, contacts, file-size limits).
-- Run this once in the Supabase SQL Editor.

create table if not exists public.book_config (
  id smallint primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint book_config_singleton check (id = 1)
);

insert into public.book_config (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.book_config enable row level security;

-- Anyone (including anonymous site visitors) can read the config — it drives
-- the public submission form and guidelines page.
create policy "book_config_public_read"
  on public.book_config for select
  using (true);

-- Only signed-in admins (there is no public sign-up — see adminStore.js) can
-- update it.
create policy "book_config_admin_write"
  on public.book_config for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
