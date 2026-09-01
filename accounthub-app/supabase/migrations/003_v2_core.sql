-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
-- Adds the "priority items" tracker (restored from the original artifact) that the v2 pass
-- brings back to the account detail page.

create table if not exists items (
  id           text primary key default 'item_' || replace(gen_random_uuid()::text, '-', ''),
  account_id   text not null references accounts(id) on delete cascade,
  title        text not null,
  status       text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  priority     boolean not null default false,
  owner        text default '',
  due_date     date,
  zendesk      text default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists items_account_id_idx on items(account_id);

alter table items enable row level security;

create policy "authenticated read/write items" on items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
