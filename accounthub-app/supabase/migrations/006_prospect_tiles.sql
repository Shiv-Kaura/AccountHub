-- Lets a prospect account show up on the pipeline even before it has any facility, quote, or
-- SOW attached — as its own "Prospect" tile, tracked via a stage on the account itself. The
-- moment a facility/quote/SOW is added, that bare tile is replaced by the real one (the pipeline
-- page figures this out by checking whether the account already has any tracked pipeline items).
-- Also lets an uploaded quote/SOW opt out of the pipeline entirely (e.g. background info that
-- shouldn't show up as a tile).
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).

alter table accounts add column if not exists stage text not null default 'Discovery'
  check (stage in ('Discovery', 'SOW & Quote Sent', 'Signed', 'Assigned to PM/Work Session Scheduled', 'Live'));
alter table accounts add column if not exists lost boolean not null default false;

alter table quotes add column if not exists track_pipeline boolean not null default true;
alter table sows   add column if not exists track_pipeline boolean not null default true;
