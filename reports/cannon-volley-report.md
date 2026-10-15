# Cannon volleys, 300 HP and Final Blast glare — 3.0.29

Jonathan requested 300 HP and an extra simultaneous bullet every fifteen turns, then capped volleys at five. Firing moves now launch 1/2/3/4/5 bullets on turns 1–15/16–30/31–45/46–60/61 onward. The saved Cannon-action counter includes Purify and Final Blast; neither move launches bullets. Ordinary direct damage, Final Blast damage and mine rules are unchanged.

Prefer separated lanes; multiple bullets may overlap fields when separation cannot accommodate the volley. Centers remain distinct, entry holes remain illegal, and limited entry spaces reduce the actual volley. The intent reports planned/requested count and individual elements/rows. Spawn animations run concurrently. New fights start at 300 HP; in-progress saves retain their existing HP.

Final Blast has a larger elemental corona, fuzzy bloom, small white/yellow overexposed core and glare on impact. Its damage number remains readable. Appearance persists through each defense hop and the held damage orb. Reduced motion uses a static orb and fading impact. Ordinary shots retain their existing appearance.

## Same-deck manual playtest

- Same authored 25-card carry-in, equipment and seed 73001 as the prior 3.0.28 test. Opening resources 3 Focus/4 Channel, 70 HP. This is a strong sample deck, not an earned full-run result.
- Repeated the previously chosen first 201 legal decisions through turn 15, then manually adapted to new intents and fields. No search, rewinds, healing or state edits. A few attempted unavailable activations were rejected without changing game state; only successful decisions enter the trace.
- **Won turn 18, 70/70 HP, zero damage and zero healing; 242 successful decisions.** Previous version won turn 17 in 220 decisions.
- Faced two-bullet volleys on enemy turns 16 and 17. Four bullets were present at the beginning of turn 18. No three-to-five-bullet combat balance claim: those thresholds were verified mechanically/UI-only.
- Turn 17's existing Light field prevented the newly placed Magnifier from activating. Used its starting 1 Ward, then the Water Ward's 16, then let the Titan absorb 9 Chaos. Preserved both bracelets and armor to absorb the departing Chaos bullet's 12 Pierce. Titan survived at 1 HP, then regenerated to 3 on turn 18.
- Cannon had 27 HP on turn 18. Placed Transmute adjacent to the 4-HP Sapling and Storm Canopy away from Solitude. Transmuted Sapling to Light: Sapling 6 + Solitude 15 + Storm Canopy 7 finished the fight. All four Channel were used.

The stronger fight required an extra turn and a new line under field pressure, but this deck still achieved a no-damage win. That does not establish broad difficulty or optimality. No further balance changes were made.

## Evidence

626 rules tests pass, including threshold/cap, distinct centers, lane scarcity, deterministic inspection/Continue and Final Blast pause. Packaged UI verifies simultaneous 2/3/5-bullet appearances without script errors. Final Blast visual checks cover Fire, Water and reduced-motion Arcane.

Full initial state, 242 actions, checkpoints, final state, frozen rules and deterministic verification: `reports/codex-cannon-3.0.29/`. `verification.json` and `winning-line.json` independently replay to the exact result. Frozen playtest source precedes the cosmetic glare addition; final rules replay also matches. Visual screenshots/results: `cannon-volley-ui-*` and `final-blast-glare-*`.

Live save untouched; portable app and ZIP refreshed. No commit or push.
