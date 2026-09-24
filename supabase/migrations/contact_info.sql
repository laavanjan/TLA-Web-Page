-- Singleton settings row for the site's contact/social details shown on the
-- Contact section (email, phone, Facebook/YouTube/Instagram links), editable
-- from /admin/contact. Run this once in the Supabase SQL Editor.

create table if not exists public.contact_info (
  id smallint primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint contact_info_singleton check (id = 1)
);

insert into public.contact_info (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.contact_info enable row level security;

-- Anyone (including anonymous site visitors) can read it — it drives the
-- public Contact section.
create policy "contact_info_public_read"
  on public.contact_info for select
  using (true);

-- Only signed-in admins (there is no public sign-up — see adminStore.js) can
-- update it.
create policy "contact_info_admin_write"
  on public.contact_info for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
