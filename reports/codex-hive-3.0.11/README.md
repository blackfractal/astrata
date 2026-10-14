# Mind Hive: Codex-directed fight, rules 3.0.11

Won on turn 15 at **16/70 HP**, losing **54 HP**, without healing or rewinding. All 279 decisions replay legally under the saved source snapshot and reproduce the final state exactly. Run `node tools/verify-codex-hive-current.mjs` to verify.

## Test conditions

- Seed 73001, authored `stratum3-developed-foundation-v1` sample build from `tools/depths-fixture.mjs`; this is not a claimed natural run or Jonathan's current save.
- 25 unupgraded cards, including Grove Titan, Transmute, two Focus Energies, Ward/Magnifier/Lattice, Lucid Guide, Lucid Needle and Scouring Gale.
- Initial 3 Focus / 4 Channel. Gold bracelet with Sapphire, Silver bracelet with Ruby, resource rings/gems, Stone Armor and Sturdy Metal Helmet. No healing or consumables used.
- Eight opening Larvae. This tests the base opening, **not** extra Larvae from leaving the Hive on the overworld.
- Codex selected legal actions; an explicitly instructed helper handled selected sequences of one-damage hits by preserving defenses for larger visible attacks. No built-in policy, search, or state edits during the attempt. The live game save was untouched.

## Damage and decisions

| Turn | HP lost | HP remaining |
| --- | ---: | ---: |
| 1–6 | 0 | 70 |
| 7 | 5 | 65 |
| 8–12 | 0 | 65 |
| 13 | 5 | 60 |
| 14 | 30 | 30 |
| 15 | 14 | 16 |

The first five lost HP were an avoidable defense-order mistake: Water bracelet was used against a Wind Drone while an Earth Shield was available. This is not evidence of unavoidable damage. Other placements and target priorities could also improve on this attempt; 54 is **not** a minimum-damage result.

The successful line built Focus and draw early, killed dangerous Larvae selectively, accumulated elemental Ward, and covered eggs with expendable cards. Non-recallable Focus Energy and Grove Titan could not be recycled through eggs: the permanent Focus increase stayed at +2. Later, insect swaps moved Scouring Gale out of its planned attack row and broke Solitude's isolation, delaying a Drone kill. Eggs consumed useful positions and cards while surviving Drones increased their damage.

On the final turn, small hits competed with 5 Arcane, 15 Fire and 25 Earth Drone attacks. Reserving Water equipment for Fire and Fire defenses for Earth mattered. Machine Elves intercepted the Earth hit before the Wards and bracelet; the next Burrower occupied their vacated egg space, preventing an uncovered hatch. The Hive then died after its final commands and hatches, awarding the card reward.

## Balance assessment

This is substantially closer to the intended difficult survival fight than the previous no-damage result. A strong build can win, but this attempt lost most of its starting life and had to spend its remaining defenses carefully. Pressure is heavily concentrated in the last three turns, particularly turn 14.

One sample does not establish that optimal play must lose HP, or that weaker/aged encounters are fair. Recommend human playtesting and comparisons across builds before increasing difficulty again. An exceptional no-damage line need not be eliminated if ordinary strong play remains demanding. The added overworld Larvae will make delayed encounters harder than this test.

## Evidence

- `attempt.json`: initial/final state, action records and checkpoints (recorded for audit, not used for rewinding).
- `sources.json`: frozen source modules, so future balance changes do not invalidate this historical proof.
- `winning-line.json`: compact action-key replay with initial/final states.
- `verification.json`: verified outcome, damage by turn and source hash.
