-- Simple ARR snapshots table (no RLS; intended for internal ops endpoints only)
create table if not exists public.arr_snapshots (
  id bigserial primary key,
  captured_at timestamptz not null default now(),
  sports_arr numeric not null,
  business_arr numeric not null,
  total_arr numeric not null
);

-- Create index for faster time-based queries
create index if not exists idx_arr_snapshots_captured_at on public.arr_snapshots (captured_at desc);

-- No RLS enabled by default (internal ops only)
alter table public.arr_snapshots enable row level security;

-- Optional: Add a policy for service role access only
-- (This is implicitly available via service role bypass, but we document it here)
comment on table public.arr_snapshots is 'ARR (Annual Recurring Revenue) snapshots for internal analytics. Access via service role only.';