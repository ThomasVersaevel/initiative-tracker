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

Apply the Supabase migration in `supabase/migrations/20261015000000_character_sheets.sql`
to create the account-owned character sheet table and its row-level security policy.

### development

Start dev server by running `npm start`  (port 3000)
