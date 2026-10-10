-- Members managed from /admin/members (add, edit, view, remove, and record
-- the membership fee so a receipt can be downloaded).
--
-- Run once in Supabase → SQL Editor, AFTER members.sql and team_editors.sql
-- (it needs the is_admin() and log_admin_activity() functions). Safe to re-run.
--
-- Who may do what:
--   everyone ........ read the member list (the public /members page), but
--                     not the fee columns
--   main admins ..... add, edit and remove members, record fees, change the
--                     receipt settings
--
-- Note: re-running members.sql wipes the table and reloads it from the
-- workbook, which throws away everything added or edited here. Run this file
-- again afterwards, since members.sql also resets the write policy.

alter table public.members add column if not exists updated_at timestamptz not null default now();

-- Membership fee. A receipt number is given the first time a fee is recorded
-- and kept for good, so a receipt downloaded again is identical.
alter table public.members add column if not exists fee_amount numeric(10, 2) check (fee_amount >= 0);
alter table public.members add column if not exists paid_on date;
alter table public.members add column if not exists receipt_no text unique;
-- Who signed it: the treasurer in Receipt settings when the number was given.
-- A copy downloaded after the treasurer changes still shows the one who signed.
alter table public.members add column if not exists receipt_signer_name text;
alter table public.members add column if not exists receipt_signer_title text;

-- Visitors only see the columns the members page shows, not who paid what.
revoke select on public.members from anon;
grant select (id, batch, name, faculty, department, district) on public.members to anon;

-- Only main admins, not team editors, can change the list.
drop policy if exists "members_admin_write" on public.members;
create policy "members_admin_write"
  on public.members for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.touch_member()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create sequence if not exists public.member_receipt_seq;

-- Numbers look like TLA-22-0042 (batch, then a running number). Browsers can't
-- choose one (or the signer): they are set here when a fee is recorded, and
-- cleared if the fee is removed (recording it again then gives a new number).
create or replace function public.number_member_receipt()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.receipt_no := null;
    new.receipt_signer_name := null;
    new.receipt_signer_title := null;
  else
    new.receipt_no := old.receipt_no;
    new.receipt_signer_name := old.receipt_signer_name;
    new.receipt_signer_title := old.receipt_signer_title;
  end if;
  if new.fee_amount is null or new.paid_on is null then
    new.receipt_no := null;
    new.receipt_signer_name := null;
    new.receipt_signer_title := null;
  elsif new.receipt_no is null then
    new.receipt_no := 'TLA-' || new.batch || '-' || lpad(nextval('public.member_receipt_seq')::text, 4, '0');
    select nullif(trim(c.treasurer_name), ''), nullif(trim(c.treasurer_title), '')
      into new.receipt_signer_name, new.receipt_signer_title
      from public.member_receipt_config c
      where c.id = 1;
  end if;
  return new;
end;
$$;

drop trigger if exists members_receipt_no on public.members;
create trigger members_receipt_no
  before insert or update on public.members
  for each row execute function public.number_member_receipt();

drop trigger if exists members_touch on public.members;
create trigger members_touch
  before update on public.members
  for each row execute function public.touch_member();

-- ---- Membership ID ----------------------------------------------------------------------
-- Every member gets a permanent running number, and an ID built from it:
-- TLA-<faculty initial>-<batch>-<number>, e.g. TLA-E-22-0023 (no faculty: X).
-- The number never changes; if the faculty or batch is corrected, the letters
-- in front follow. Browsers can't choose either. Only admins can read them.
alter table public.members add column if not exists membership_no integer unique;
alter table public.members add column if not exists membership_id text unique;

create sequence if not exists public.member_no_seq;

create or replace function public.membership_id_of(p_faculty text, p_batch smallint, p_no integer)
returns text
language sql
immutable
as $$
  select 'TLA-' || coalesce(nullif(upper(left(trim(p_faculty), 1)), ''), 'X') || '-' || p_batch || '-' || lpad(p_no::text, 4, '0');
$$;

create or replace function public.number_member()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.membership_no := nextval('public.member_no_seq');
  else
    new.membership_no := old.membership_no;
  end if;
  new.membership_id := public.membership_id_of(new.faculty, new.batch, new.membership_no);
  return new;
end;
$$;

-- Members without a number yet (everyone, the first time) are numbered in
-- batch, faculty, name order. Other triggers are off meanwhile so this isn't
-- logged or counted as an edit.
drop trigger if exists members_number on public.members;
alter table public.members disable trigger user;
with todo as (
  select id, row_number() over (order by batch, faculty nulls last, name, id) as n
  from public.members
  where membership_no is null
), top as (
  select coalesce(max(membership_no), 0) as n from public.members
)
update public.members m
set membership_no = top.n + todo.n
from todo, top
where m.id = todo.id;
update public.members
set membership_id = public.membership_id_of(faculty, batch, membership_no)
where membership_id is distinct from public.membership_id_of(faculty, batch, membership_no);
alter table public.members enable trigger user;

select setval('public.member_no_seq', greatest((select max(membership_no) from public.members), 1), (select count(*) > 0 from public.members));

create trigger members_number
  before insert or update on public.members
  for each row execute function public.number_member();

-- ---- Activity log -----------------------------------------------------------------------
create or replace function public.log_member_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Changes made in the SQL Editor (e.g. reloading the workbook with
  -- members.sql) have no signed-in user; keep them out of the log.
  if auth.uid() is null then
    return coalesce(new, old);
  end if;
  if tg_op = 'INSERT' then
    perform public.log_admin_activity('member_added', null, jsonb_build_object('name', new.name, 'batch', new.batch));
  elsif tg_op = 'DELETE' then
    perform public.log_admin_activity('member_removed', null, jsonb_build_object('name', old.name, 'batch', old.batch));
  else
    perform public.log_admin_activity(
      'member_updated',
      null,
      jsonb_build_object('name', new.name, 'batch', new.batch, 'before', to_jsonb(old) - 'updated_at', 'after', to_jsonb(new) - 'updated_at')
    );
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists members_log on public.members;
create trigger members_log
  after insert or delete or update of batch, name, faculty, department, district, fee_amount, paid_on on public.members
  for each row execute function public.log_member_change();

-- ---- Receipt settings ---------------------------------------------------------------------
-- One row: the fee filled in by default and who signs the receipts.
create table if not exists public.member_receipt_config (
  id smallint primary key default 1,
  default_fee numeric(10, 2) check (default_fee >= 0),
  treasurer_name text not null default '',
  treasurer_title text not null default 'Treasurer',
  updated_at timestamptz not null default now(),
  constraint member_receipt_config_singleton check (id = 1)
);

insert into public.member_receipt_config (id) values (1) on conflict (id) do nothing;

alter table public.member_receipt_config enable row level security;

drop policy if exists "member_receipt_config_admin_read" on public.member_receipt_config;
create policy "member_receipt_config_admin_read"
  on public.member_receipt_config for select
  using (public.is_admin());

drop policy if exists "member_receipt_config_admin_write" on public.member_receipt_config;
create policy "member_receipt_config_admin_write"
  on public.member_receipt_config for update
  using (public.is_admin())
  with check (public.is_admin());
