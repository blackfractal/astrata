# The Apex AI evaluation — 4.0.0

Ten completed trials: five full Apex carry-ins, then five isolated Predator fights. `weighted-druid-v3` makes every decision through the shared observation/legal-action API. No learned training was performed. Sources, initial states, every action and final states are retained under `reports/apex-evaluation-final`. Reproduce with `node tools/apex-evaluate.mjs reports/apex-evaluation-final`.

The authored `apex-developed-foundation-v1` fixture starts with 70 HP, 240 Gold, 25 cards, 3 Focus/4 Channel, elemental Gold/Silver bracelets, resource rings, Stone Armor and Sturdy Metal Helmet. Ward, Grove Titan, Solitude, Water spell, Machine Elves and Lucid Guide are upgraded. This is a developed sample deck, **not a naturally earned S1-through-S4 run**. Direct Predator trials use the same build without rewards from climbing.

| Trial | Seed | Result | Floor reached | Decisions | Death |
| --- | ---: | --- | ---: | ---: | --- |
| ascent | 84001 | loss | 1 | 178 | burn |
| ascent | 84002 | loss | 3 | 869 | Drone |
| ascent | 84003 | loss | 3 | 757 | Drone |
| ascent | 84004 | loss | 1 | 311 | Collapse |
| ascent | 84005 | loss | 2 | 365 | poison |
| predator | 84001 | loss | 4 | 81 | World Eater |
| predator | 84002 | loss | 4 | 95 | Riven Earth |
| predator | 84003 | loss | 4 | 86 | Glass Skitter |
| predator | 84004 | loss | 4 | 78 | World Eater |
| predator | 84005 | loss | 4 | 78 | World Eater |

No exceptions, nonterminal stalls or illegal-action failures. All ten trials lost. Two ascent trials reached floor 3; none reached the Predator. Direct Predator trials establish that the new moves execute under AI play; they do not establish a fair win rate. The policy still makes weak Ideon, formation and deck-management decisions and prefers low-HP rematches, which can misleadingly favor Mind Hive. Do not interpret this small, fixed-deck sample as proof the content is impossible—or as proof that it is balanced.

No balance weakening was applied solely to make the AI win. Human playtesting and stronger search are the next tuning step, particularly paired S3 Archons, recovery across floors and the Predator's destruction/Guardian pressure. Scripted victory/transition tests separately verify the win-screen path; these are not counted as earned AI victories.

The initial pre-Rift-Boar evaluation is preserved separately in `reports/apex-evaluation`. Adding the new enemy changes seeded pool draws; the table above is the final pool evaluation.
