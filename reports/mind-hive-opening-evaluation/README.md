# Mind Hive opening swarm evaluation — 3.0.7

2026-10-14. Jonathan requested eight starting Ideons followed by a rising egg procession, tested with fairly strong decks. Implemented; no further balance tuning was applied after seeing these results.

## Rules tested

- Eight insects start in the rightmost three columns: four Skitters and four Burrowers, mixed across all seven elements. Seeded lanes give one insect per row, plus a second in two rows. No overwriting placed cards.
- Player acts before the opening swarm, including Hive-initiated encounters.
- Eggs per enemy turn: **1/1/1/1, 2/2/2/2, 4/4/4, 6/6, 8, 0**. Those stages use the rightmost 1/2/3/4 columns respectively.
- Existing insects move, older eggs hatch, new eggs are laid, then the Hive loses one countdown HP. Turn 15 resolves commands and hatches before victory.
- Covered eggs discard the whole Construct; uncovered eggs cause 8 damage of their element. Either hatches an insect. Elves can prevent both; blocked hatching waits. Newborns do not move immediately. Storm Canopy still excludes Ideons.

## Method and results

Twenty isolated fights: four fixed, coherent builds × seeds 73001–73005. All start at 70 HP, with Gold/Sapphire and Silver/Ruby bracelets, resource rings/gems, Stone Armor and Sturdy Metal Helmet. Baseline is the same unupgraded 25-card authored carry-in as the earlier five tests. Other builds have 30 cards and four declared upgrades each. Exact lists/upgrades are in `settings.json`. No potions. These are synthetic strong builds, not earned campaigns or a population win-rate estimate.

One unchanged WeightedPolicy selected all legal actions; no training, search, seed selection or post-result optimization. Every fight was replayed from its initial state and matched exactly. Initial/final states, decisions, per-round HP/resources/insect counts, full run archives and source snapshots are retained here. Jonathan's live save was not read or modified.

| Build | Wins | Final HP across five seeds | Damage-free fights |
|---|---:|---|---:|
| Original balanced carry-in | 5/5 | 70, 70, 57, 70, 70 | 4/5 |
| Wards and repair | 5/5 | 70, 70, 68, 70, 67 | 3/5 |
| Allies and elemental chains | 5/5 | 70, 70, 68, 70, 70 | 4/5 |
| Efficient spells and Insight | 5/5 | 59, 66, 68, 70, 66 | 1/5 |

**20/20 victories; 12/20 damage-free. Average damage taken 2.05 HP; worst 13 HP.** Every run successfully laid all 44 scheduled eggs. No run lost HP during the first five enemy turns; 39 of the total 41 HP damage occurred after the tenth. Each fight reached a peak of 11–22 simultaneous insects.

The earlier baseline went 5/5 with zero damage. This version's baseline is still 5/5, but one run takes 13. Opening spawns consume seeded randomness, so the same seed no longer guarantees identical card draws/egg locations; this is a useful fixture comparison, not an isolated causal measurement of eight extra insects.

## Assessment

The board looks much more crowded, but the encounter still falls short of the intended harrowing survival test against prepared builds.

1. **The opening swarm is distant.** Columns 5–7 and one-space movement leave several player turns to deploy the engine. The measured opening causes no HP damage in these twenty fights.
2. **Congestion limits pressure.** Insects cannot move into other insects; Skitters cannot cross placed cards. A large live count is not equivalent to a large number of attacks. Burrowers can swap through cards, but they too stop behind another insect.
3. **The final swarm arrives too late to walk across the grid.** Final eggs can burst, but their newborn insects immediately disappear with the Hive; many slightly older late-wave insects also never reach the left edge. Late pressure is predominantly the egg coverage/defense problem.
4. **Strong Focus and recycling answer the eggs efficiently.** Across the tests, 606 of 708 hatched eggs were covered (85.6%), and 136 eggs were repaired. Covered eggs also return useful cards for reuse without Recall cost. The repair build prevented 10–13 hatches per fight in four seeds, and 10 in the remaining seed.

Recommendation for the next discussion: improve how existing insects create timely threats or relieve their traffic jams before simply increasing egg counts again. A visibly telegraphed late acceleration, or a limited lane-changing insect, could convert crowded boards into real pressure. Neither is implemented. Avoid silently adding unavoidable damage to force a target HP loss.

## Delivery checks

548 rules tests pass. Packaged Electron check confirms all eight initial insects, player-first phase controls, visible first movement and one new egg; screenshots retained under `reports/screenshots/hive-opening`. Content/art audit: 202 required assets, no missing files/provenance. Portable app and ZIP rebuilt as 3.0.7.

Existing in-progress fights are not retrofitted with starting insects. New Hive encounters receive the opening swarm; current saved encounters use the new egg schedule on subsequent turns. No live save rewind was performed.
