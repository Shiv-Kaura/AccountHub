-- Batch 3: sales prospect tracking.
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).

-- A simple free-text "owner" tag on accounts, for filtering the pipeline board by who's
-- working a deal. Deliberately not a foreign key to auth.users (that column already exists as
-- owner_id, reserved for when reps get real logins) — this is a plain name tag for now.
alter table accounts add column if not exists owner_name text not null default '';

-- Lets a facility/quote/SOW be marked "lost" without deleting it or leaving it stuck in an
-- active stage forever. Kept as a flag rather than a pipeline stage so it doesn't interfere
-- with the existing Discovery → ... → Live progression or the prev/next arrow logic.
alter table sites  add column if not exists lost boolean not null default false;
alter table quotes add column if not exists lost boolean not null default false;
alter table sows   add column if not exists lost boolean not null default false;
