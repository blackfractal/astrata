# Alternating valuable-line Unmake — 4.0.18

Jonathan requested alternating destruction of the most valuable row and column between Apex Predator cycles, then a retry from the same archived fight opening.

## Rules

Unmake H is the first cycle: destroy the most valuable row. Unmake V is the second: destroy the most valuable column. Repeat H/V thereafter. Use the existing Construct valuation, summed across each line: damage/defense potential, printed Focus, remaining activation allowance, then topmost/leftmost for ties. This replaces the previous fullest-row rule. Entire Constructs and their attachments are destroyed. The live warning and intent identify the axis and rule; warnings commit at End Turn. Purify does not advance the cycle. Legacy in-flight saved plans retain their committed axis and spaces.

Fangs still destroys one Construct, World Eater two. HP500, damage26Arcane for Unmake, damage scaling, Corruptions and Ideons are unchanged. No live save/profile was edited.

## Validation

All744 rules tests pass. New coverage includes H/V/H cycles, value over count, full-line warnings and whole-Construct destruction, deterministic ties/empty grids, Recall retargeting, Continue, Purify, own-Corruption resolution and pre-update queued row warnings. Existing Hart/Colossus/Choir targeting tests remain unchanged and passing. Intent and tooltip wording now distinguish valuable lines from fullest lines; the generic valuable-Construct tooltip no longer incorrectly says every such move destroys two.

## Retry method

Same seed24102477 Apex opening as the preceding comparison:36/70HP,55cards,4Focus/4Channel/6Insight, boss500HP. Source snapshots/apex-fangs-4.0.17/initial.json, originally snapshots/codex-growth-manual-24102477/battle-466.json. The first retry uses the same placement/activation/defense search and weights as the preceding Fangs comparison. Two additional candidates prioritize Titan offense or survival/draw. These are bounded-search retries, not manually chosen actions, a global win rate or proof of optimal play. Source snapshots, exact initial state, actions, summaries and replay checks are preserved in reports/apex-unmake-4.0.18.

## Results

| Candidate | Result | Turn | Boss HP remaining | Destroyed cards | Actions |
|---|---|---:|---:|---:|---:|
| Comparable settings | Loss | 11 | 345 | 12 | 166 |
| Offense / Titan priority | Loss | 10 | 370 | 13 | 145 |
| Survival / draw priority | Loss | 10 | 398 | 16 | 130 |

All 441 actions independently legal/replay-verified, with final HP/mode/RNG/full battle/inventory/equipment matching. None found a winning line. These attempts used the exact archived36HP opening; no healing, new equipment, changed draws or extra cards were supplied.

The prior row-only Fangs-one attempt with comparable settings lost on turn13 with214bossHP. The new comparable attempt loses on turn11 with345bossHP. The combined alternation/value-targeting change is harder for this controller in this position, not easier. It is not possible to isolate the effect of alternating axes from the simultaneous switch from card count to card value. The controller uses a greedy placement heuristic and bounded activation/defense search; it does not establish whether a sufficiently well-planned human line can win.

The first Unmake H in the comparable retry removes a Blast and Lucid Guide, despite a small number of threatened cards. Value-based destruction can remove an important part of the engine without destroying many cards. The second Unmake is correctly vertical on turn10. The defense-focused and offense-focused candidates die to Unmake V; the comparable candidate survives it and dies to Brood of the Summit on turn11. Exact end-turn plans are retained per candidate. Fewer total destroyed cards than the earlier loss therefore does not imply an easier fight.

Keep the requested behavior with no additional unauthorized balance changes. No winning line found from this opening; no impossibility or general-balance claim.

## Delivery

4.0.18 runtime and portable ZIP refreshed. Packaged H/V/H intent, valuable targeting and version verified. Archive/source/CRC checks recorded in reports/apex-unmake-4.0.18/package-verification.json. No visual UI pass claimed. No live save/profile edits, commit or push.

