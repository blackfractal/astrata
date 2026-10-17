# S3 ordinary encounter roles — 4.0.6

2026-10-17. Jonathan approved selective opening Ideons/Corruptions for some enemies and higher HP/damage for others. The purpose is to test quick formation decisions in some encounters and quick engine development in others. S1/S2, tutorials, S3 Archons and the Apex Predator are unchanged. S4 returning ordinary enemies inherit these definitions plus existing rematch scaling.

## Immediate formation pressure

| Enemy | New opening |
|---|---|
| Nerve Weaver | One Nerve Shuttle |
| Pale Grazer | One Glass Leech |
| Hollow Drifter | One Hollow Sentinel protecting its owner |
| The Knotkeeper | Two Clinging Thoughts restricting adjacent Recall |
| Echo Polyp | Two active Nausea spaces |

Ideons occupy seeded empty, non-Hole spaces in columns 4–5, with column 1 nearest the player. Opening Rites and other Ideons are never overwritten. No legal space means no spawn. Passive effects work immediately. Opening Ideons cannot receive a command before the first player turn, even during an ambush. Existing move lists still summon additional Ideons. Echo Polyp's subsequent Nausea waves retain normal telegraphs. Corrected old counter text that implied covering Nausea/Anger neutralizes them.

## Engine-development pressure

Values below are actual fresh S3 values, including the previously existing 1.2 pressure multiplier. Later-cycle/restless increases continue normally. No new preplaced hazards were added to this group.

| Enemy | HP before → after | Direct first-cycle damage before → after |
|---|---|---|
| Glass Brood | 58 → 72 | Wind 11 → 14; Earth 14 → 18 |
| Blind Seer | 65 → 82 | Light 13 → 17; Chaos 11 → 14 |
| The Kindly Hunger | 150 → 180 | Water 16 → 19; Wind 19 → 24; Water 14 + Earth 14 → 17 + 17; Chaos 18 → 22 |
| Borrowed Oracle | 144 → 173 | Light 14 → 18; Chaos 18 → 22; Wind 14 + Fire 17 → 17 + 19 |

Continue preserves current HP, cards, Corruptions and Ideons. It never injects an opening setup into an ongoing battle. As with other content updates, future moves use the current definitions. Fresh battles use new HP. New starting spawns consume seeded randomness, so older-version choices are not guaranteed to reproduce identical draws across the rules change.

## Controlled encounter diagnostic

`tools/depths-encounter-roles-evaluate.mjs` compares the previous numerical/opening definitions with the new ones using seed 73001, the same declared developed S1/S2 fixture, 70 HP, 3 starting Focus, 4 Channel, elemental Gold/Silver Bracelets, resource Rings, Stone Armor and Crown. This is the built-in weighted policy, not Codex decision-making and not a naturally earned campaign. It includes Lucid Guide and other S3 tools. New opening RNG can change subsequent draws, so this is a seed-matched encounter comparison, not an isolated damage experiment.

| Enemy | Before: result / final HP / turns | After: result / final HP / turns |
|---|---|---|
| Glass Brood | Win / 70 / 3 | Win / 70 / 3 |
| Nerve Weaver | Win / 70 / 4 | Win / 68 / 5 |
| Pale Grazer | Win / 70 / 4 | Win / 67 / 5 |
| Echo Polyp | Win / 70 / 3 | Win / 70 / 4 |
| Blind Seer | Win / 69 / 3 | Win / 65 / 3 |
| Hollow Drifter | Win / 70 / 5 | Win / 67 / 9 |
| The Kindly Hunger | Win / 48 / 8 | Loss / 0 / 10 |
| The Knotkeeper | Win / 41 / 13 | Loss / 0 / 18 |
| Borrowed Oracle | Win / 48 / 10 | Win / 4 / 12 |

The ordinary Motes remain manageable for this developed build; opening threats generally buy another turn or more. Eidolons show a much larger attrition increase, so they are the priority for human follow-up. This does not prove the two lost encounters are unwinnable, or establish a win rate. Do not make another blanket increase from this single automated sample. No card/equipment nerfs were included. All 18 action sequences replayed exactly; initial/final states, decisions, definitions and source snapshot are retained in `reports/depths-encounter-roles-evaluation/`.

## Verification

670 rules tests pass, including 10 new regressions covering either initiator, ambush grace, combined openings, legal occupied-space handling, seeded repeatability, active opening versus subsequent telegraphs, current HP/damage, Continue and tutorial/Archon exclusions. Packaged UI and asset audit results are recorded alongside this report. No live player save, commit or push was changed.

Asset audit: 215 required assets, 224 selected versions, no missing files/provenance. Three isolated packaged UI checks pass: visible opening Sentinel and owner protection, two active Nauseas with correct first intent, and stronger Glass Brood HP. No renderer errors; screenshots inspected. Runtime and portable ZIP refreshed.
