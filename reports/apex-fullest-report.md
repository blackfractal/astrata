# Fullest-line alternating Unmake — 4.0.19

Jonathan requested restoring fullest-line targeting while keeping H/V alternation, then retrying the same Apex fight opening.

Unmake H destroys the row with the most cards; Unmake V destroys the column with the most cards. H is first, then V, repeating each cycle. All cards including melded cards count. Ties choose topmost row / leftmost column. Card power, costs and remaining uses do not affect targeting. This restores the original count-based row rule and extends it to alternate columns. The six-move cycle, Purify behavior, warning commitments and saved in-flight plans are unchanged. Fangs still destroys one valuable Construct and World Eater two; HP500, damage and all other moves are unchanged.

All744 rules tests pass, including H/V/H, card count over value, melded cards, ties, empty boards, Recall retargeting, Continue and committed warnings. Design4.240 and S4draft0.14 updated. Existing UI branches show fullest-row/fullest-column intent and tie rules.

## Retry method

Exact same36/70HP opening from seed24102477:55cards,4Focus/4Channel/6Insight, boss500HP. Same equipment, inventory, RNG and card order as reports/apex-unmake-4.0.18/initial.json. The preceding three bounded-search configurations are repeated unchanged: comparable, offense/Titan priority, survival/draw priority. Both search helpers are byte-identical to the prior versions. No live save/profile is touched. This is search-assisted evaluation, not manually selected moves, optimality proof or a population win rate.

Frozen rules, initial state, turn checkpoints, full actions, independently verified replays and results are retained under reports/apex-fullest-4.0.19.

## Retries from36HP

All three candidates lost.

| Candidate | Death turn | Predator HP remaining | Destroyed cards | Actions |
|---|---:|---:|---:|---:|
| Comparable settings | 13 | 221 | 24 | 188 |
| Offense priority | 6 | 366 | 13 | 81 |
| Survival priority | 11 | 356 | 19 | 142 |

All411actions independently legal/replay-verified. With comparable settings, the original fullest-row-only version lostT13boss214; valuable H/V lostT11boss345; fullest H/V now losesT13boss221. This particular line is much closer to the old row-only result than the valuable-line version. The first144actions match the row-only line; the second Unmake at turn11 is vertical and destroys five cards in the leftmost column. The line loses to World Eater at turn13. These are controller-specific outcomes, not proof the opening is unwinnable or general difficulty measurements. The offense candidate dies before the first vertical move, so its result cannot assess alternation.

## Starting-health question

Jonathan then asked whether more initial HP would make the fight possible. Only HP is changed from36 to70 in isolated fixtures; maxHP70, deck, equipment, inventory, draws and RNG are untouched. Replaying the exact188decisions of the comparable36HP attempt at70HP is legal and survives its fatal World Eater hit with18HP. The Predator still has221HP and enemy jobs remain, so this is not a survival claim for the entire turn or fight. That prefix and state are preserved in same-line-70hp.json. A fresh full-health search and a continuation of that exact prefix are also being evaluated.

### Full-health results

The fresh70HP search lost on turn12 with316bossHP remaining (170actions). The controlled-prefix continuation survived to turn16, then died to Hollow Hunger with140bossHP remaining and26cards destroyed. Its complete246-action line (the188-action prefix plus58 continuation actions) was independently replayed from the70HP initial state; HP/mode/RNG/full battle/inventory/equipment matched the saved final state. Full evidence: full-health-combined.json; fresh attempt: full-health/trial.json. The first prefix-continuation progress batch starts with the pending turn13 reactions and also resolves turn14; subsequent batch labels and final turn16 are ordinary battle turns.

Starting full therefore materially extends this particular line:36HP start losesT13boss221,70HP with the same prefix reachesT16boss140. It does not establish a win. The fresh70HP search adapts its choices (including to healing at full HP) and fares worse than the controlled-prefix candidate; this demonstrates controller/line dependence, not that extra health is harmful. Low opening HP is part of the problem, but cannot be identified as the sole cause or used to prove the fight impossible. No additional balancing or live-save change performed.

## Delivery

Version4.0.19 runtime/portable ZIP refreshed; packaged H/V/H intent and fullest targeting verified. Full archive CRC, source/package/version and report matching checks are recorded in reports/apex-fullest-4.0.19/package-verification.json. No visual UI pass claimed. No commit/push or live-profile changes.


