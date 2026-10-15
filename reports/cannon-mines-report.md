# Refraction Cannon charging mines — 3.0.26

Jonathan requested two Mind Mines on the charging action, followed by another manual test with the same strong carry-in deck.

## Rules delivered

- Actions 4, 9, 14… retain the normal shot/attack and announce Final Blast, additionally laying up to two mines on distinct empty legal spaces. No overwriting cards, Ideons or Corruptions. A full board can prevent placement.
- One complete player turn to cover or defuse. The two mines resolve before the following Final Blast on 5, 10, 15…; uncovered mines each deal 20 Fire from their own space, while covered mines destroy the entire cover before it can defend against the blast.
- Existing mine explosion/traversal animations and Elves repair apply. Intent explicitly says “Mind Mines detonate, then Final Blast.” Other owners' Corruptions keep their existing timing. Final Blast remains exactly 30, with the previously announced element and no bullet commands/launch on that action.
- Mines are selected before the charging turn's bullet movement. A moving bullet can subsequently cover a mine; repair from adjacent Elves remains possible. This happened in the manual test and was handled legally.

## Manual playtest

Same 25-card developed-foundation fixture and equipment as the previous Cannon/Hive tests, seed 73001, 70 HP, opening 3 Focus / 4 Channel. Codex chose the legal actions manually through the headless engine. First 43 opening actions match the previous test; decisions after the first mines are fresh. No search, rewinds, healing, save changes or state edits during the attempt.

**Victory on turn 15 at 68/70 HP, 177 actions.** Full replay independently verified against current rules. Previous version: turn 16 at 70/70, 191 actions. Mine selection consumes seeded randomness, so later draws/projectile targets/elements diverge; this is not a controlled win-rate comparison.

- Turn 5: Elves defused one mine. Rain Lantern covered the other, granted its Focus benefit, then was destroyed. An 11-Ward defense and Titan absorbed the Water Final Blast.
- Turn 10: Elves defused one mine. Clear Mind was activated then sacrificed over the other. Two Wards absorbed 16 of the Light Final Blast; Titan absorbed the remaining 14.
- Turn 15: killed the Cannon during activation before its third pair of mines and Water Final Blast could resolve.
- Both resolved mine pairs caused zero player damage, at the cost of two Elves activations and two permanently destroyed utility cards. Three pairs were laid overall.
- The only 2 HP loss was an avoidable defense-order mistake on the ordinary turn-12 Arcane attack: I selected equipment first, moving the attack past the grid. A separate checkpoint diagnostic verified Ward-then-bracelet avoids this loss. That correction was NOT substituted into the recorded attempt.
- Boss damage came from multiple cards: Solitude 75, Plasma Ball 72, Titan 63, Storm Canopy 14, Cinder Snap 12, Blasts 10, Lucid Needle 8, Scouring Gale 6 (last hit clamped).
- Titan ended at 24 HP despite absorbing both Final Blasts, supported by passive adjacent-card growth. It dealt its 63 damage early, then acted as a replenishing defensive reserve. Only the first opening was reused; I did not need to repeatedly Transmute Titan for the new Final Blasts.

## Assessment

The mines add useful decisions and consume cards/actions, particularly when a bullet field blocks the convenient answer. They do not make this strong build difficult by themselves. The deck has enough zero-cost utility covers, Elves repairs, Wards, equipment and Titan HP to absorb the pressure. Spending one use of an already useful utility card before sacrificing it is especially efficient. The minor HP loss is not evidence of unavoidable boss damage.

This is one authored strong deck and one seed, not an estimate of ordinary-player win rate. No further buffs or card nerfs were applied.

## Verification and artifacts

618 rules tests pass, including uncovered 20+20+30 ordering, cover destruction before defense selection, occupied-board safety and defused-mine Continue persistence. Packaged UI tested charge turns 4 and 9, two visible mines, explicit Final Blast intent, one-turn response and actual uncovered 70-damage resolution; no browser errors. Screenshot inspected. The UI fixture uses 1000 HP solely to survive test attacks and is separate from the unmodified 70-HP playtest.

Initial UI assertion mistakenly read the battle-start autosave instead of current HP; corrected to assert the visible HP counter. No product fix was needed.

- `reports/codex-cannon-3.0.26/attempt.json`: initial state, every selected action, checkpoint and final state.
- `sources.json`: frozen source snapshot; `verification.json`: results and deterministic replay validation; `winning-line.json`: portable full line.
- `defense-correction.json`: isolated alternative proving the 2-HP mistake avoidable.
- `reports/cannon-mines-tests.txt`, `reports/cannon-mines-ui.json` and UI screenshots.
- `tools/codex-cannon-mines-play.mjs`, `tools/verify-codex-cannon-mines.mjs`, `tools/cannon-mines-ui-test.mjs` reproduce the workflow.

Main design v4.209, S3 draft 0.44. Portable executable and ZIP rebuilt. Live save untouched. No commit/push.
