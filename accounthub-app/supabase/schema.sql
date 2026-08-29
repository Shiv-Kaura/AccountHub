-- AccountHub schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
-- Mirrors the shape of the original single-JSON-blob data model, split into real tables.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Accounts (facility groups)
-- ---------------------------------------------------------------------------
create table accounts (
  id            text primary key default 'acc_' || replace(gen_random_uuid()::text, '-', ''),
  name          text not null,
  segment       text not null default 'managed' check (segment in ('managed', 'deal')),
  health        text not null default 'green' check (health in ('green', 'yellow', 'red')),
  contact       text default '',
  owner_id      uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table sites (
  id             text primary key default 'site_' || replace(gen_random_uuid()::text, '-', ''),
  account_id     text not null references accounts(id) on delete cascade,
  name           text not null,
  location       text default '',
  stage          text not null default 'Discovery'
                 check (stage in ('Discovery', 'SOW & Quote Sent', 'Signed', 'Assigned to PM/Work Session Scheduled', 'Live')),
  target_date    date,
  owner          text default '',
  notes          text default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table contacts (
  id           text primary key default 'ct_' || replace(gen_random_uuid()::text, '-', ''),
  account_id   text not null references accounts(id) on delete cascade,
  name         text not null,
  role         text default '',
  role_tags    text[] not null default '{}',
  email        text default '',
  phone        text default '',
  created_at   timestamptz not null default now()
);

create table account_notes (
  id           text primary key default 'note_' || replace(gen_random_uuid()::text, '-', ''),
  account_id   text not null references accounts(id) on delete cascade,
  note_date    date not null default current_date,
  body         text not null,
  created_at   timestamptz not null default now()
);

-- Uploaded documents. Files live in Supabase Storage (bucket "docs"); this row is the pointer +
-- metadata, not the file itself — the old artifact stored the whole PDF as base64 inline, which is
-- exactly the kind of thing a real backend fixes.
create table docs (
  id                text primary key default 'doc_' || replace(gen_random_uuid()::text, '-', ''),
  account_id        text not null references accounts(id) on delete cascade,
  kind              text not null check (kind in ('quote', 'sow')),
  title             text not null,
  facility_site_id  text references sites(id) on delete set null,
  notes             text default '',
  file_name         text,
  file_size         bigint,
  storage_path      text,
  uploaded_at       timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Quotes & SOWs (generated documents, independent of the uploaded-doc flow above)
-- ---------------------------------------------------------------------------
create table quotes (
  id                     text primary key default 'quote_' || replace(gen_random_uuid()::text, '-', ''),
  account_id             text references accounts(id) on delete set null,
  exhibit_label          text default '',
  name                   text not null,
  customer               text default '',
  status                 text not null default 'Draft',
  quote_date             date not null default current_date,
  stage                  text not null default 'Discovery'
                         check (stage in ('Discovery', 'SOW & Quote Sent', 'Signed', 'Assigned to PM/Work Session Scheduled', 'Live')),
  synthesis_contact      text default '',
  synthesis_email_phone  text default '',
  customer_contact       text default '',
  customer_email_phone   text default '',
  implementation_items   jsonb not null default '[]',
  rate_sel               jsonb not null default '{}',
  po_rows                jsonb not null default '[]',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table sows (
  id                 text primary key default 'sow_' || replace(gen_random_uuid()::text, '-', ''),
  account_id         text references accounts(id) on delete set null,
  customer           text default '',
  address            text default '',
  project_title      text not null,
  sow_date           date not null default current_date,
  status             text not null default 'Draft',
  stage              text not null default 'Discovery'
                     check (stage in ('Discovery', 'SOW & Quote Sent', 'Signed', 'Assigned to PM/Work Session Scheduled', 'Live')),
  work_summary       text default '',
  work_details       jsonb not null default '[]',
  solutions_diagram  boolean not null default false,
  meeting_notes      text default '',
  contact_name       text default '',
  contact_email_phone text default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table items (
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

create index sites_account_id_idx on sites(account_id);
create index items_account_id_idx on items(account_id);
create index contacts_account_id_idx on contacts(account_id);
create index account_notes_account_id_idx on account_notes(account_id);
create index docs_account_id_idx on docs(account_id);
create index quotes_account_id_idx on quotes(account_id);
create index sows_account_id_idx on sows(account_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — locked down to signed-in users only for now (phase 02 adds real
-- per-role policies; this is the minimum needed so the anon key can't read/write anything).
-- ---------------------------------------------------------------------------
alter table accounts enable row level security;
alter table sites enable row level security;
alter table contacts enable row level security;
alter table account_notes enable row level security;
alter table docs enable row level security;
alter table quotes enable row level security;
alter table sows enable row level security;
alter table items enable row level security;

create policy "authenticated read/write accounts" on accounts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write sites" on sites for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write contacts" on contacts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write account_notes" on account_notes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write docs" on docs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write quotes" on quotes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write sows" on sows for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write items" on items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for uploaded PDFs.
insert into storage.buckets (id, name, public) values ('docs', 'docs', false)
  on conflict (id) do nothing;

create policy "authenticated access to docs bucket" on storage.objects for all
  using (bucket_id = 'docs' and auth.role() = 'authenticated')
  with check (bucket_id = 'docs' and auth.role() = 'authenticated');
