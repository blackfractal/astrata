# Titan deck versus scaling Cnidarian

**Victory: turn 14, 62/70 HP.** Rules/content 3.0.13, seed 73001. Codex chose all 178 legal decisions manually, without search, built-in AI or rewinds. An independent frozen-source replay matches the final observation. No healing or consumables. Live save/profile untouched; no game-rule changes made during this test.

The initial deck, inventory and equipment are asserted identical to the authored strong fixture used for the earlier Mind Hive and Cnidarian attempts: `stratum3-developed-foundation-v1`, 25 cards including Grove Titan and Transmute, 3 Focus / 4 Channel, Gold/Sapphire and Silver/Ruby bracelets, resource rings, Stone Armor and Sturdy Metal Helmet, full 70 HP, no Restless. This is a declared sample carry-in, not an organically earned run.

| Result | Fixed damage, 3.0.12 | Scaling damage, 3.0.13 |
| --- | ---: | ---: |
| Victory turn | 12 | 14 |
| Final player HP | 65 | 62 |
| HP lost, no healing | 5 | 8 |
| Tendrils killed | 2 | 4 |
| Titan boss damage | 72 | 62 |
| Titan survives | Yes, 23 HP | No, sacrificed turn 7 |

## How the line changed

The same Titan opening took 5 player damage on turn 1. Turn 2 placed three neighbors and Focus Energy; turn 3 Transmuted Titan to Wind. Scaling reduced Titan to 14 HP by turn 4 and 8 HP by turn 7 despite resistance and regeneration. Its three attacks dealt 20 + 21 + 21 boss damage. On turn 7 its remaining HP absorbed 16 of a 20-Water boss attack before the bracelet finished guarding. This converted a spent, declining Ally into immediate protection.

Kill sequence: turn 5 Gale plus Needle killed the first original tendril; turn 8 Wind Plasma Ball randomly killed the second; turn 9 Needle plus an attuned Blast killed the last original; turn 10 another Wind Plasma Ball killed a replacement, producing the first two-for-one replacement. Plasma fired three times: one boss hit and two tendril kills. Those random targets were accepted without rerolls.

Familiar, Sapling and Machine Elves absorbed direct hits. Lucid Guide provided a final Splash buffer, falling on turn 8. All five placed Allies were gone after that. The new tendrils were still traveling, so none inflicted Poison before the win. Scaling therefore mattered strongly to Ally survival but did not directly damage the player once Allies were gone.

Recalled Storm Canopy, Solitude and Water Blast supplied reliable targeted boss damage. Re-placed Water Blast was Transmuted to Wind. Living Lattice supplied Wind Ward; Magnifier revived depleted Ward. Neutral Ward and equipment covered Light/Chaos, while Wind Guard handled Water. Total player losses: 5 on turn 1, 2 on turn 9, 1 on turn 13. Solitude and a Nausea-weakened Needle dealt the final 13 on turn 14.

Boss damage totals: Storm Canopy 66, Titan 62, Solitude 60, Water Blast 29, Plasma Ball 24, Gale 12, Needle 9, ordinary Blast 4, Sapling 4. No claim of optimal play: some resources and card activations went unused, and a few attempted selectors were invalid. Invalid selectors caused no action or RNG advance; all accepted decisions are preserved.

## Assessment

The change closes the indefinite remote-Titan regeneration strategy. It makes selective kills, sacrificing spent Allies and recycling defenses more important, and lengthened this attempt by two turns. However, this strong build still won comfortably with only eight HP lost.

The remaining breathing room is concrete: without Allies, advancing tendrils perform no Splash or strike and only inflict Poison after reaching the left edge. Killing old tendrils replaces them farther forward, buying travel time. That let the last six player turns focus on the boss's direct attacks while the replacements advanced. This is one adaptive playthrough of one authored build/seed, not a measured general win rate or an isolated numerical estimate of the scaling change.

The proposed replacement-on-killer-space telegraph/burst is not implemented in 3.0.13 and was not part of this test.

## Reproduction

`attempt.json` contains initial/final states, every accepted action and pre-action checkpoints. `sources.json` freezes the tested rules. `winning-line.json` contains action keys; `verification.json` includes per-turn HP and damage totals. Run `node tools/verify-cnidarian-scaling.mjs` to independently verify. The earlier 3.0.12 attempt remains intact.
