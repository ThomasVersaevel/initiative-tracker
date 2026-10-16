create table if not exists public.rulesets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  edition text not null,
  source text,
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rulesets_builtin_slug_idx
  on public.rulesets (slug)
  where created_by is null;

create unique index if not exists rulesets_owner_slug_idx
  on public.rulesets (created_by, slug)
  where created_by is not null;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  ruleset_id uuid not null references public.rulesets (id) on delete cascade,
  created_by uuid references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  hit_die smallint check (hit_die in (4, 6, 8, 10, 12)),
  primary_abilities text[] not null default '{}'::text[],
  saving_throw_proficiencies text[] not null default '{}'::text[],
  proficiencies jsonb not null default '{}'::jsonb
    check (jsonb_typeof(proficiencies) = 'object'),
  starting_equipment jsonb not null default '{}'::jsonb
    check (jsonb_typeof(starting_equipment) = 'object'),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists classes_builtin_slug_idx
  on public.classes (ruleset_id, slug)
  where created_by is null;

create unique index if not exists classes_owner_slug_idx
  on public.classes (ruleset_id, created_by, slug)
  where created_by is not null;

create index if not exists classes_ruleset_id_idx
  on public.classes (ruleset_id);

create table if not exists public.subclasses (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  created_by uuid references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  unlock_level smallint not null default 3
    check (unlock_level between 1 and 20),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subclasses_builtin_slug_idx
  on public.subclasses (class_id, slug)
  where created_by is null;

create unique index if not exists subclasses_owner_slug_idx
  on public.subclasses (class_id, created_by, slug)
  where created_by is not null;

create index if not exists subclasses_class_id_idx
  on public.subclasses (class_id);

create table if not exists public.class_features (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  slug text,
  name text not null,
  description text not null default '',
  level smallint not null check (level between 1 and 20),
  sort_order integer not null default 0,
  choices jsonb not null default '{}'::jsonb
    check (jsonb_typeof(choices) = 'object'),
  prerequisites jsonb not null default '{}'::jsonb
    check (jsonb_typeof(prerequisites) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists class_features_class_slug_idx
  on public.class_features (class_id, slug)
  where slug is not null;

create index if not exists class_features_class_level_idx
  on public.class_features (class_id, level, sort_order);

create table if not exists public.subclass_features (
  id uuid primary key default gen_random_uuid(),
  subclass_id uuid not null references public.subclasses (id) on delete cascade,
  slug text,
  name text not null,
  description text not null default '',
  level smallint not null check (level between 1 and 20),
  sort_order integer not null default 0,
  choices jsonb not null default '{}'::jsonb
    check (jsonb_typeof(choices) = 'object'),
  prerequisites jsonb not null default '{}'::jsonb
    check (jsonb_typeof(prerequisites) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subclass_features_subclass_slug_idx
  on public.subclass_features (subclass_id, slug)
  where slug is not null;

create index if not exists subclass_features_subclass_level_idx
  on public.subclass_features (subclass_id, level, sort_order);

create table if not exists public.class_progression (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  level smallint not null check (level between 1 and 20),
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, level)
);

create or replace function public.update_class_catalog_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rulesets_updated_at on public.rulesets;
create trigger rulesets_updated_at
  before update on public.rulesets
  for each row
  execute function public.update_class_catalog_updated_at();

drop trigger if exists classes_updated_at on public.classes;
create trigger classes_updated_at
  before update on public.classes
  for each row
  execute function public.update_class_catalog_updated_at();

drop trigger if exists subclasses_updated_at on public.subclasses;
create trigger subclasses_updated_at
  before update on public.subclasses
  for each row
  execute function public.update_class_catalog_updated_at();

drop trigger if exists class_features_updated_at on public.class_features;
create trigger class_features_updated_at
  before update on public.class_features
  for each row
  execute function public.update_class_catalog_updated_at();

drop trigger if exists subclass_features_updated_at on public.subclass_features;
create trigger subclass_features_updated_at
  before update on public.subclass_features
  for each row
  execute function public.update_class_catalog_updated_at();

drop trigger if exists class_progression_updated_at on public.class_progression;
create trigger class_progression_updated_at
  before update on public.class_progression
  for each row
  execute function public.update_class_catalog_updated_at();

alter table public.rulesets enable row level security;
alter table public.classes enable row level security;
alter table public.subclasses enable row level security;
alter table public.class_features enable row level security;
alter table public.subclass_features enable row level security;
alter table public.class_progression enable row level security;

create policy "Users can read published or owned rulesets"
  on public.rulesets
  for select
  to authenticated
  using (status = 'published' or created_by = auth.uid());

create policy "Users can create their own rulesets"
  on public.rulesets
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Users can update their own rulesets"
  on public.rulesets
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Users can delete their own rulesets"
  on public.rulesets
  for delete
  to authenticated
  using (created_by = auth.uid());

create policy "Users can read published or owned classes"
  on public.classes
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or (
      status = 'published'
      and exists (
        select 1
        from public.rulesets
        where id = ruleset_id
          and status = 'published'
      )
    )
  );

create policy "Users can create their own classes"
  on public.classes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.rulesets
      where id = ruleset_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can update their own classes"
  on public.classes
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.rulesets
      where id = ruleset_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can delete their own classes"
  on public.classes
  for delete
  to authenticated
  using (created_by = auth.uid());

create policy "Users can read published or owned subclasses of readable classes"
  on public.subclasses
  for select
  to authenticated
  using (
    (status = 'published' or created_by = auth.uid())
    and exists (
      select 1
      from public.classes
      where id = class_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can create their own subclasses of readable classes"
  on public.subclasses
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.classes
      where id = class_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can update their own subclasses"
  on public.subclasses
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.classes
      where id = class_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can delete their own subclasses"
  on public.subclasses
  for delete
  to authenticated
  using (created_by = auth.uid());

create policy "Users can read features of readable classes"
  on public.class_features
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.classes
      where id = class_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can create features for their own classes"
  on public.class_features
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  );

create policy "Users can update features for their own classes"
  on public.class_features
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  );

create policy "Users can delete features for their own classes"
  on public.class_features
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  );

create policy "Users can read features of readable subclasses"
  on public.subclass_features
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.subclasses
      join public.classes on classes.id = subclasses.class_id
      where subclasses.id = subclass_id
        and (subclasses.status = 'published' or subclasses.created_by = auth.uid())
        and (classes.status = 'published' or classes.created_by = auth.uid())
    )
  );

create policy "Users can create features for their own subclasses"
  on public.subclass_features
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.subclasses
      where id = subclass_id
        and created_by = auth.uid()
    )
  );

create policy "Users can update features for their own subclasses"
  on public.subclass_features
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.subclasses
      where id = subclass_id
        and created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.subclasses
      where id = subclass_id
        and created_by = auth.uid()
    )
  );

create policy "Users can delete features for their own subclasses"
  on public.subclass_features
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.subclasses
      where id = subclass_id
        and created_by = auth.uid()
    )
  );

create policy "Users can read progression for readable classes"
  on public.class_progression
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.classes
      where id = class_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can create progression for their own classes"
  on public.class_progression
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  );

create policy "Users can update progression for their own classes"
  on public.class_progression
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  );

create policy "Users can delete progression for their own classes"
  on public.class_progression
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.classes
      where id = class_id
        and created_by = auth.uid()
    )
  );
