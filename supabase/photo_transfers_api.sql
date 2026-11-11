-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.photo_transfers
  add column if not exists share_token_hash text,
  add column if not exists manage_token_hash text,
  add column if not exists storage_path text,
  add column if not exists status text default 'pending',
  add column if not exists mime_type text,
  add column if not exists expected_size_bytes bigint,
  add column if not exists size_bytes bigint,
  add column if not exists request_fingerprint text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists expires_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.photo_transfers enable row level security;

create unique index if not exists photo_transfers_share_token_hash_idx
  on public.photo_transfers (share_token_hash);
create unique index if not exists photo_transfers_manage_token_hash_idx
  on public.photo_transfers (manage_token_hash);
create unique index if not exists photo_transfers_storage_path_idx
  on public.photo_transfers (storage_path);
create index if not exists photo_transfers_rate_limit_idx
  on public.photo_transfers (request_fingerprint, created_at desc);
create index if not exists photo_transfers_expiry_idx
  on public.photo_transfers (expires_at)
  where status in ('pending', 'ready');

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'photo_transfers_status_check'
  ) then
    alter table public.photo_transfers
      add constraint photo_transfers_status_check
      check (status in ('pending', 'ready', 'deleting', 'delete_failed'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'photo_transfers_size_check'
  ) then
    alter table public.photo_transfers
      add constraint photo_transfers_size_check
      check (expected_size_bytes > 0 and (size_bytes is null or size_bytes > 0));
  end if;
end $$;
