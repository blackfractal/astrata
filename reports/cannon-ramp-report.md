# Cannon ordinary-attack ramp and manual playtest — 3.0.28

Jonathan revised ordinary damage to 14, 7+7, 16, 8+8, 18, 9+9… and requested the same strong-deck test after the scaling changes.

## Final rules

Ordinary attacks alternate single and two distinct-element hits. Total damage is 14 + 2 × floor(n/2), where n is the zero-based ordinary-attack count. Dual hits each deal half that total. Final Blast and Purify pause the ordinary progression. The first element follows field selection; the second counters it, with deterministic non-Arcane rotation for an Arcane first hit. Both hits are shown and resolve separately. No additional generic half-HP, Restless or cycle bonuses apply.

Final Blast remains40/50/60/70… on Cannon actions5/10/15/20…; charges4/9/14/19 announce the exact damage and lay two mines. Mine damage20Fire, projectile arrival12Pierce and boss260HP are unchanged. Continue preserves progression through the existing counters. Main design v4.211 / S3 draft0.46.

## Manual result

**Won turn17 at70/70HP. Zero damage, zero healing, no rewinds, 220 legal actions.** Same25-card developed-foundation fixture, seed73001, opening3Focus/4Channel and the same WaterGold/FireSilver/resource equipment as earlier tests. Codex selected actions manually; all states/actions and frozen sources retained. Independent replay against current rules matches the final state exactly.

| Final Blast | Preparation and resolution |
|---|---|
| Turn5,40Water | Elves repaired one mine; Rain Lantern activated then sacrificed over the other. Ward11 + Shield6 + remaining Magnifier2 absorbed19; Titan took21, ending the next player-turn start at11HP. All four Channel went to preparation/defense, foregoing the old offensive activation. |
| Turn10,50Wind | Elves repaired one mine; an unused Shield covered the other. Wind Ward15 + Arcane Ward11 + Magnifier11 absorbed37. Earth Titan took the remaining13 at elemental advantage. |
| Turn15,60Water | Elves repaired one mine; Water Blast covered the other. New Ward absorbed11. Lattice converted the other Ward to Wind and added5; activation raised it to26Ward, worth39 against Water. Equipment covered the final10 exactly: WaterGold7 + FireSilver2 + armor1. No Titan interception needed. |

Six cards were permanently destroyed during the battle: Rain Lantern, one Shield and Water Blast as mine covers; Familiar and Machine Elves as deliberate interceptors; Lucid Guide when it killed a projectile from inside a Destruction field. These losses are part of the actual line, not simulated costs.

The Titan was never recalled. It dealt63 early damage, then provided a slowly replenishing HP reserve. It intercepted the first two Final Blasts, one9Wind hit and one12Light hit; it ended at10HP. It was not Transmuted in this run. Transmute instead changed Plasma Ball to Light and Lucid Guide to Wind so the Guide could activate inside a Wind field and kill its projectile.

Boss damage: Solitude89 (last hit clamped), Plasma64, Titan63, Storm Canopy28, Lucid Needle8, Blast4, Scouring Gale4. Cinder Snap and Water Blast contributed by killing bullets. Plasma sometimes hit bullets instead of the boss. A Chaos field shut down Light Plasma on turn15, forcing another full defensive turn instead of a simple lethal attempt.

## Interpretation

The damage ramp creates more pressure and gives the later turns a clear deadline. Compared with the preceding mines-only attempt, victory took17 rather than15 turns and required facing all three Final Blasts instead of killing before the third. The first blast consumed all Channel; later blasts required substantial Ward recycling and elemental planning. Several spare Allies/cards were spent to preserve player HP.

Nevertheless, this is still a no-damage win. The larger numbers have not demonstrated unavoidable player damage or a generally hard fight for this build. Renewable recalled Wards, Lattice's instant Guard/recoloring, efficient equipment and Titan growth together remain strong. The turn15 plan used exactly the prepared Ward/equipment capacity, but other cards remained available, so this was not proof of a uniquely narrow winning line. There were also placement inefficiencies, including temporarily disabling Solitude with a neighboring Magnifier and blocking Ward activation with a neighboring card; I adapted without rewinding.

One authored strong deck and one seed cannot establish population balance. Later random draws/targets diverge as decisions and mine selections differ, so this is not a controlled win-rate comparison. No additional tuning was applied after the test.

## Verification and delivery

622 rules tests pass, including the exact ordinary sequence through16turns, distinct-element ordering, pauses for Final Blast/Purify, explicit escalation only, stable inspection, Continue, and mines before blasts. Three isolated packaged UI fixtures show actual8+8/10+10/12+12 charging attacks and40/50/60Final Blasts; resulting HP totals verify both mines and the blast execute. No page errors; screenshot inspected. UI fixtures use1000HP only to survive testing and are separate from the70HP manual playtest.

Artifacts: `reports/codex-cannon-3.0.28/attempt.json`, `sources.json`, `verification.json`, `winning-line.json`; `reports/cannon-ramp-tests.txt`; `reports/cannon-ramp-ui.json` and screenshots. Tools: `codex-cannon-ramp-play.mjs`, `verify-codex-cannon-ramp.mjs`, `cannon-ramp-ui-test.mjs`.

Portable executable and ZIP rebuilt. Live user save untouched. No commit/push.
