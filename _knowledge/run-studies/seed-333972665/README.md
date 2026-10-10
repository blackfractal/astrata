# Three Ashlings: a verified escape

Run `fc887d68-0fcc-469b-93d1-98a7781ebd4d`, seed **333972665**, package 2.1.13, rules/content 2.1.10. Jonathan entered against three Fire Ashlings (18 HP each, Restless 1) with 54 HP and died during the transition to turn 6.

**Beatable from the exact entry: victory on turn 6 with 10 HP.** The first 115 actions, including the whole first battle turn, remain unchanged. A fresh-seed replay verifies every action against the legal-action list and exactly matches the archived battle entry, including RNG, equipment, deck, and battle state. All ten archived gameplay source files match the frozen research copy after newline normalization. No live profile or gameplay files were changed.

## Turning point

Turn 2: instead of Sapling, place another Blast directly beside the existing Blast (row 3, column 3; existing Blast is column 4). Activate both against wounded Ashling 1. Their adjacency bonus gives each 5 Arcane damage; the first attack also gets 1 damage from the Earth-attuned Ring against Fire. The wounded enemy has 9 HP, so 11 total kills it before its next Burn application.

Jonathan's Sapling attack dealt 3, then the isolated Blast dealt 4: 7 total, leaving that Ashling at 2 HP. All three survived to apply Burn again on turn 3. The first finally died during turn 4's enemy phase.

## Winning continuation

| Turn | Main choices |
| --- | --- |
| 1 | Keep Jonathan's Glass Moth, Clear Mind and Blast placements; activate Moth and Blast. |
| 2 | Adjacent second Blast; both Blasts kill Ashling 1. Drink carried Healing Sap; intercept with Moth, Armor and Bracelet. |
| 3 | Place Wild Conduit. Activate Clear Mind and the remaining Blast use against Ashling 2. |
| 4 | Place Rain Lantern and Focus Energy. Activate Conduit, Focus Energy, Clear Mind, Rain Lantern to fund the next turn's placements and draw. |
| 5 | Place Blast adjacent to Rain Lantern, plus Sapling, Familiar and Ignis Spark. Conduit provides an extra net Channel; Water Blast and Ignis kill Ashling 2, Sapling damages Ashling 3. |
| 6 | Add the final Blast, connected through the first Water-attunable Blast. Activate the nearer Blast as Water, then relay Water to the second Blast. Kill Ashling 3 before another enemy phase. |

The successful line also recalls spent Conduit on turn 6; that recall is not the source of lethal damage. Exact placements and defenses are retained in the replay.

Healing Sap contributes 5 HP of margin. Independently replaying the same line while skipping only `consume` also wins, at **5 HP**. It was helpful, not required.

This is a searched existence proof, not an optimal line or a claim that the rest of the run is won. Future draws can differ legitimately after different plays/discards even with the same starting seed. No earlier reward, equipment or route changes were necessary.

## Evidence

`headless-replay.zip` contains frozen source, original event states, winning segments, full winning line, and `verify.mjs`. Extract it and run `node verify.mjs` (verified with Node 24). `verification.json` records source hashes and outcome. Research/search scripts remain under ignored `_research/last-ashlings/`.
