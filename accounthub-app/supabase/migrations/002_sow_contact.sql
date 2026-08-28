-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
-- Adds the contact fields the SOW Generator needs for auto-fill + PDF export.

alter table sows add column if not exists contact_name text default '';
alter table sows add column if not exists contact_email_phone text default '';
