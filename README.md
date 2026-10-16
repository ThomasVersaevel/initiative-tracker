# initiative-tracker
An initiative tracker web-app for TTRPG game masters.

### Features:

#### Initiative tracker:
Set initiative, player name, movement speed, HP, AC, spell save DC, condition and condition timer

Move through rounds and keep round number.
Automatically reduce condition timer each round.
Auto rolls a d20 for each turn for quick monster attacks.
Optional images per row.
Settable soundboard.
Greyout on surprised round.
Popup requesting saving throw on conditions that require one.
Previous button to go back one row.
Dynamically add and delete rows.
Multiple color themes.
Remembers setup from last session
Allows saving and importing saved characters and monster stat-blocks.

#### Stat block builder

Build your own monster with this modular stat block building application.
Saved in database and importable in the initiative tracker.

#### Character sheets

Create and save multiple character sheets per account. The Characters page lists
your saved sheets and opens each one with its saved identity, ability scores,
proficiencies, features, and equipment.

Apply the Supabase migrations in `supabase/migrations` to create the account-owned
character sheet table and the rules catalog (rulesets, classes, subclasses,
species, level-based class/subclass/species features, and class progression),
with row-level security policies. The D&D SRD 5.2.1 migration seeds its nine
player species and their traits, including lineage and ancestry choices.

The seeded class and species data is derived from the D&D System Reference Document 5.2.1,
Copyright Wizards of the Coast LLC, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), and sourced from the
[official SRD page](https://www.dndbeyond.com/srd). The text was extracted,
normalized, and structured as catalog records. The SRD includes 12 classes and
one subclass for each; it does not include every option from the 2024 rulebooks.

### development

Start dev server by running `npm start`  (port 3000)
