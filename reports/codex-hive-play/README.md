# Codex manually driven Mind Hive victory

2026-10-14, rules/content 3.0.8. Jonathan asked whether Codex could beat the updated fight by choosing decisions itself.

Historical result: 3.0.9 subsequently closes non-recallable-card recycling. This line is not a verified victory under that changed rule. The verifier uses the preserved 3.0.8 source snapshot.

**Victory after all 15 rounds, 70/70 HP, zero damage taken.** One attempt, no rewinds. Codex selected all 190 actions directly from the engine's legal actions. No WeightedPolicy, tactical search, rule edits, deck edits, HP edits, or RNG edits. The complete action replay reproduces the final observation exactly.

This is the existing authored **balanced strong-deck fixture, seed 73001**, not Jonathan's campaign save or a random 30-card deck. It starts with 25 unupgraded cards, 70 HP, 3 Focus and 4 Channel, with Gold/Sapphire and Silver/Ruby bracelets, resource rings, Stone Armor and Sturdy Metal Helmet. The unchanged built-in AI died on round 11 from the identical initial state. Jonathan's live save was untouched. Play was headless through legal engine actions, not a watched UI run. Choices used the visible current board/hand plus known rules; the hidden draw order was not inspected to choose moves.

## What made the line work

- Place Grove Titan immediately and surround it with support cards. Save its three attacks for Drones: Wind Titan killed the Water Drone on turn 6; Light Titan killed the Chaos Drone on turn 8; Lucid Guide's mark made its third attack lethal against the Light Drone on turn 10.
- After spending those attacks, Transmute Titan to Fire and use its accumulated HP to absorb the surviving Earth Drone's escalating attacks. Spent attack allowance does not prevent Ally defense.
- Cover eggs with inexpensive cards that can be profitably recycled. Repeated egg-driven recycling let two Focus Energy copies produce five permanent boosts overall. Permanent Focus reached +5. This is an important engine-strength interaction to consider in balance discussions.
- Bank Ward during quieter turns. Magnifier and Living Lattice strengthened one Ward; Transmute later changed that host to Water. Stored Guard remained useful after all its activations were spent.
- Kill selected insects that would reach the player, rather than trying to clear every insect. Choose equipment defenses using their elemental matchups. Repair three eggs, including one Wind Drone egg; late Drones only had one or two attacks remaining and could be defended instead of killed.
- Use the final turn's attacks to remove a Water Burrower before it exited, then survive the remaining Drone shots and hatches. Victory occurred only after those effects resolved.

This is a counterexample to interpreting the AI's 0/20 result as unwinnability. It also demonstrates that this strong deck can still completely prevent damage under the new rules. It does not establish that every seed/deck is easy, or that this line is optimal. No further balance changes were made.

## Evidence

- `attempt.json`: initial/current state, all selected actions, and a checkpoint before each action.
- `winning-line.json`: portable initial state, ordered legal action keys and final state.
- `verification.json`: exact replay check, per-round HP/resources, original AI result, source hash.
- `sources.json`: source snapshot for reproducing the rules used.
- `../../tools/codex-hive-play.mjs`: explicit-action driver; never accesses the live player profile.
- `../../tools/verify-codex-hive-play.mjs`: rerun verification with `node tools/verify-codex-hive-play.mjs`.

Several action selectors were rejected when an insect had moved a card, a selector needed an additional field, or victory had already occurred. Rejected selectors do not execute or advance RNG. No game decisions were rolled back.
