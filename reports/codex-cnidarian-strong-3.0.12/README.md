# Strong Mind Hive deck versus revised Cnidarian

**Victory: turn 12, 65/70 HP.** Rules/content 3.0.12, seed 73001, 149 manually selected legal decisions, no rewinds, no search or built-in AI. Independent frozen-source replay matches the final observation. All five player HP lost on turn 1; no player healing or consumables used.

This is the authored `stratum3-developed-foundation-v1` test build used for the previous manual Mind Hive victory, not Jonathan's live save or a claimed organically earned campaign. Setup asserts exact equality of deck, inventory and equipment against that earlier attempt. The 25-card deck includes Grove Titan, Transmute, Lucid Guide, Machine Elves, Ward/Lattice/Magnifier, Focus Energy, Wind spells and foundation cards. It starts at 3 Focus / 4 Channel with Gold/Sapphire and Silver/Ruby bracelets, resource rings, Stone Armor and Sturdy Metal Helmet. No Restless. The same build previously beat Mind Hive at 16/70 HP on turn 15; this single comparison is not a win-rate estimate.

## The line

- Place Titan immediately at R5C1. Accept the opening 5 HP loss after equipment Guard to preserve its HP. It deals 20 Earth damage first.
- Place Focus, Blast and Lucid Needle around Titan. Three adjacent cards restore 3 HP each turn, offsetting three distant Splashes.
- Transmute Titan to Wind. Its next two attacks deal 26 each, for 72 total boss damage across its three uses. Keep the spent Titan alive afterward to divert Splash.
- Sacrifice the smaller Allies to absorb direct boss damage before the tendrils would kill them. Sapling, Machine Elves, Familiar and Lucid Guide are lost; Titan survives at 23 HP. The Elves are used as a body here, not for repair.
- On turn 6, Guide marks a tendril for Needle; Scouring Gale finishes a previously damaged tendril. Only two tendrils die, keeping replacements one-for-one. Do not clear every tendril.
- Use Wind Shields and a Wind Ward for Water attacks; keep neutral Ward and bracelet capacity for the Chaos/Light hits. Recall spent offensive cards and re-place them away from Nausea. Recalls also reset their activation allowances.
- Repeat Storm Canopy and Solitude. Transmute a re-placed Water Blast to Wind. Finish with Storm Canopy, Solitude, Gale and a Wind-attuned ordinary Blast before turn 12's enemy sequence.

Boss damage: Titan 72, Storm Canopy 66, Solitude 60, Water Blast 25, Scouring Gale 24, ordinary Blasts 13 (lethal overkill excluded), Needle 6, Sapling 4. Plasma Ball never activates; Cinder Snap only covers Nausea. Several resources/activations remain unused, so this is not an optimized upper bound.

## Balance assessment

The revised tendrils do swap cards, use adjacent strikes, and Splash distant Allies correctly. They killed/pressured supporting Allies and displaced Rain Lantern, Transmute and a Ward. Nausea also reduced Water Blast damage until it was recalled and repositioned.

The remaining weakness is **stable remote Ally sustain**. The tendrils move straight west and never change lanes to approach the Titan at R5C1. Even a tendril at the left edge uses Splash instead of Poison while any Ally survives. Titan's three-neighbor regeneration pays for all three Splashes indefinitely, even after its own attacks are spent. This lets the player cycle reliable damage spells against an otherwise manageable boss sequence without engaging the multiplying replacement mechanic.

For this build the encounter remains forgiving: 5 total HP lost versus 54 in the earlier Hive test. This does not establish that arbitrary decks or lower-resource carry-ins win. No balance changes made as part of the test. Potential follow-up discussion should address the stationary left-edge Splash equilibrium rather than assuming higher boss HP alone solves it.

## Evidence

`attempt.json` contains the initial/final state, all selected actions and all pre-action checkpoints. `sources.json` freezes the tested modules. `winning-line.json` provides replay keys; `verification.json` contains per-turn HP and damage totals. Replay with `node tools/verify-cnidarian-strong.mjs`. Rejected selector matches caused no gameplay action, RNG change or rewind.

The user's live save and game implementation were not changed.

## Subsequent rule change

Version3.0.13 restores individual tendril growth: strike+2 and Splash+0.5 per successive command (rounded up), resetting on replacement. This frozen3.0.12 victory used fixed4/1 damage and does not establish a win under the newer rules.
