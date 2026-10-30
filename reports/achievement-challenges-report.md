# Achievement descriptions and challenges — 4.0.42

Jonathan requested descriptions and seven achievements, including clarifications supplied during implementation. Changes remain on main for his commit/push.

## Delivered behavior

Ordinary achievements explain their requirements. Exactly four show `??????????????????`: Calm the Apex Predator, I Stand Alone, Calm Astrata and A Little Kindness. Their descriptions remain concealed after completion. Retired achievements remain hidden without deleting old earned records.

| Achievement | Requirement |
| --- | --- |
| Blast Miser | Complete S1–S4 without placing starter Blast. Upgraded/Transmuted copies count; Water Blast does not. |
| Shield Miser | Complete S1–S4 without placing starter Shield, including upgraded/Transmuted copies. |
| On a Strict Diet | Complete S1–S4 without using consumables, including direct drinking from pickups and defensive use. |
| Masochist | Complete S1–S4 without entering a spawned map Tavern. Between-Strata Taverns are allowed; the Apex-floor Tavern is not. |
| Sedentary Lifestyle | Complete S1–S4 with at most 19 chosen map steps. Diagonals count one; waiting and automatic transitions count zero. A chosen step onto stairs still counts. |
| Elemental Purity | Finish S4 with a nonempty Grimoire containing Arcane plus at most one other printed element. All-Arcane or any single-element deck qualifies. Earlier composition and temporary transformations do not affect the final test. |
| Pop Goes the Weasel | Take any full-health Archon to zero in one direct damage hit and survive the encounter. Separate hits and status damage cannot be combined; surviving Final Note is required. |

The first five use explicit fresh-run tracking, carried through saves, result records and ordinary battle restart checkpoints. Owned but unplayed cards and unused supplies are permitted. Free Inspiration placement counts. Liquid Crystal preparation and Tools are material uses, not consumable use. Visiting a spawned Tavern counts even without using a service. No incomplete legacy summary is assumed to prove zero uses, placements, movement or visits. Elemental Purity can be backfilled from a complete final deck. Pop Goes the Weasel records the actual source, maximum HP and damage and commits evidence on encounter victory; losing a later encounter does not revoke an earned achievement.

## Validation

- Full automated test suite passed: **824 tests**. Added coverage for independent awards, losses/tutorials/early victories, legacy unknowns, upgraded/recolored cards, free placement, direct pickup drinking, exact saves/restarts, Tavern exceptions, 19/20-step boundary, ascent/waiting, printed-element mixtures and one-hit damage versus multi-hit/Guard/wounded/status cases.
- A constructed board verifies a possible Pop Goes the Weasel attack: Resonant Grove plus 24 Earth cards in a complete 5×5 square has102damage. Adjacent Transmute makes the Grove Fire; Fury Sap doubles it; elemental advantage yields306damage against full-health276HP Black Bile. The final actions are legal. This is a damage/setup proof, not a full campaign or evidence that assembling/protecting such a formation is easy. Fury Sap is available from S2, so the example deliberately uses an S2 Archon.
- Packaged renderer checked in isolated Edge using `tools/archives-ui-smoke.mjs --packaged`: descriptions, exact four secret placeholders, new entries, navigation and collection behavior. No user save/profile changes. Existing test-run artifacts remain under ignored `.tmp/`.

Rules/content/package4.0.42, design4.262. Combat balance unchanged. Approximate additional implementation, clarification, testing, documentation and packaging time:40minutes. No commit/push.
