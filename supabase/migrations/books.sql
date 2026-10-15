-- Books shown at /books and /books/<slug>. Managed at /admin/books (Books tab):
-- add a book as a Google Drive link or an uploaded PDF (stored on Cloudinary),
-- edit, reorder, hide and delete.
--
-- Run once in Supabase → SQL Editor, AFTER team_editors.sql (it needs the
-- is_admin() and log_admin_activity() functions). Safe to re-run.
-- Then redeploy the edge function: supabase functions deploy cloudinary-sign
--
-- Who may do what:
--   everyone ........ read listed and link-only books
--   main admins ..... read all, add, edit, reorder, delete
--
-- visibility: 'listed'   = on the /books page and its own page
--             'unlisted' = only its own page (a link or QR code), not on /books
--             'hidden'   = nobody but admins
-- source:     'drive'  = the PDF is a Google Drive file (drive_file_id)
--             'upload' = the PDF was uploaded to Cloudinary (pdf_url, pdf_public_id)

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    constraint books_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}$' and slug <> 'submit'),
  title text not null,
  author text not null default '',
  year integer,
  category text not null default 'tla' constraint books_category check (category in ('tla', 'student')),
  description text not null default '',
  source text not null default 'drive' constraint books_source check (source in ('drive', 'upload')),
  drive_file_id text not null default '',
  pdf_url text not null default '',
  pdf_public_id text not null default '',
  doc_link text not null default '',
  cover_url text not null default '',
  cover_public_id text not null default '',
  visibility text not null default 'listed' constraint books_visibility check (visibility in ('listed', 'unlisted', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.books enable row level security;

drop policy if exists "books_read" on public.books;
create policy "books_read"
  on public.books for select
  using (visibility <> 'hidden' or public.is_admin());

drop policy if exists "books_admin_write" on public.books;
create policy "books_admin_write"
  on public.books for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.touch_book()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists books_touch on public.books;
create trigger books_touch
  before update on public.books
  for each row execute function public.touch_book();

-- ---- Activity log -----------------------------------------------------------------------
create or replace function public.log_book_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_admin_activity('book_added', null, jsonb_build_object('title', new.title, 'slug', new.slug));
  elsif tg_op = 'DELETE' then
    perform public.log_admin_activity('book_removed', null, jsonb_build_object('title', old.title, 'slug', old.slug));
  elsif old.visibility is distinct from new.visibility and new.visibility = 'hidden' then
    perform public.log_admin_activity('book_hidden', null, jsonb_build_object('title', new.title, 'slug', new.slug));
  elsif old.visibility is distinct from new.visibility and old.visibility = 'hidden' then
    perform public.log_admin_activity('book_shown', null, jsonb_build_object('title', new.title, 'slug', new.slug));
  elsif (old.title, old.slug, old.author, old.year, old.category, old.description, old.source, old.drive_file_id,
         old.pdf_url, old.doc_link, old.cover_url, old.visibility)
        is distinct from
        (new.title, new.slug, new.author, new.year, new.category, new.description, new.source, new.drive_file_id,
         new.pdf_url, new.doc_link, new.cover_url, new.visibility) then
    perform public.log_admin_activity('book_updated', null, jsonb_build_object('title', new.title, 'slug', new.slug));
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists books_log on public.books;
create trigger books_log
  after insert or delete or update on public.books
  for each row execute function public.log_book_change();

-- ---- The books that were hard-coded in src/Pages/booksData.js ---------------------------
-- tla26 is reached through printed QR codes only, so it stays link-only.
insert into public.books (slug, title, year, category, description, source, drive_file_id, doc_link, cover_url, visibility, sort_order)
values
  ('thamilaruvi26', 'தமிழருவி''26 இதழ்', 2026, 'tla',
   'தமிழ் இலக்கிய மன்றம் — தமிழருவி''26 நூல். PDF அல்லது Document வடிவில் படிக்கவும், பதிவிறக்கவும்.',
   'drive', '1MAR2g8M0ZhaNip4eSHk6hfwBYoBVy3IF',
   'https://docs.google.com/document/d/1lyxBng9S_Kpjzh3EqBKi8WywJLtVoLXD/edit',
   '/images/books/thamilaruvi26-cover.webp', 'listed', 0),
  ('tla26', 'TLA 26', 2026, 'tla',
   'தமிழ் இலக்கிய மன்றம் — TLA 26 நூல். Read and download the TLA 26 book.',
   'drive', '1tVvDgXaQXHyEvBQOUYnu5O0oIjpdZDbS', '', '', 'unlisted', 1)
on conflict (slug) do nothing;
