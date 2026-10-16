-- D&D System Reference Document 5.2.1 (2024 rules), Copyright Wizards of the Coast LLC.
-- Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
-- Source: https://www.dndbeyond.com/srd. Text was normalized into catalog records.

create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  ruleset_id uuid not null references public.rulesets (id) on delete cascade,
  created_by uuid references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  creature_type text not null default 'Humanoid',
  size_options text[] not null default array['Medium']::text[],
  speed smallint not null default 30 check (speed >= 0),
  languages text[] not null default array['Common']::text[],
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists species_builtin_slug_idx
  on public.species (ruleset_id, slug)
  where created_by is null;

create unique index if not exists species_owner_slug_idx
  on public.species (ruleset_id, created_by, slug)
  where created_by is not null;

create index if not exists species_ruleset_id_idx
  on public.species (ruleset_id);

create table if not exists public.species_features (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species (id) on delete cascade,
  slug text,
  name text not null,
  description text not null default '',
  level smallint not null default 1 check (level between 1 and 20),
  sort_order integer not null default 0,
  choices jsonb not null default '[]'::jsonb
    check (jsonb_typeof(choices) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists species_features_species_slug_idx
  on public.species_features (species_id, slug)
  where slug is not null;

create index if not exists species_features_species_level_idx
  on public.species_features (species_id, level, sort_order);

drop trigger if exists species_updated_at on public.species;
create trigger species_updated_at
  before update on public.species
  for each row
  execute function public.update_class_catalog_updated_at();

drop trigger if exists species_features_updated_at on public.species_features;
create trigger species_features_updated_at
  before update on public.species_features
  for each row
  execute function public.update_class_catalog_updated_at();

alter table public.species enable row level security;
alter table public.species_features enable row level security;

create policy "Users can read published or owned species"
  on public.species
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

create policy "Users can create their own species"
  on public.species
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

create policy "Users can update their own species"
  on public.species
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

create policy "Users can delete their own species"
  on public.species
  for delete
  to authenticated
  using (created_by = auth.uid());

create policy "Users can read features of readable species"
  on public.species_features
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.species
      where id = species_id
        and (status = 'published' or created_by = auth.uid())
    )
  );

create policy "Users can create features for their own species"
  on public.species_features
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.species
      where id = species_id
        and created_by = auth.uid()
    )
  );

create policy "Users can update features for their own species"
  on public.species_features
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.species
      where id = species_id
        and created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.species
      where id = species_id
        and created_by = auth.uid()
    )
  );

create policy "Users can delete features for their own species"
  on public.species_features
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.species
      where id = species_id
        and created_by = auth.uid()
    )
  );

insert into public.species
  (id, ruleset_id, created_by, slug, name, description, creature_type, size_options, speed, languages, status)
