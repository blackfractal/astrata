# Rending Fangs double attack and same-build retry

2026-10-24. Game4.0.22; design4.242; S4draft0.15.

## Result

**A legal winning line exists for the unchanged manufactured build under the new Fangs rule: victory on player turn11 at1HP, with13cards Destroyed.** The full180-action line was replayed from the original initial state, checking every action against current legal choices and matching final HP, mode, RNG, battle, inventory and equipment.

This was search-assisted play with a manually chosen Titan opening and manually solved final turn, not an autonomous AI win. The search continuation from that same turn11 position lost with27bossHP. Finding the finish demonstrates why the earlier unsuccessful searches were not proofs of impossibility.

## Approved change

Rending Fangs changes from28Fire plus destruction of the most valuable Construct to **16Fire followed by16Fire, with no Construct destruction**. It still applies pending Corruptions and commands surviving owned Ideons. Each hit independently gains3per completed cycle and4at or below250HP: second-cycle Fangs at halfHP is23+23.

Predator500HP, Unmake's entire fullest row/column, World Eater's two valuable Constructs, other attacks, Corruptions, summons and scaling remain unchanged. Updated the enemy description and both design documents. Existing saved battle HP is not overwritten; future intents use the current definition.

## Identical carry-in fixture

Reused `apex-semi-ideal-4.0.19/initial.json` exactly: seed20261024,70/70HP,40cards,6Insight/5Focus/5Channel, Gold+SilverBracelets, five resource gems, six card upgrades, three different legendaries and three consumables. No added HP/cards/equipment, no draw rearrangement and no new RNG seed. The original manufactured acquisition caveat still applies: a favorable hypothetical build, not a completed campaign proving its economy.

The comparison baseline is4.0.21, so **both baseline and revised runs allow unlimited consumables**. Their frozen rule folders differ only in `apex-content.mjs` (Fangs definition/description) and `content.mjs` (version). The old4.0.19 loss is not used as the sole causal comparison.

## Attempts

| Rules / approach | Outcome | Boss HP remaining | Destroyed | Decisions |
| --- | --- | ---: | ---: | ---: |
| Old Fangs, prior guided opening | Lost turn11 | 83 | 17 | 180 |
| New Fangs, same guided opening/helper | Lost turn9 | 189 | 12 | 151 |
| New Fangs, automated fresh opening | Lost turn9 | 169 | 9 | 146 |
| New Fangs, manually chosen forward Titan opening | Search continuation lost turn11 | 27 | 14 | 192 |
| New Fangs, proactive row/column spreading heuristic | Lost turn11 | 186 | 9 | 179 |
| New Fangs, Titan line with manually solved finish | **Won turn11,1HP** | **0** | **13** | **180** |

All1028recorded decisions across these lines independently replay-verified. These are overlapping attempts with shared prefixes, not independent samples or a win-rate estimate. The same-opening automated comparison was worse despite lower destruction; different tactical choices after states diverged matter. The eventual win therefore does not measure the isolated numerical benefit of the Fangs change.

## Winning decisions

The new opening placed Titan at row3/column7, Guide at row3/column6, Corner Flame at row1/column7 and Cinder Snap at row1/column6. It deliberately accepted13player damage on the first enemy turn. Titan survived Fangs and contributed94boss damage before later destruction. By the end of the first cycle the player had34HP and the boss262HP.

At the start of player turn11: **player1HP, Predator62HP,7Focus,5Channel, no living Ideons**. The winning finish was:

1. Play Undertow underneath the spent Solitude+ at row5/column3:2Focus, returning Solitude to hand.
2. Re-place Solitude+ isolated at row6/column1:1Focus.
3. Advance to Activation.
4. Activate Transmute at row4/column7 on adjacent Mindfire at row5/column7, choosingLight:1Channel.
5. Activate Mindfire, spending3Focus: `(6 + 3×8) × 1.5 = 45` Light damage againstChaos,0Channel. Boss62→17.
6. Activate Solitude+:13Light becomes20damage,1Channel, finishing the remaining17HP before another enemy turn.

No potion remained to manufacture this finish. One Focus and three Channel remained unused after victory. The decisive resource was saving Focus for Mindfire rather than filling more spaces. This is a four-card finish involving Undertow, Solitude, Transmute and Mindfire, built on the damage dealt throughout the fight.

## Assessment

The new Fangs creates a useful early investment window: Titan can contribute across multiple turns instead of being immediately removed by Fangs. The fight remains severe. In the winning prefix, the first Unmake destroyed5cards and the second destroyed5more; World Eater destroyed2. The spread heuristic limited those losses to3each but gave up too much damage and still lost, so indiscriminate spreading is not a solution either.

Keep the approved change for playtesting. This demonstrates a win from a strong, full-health setup, not comfortable difficulty, robust balance or reliable wins from ordinary carry-in builds. No additional boss or card tuning was applied.

## Verification and artifacts

750rules tests pass, including two-hit resolution, Nausea application without card destruction and independent per-hit escalation. Existing destruction-target commitment coverage now exercises World Eater. Packaged engine verifies16+16, no destruction flag, and23+23in cycle2at250HP.

Evidence directory: `apex-double-fangs-4.0.22/`.

- `initial.json`, `build-manifest.json`: unchanged carry-in state and original provenance.
- `baseline/rules`, `revised/rules`, `spread/rules`: frozen rules and strategy helpers; per-trial rule hashes.
- `run.mjs`: reproducible searches and full replay checks; trial folders retain actions, progress and final states.
- `turn11.json`, `turn11-prefix.json`, `manual-finish.mjs`: exact decision point and manually chosen finish.
- `winning-line.json`, `winning-summary.json`: complete verified victory, preserving the final internal bossHP of-3from overkill; displayed remainingHP is0.

Runtime/portable ZIP refreshed to4.0.22. Live player save untouched. No native UI playthrough, campaign-acquisition proof, commit or push claimed.
