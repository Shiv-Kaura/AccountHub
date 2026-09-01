-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
--
-- Lets staff take a file a customer sent back through the portal and "file" it as a real
-- account document (same as the normal "Uploaded documents" upload: title, quote/SOW, facility,
-- optional pipeline tracking) instead of it just sitting in the portal's file list forever.
--
-- filed_doc_id points at the docs row that was created from this portal upload, once someone
-- has filed it. Null means "not filed yet" — that's the signal the UI uses to show the
-- "Save to account" button versus a plain "Filed" label.

alter table portal_files add column if not exists filed_doc_id text references docs(id) on delete set null;
