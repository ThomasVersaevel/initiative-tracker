create table if not exists public.initiative_trackers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.initiative_trackers enable row level security;

create policy "Users can manage their own initiative tracker"
  on public.initiative_trackers
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);