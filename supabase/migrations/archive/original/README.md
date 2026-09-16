# Archived original migrations

These 19 migrations (2025-08) are the **original project schema** — created during
the initial build before the CareHub rebrand. They have all been applied to the
live database and are kept here for history / full-DB rebuilds.

They are **not needed for shipping** — the CareHub work builds on top of them,
and the consolidated `../../../../rebuild_all.sql` at the project root contains
the entire current state (original schema + all CareHub changes) in one file.

## File list

| Migration | Purpose (from name pattern) |
|---|---|
| 20250810142215_dusty_bridge | Initial schema |
| 20250810142413_floating_brook | Schema additions |
| 20250810143558_bright_violet | Schema additions |
| 20250810144000_aged_snowflake | Schema additions |
| 20250810144931_azure_recipe | Schema additions |
| 20250810145109_empty_frog | Schema additions |
| 20250810145242_holy_paper | Schema additions |
| 20250810145527_orange_dune | Schema additions |
| 20250811133632_holy_villa | Data / functions |
| 20250813145646_crystal_star | Data / functions |
| 20250817050645_tiny_lagoon | Data / functions |
| 20250817082339_yellow_cave | Data / functions |
| 20250821144914_emerald_dune | Data / functions |
| 20250821150031_flat_math | Data / functions |
| 20250821155228_little_mountain | Data / functions |
| 20250821155259_misty_dust | Data / functions |
| 20250821163046_graceful_wind | Data / functions |
| 20250829164833_cool_bar | Data / functions |
| 20250829164844_old_bridge | Data / functions |

## Rebuild path

To recreate the database from scratch on a fresh Supabase project:

1. Run `rebuild_all.sql` (project root) — it is the full consolidated script.
2. Or, to replay in exact order: run each file in this folder in filename order,
   then run the `20260916*` migrations in the parent folder in order.