# Apex Predator: manufactured strong endgame opening

2026-10-24. Rules/content 4.0.19; seed 20261024. Jonathan requested a reasonable semi-idealized opening and an attempt to beat the current Predator. No balance or live-save changes were made.

## Result

No victory found in five search-assisted lines from the same manufactured state. The closest lost on turn 11 with the Predator at **83/500 HP**, after 17 cards had been destroyed. This is evidence of substantial attrition pressure even with full health and strong equipment, not proof that this state is unwinnable or an estimate of human win rate.

| Line | Starting strategy | Result | Boss HP left | Destroyed cards | Verified decisions |
| --- | --- | --- | ---: | ---: | ---: |
| Balanced | Automated placement/activation search | Lost turn 11 | 131 | 17 | 193 |
| Offense | Higher Titan/attack emphasis | Lost turn 10 | 188 | 15 | 173 |
| Preservation | Higher HP/card preservation emphasis | Lost turn 11 | 180 | 17 | 197 |
| Guided opening | Manually chose five opening placements; delayed Titan, preserved Guide | Lost turn 11 | 87 | 16 | 187 |
| Recycling | Same guided opening; explicitly evaluated Undertow plus immediate re-placement | Lost turn 11 | 83 | 17 | 181 |

All **931 decisions** independently replayed from the original initial state with legal-action checks and matching final HP, mode, RNG, battle, equipment and inventory. Guided totals include the five manually selected placements. The two guided runners also verify their search suffix from the post-placement state; `analyze.mjs` verifies the combined full line.

## Manufactured build

- 70/70 HP, **6 Insight / 5 Focus / 5 Channel**, all derived from ordinary equipment. No direct resource bonuses or modified card stats.
- 40 cards, retaining all 12 starters. Damage options include two Plasma Balls, Solitude+, Mindfire, Prismatic Sap, Water Blast+, Corner Flame, Cinder Snap, Grove Titan and Eclipse Seed. Two Transmutes, two Wild Conduits, two Focus Energies, Tide Memory, Rain Lantern, Undertow and several Ward options support the engine. Lucid Guide+ and Machine Elves+ provide disruption answers.
- Three different legendaries: Grove Titan, Heartwood Bastion, Eclipse Seed. Six legal upgrades total: two Shields, Water Blast, Solitude, Guide and Elves.
- Gold Bracelet and Silver Bracelet, both with Storm Opals; Lantern Necklace with Storm Opal; two Rings of Patience with Amber Thoughts; Mothlight Crown; Armor of Remembrance. The bracelets provide 11 neutral Guard per round.
- Healing Sap, Channel Draught and Fury Sap.
- Unmodified seeded opening: Corner Flame, Lucid Guide, Eclipse Seed, Grove Titan, Cinder Snap, Shield. No hand or draw-order rearrangement.

This is a favorable hypothetical collection, not an inventory proven to have been acquired through a complete campaign. In particular, three legendaries and five resource gems represent a lucky, expensive run. Retaining the starters makes it less draw-efficient than a fully pruned ideal deck. The fixture assumes the Elves' legal Tools upgrade was purchased; it does not simulate its acquisition.

## Findings and limitations

The fight punished immediate investment in a valuable non-recallable Ally. Early automated lines played Titan on turn 1 and lost it to Fangs after only one attack. They also sacrificed Lucid Guide to preserve HP before the Guardian Ideon became a problem. Those are tactical weaknesses in the controller, not evidence that these cards are inherently poor.

I changed the opening to Corner Flame at slot 6, Shield at 5, Cinder Snap at 12, Eclipse Seed at 19 and Lucid Guide at 20 (zero-based slots). This gives the Shield a Fire source, holds Titan back, and puts the Guide forward. I also increased the search's value for keeping usable Guide/Elves alive and stopped pointless Guide movement activations. That improved the result from 131 to 87 boss HP remaining, although the opening itself is not claimed optimal.

The original greedy placement evaluation undervalued Undertow: returning a useful card to hand looks immediately worse unless its subsequent re-placement is considered. Adding that two-step evaluation resulted in four Undertow placements and a slightly closer result, 83 HP. It still lost. This is a search-helper improvement saved with the experiment, not a change to the game's built-in AI.

In the closest line, Mindfire supplied 96 boss damage, Plasma Balls 64, Titan 53, ordinary Blasts 47, Corner Flame 41 and Solitude 40. No single two-card combo carried the fight. The pressure came from sustaining damage and defense while losing useful cards. The turn-11 death was Brood of the Summit, not a simple empty-deck failure.

Other known search weaknesses remain: short-horizon placement and recalls, imperfect protection of future engines, and premature Healing Sap use for only 2 HP instead of its possible 5. These runs used bounded search (activation width 10/depth 10, defense width 5), not exhaustive solving or fully manual play. Multiple lines share large prefixes and are not independent samples.

My assessment: a strong 5-Focus/5-Channel start does not automatically solve this Predator. Attrition remains a credible concern, but these results do not justify declaring the fight impossible or changing its numbers without accounting for the controller's mistakes. The saved fixture is useful for comparing future tuning on identical inputs.

## Undertow cost clarification

Jonathan's recollection is correct: Cinder Snap has 3 Recall Focus and Corner Flame has 1. With Undertow's own 1-Focus cost:

| Operation | Cinder Snap | Corner Flame |
| --- | ---: | ---: |
| Undertow returns it to hand | 4 Focus | 2 Focus |
| Return and immediately re-place | 4 Focus | 3 Focus |

The return alone differs by **2**; the complete cycle differs by **1**, because Snap costs 0 to place and Corner Flame costs 1. This reinforces Corner Flame's appeal for repeated early-game recycling.

## Reproducible evidence

- `apex-semi-ideal-4.0.19/manifest.json`: complete deck, equipment, upgrades and caveats.
- `before-battle.json`, `initial.json`: isolated manufactured states.
- `setup.mjs`: constructs the fixture through game APIs.
- `balanced`, `offense`, `preservation`, `guided`, `recycling-run`: trial actions, final states, summaries and analysis.
- `guided-prefix.json`, `guided-opening.json`: manual placements and resulting state.
- `revised/rules`: frozen 4.0.19 rules; each trial has a rules hash manifest.
- `revised`, `guided`, `recycling`: corresponding search/placement helpers.
- `analyze.mjs`: full legal replay verification and damage/recall/consumable analysis for all five trials.

No UI viewing test, campaign-acquisition proof, game rebalance, package rebuild, live-save edit, commit or push was performed for this experiment.
