create table if not exists public.stat_block_store_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  store_type text not null check (
    store_type in (
      'speed',
      'trait-skill',
      'trait-resistance',
      'trait-sense',
      'trait-language',
      'ability',
      'action',
      'multiattack',
      'bonus-action',
      'reaction',
      'legendary-action',
      'legendary-resistance',
      'lair-action'
    )
  ),
  name text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists stat_block_store_items_owner_type_name_idx
  on public.stat_block_store_items (user_id, store_type, name);

alter table public.stat_block_store_items enable row level security;

create policy "Users can manage their own stat block store items"
  on public.stat_block_store_items
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
