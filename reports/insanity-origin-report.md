# Insanity damage origin and Plasma Ball explanation

2026-10-25 · version 4.0.24 · design 4.245

Jonathan asked why Plasma Ball inflicted only 8 HP damage and requested Insanity damage to travel from its actual space rather than the enemy.

Read-only inspection of live archive run `01cf6cdc-3bc4-420a-9253-76605bdf8ec2`, seed1877058977, confirmed Borrowed Face's Mirror Skin had 8 Guard. The Plasma Ball activation at archived step550 had damage16; enemy HP68→58 and Guard8→0 reflect 8 HP damage from Plasma plus2 from the independent ring proc. Later unguarded Plasma activations retain their full16. No Plasma balance or damage calculation change was needed.

Insanity's player-turn HP-loss presentation frame now supplies its own numeric `gridSourceSlot`. Existing renderer precedence already supports this origin and its Chaos projectile/impact; previously the missing source allowed the preceding enemy origin to remain in use. No changes to bypass rules, damage ramp, coverage reset, death timing, or the player's save.

Verification: 761 rules tests pass. New regression covers multiple Insanity spaces, slot0, covered suppression/reset, ramping, and lethal clamping. Isolated headless Edge test of packaged presentation confirms two projectile origins at slots0/41, both ending at the player, after a prior enemy incoming frame. No renderer errors. Native-window verification not claimed. Packaged runtime and portable ZIP refreshed and source bytes verified.
