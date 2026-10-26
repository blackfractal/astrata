# Jonathan's Cnidarian review — 2026-10-25

Read-only analysis of run `01cf6cdc-3bc4-420a-9253-76605bdf8ec2`, Cnidarian UID280. Archived decision states/effects preserved in records.json. No changes to gameplay, balance, or live save.

## Result and limits

- Victory on player turn10 against324HP Cnidarian;70HP throughout. Cumulative damageTaken stays98 across the fight. No battle consumables or healing. The archive includes an early turn1 resume after a placement; that reset is not evidence of a completely uninterrupted attempt. The damage accounting below is unaffected by it.
- Played in4.0.29, not installed4.0.31. Old Ignis counted its current element; old Starleaf was Arcane and had no orthogonal crowding penalty. Therefore this is a review of the actual played build, not a test of current elemental-formation balance.
- Boss HP damage, clamped to remaining HP: Starleaf164, Resonant Grove44, Prismatic Sap32, Mindfire30, Mirror Armor18, Ignis15, Corrode8, Sapling7, Glass Moth6. Total324. Final Starleaf overkill excluded.
- Eight destroyed cards: Familiar, both Plasma Balls, Glass Moth, Lucid Guide, both Machine Elves, Sapling. Recalls/discards are not counted as destruction.
- Two tentacles killed during turn4, both credited to Plasma activations; replacement warnings later destroy those spent Plasma Balls. Tentacle count does not exceed3. Intentionally limiting kills avoids replacement multiplication.
- First turn ends with4unusedChannel; second with2. Rootwall never activates because it is on the right edge. Heat applies Burn to an immune Water tentacle. Lucid Guide never activates; it serves as a Wind-transmuted decoy. Clear Mind remains unused. These are reasons the result cannot be explained solely by perfect play.

## What worked

1. Initiating alone and getting the first player turn avoids an opening ambush.
2. Strong spatial attackers: the complete square gives Grove22 per use; Starleaf's full diagonals give32 for multiple turns.
3. Undertow recycles Starleaf, restoring its allowance; six Starleaf attacks supply about51% of the boss damage. Another Undertow returns Grove for reuse.
4. Wind Prismatic Sap provides offense and elemental Guard; Living Lattice changes a developed Bastion to Wind and adds5Ward. Upgraded Shields, Thought Bulwark and bracelets handle the boss's direct attacks.
5. Allies absorb tentacle attention and die instead of the player. Two Plasma kills give a temporary reprieve; leaving other tentacles alive avoids extra replacements. Accepting already-spent Plasma losses is sensible.
6. Slow Rot contributes8HP damage and induces a Purify turn, giving time to develop the board.

## Assessment

For this well-equipped deck, the old-build fight was too forgiving as an S3 climax: ten turns, substantial early inefficiency, no consumables and zeroHP damage. It still required formation construction, recycling, elemental defense, and accepting card attrition. It was not a one-card instant win; no single new nerf is justified by this record.

The most useful pressure question is whether distant Ally targeting absorbs too much of the tentacle threat. Most logged tendril actions are Splashes; only one logged adjacent strike appears, against Machine Elves. One old tentacle repeatedly alternates nearby columns while targets change. This merits a pursuit/targeting review, not an unsupported claim of a movement bug. Increasing bossHP alone would prolong the stable defensive loop.

Before changing numbers, retest on current4.0.31: fixed transmutedIgnis increases this engine's output, while Starleaf's orthogonal penalty can reduce it. If the same low-pressure outcome persists, prioritize tentacle ability to threaten the player/close distance and direct-boss pressure, preserving deliberate Ally sacrifice as a valid tactic. No tuning implemented.