values
  ('20000000-0000-4000-8000-000000000001', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'dragonborn', 'Dragonborn', 'Descended from dragons, dragonborn have striking features and draconic gifts.', 'Humanoid', array['Medium']::text[], 30, array['Common', 'Draconic']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000002', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'dwarf', 'Dwarf', 'Dwarves are resilient humanoids with a deep connection to stone.', 'Humanoid', array['Medium']::text[], 30, array['Common']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000003', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'elf', 'Elf', 'Elves are magical people with a supernatural connection to the Feywild.', 'Humanoid', array['Medium']::text[], 30, array['Common', 'Elvish']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000004', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'gnome', 'Gnome', 'Gnomes are magical folk known for their curiosity and ingenuity.', 'Humanoid', array['Small']::text[], 30, array['Common', 'Gnomish']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000005', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'goliath', 'Goliath', 'Goliaths are towering humanoids whose ancestry is tied to giants.', 'Humanoid', array['Medium']::text[], 35, array['Common', 'Giant']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000006', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'halfling', 'Halfling', 'Halflings are resourceful folk blessed with remarkable luck.', 'Humanoid', array['Small']::text[], 30, array['Common']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000007', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'human', 'Human', 'Humans are adaptable and ambitious, with varied talents.', 'Humanoid', array['Small', 'Medium']::text[], 30, array['Common', 'One other language']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000008', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'orc', 'Orc', 'Orcs are determined humanoids with powerful builds and endurance.', 'Humanoid', array['Medium']::text[], 30, array['Common', 'Orc']::text[], 'published'),
  ('20000000-0000-4000-8000-000000000009', '1d8b3e11-e6f0-52ec-baac-d710fbbdddd6', null, 'tiefling', 'Tiefling', 'Tieflings carry an otherworldly legacy connected to the Lower Planes.', 'Humanoid', array['Small', 'Medium']::text[], 30, array['Common', 'One other language']::text[], 'published')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  creature_type = excluded.creature_type,
  size_options = excluded.size_options,
  speed = excluded.speed,
  languages = excluded.languages,
  status = excluded.status;

insert into public.species_features
  (id, species_id, slug, name, description, level, sort_order, choices)
values
  ('21000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'draconic-ancestry', 'Draconic Ancestry', 'Your lineage stems from a dragon progenitor. Your choice determines the damage type used by your Breath Weapon and Damage Resistance.', 1, 1, '[{"key":"ancestry","prompt":"Choose a draconic ancestry","options":["Black (Acid)","Blue (Lightning)","Brass (Fire)","Bronze (Lightning)","Copper (Acid)","Gold (Fire)","Green (Poison)","Red (Fire)","Silver (Cold)","White (Cold)"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'breath-weapon', 'Breath Weapon', 'When you take the Attack action, replace one attack with magical energy in a 15-foot cone or 30-foot line (5 feet wide). Creatures in the area make a Dexterity save (DC 8 + Constitution modifier + Proficiency Bonus), taking 1d10 damage on a failed save or half on a success. Damage increases to 2d10 at level 5, 3d10 at level 11, and 4d10 at level 17. Uses equal Proficiency Bonus per Long Rest.', 1, 2, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'damage-resistance', 'Damage Resistance', 'You have Resistance to the damage type determined by your Draconic Ancestry.', 1, 3, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', 'darkvision', 'Darkvision', 'You have Darkvision with a range of 60 feet.', 1, 4, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', 'draconic-flight', 'Draconic Flight', 'Starting at character level 5, as a Bonus Action you gain a Fly Speed equal to your Speed for 10 minutes. Once used, this trait recharges when you finish a Long Rest.', 5, 5, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', 'darkvision', 'Darkvision', 'You have Darkvision with a range of 120 feet.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000002', 'dwarven-resilience', 'Dwarven Resilience', 'You have Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition.', 1, 2, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000002', 'dwarven-toughness', 'Dwarven Toughness', 'Your Hit Point maximum increases by 1, and increases by 1 again whenever you gain a level.', 1, 3, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000002', 'stonecunning', 'Stonecunning', 'As a Bonus Action while on or touching stone, gain Tremorsense with a range of 60 feet for 10 minutes. Uses equal Proficiency Bonus per Long Rest.', 1, 4, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000003', 'darkvision', 'Darkvision', 'You have Darkvision with a range of 60 feet.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000003', 'elven-lineage', 'Elven Lineage', 'Choose a lineage and gain its level 1 benefit. You learn its level 3 and level 5 spells at those character levels; each is always prepared and can be cast once without a spell slot per Long Rest. Choose Intelligence, Wisdom, or Charisma as your spellcasting ability.', 1, 2, '[{"key":"lineage","prompt":"Choose an elven lineage","options":["Drow","High Elf","Wood Elf"]},{"key":"spellcastingAbility","prompt":"Choose your spellcasting ability","options":["Intelligence","Wisdom","Charisma"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000003', 'fey-ancestry', 'Fey Ancestry', 'You have Advantage on saving throws you make to avoid or end the Charmed condition.', 1, 3, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000003', 'keen-senses', 'Keen Senses', 'You have proficiency in the Insight, Perception, or Survival skill.', 1, 4, '[{"key":"keenSensesSkill","prompt":"Choose a skill proficiency","options":["Insight","Perception","Survival"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000003', 'trance', 'Trance', 'You do not need to sleep, and magic cannot put you to sleep. You can finish a Long Rest in 4 hours by meditating, during which you remain conscious.', 1, 5, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000004', 'darkvision', 'Darkvision', 'You have Darkvision with a range of 60 feet.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000004', 'gnomish-cunning', 'Gnomish Cunning', 'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.', 1, 2, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000004', 'gnomish-lineage', 'Gnomish Lineage', 'Choose a lineage granting a magical benefit. Forest Gnome grants Minor Illusion and Speak with Animals; Rock Gnome grants Mending and Prestidigitation, plus the ability to create clockwork devices.', 1, 3, '[{"key":"lineage","prompt":"Choose a gnomish lineage","options":["Forest Gnome","Rock Gnome"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000018', '20000000-0000-4000-8000-000000000005', 'giant-ancestry', 'Giant Ancestry', 'Choose a giant ancestry and gain its associated magical benefit.', 1, 1, '[{"key":"ancestry","prompt":"Choose a giant ancestry","options":["Cloud (teleport up to 30 feet as a Bonus Action)","Fire (deal extra fire damage when you hit with an attack)","Frost (deal extra cold damage and reduce a target’s Speed)","Hill (knock a Large or smaller target Prone)","Stone (use a Reaction to reduce damage)","Storm (use a Reaction to deal lightning damage)"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000019', '20000000-0000-4000-8000-000000000005', 'large-form', 'Large Form', 'Starting at character level 5, you can change your size to Large for 10 minutes, gaining Advantage on Strength checks and a Speed increase of 10 feet. Uses equal Proficiency Bonus per Long Rest.', 5, 2, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000005', 'powerful-build', 'Powerful Build', 'You have Advantage on ability checks to end the Grappled condition. You also count as one size larger when determining carrying capacity and the weight you can push, drag, or lift.', 1, 3, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000021', '20000000-0000-4000-8000-000000000006', 'brave', 'Brave', 'You have Advantage on saving throws you make to avoid or end the Frightened condition.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000022', '20000000-0000-4000-8000-000000000006', 'halfling-nimbleness', 'Halfling Nimbleness', 'You can move through the space of any creature that is a size larger than you, but cannot stop there.', 1, 2, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000023', '20000000-0000-4000-8000-000000000006', 'luck', 'Luck', 'When you roll a 1 on a D20 Test, you can reroll the die, and must use the new roll.', 1, 3, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000024', '20000000-0000-4000-8000-000000000006', 'naturally-stealthy', 'Naturally Stealthy', 'You can take the Hide action even when obscured only by a creature at least one size larger than you.', 1, 4, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000025', '20000000-0000-4000-8000-000000000007', 'resourceful', 'Resourceful', 'You gain Heroic Inspiration whenever you finish a Long Rest.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000026', '20000000-0000-4000-8000-000000000007', 'skillful', 'Skillful', 'You gain proficiency in one skill of your choice.', 1, 2, '[{"key":"skill","prompt":"Choose a skill proficiency","options":["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000027', '20000000-0000-4000-8000-000000000007', 'versatile', 'Versatile', 'You gain an Origin feat of your choice.', 1, 3, '[{"key":"originFeat","prompt":"Choose an Origin feat","options":[],"allowCustom":true}]'::jsonb),
  ('21000000-0000-4000-8000-000000000028', '20000000-0000-4000-8000-000000000008', 'adrenaline-rush', 'Adrenaline Rush', 'You can take the Dash action as a Bonus Action. When you do, gain Temporary Hit Points equal to your Proficiency Bonus. Uses equal Proficiency Bonus per Long Rest.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000029', '20000000-0000-4000-8000-000000000008', 'darkvision', 'Darkvision', 'You have Darkvision with a range of 120 feet.', 1, 2, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000030', '20000000-0000-4000-8000-000000000008', 'relentless-endurance', 'Relentless Endurance', 'When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. Once used, this trait recharges when you finish a Long Rest.', 1, 3, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000031', '20000000-0000-4000-8000-000000000009', 'darkvision', 'Darkvision', 'You have Darkvision with a range of 60 feet.', 1, 1, '[]'::jsonb),
  ('21000000-0000-4000-8000-000000000032', '20000000-0000-4000-8000-000000000009', 'fiendish-legacy', 'Fiendish Legacy', 'Choose a legacy, gaining its level 1 benefit. You learn its level 3 and level 5 spells at those character levels; each is always prepared and can be cast once without a spell slot per Long Rest. Choose Intelligence, Wisdom, or Charisma as your spellcasting ability.', 1, 2, '[{"key":"legacy","prompt":"Choose a fiendish legacy","options":["Abyssal","Chthonic","Infernal"]},{"key":"spellcastingAbility","prompt":"Choose your spellcasting ability","options":["Intelligence","Wisdom","Charisma"]}]'::jsonb),
  ('21000000-0000-4000-8000-000000000033', '20000000-0000-4000-8000-000000000009', 'otherworldly-presence', 'Otherworldly Presence', 'You know the Thaumaturgy cantrip.', 1, 3, '[]'::jsonb)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  level = excluded.level,
  sort_order = excluded.sort_order,
  choices = excluded.choices;
