-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
--
-- Adds the customer-facing portal: each account gets a private, unguessable link (no password,
-- no customer login) that lets that account's contacts view files shared with them and upload
-- files back (e.g. a completed intake form), all tracked in one place instead of email threads.
--
-- Access model: the portal link itself IS the credential. Anyone who has an account's
-- portal_token can see that one account's shared files — nobody else's, because they don't have
-- that account's token. All portal-side reads/writes happen through server code using the
-- Supabase service-role key (see src/lib/supabase/portal-client.ts), which deliberately bypasses
-- the row-level-security policies below — those policies exist only for the normal, signed-in
-- staff app, not for the portal.

alter table accounts add column if not exists portal_token text unique;

update accounts set portal_token = replace(gen_random_uuid()::text, '-', '')
  where portal_token is null;

alter table accounts alter column portal_token set not null;
alter table accounts alter column portal_token
  set default replace(gen_random_uuid()::text, '-', '');

create table if not exists portal_files (
  id           text primary key default 'pf_' || replace(gen_random_uuid()::text, '-', ''),
  account_id   text not null references accounts(id) on delete cascade,
  direction    text not null check (direction in ('shared_with_customer', 'uploaded_by_customer')),
  file_name    text not null,
  file_size    bigint,
  storage_path text not null,
  note         text default '',
  uploaded_at  timestamptz not null default now()
);

create index if not exists portal_files_account_id_idx on portal_files(account_id);

alter table portal_files enable row level security;

-- Internal staff (signed in to the main app) can read/write freely, same pattern as every
-- other table. Customers are never signed in — the portal deliberately has no login — so all
-- portal-side access goes through the service-role client instead, which bypasses this policy
-- entirely and scopes every query by portal_token in application code. No anon-role policy is
-- added here on purpose: a visitor with only the public anon key still can't query this table
-- directly, even with a valid token — the token is only meaningful to the server-side portal
-- code that checks it.
create policy "authenticated read/write portal_files" on portal_files for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for files exchanged through the portal — kept separate from the "docs" bucket
-- (Quote/SOW PDFs) since these are a different kind of record with different access rules.
insert into storage.buckets (id, name, public) values ('portal-files', 'portal-files', false)
  on conflict (id) do nothing;

create policy "authenticated access to portal-files bucket" on storage.objects for all
  using (bucket_id = 'portal-files' and auth.role() = 'authenticated')
  with check (bucket_id = 'portal-files' and auth.role() = 'authenticated');
