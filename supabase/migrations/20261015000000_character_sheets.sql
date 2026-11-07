create table if not exists public.character_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists character_sheets_user_id_updated_at_idx
  on public.character_sheets (user_id, updated_at desc);

create or replace function public.update_character_sheets_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists character_sheets_updated_at on public.character_sheets;
create trigger character_sheets_updated_at
  before update on public.character_sheets
  for each row
  execute function public.update_character_sheets_updated_at();

alter table public.character_sheets enable row level security;

create policy "Users can manage their own character sheets"
  on public.character_sheets
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
