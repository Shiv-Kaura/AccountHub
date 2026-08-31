-- Tracks when a record last changed stage, so the pipeline UI can show
-- "N days in stage" and a per-column average. Backfilled from created_at
-- for existing rows (best available approximation); going forward every
-- stage-changing action sets this explicitly alongside `stage`.

alter table accounts add column if not exists stage_changed_at timestamptz not null default now();
alter table sites add column if not exists stage_changed_at timestamptz not null default now();
alter table quotes add column if not exists stage_changed_at timestamptz not null default now();
alter table sows add column if not exists stage_changed_at timestamptz not null default now();

-- One-time backfill: every row just got stage_changed_at = now() from the
-- column default above, so this pulls existing rows back to their created_at.
update accounts set stage_changed_at = created_at;
update sites set stage_changed_at = created_at;
update quotes set stage_changed_at = created_at;
update sows set stage_changed_at = created_at;
