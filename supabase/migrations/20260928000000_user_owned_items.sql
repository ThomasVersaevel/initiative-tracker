alter table public.characters
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists characters_user_id_idx
  on public.characters (user_id);

create index if not exists stat_blocks_user_id_idx
  on public.stat_blocks (user_id);

alter table public.characters enable row level security;
alter table public.stat_blocks enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('characters', 'stat_blocks')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

create policy "Users can manage their own characters"
  on public.characters
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own stat blocks"
  on public.stat_blocks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);