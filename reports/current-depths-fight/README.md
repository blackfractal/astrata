# Borrowed Oracle / Glass Brood — Jonathan's S3 event

2026-10-13. Seed655758646, continued from S2 victory; run0bee2d57-fb5a-4cfa-9b26-21a6ed896c34. Rules/content3.0.0, package3.0.1. User requested restarting the completed Oracle battle and comparing both event options. Actual save restored to the exact Oracle opening:21HP,163Gold,turn1,original hand/RNG. Previous post-fight position is backed up under `%APPDATA%/astrata/save-backups/oracle-start-1791866237502`. Analysis simulations never write to the live save.

| Line | Turns | Damage taken | Ending HP | Consumables |
| --- | ---: | ---: | ---: | ---: |
| Jonathan's completed Oracle attempt | 11 | 20 | 3 | 0 |
| Tested Oracle alternative | 9 | 0 | 23 | 0 |
| Tested Brood alternative | 4 | 12 | 11 | 0 |

The event begins at19HP; Holy Armor heals2 at battle start, then2 at the next turn start. All table lines start at21HP. The zero-damage Oracle line is optimal for damage avoided, not a proof of minimum turns. Brood was manually tested, not exhaustively solved. Its event choice changes RNG consumption and opening draws; both comparisons begin at the same pre-event state with the same collection/equipment. Baseline heuristic-policy failures are also retained, explicitly separate from these manual lines.

## What mattered

- Jonathan remained at22HP through turn8. Losses:1 from the opening Light attack;2 from the Sentinel plus9 from hypnotized Cinder Snap at the end of turn8;8 from Foreign Sensation at the end of turn9. Winning at3HP was not the result of uniformly poor defense.
- Sentinel is Arcane-vulnerable and element-resistant. Guide then an Arcane Blast uses its mark efficiently. The alternative removes the first Sentinel on turn2. Jonathan spent elemental attacks on it and removed it on turn3; later another died on turn7 immediately before its replacement.
- Recall threatened damage cards before Hypnosis lands, or use their remaining activation when appropriate. The alternative recalls Water Blast before the first application, moves Guide out of its corrupted space later, and recalls Chaos Thorn Eruption before it can be compelled. It does not need to clear every Corruption.
- Resonance was placed on turn6 but expired unused. The alternative activates it, paying for a fourth useful action that turn.
- Plan each hit in the mixed sequence. Earth Lattice handles9 of the first Wind hit with6Ward; use the Silver Bracelet for the remainder, then save the Shield and Gold Bracelet for Fire. Equipment selection ends card-defense access for that hit, so reserve the correct cards before moving the attack left.
- Slow Rot and later Chaos Thorn Eruption were good choices. Corrode already applied to the Oracle keeps working behind its Sentinel; the alternative retains that pressure and spends fewer turns restoring defenses instead of attacking.

For this position, prefer Oracle when minimizing HP loss. Brood is shorter but starts with three9-Wind attackers and follows with12-Earth attacks, demanding substantial immediate defense or kills. Storm Canopy shines against both Brood and their Ideons, but the opening still cost HP in the tested line.

## Replay

`start.json` is the exact Oracle opening. `event.json` is the pre-choice state. `human.json` contains only the completed attempt, excluding the earlier partial attempt that was restarted. `oracle-no-damage.json` and `brood-victory.json` contain legal actions and results. Run `node reports/current-depths-fight/verify.mjs` to replay all three. `manual.mjs` and `brood.mjs` reproduce the manual alternatives; coordinates in them are zero-based, while action labels use the normal one-based slot display. `verification.json` records replay results and source hashes.
