# Player-directed Splash — 3.0.14

With no living player Allies, a tendril now moves and Splashes the player for its age-scaled elemental damage. Obstructed movement still allows Splash. Defense starts at its resulting column: cards in that column or farther left are eligible, plus equipment. Guarding is optional and attacks never move backwards. Beginning a command at the left edge with no Allies inflicts Poison 2 instead of Splash. Existing adjacent/distant Ally priorities and newborn damage resets remain.

Player Splash uses the usual selectable defense traversal and elemental handling. Its short tentacle lash plays only on the first impact, followed by the usual pulse and each impact effect. Intent and descriptions explain the target and positional restriction. Continue retains existing combat progress.

## Controlled Titan-deck comparison

Same authored strong deck, seed 73001, 70 starting HP, no Restless. Reused every decision from the verified 3.0.13 line, adding six manually selected defenses for the new Splash reactions. The verifier asserts the non-Splash action sequence is identical. No search, AI policy, rewinds, healing or consumables; live save untouched.

| Rule | Victory turn | Final HP | HP lost |
| --- | ---: | ---: | ---: |
| Scaling, no player Splash (3.0.13) | 14 | 62 | 8 |
| Scaling with player Splash (3.0.14) | 14 | 38 | 32 |

The additional 24 HP loss comes from Splash. Turn 13 alone cost 11 HP including the boss's hit. Four tendrils were killed in both attempts; card draw, damage spells and their random targets remain the same. This is a controlled replay of a known winning line with new defensive reactions, not a newly optimized strategy or a population win-rate estimate.

This substantial pressure closes the previous period of harmless travel after the last Ally dies. Keep player Splash for playtesting; health-threshold reinforcements are not applied yet. Jonathan's conditional proposal remains available: add two at half health and four at quarter health. Current opening count is three, so that would be nine baseline spawns before kill-based multiplication, not a guaranteed ten living tentacles. A ten-total design would need a separate opening-count/target-population decision. The proposed killer-space replacement telegraph/burst also remains pending.

Validation: 579 rules tests pass. Added tests cover player Splash, post-movement origin, same/left-column guarding, no reverse traversal, obstruction and left-edge Poison replacement. Packaged UI checks verify normal and reduced motion, one initial lash, impacts across two Wards and player, and a farther-right Ward remaining untouched. Full fight evidence is in `codex-cnidarian-strong-3.0.14`; verify with `node tools/verify-cnidarian-splash.mjs`.
