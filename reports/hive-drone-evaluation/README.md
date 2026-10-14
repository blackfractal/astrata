# Hive movement, Drones and victory presentation — 3.0.8

2026-10-14. Jonathan requested leftmost-first Ideon movement, swapping for all moving insects, then diagonal Skitters, a stationary scaling Drone, and a staged Hive death with one second to see the cleared battlefield. Berserk is explicitly deferred; one transformation per insect is the approved cap if implemented later.

## Delivered rules

- Each owner's commanded Ideons act from the leftmost column to the rightmost; topmost row breaks ties. Enemy ownership/command timing and other creatures' strides stay intact.
- Burrowers move straight west. Skitters choose uniformly among legal west/NW/SW destinations using the persisted RNG. They never wrap rows or waste a move if a legal destination exists.
- Both moving insects swap a whole player Construct into their old space, preserving its card state and stored Shield Guard. Space Corruptions stay; landing effects still apply. Another Ideon or Memory Hole blocks that destination. Insects do not swap each other.
- Drone: **50 HP, stationary, attacks for 5/10/15/20/… damage of its inherited element on successive owner commands**. Normal defense chain starts at its column. First attack is the command after hatching. Its next damage and element are visible on the card and in inspection.
- No opening Drones. Every fourth laid egg contains one; the other three eggs alternate the moving species. Destroying/repairing that egg prevents its Drone. Existing eggs retain their stored species. Original eight-insect opening, egg counts, hatch damage and fifteen-round clock are unchanged.
- Final attacks and hatch damage must be survived. Then the Hive disintegrates first, owned Ideons disintegrate together, and the battlefield remains visible for one real second before rewards. Fast/reduced-motion retain that second; explicit Skip can bypass it. Player cards remain.
- Saved moving insects receive the new movement/description without resetting HP, age, element or position. Current user save was not modified or rewound. No retroactive opening insects are added to an existing fight.

## Same strong-deck benchmark

Four fixed authored builds × seeds73001–73005, same gear and70HP as3.0.7. Baseline25cards unupgraded; other builds30cards/four upgrades. No potions or naturally earned campaign claim. Exact fixtures are in settings.json. Production WeightedPolicy is unchanged, with no training or lookahead search.

| Build | 3.0.7 wins | Final3.0.8 wins | Loss rounds in seed order |
|---|---:|---:|---|
| Balanced | 5/5 | 0/5 | 11,14,14,12,12 |
| Wards/repair | 5/5 | 0/5 | 14,13,12,12,13 |
| Allies/element chains | 5/5 | 0/5 | 13,14,15,14,11 |
| Efficient spells/Insight | 5/5 | 0/5 | 14,12,14,14,13 |

**Twenty losses, nineteen killing blows from Drones and one from a Mind Egg.** Previously all twenty won and twelve took no damage. The combined version is a severe difficulty increase for this heuristic controller, not evidence that the encounter is mathematically unwinnable.

**Manual follow-up:** Codex subsequently selected every action in the identical balanced seed73001 opening and won with70/70HP, zero damage, and no rewinds. All190actions replay exactly. This fixture's AI had died on round11. See [the manual-play report](../codex-hive-play/README.md) for the line and its limits.

A completed intermediate experiment, before the diagonal and Drone additions, tested only leftmost-first commands plus straight-line swapping for both types:20/20wins,14damage-free. It remains under `../mind-hive-movement-evaluation`. A diagonal-only experiment was interrupted by a temporary Windows archive-file rename lock after three completed baseline victories; partial data remain under `../mind-hive-skitter-evaluation`, and are not treated as a complete benchmark. The final benchmark also encountered one file lock on its last scenario; that scenario was rerun with a fresh archive ID using `--resume`, retaining the nineteen completed results and partial original archive.

## Separate target-priority diagnostic

The ordinary AI does not assign a special urgency score to an escalating Drone. A separately labeled five-fight experiment added25action-score points for damaging Drones or repairing Drone eggs, with no other changes. Production AI was not modified. It also lost5/5, on rounds13,15,15,12,15; four Drone killing blows and one egg. Three seeds reached the final round, so this helped some lines but did not find a win. Exact policy, states/actions and source snapshots are retained under `../hive-drone-priority-evaluation`.

This is a deliberately simple diagnostic, not optimized play or proof of the best available line. The first Drone can hatch after the fourth egg and repeatedly attack for increasing damage, so leaving one alive compounds pressure across many rounds. Keeping repairs available for visible Drone eggs is now especially valuable. Covering one only prevents its hatch burst/discards the cover; it does **not** stop the Drone appearing.

**Assessment:** movement rules are more coherent and Drones establish a real priority target. The combined difficulty has swung sharply past the old easy version in these tests. Do not add Berserk yet. A human replay or stronger tactical search should precede another buff; frequency, HP and attack growth are separate possible tuning controls, none silently changed here.

## Verification and assets

560 rules tests pass, including full-Construct queue swapping, diagonal bounds and seeded replay, old-save migration, Drone growth/save-load, one-in-four eggs, newborn timing and lethal final-turn ordering. All20main plus5diagnostic final-state replays match exactly. Full initial/final states, actions, source snapshots and run archives are retained.

Packaged Electron verification checks diagonal Skitter movement followed by the trailing Burrower moving the same Shield, Drone image/intent5→10, and death ordering. The enemy-free battlefield held for1001.9ms with Fast and reduced motion both enabled before rewards. Screenshots: `../screenshots/hive-drone`; report: `../hive-drone-ui-verification.json`.

New image: `assets/ideon-drone.png`, generated with the built-in image_gen service using the imagegen skill. Original retained. Exact final prompt, source path and SHA256 are in `../drone-art-provenance.json`; also registered in the art manifest. Underlying model identifier is not exposed.203required art assets pass content/provenance audit. Portable app and ZIP rebuilt.
