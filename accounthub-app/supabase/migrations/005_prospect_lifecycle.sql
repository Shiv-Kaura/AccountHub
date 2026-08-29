-- Renames the "deal" account segment to "prospect" (better matches how it's actually used —
-- sales prospects like new-logo facilities, not just discounted deals), and lets the app
-- auto-promote a prospect to a managed facility group once it's Signed on the pipeline.
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).

alter table accounts drop constraint if exists accounts_segment_check;

update accounts set segment = 'prospect' where segment = 'deal';

alter table accounts add constraint accounts_segment_check
  check (segment in ('managed', 'prospect'));
