# Cannon alternating attacks and escalating Final Blast — 3.0.27

Jonathan approved stronger ordinary attacks, then clarified the final numbers as 20 or 10+10 and a Final Blast starting at 40.

## Delivered behavior

- Ordinary attack actions alternate a single 20-damage hit and two sequential 10-damage hits of different elements. Start with the single hit. Purify and Final Blast do not consume this alternation.
- First element follows the existing field/launch selection. For dual attacks, the second element counters the first; Arcane has no counter, so its second element rotates deterministically through the six non-Arcane elements across dual-hit actions. Both elements and their order are visible in intent and recorded in the combat log. Inspection does not consume RNG.
- Final Blast: 40 on action5, 50 on10, 60 on15, then +10 every five Cannon actions. Both the charge warning and pending Final Blast intent show the correct damage. The existing saved action counter carries escalation through Continue, including older pending blasts.
- Ordinary hits stay fixed at 20 total: no additional cycle, half-HP or Restless scaling. Final Blast has only its explicit +10 progression. HP remains260. Mine damage20Fire, projectile arrival12Pierce, charging mines, bullet fields/movement and blast-turn pauses remain unchanged.

## Verification

622 rules tests pass. Tests check exact per-hit damage/elements and execution order across16turns, escalation through70, no inspection rerolls, Continue preservation, Purify/ordinary alternation, lack of generic damage bonuses, mine-before-blast ordering and full-grid defense eligibility.

Three isolated packaged-game UI cases verify charging40/50/60, displayed single/mixed ordinary intents, two visible mines, and actual HP loss from the normal20 followed by two uncovered20Fire mines and the correct Final Blast. No page errors; screenshot inspected. UI fixtures use1000HP so the tests can observe all hits; they are not difficulty playtests.

No new strong-deck victory test was run in this change. The previous 68HP victory applies to3.0.26 and does not establish the difficulty of this version.

Main design v4.210 / S3 draft0.45. Executable and ZIP rebuilt. Live save untouched; no commit/push. Restart the game to load the new rules.

Evidence: `reports/cannon-escalation-tests.txt`, `reports/cannon-escalation-ui.json`, UI screenshots, `tests/cannon-escalation.test.mjs`, and `tools/cannon-escalation-ui-test.mjs`.
