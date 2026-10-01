# Live boss grid telegraphs — package 1.3.27

Rules 1.3.16 unchanged; content 1.1.16; weighted-druid-v1.7 unchanged. All 166 rules tests pass. Target resolution now shares a pure gridTargets function with the preview; the actual selection rules and tie-breakers are unchanged. AI observations add battle.telegraphs containing visible source/action, threatened spaces, affected occupied slots and card count. Reads consume no RNG and expose no hidden state.

Eight new tests cover all three boss previews, deterministic ties, retargeting after Recall, exact match with ensuing destruction, covered-card counting, empty spaces within lines, empty boards, normal/enemy/reaction phases, simultaneous boss warnings, saved state and nonmutating observations. Shared targeting retains newest/connected behavior.

Packaged UI checks exercise Cinder Hart, Void-Colossus and Glass Choir. Live warnings move after actual Recall, Cinder's count updates after a real drag placement, activation buttons remain clickable under overlays, and the actual destruction matches marked cards. The following normal turn removes the markers. Enemy Tells use plain targeting descriptions; warnings show both outlines and symbols. No renderer errors; screenshots inspected. Evidence: `tests/grid-telegraph.test.mjs`, `tools/grid-telegraph-ui-test.mjs`, `reports/grid-telegraph-verification.json`, `reports/screenshots/grid-telegraph/`.

No new five-run balance batch for this visibility-only change. The preceding mini-element evaluation (loss/win9/loss/loss/win11) remains the latest five-run report. No policy training or balance changes. Corruptions, their counter-cards, spreading Wildfire, Shear and larger grids were added to the future-only design sections, not the game.

---

# Matching-element Mini-Voids — package 1.3.26

Rules 1.3.16/content 1.1.15; weighted-druid-v1.7 unchanged. All 158 rules tests pass. Eleven added tests cover matching versus nonmatching hits across all seven elements, neutral same-element damage, the existing once-per-activation limit, Fire weakness/resistance, independent summon elements after actual Glare, exact-state save/resume, live rotation details, equipment bonus hits, and a matching killing blow leaving a summon before victory. The prior fixed-Chaos trigger test was updated to the new rule.

Packaged graphical verification: a Fire Blast deals normal 4 damage to a Fire Colossus and summons one Fire Mini-Void. A subsequent actual Water Glare changes only the boss; the Mini-Void attacks for 2 Fire and telegraphs 3 Fire next, with both rotation entries still Fire in its details. No renderer errors; screenshot inspected. Evidence: `tests/mini-element.test.mjs`, `tools/mini-element-ui-test.mjs`, `reports/mini-element-verification.json`, `reports/screenshots/mini-element/`.

Five runs in `reports/mini-element-evaluation/` complete: 825183 loss at round 20; 825184 win at 9 HP, round 19; 825185 loss at round 14; 825186 loss at round 12; 825187 win at 11 HP, round 19. The last seed previously won at 10 HP and now takes 11 rather than 10 boss turns. Other outcomes are unchanged. This is a playability check, not a balance conclusion. No policy retraining or tuning; focused tests and the graphical scenario cover the new summon behavior.

---

# Chaotic Glare — package 1.3.25

Rules 1.3.15/content 1.1.14; weighted-druid-v1.7 unchanged. Includes the preceding Choir Final Note update. All 147 rules tests pass. Twelve new checks cover the four-move cycle, all seven possible elements (including retaining Chaos), both subsequent Fists, Fire weakness/resistance and Arcane neutrality, unchanged Chaos-hit summoning, seeded replay/save persistence, old-save compatibility, and no premature RNG consumption in observations/Tells.

Packaged UI checks exercise actual Fire and Arcane Glare outcomes, no damage during Glare, visible current element, updated next-attack Tells and full rotation details, and both following attacks. Each deals 11 in these fixtures because one full cycle has completed; base damage remains 10. Fixtures use 999 HP to isolate presentation. No renderer errors; screenshot inspected. Evidence: `tests/chaotic-glare.test.mjs`, `tools/chaotic-glare-ui-test.mjs`, `reports/chaotic-glare-verification.json`, `reports/screenshots/chaotic-glare/`.

Five runs in `reports/chaotic-glare-evaluation/`:

| Seed | Outcome | Comparison |
|---|---|---|
| 825183 | Loss, round 20 | Cinder Hart result unchanged. |
| 825184 | Win, 9 HP, round 19 | Previously lost to Void-Colossus; now wins in 10 boss turns. |
| 825185 | Loss, round 14 | Five-enemy collision result unchanged. |
| 825186 | Loss, round 12 | Fire Wolf/Dervish result unchanged. |
| 825187 | Win, 10 HP, round 19 | Previously won at 6 HP after 12 boss turns; now 10 turns. |

The extra non-attacking move reduces attack frequency and slows per-cycle scaling; changing matchups also affects the fight. This sample suggests an easier Colossus, but does not isolate those factors or establish overall balance. No compensating HP/damage adjustment or policy training was made. None reached Glass Choir; its focused rules/UI evidence remains the coverage for Final Note.

---

# Glass Choir Chorus and Final Note — package 1.3.24

Rules 1.3.14/content 1.1.13; weighted-druid-v1.7 unchanged. All 135 rules tests pass. Ten focused tests cover the revised rotation/warning, fixed unscaled death damage, victory deferral, mutual-death loss, ordered defenses without refill, exact-state resume, status/reflection/equipment kills, two simultaneous Choir deaths, continued battle with other enemies, and loading recent save versions.

Packaged UI checks verify the battle-card and full-description warning, Chorus in the rotation, a zero-HP Choir remaining visible during defense, bracelet selection, Final Note damage before rewards, lethal damage before You Died, only Enemy highlighted during the response, reduced motion, Skip and effect cleanup. No renderer errors; screenshots inspected. Evidence: `tests/choir-final-note.test.mjs`, `tools/choir-final-note-ui-test.mjs`, `reports/choir-final-note-verification.json`, `reports/screenshots/choir-final-note/`.

Five runs in `reports/choir-final-note-evaluation/` completed: seeds 825183–825186 lost at rounds 20/19/14/12; 825187 won at 6 HP, round 19. These match the preceding status-defense outcomes. None reached Glass Choir, so the batch is a general playability check, not coverage of the changed boss or a balance conclusion. Focused rules and UI scenarios establish the new death-attack behavior. The policy was not trained or retuned to plan around Final Note.

---

# Ongoing status damage — package 1.3.23

Rules 1.3.13/content 1.1.12; weighted-druid-v1.7 unchanged. All 125 rules tests pass. Seven focused regressions cover opening Husk Corrode, increasing turn-start damage, Burn/Poison/Corrode bypassing attack defenses without consuming bracelet block, normal per-attack flat reduction, bracelet-before-armor attack order, elemental resistance and reflection excluding status ticks. Status hit presentation carries the actual HP loss and no armor-defense highlight. See `tests/status-defense.test.mjs`.

Five deterministic background runs in `reports/status-defense-evaluation/` completed without stalls:

| Seed | Outcome | Comparison with preceding rules |
|---|---|---|
| 825183 | Loss, round 20 | Cinder Hart approached at 22 HP instead of 27; survived eight boss turns instead of nine. |
| 825184 | Loss, round 19 | Previously won with 4 HP; now loses to Void-Colossus. |
| 825185 | Loss, round 14 | Still loses the five-enemy encounter. |
| 825186 | Loss, round 12 | Still loses against Fire Wolf and Dervish Hunter. |
| 825187 | Win, 6 HP, round 19 | Previously won with 15 HP. |

This is an intentional increase in ongoing status danger. Five seeds are a playability check, not a statistically reliable balance estimate. No policy training or unrelated balance changes. No new graphical test was needed for this damage-routing and content-text change; existing presentation is fed verified hit snapshots.

---

# Equipment projectile origin — package 1.3.22

Presentation-only change; rules 1.3.12/content 1.1.11 and weighted-druid-v1.7 are unchanged. All 118 rules tests pass. Packaged UI checks verify the Ring projectile starts at the actual equipped icon, including the right finger slot, while the main attack starts at its card. Normal 2-damage and socketed 1-damage results are preserved; a second attack does not retrigger the Ring. Normal/Fast, reduced motion and Skip clean up correctly. Reduced motion shows the Ring highlight without a traveling projectile. No renderer errors; screenshot inspected.

Evidence: `reports/ring-origin-verification.json`, `reports/screenshots/ring-origin/`, `tools/ring-origin-ui-test.mjs`. The preceding five-run evaluation remains applicable; no redundant balance batch was run.

---

# Zero-HP defeat and Stone Golem — package 1.3.21

Rules 1.3.12/content 1.1.11; weighted-druid-v1.7 unchanged. All 118 tests pass. Packaged UI checks verify player HP never appears negative during a lethal attack, 0 HP precedes You Died, and Stone Golem grows from 10/10 to 16/16, intercepts, then loses Taunt while retaining its maximum HP. Wounded growth, same-round repeated interception, later optional interception and status lethality have focused rules coverage. Evidence: `reports/golem-defeat-verification.json`, `reports/screenshots/golem-defeat/`, `tests/golem-defeat.test.mjs`.

Five runs in `reports/golem-defeat-evaluation/` completed:

| Seed | Outcome | Interpretation |
|---|---|---|
| 825183 | Loss, round 20 | Used an unactivated 10-HP Golem. Reached Cinder Hart at 27 HP (previously 40) and died after nine boss turns. Attrition and the baseline strategy contributed; this sample does not isolate every downstream decision. |
| 825184 | Win, 4 HP, round 19 | Narrow Void-Colossus win, unchanged. |
| 825185 | Loss, round 14 | Five-enemy collision at low HP, unchanged. |
| 825186 | Loss, round 12 | Attrition followed by Fire Wolf and Dervish Hunter, unchanged. |
| 825187 | Win, 15 HP, round 19 | Healthier approach to Void-Colossus, unchanged. |

None activated Stone Golem. Its new ability is verified by focused tests, not this batch. The baseline policy was not trained or retuned; the small sample establishes playability, not balance, and demonstrates no new exploit.

---

# Ward allowance — package 1.3.20

Content 1.1.10 reduces Ward's total activations from 3 to 2; rules 1.3.11 and weighted-druid-v1.7 are unchanged. All 114 tests pass. A direct engine check verifies two activations, rejection of a third, and continued absorption from remaining ward value after exhaustion. Evidence: `reports/ward-limit-verification.json`.

Five runs in `reports/ward-limit-evaluation/` completed with the same outcomes and causal patterns described in the preceding report: 825183 lost to Cinder Hart (round 20); 825184 beat Void-Colossus with 4 HP (19); 825185 died in a five-enemy collision (14); 825186 died to Fire Wolf plus Dervish Hunter (12); 825187 beat Void-Colossus with 15 HP (19). None activated Ward. This checks general playability and does not establish the balance impact of its reduced allowance. No new exploit was demonstrated or policy training performed.

---

# Transmute and activation shortcut — package 1.3.19

Rules 1.3.11; content 1.1.9 and weighted-druid-v1.7 unchanged. All 114 tests pass. Focused packaged UI checks confirm sole-choice double-click behavior and an actual Water-transmuted Blast dealing 6 to a Fire enemy despite a Fire neighbor, with correct grid/details text. No renderer errors.

Five headless runs completed under the corrected rules:

| Seed | Result | Final HP / Field round | Interpretation |
|---|---|---|---|
| 825183 | Loss | 0 / 20 | Reached Cinder Hart at 40 HP but lost after 12 turns; sustained boss damage outlasted the strategy. |
| 825184 | Win | 4 / 19 | Narrow survival against Void-Colossus; strategy and encounter/equipment luck both matter. |
| 825185 | Loss | 0 / 14 | Entered a five-enemy collision at 12 HP and died in one turn; prior attrition and positioning contributed. |
| 825186 | Loss | 0 / 12 | Earlier attrition left 16 HP for Fire Wolf plus Dervish Hunter; died in two turns. |
| 825187 | Win | 15 / 19 | Reached Void-Colossus at 41 HP and survived an 11-turn battle; a healthier approach supported the same baseline policy. |

These outcomes match the preceding evaluation. None of these runs activated Transmute, so they establish general playability, not Transmute balance; the focused tests exercise the correction. No exploit was demonstrated by this small sample, and no policy weights were trained. Evidence: `reports/transmute-evaluation/`, `reports/transmute-verification.json`, `reports/double-activation-verification.json`, `tests/transmute.test.mjs`.

---

# Horizontal 16:9 battlefield — package 1.3.18

Presentation-only change; rules 1.3.10/content 1.1.9 and weighted-druid-v1.7 remain unchanged. All 110 rules tests pass. Packaged UI verification covers fixed battle geometry at 16:9, 4:3 and 21:9, letterboxing/pillarboxing, window presets/fullscreen, local hand/enemy scrolling, real placement and bracelet defense, inspectors and AI drawer persistence after one AI action. Existing combat-feedback and elemental-impact checks also pass in the scaled stage, including attack drag previews and actual damage. No renderer errors; screenshots inspected.

Evidence: `reports/horizontal-layout-verification.json`, `reports/screenshots/horizontal-layout/`, `tools/horizontal-layout-ui-test.mjs`, refreshed battle-feedback and element-impact verification reports. Existing five-run gameplay conclusions remain applicable; no new full graphical run or balance batch was performed for this layout change.

---

# Elemental spell impacts — package 1.3.17

Presentation-only change; rules 1.3.10/content 1.1.9 and weighted-druid-v1.7 are unchanged. Packaged graphical tests verify all seven element-specific bursts during actual attacks, the gray Arcane star, impact location and timing after projectile arrival, Ally interception, and correct cleanup. Fast, reduced-motion and Skip modes retain identical damage and final state. Reduced motion has no flying particles. No renderer errors; Arcane/Fire/Water screenshots inspected.

Evidence: `reports/element-impact-verification.json`, `reports/screenshots/element-impact/`, `tools/element-impact-ui-test.mjs`. Previous 110-test and five-run gameplay results remain applicable; no redundant gameplay batch or rules test run was needed.

---

# Battle feedback and upgrade previews — package 1.3.16

Rules 1.3.10/content 1.1.9 and weighted-druid-v1.7 remain unchanged. Combat power and elemental calculations were extracted into shared pure functions so the interface uses the same math as combat. No balance or policy changes. All 110 tests pass, including previews matching actual hits across weakness, strength, neutral, Resist, Guard, Flicker and Wisp cases, with no state/RNG mutation.

Packaged graphical checks use real mouse drags: Thorn Choir updates 6→8 after placing a neighbor; holding an attack over three enemies shows 12 (+4) green, 4 (-4) red and 8 neutral. Canceling spends no Channel and restores 8; committing the first target deals 12. Tests also verify Insight→Focus→Channel highlighting, no resource highlight during enemy defense, six adverse-status badges and their tooltips, Used-this-turn state, badge/control separation, and a Shield upgrade tooltip showing 4→7. No renderer errors; screenshots inspected. Evidence: `reports/battle-feedback-verification.json`, `reports/screenshots/battle-feedback/`, `tests/battle-feedback.test.mjs`.

The preview describes the source card's direct hits; equipment, covered-card effects and status ticks are separate, as stated in hover help. Random attacks retain their range and are not presented as a deterministic target forecast. Prior five-run results remain applicable; no new gameplay batch or full graphical playthrough was run.

---

# Keyword help — package 1.3.15

Presentation/help-only change: shared keyword annotation across rendered text, expanded glossary and aliases, including Locked/Frozen/Severed. Rules 1.3.10/content 1.1.9 and weighted-druid-v1.7 are unchanged. All 107 gameplay tests pass again. Packaged UI checks verify status and card-detail help, Ally HP, four-second expiry, valid Locked Corner Flame activation and once-per-turn gating, dialogs, 92 glossary terms/aliases, dynamic text replacement, safe text preservation and idempotent annotation. No renderer errors; screenshot inspected. Evidence: `reports/keyword-help-verification.json`, `reports/screenshots/keyword-help/`. Prior five-run results remain applicable; no new gameplay batch was needed.

---

# Dialog dismissal — package 1.3.14

Presentation-only change: Grimoire, Inventory, Menu and other dialogs support backdrop dismissal. Rules 1.3.10/content 1.1.9 and weighted-druid-v1.7 are unchanged; the 107-test and five-run results below remain applicable. Packaged UI checks verify backdrop/×/Escape closure, interior interaction and drag protection, Inventory inspection, and no underlying action or renderer errors. Evidence: `reports/dialog-dismiss-verification.json`. No new gameplay batch was needed.

---

# Resource feedback and charged attacks — package 1.3.13

Rules 1.3.10/content 1.1.9, weighted-druid-v1.7. Insight is spent by Reveal; counters refill as the player ends their turn. Charged-card actions explicitly distinguish charge-building (no enemy target or immediate damage) from release. The policy values their declared future damage/Burn without pretending the charge already hit an enemy. Kiln releases 30 targeted damage and Burn 2 to all enemies.

All 107 rules tests pass. Packaged UI tests observe Insight 4→3→2→1→0 in Normal, Fast and reduced-motion modes; Skip finishes at 0. They verify two targetless Charge clicks, counters 0/0/0 before End Turn then 4/1/2 during enemy defense, and charged Kiln selecting one enemy, dealing exactly 30 to it, and applying Burn 2 to both. No renderer errors; screenshot inspected. Evidence: `reports/charge-resources-verification.json`, `reports/screenshots/charge-resources/`, `tests/charge-resources.test.mjs`.

Five full headless runs (825183–825187) complete with the same two wins/three losses and final HP/rounds as the previous sample: 0/20, 4/19, 0/14, 0/12, 15/19. Logs: `reports/charge-resources-evaluation/`. These runs demonstrate regression stability, not Kiln balance or a reliable win rate. No new full graphical playthrough is claimed.

---

# Elemental Ally spillover correction — package 1.3.12

Rules 1.3.9/content 1.1.8; weighted-druid-v1.6. Ally interception separates base damage and a defender-specific weakness bonus. The policy now evaluates interception using the same calculation, valuing base damage prevented rather than inflated Ally HP damage. No weight training or broader tuning was performed. Logs: `reports/spillover-evaluation/`.

| Seed | Outcome | Final HP | Field round | Last encounter |
| --- | --- | --- | --- | --- |
| 825183 | loss | 0 | 20 | The Cinder Hart |
| 825184 | win | 4 | 19 | Void-Colossus |
| 825185 | loss | 0 | 14 | Bell Beetle 1, Bell Beetle 2, Fire Wolf, Shard-Walker, Needle Imp |
| 825186 | loss | 0 | 12 | Fire Wolf, Dervish Hunter |
| 825187 | win | 15 | 19 | Void-Colossus |

Two wins and three losses; all runs terminate normally. Seed 825187 ends at 15 HP instead of 6; seed 825185 reaches round 14 instead of 11. These are examples of changed play under corrected interception and policy evaluation, not an isolated balance estimate. The small sample does not establish win rate.

All 100 rules tests pass, including the approved 6/5/2 player-damage examples, bonus-first absorption, bonus exhaustion without regeneration, both elemental cycles, neutral/resistant transitions, odd-number rounding, save/load, Guardian, Taunt, equipment and separate hits. Real packaged UI interactions verify preview and actual HP for each approved example with no renderer errors. Incoming inspection shows remaining base/bonus separately; screenshots inspected. Evidence: `reports/spillover-verification.json`, `reports/screenshots/spillover/`, `tests/spillover.test.mjs`. These are targeted graphical tests, not a new full graphical playthrough.

---

# Resonance placement cost — package 1.3.11

Content 1.1.8, unchanged rules 1.3.8 and weighted-druid-v1.5. Resonance placement is now 1 Focus. Its zero-Channel activation, +1 Channel gain, single use, Recall/extra-use restrictions, and turn-end destruction are unchanged. All 92 existing rules tests pass. A direct packaged-engine check verifies placement with exactly 1 Focus, spending it, activating from 0 Channel exactly once, and destruction at turn end. See `reports/resonance-cost-verification.json`.

Five complete headless runs (825183–825187) retain two wins/three losses and the same final HP/rounds as the previous sample: 0/20, 4/19, 0/11, 0/12, 6/19. Logs: `reports/resonance-cost-evaluation/`. This is regression evidence, not a balance estimate for Resonance. No new graphical test was needed for this data-only cost change.

---

# Starting equipment and +50% enemy HP — package 1.3.10

Rules 1.3.8/content 1.1.7; unchanged weighted-druid-v1.5. Bronze Bracelet refills 2 block; Rootbound Ring fires one separate 2-damage hit on the first damaging attack per player turn. All 23 enemy HP definitions are 50% above package 1.3.9, rounded up, including summons. Complete logs: `reports/equipment-balance-evaluation/`.

| Seed | Outcome | Final HP | Field round | Last encounter |
| --- | --- | --- | --- | --- |
| 825183 | loss | 0 | 20 | The Cinder Hart |
| 825184 | win | 4 | 19 | Void-Colossus |
| 825185 | loss | 0 | 11 | Ink Leech, Ink Leech, Needle Imp |
| 825186 | loss | 0 | 12 | Fire Wolf, Dervish Hunter |
| 825187 | win | 6 | 19 | Void-Colossus |

Two wins and three losses, versus four wins and one loss in the preceding five-run sample. Both victories are narrow: 4 and 6 HP after 11- and 12-turn Colossus fights. One loss occurs against Cinder Hart; two occur in grouped encounters before the Archon. All runs terminate normally without stalls or policy changes. These results suggest more survival pressure for this policy and sample, not an established player win rate. Routes and later random outcomes diverge as fights and decisions change, so these are not isolated per-item effect estimates. No extra tuning was done to force wins.

All 92 rules tests pass. New coverage includes once-per-turn Ring limits and refresh across battles/saves, Plasma/Fusion/Prism/area attacks, status-only and charge-building exceptions, negation, guard, lethal opening hits, elemental sockets, unchanged Crown of Thorns triggers, and Bracelet refills. Packaged interaction tests verify actual damage 6 then 4 from two separated Blasts, 2 block during defense, equipment descriptions, Ring Ready/Spent states and next-turn refresh, and new enemy HP. No renderer errors; the badge was repositioned after visual inspection and is checked against label overlap. Evidence: `reports/equipment-balance-verification.json`, `reports/screenshots/equipment-balance/`. Targeted graphical tests are not a new full graphical playthrough. Earlier reports below remain historical evidence for their versions.

---

# Scarce healing and stronger enemies — package 1.3.9

Rules 1.3.7/content 1.1.6; unchanged weighted-druid-v1.5. Blast damage and Shield block are now 4. All five activation-healing cards are rare, weighted one-quarter as heavily as other rare cards, and destroyed after one use. Enemy HP is increased 15%, rounded up. Raw decisions and encounter logs: `reports/balance-evaluation/`.

| Seed | Outcome | Final HP | Field round | Last encounter |
| --- | --- | --- | --- | --- |
| 825183 | win | 6 | 18 | The Cinder Hart |
| 825184 | win | 18 | 19 | Void-Colossus |
| 825185 | win | 41 | 20 | The Cinder Hart |
| 825186 | loss | 0 | 17 | Shard-Walker |
| 825187 | win | 38 | 19 | Void-Colossus |

Four wins, one loss; all five runs terminated normally without policy changes or stalls. The Cinder Hart win at 6 HP and the round-17 Shard-Walker loss show that survival pressure exists, but this sample does not estimate a reliable win rate or prove the intended difficulty. These seeds previously produced three wins/two losses; acquisition changes consume randomness differently, so routes, enemy draws, rewards, and later decisions differ. This is not a controlled before/after balance experiment. No extra tuning was performed to force favorable AI outcomes.

All 86 rules tests pass. Focused coverage includes healing at full HP, player/Ally healing and secondary effects, Keystone/Recall restrictions, covered Fusion healing, restoration next battle, scarcity across offers and Item Decks, new HP values, and old-save retention. Targeted packaged tests verify reduced Blast damage, Shield 4, the printed single-use contract, Ally healing followed by visible Destroyed-pile removal, and continued click/drag targeting, Shift and Transmute. No renderer errors. See `reports/balance-verification.json` and `reports/screenshots/balance/`. This is not a new full graphical playthrough; older evaluations below remain historical evidence for their stated versions.

---

# Ally vitality and battlefield targeting — package 1.3.8

Rules 1.3.6/content 1.1.5 and weighted-druid-v1.5 remain unchanged. Added Ally maximum-HP display metadata without capping or changing HP calculations. Five refreshed seeds 825183–825187 end identically to the preceding gameplay evaluation: **3 wins / 2 losses**, HP/rounds **51/20, 7/19, 0/20, 60/19, 0/19**. Logs: `reports/battle-targeting-evaluation/`.

All 80 rules tests pass. Packaged human-interface tests cover real clicks and drags for adjacent-card attunement and enemy selection, cancel/invalid actions without resource spending, healing a selected Ally with an updated life bar, Shift destinations, and inline Transmute element choices that affect subsequent attunement. No renderer errors. See `reports/battle-targeting-verification.json` and screenshots. The AI continues to submit complete legal actions directly; no policy adaptation was needed for this UI change. Targeted packaged interaction testing is not a new full graphical playthrough.

---

Package 1.3.7 adds only Druid card backs and faster overlapping Reveal to rules 1.3.6/content 1.1.5. The gameplay results below remain current. Packaged presentation tests preserve revealed card identities/order across Normal, Fast, Skip, and reduced-motion modes; normal four-card Reveal measured 1,778 ms. See `reports/druid-reveal-verification.json`.

# Once-per-turn activation — rules 1.3.6, content 1.1.5

Five sequential seeds 825183–825187: **3 wins / 2 losses**, unchanged weighted-druid-v1.5. Outcomes (HP / round): **win 51/20, win 7/19, loss 0/20, win 60/19, loss 0/19**. Losses occurred against Cinder Hart and Void-Colossus respectively. Full logs: `reports/activation-turn-evaluation/`. Every run ended normally; none stalled. The policy receives the restricted legal action set and needs no special-case bypass. No tuning was applied to force victories. Five runs are insufficient for a reliable win-rate estimate.

The once-per-turn/Blink requirement is now implemented. Each card tracks current-turn use independently of its total allowance; unlimited cards, Charge, and covered Pile/Fusion activations follow the same default. No current card gained Blink; a temporary printed-Blink rules fixture verifies paid repeat activation and allowance/resource limits.

All 78 rules tests pass. The packaged UI test verifies disabled activation despite surplus Channel and total uses, Used this turn, automatic forward-arrow prompting, popup details, next-turn availability, and permanent exhaustion after the final total use, with no renderer errors. See `reports/activation-turn-verification.json` and screenshot. Current verification is targeted graphical interaction plus five full headless runs, not a new full graphical playthrough. Older sections below retain their historical pending-rule descriptions and results.

---

# Druid starter and Insight — rules 1.3.5, content 1.1.4

Five sequential seeds 825183–825187: **5 wins / 0 losses**, unchanged weighted-druid-v1.5. Final HP / round: **25/19, 23/19, 29/20, 49/20, 62/19**. Logs: `reports/druid-start-evaluation/`. The new 12-card deck (four Blasts/four Shields plus four other starters) and base Insight 4 change draw frequency, random consumption, and later routes. This small combined-change sample does not isolate a balance effect.

All 72 rules tests pass. Packaged UI shows four dealt/revealed cards, eight remaining in the Grimoire, and starting resources of 4 Insight / 1 Focus / 2 Channel, with no renderer errors. See `reports/druid-start-verification.json` and screenshot. Tests also verify reset behavior and preservation of existing saved decks. This is targeted graphical verification plus five full headless runs, not a new full graphical playthrough.

General once-per-turn/Blink gameplay remains pending separately.

---

# Resonance and equipment — rules 1.3.4, content 1.1.3

Five seeds 825183–825187: **5 wins / 0 losses**, policy weighted-druid-v1.5. Final HP / round: **55/20, 29/19, 25/20, 65/19, 25/19**. Logs: `reports/resonance-equipment-evaluation/`. None acquired Resonance, so this sample checks run completion and the new unequip action without measuring Resonance balance. The policy explicitly avoids unequipping useful gear merely to re-equip it.

All 70 rules tests pass. Direct tests verify Resonance's net +1 Channel from zero, single use without Recall or extra allowance, and expiration into Destroyed, including covered/unused copies. Packaged UI tests verify those interactions plus actual equipment dragging in both directions, no duplicates across Equipped/Satchel, and unnumbered grid cells, with no renderer errors. See `reports/resonance-equipment-verification.json` and screenshots. No new full graphical playthrough is claimed for this patch.

General once-per-turn/Blink gameplay remains pending; Resonance's printed single-use restriction is implemented.

---

# Stop-on-player movement — rules 1.3.3, content 1.1.2

Five sequential seeds 825183–825187: **5 wins / 0 losses**, weighted-druid-v1.4. Final HP / round: **55/20, 29/19, 25/20, 65/19, 25/19**. Raw logs: `reports/movement-stop-evaluation/`. These outcomes match the prior five-run sample; this is regression evidence, not a measured balance effect.

All 66 rules tests pass. Targeted tests exercise a Restless Wanderer reaching the player before spending its movement, subsequent enemies completing their moves, Pack chains retaining arrivals, diagonal contact, and existing-save compatibility. The packaged UI fixture visibly holds the Bat on the player while the Hunter moves, then opens one battle containing both enemies, with no renderer errors. See `reports/movement-stop-verification.json` and its screenshots. Current graphical verification is a targeted interaction, not a newly recorded full graphical playthrough.

The design-only Blink/once-per-turn gameplay requirement remains pending.

---

# Matching starter-card adjacency — rules 1.3.2, content 1.1.2

Final five sequential seeds 825183–825187: **5 wins / 0 losses**, using weighted-druid-v1.4. Final HP / Field round: **55/20, 29/19, 25/20, 65/19, 25/19**. Raw logs are in `reports/adjacency-evaluation/`. The policy rewards placement next to matching exposed cards and reads the actual Shield block value from legal-action effects.

Both bonuses are position-dependent: adjacent Blasts gain damage and adjacent Shields gain block when activated. Direct tests and the packaged UI verify 6/7/6 for a row of three. Elemental conversion occurs after the bonus, and stored Shield block is not retroactively recalculated when neighbors change. Coverage includes diagonals, row edges, covered cards, Sever, and exposed spent neighbors.

All five seeds still win, but seed 825184 ends at 29 HP instead of the prior 40 HP. Altered placement scores and combat choices mean that a stronger card interaction need not improve every route. This small sample is not a balance estimate. No further tuning was made to chase a win rate. **62 rules tests pass**, and packaged adjacency/activation/pulse checks have no renderer errors. The prior full graphical victory belongs to rules 1.3.1; this final patch was checked with targeted packaged interactions and five full headless runs.

The design-only Blink/once-per-turn requirement remains pending in gameplay. These results use the existing repeat-activation rule, with zero-Focus Clear Mind/Rain Lantern/Tide Memory, no Blast/Shield rewards, and the new adjacency bonuses enabled.

---

# Reveal and economy-card update — rules 1.3.1, content 1.1.1

The final five sequential seeds 825183–825187 all completed: **5 wins / 0 losses**, using weighted-druid-v1.3. Final HP / Field round were 55/20, 40/19, 25/20, 65/19, and 25/19. Logs and individual encounter results are in `reports/reveal-evaluation/`. This supersedes the earlier same-turn diagnostic run before the zero-Focus economy-card changes.

Blast and Shield never appeared among selected rewards; direct generation tests over 100 seeds verify they are excluded from normal/rare reward offers. Existing copies and shop stock remain valid. The five runs used Clear Mind 0, 1, 1, 2, and 1 times respectively; none activated Rain Lantern or Tide Memory. Therefore this sample verifies completion but offers little evidence about Rain Lantern/Tide Memory balance. Their zero placement cost, Channel payment, and next-turn-only resource timing are checked directly in the rules tests. The bot still favors immediate offense over future draw, which may underuse these cards.

Seed 825183 dipped to 29 HP but finished at 55; 825186 never dropped below 57 and finished at full health. Recovery remains powerful in some routes. No balance conclusion should be attributed solely to the reward exclusion or cheaper utility cards, because reward shuffling changes later random outcomes too. The earlier 80/100 result remains evidence for rules 1.3.0/content 1.1.0, not this update.

Reveal animation is presentation-only: the captured draw order matches the headless engine, and a full-run invariance regression still passes. Normal/Fast/Skip/reduced-motion packaged checks confirm ordered reveals and automatic Placement. Movement brightness and arrow-pulse fixtures pass. **58 rules tests pass.** The final packaged full run (seed 825184) won at 40 HP, round 19, in 102 seconds; results/history, completed-save deletion, and zero renderer errors are recorded in `reports/reveal-playthrough.json`.

Scope boundary: the once-per-turn/Blink rule requested specifically for the design document is recorded in design v4.41, but is not implemented in this package. These AI results still use the previous repeat-activation behavior. Design v4.42's zero-Focus Clear Mind, Rain Lantern, and Tide Memory costs are implemented.

---

# Paired spawns and 2 Channel — rules 1.3.0

Five complete headless runs used weighted-druid-v1.3, content 1.1.0, and unchanged default numeric weights. **5 wins / 0 losses.** These are sequential seeds selected before running, not a selection of winning seeds. Raw actions, reasons, and encounter results are in `reports/pairs-evaluation/`.

| Seed | Outcome / final HP | Final round | Observation from the run |
|---|---|---|---|
| 825183 | Win / 44 | 19 | Survived Ashling + Dervish, then Shard-Walker + Pale Weaver. Sapling was activated 13 times. Hart took 5 turns. |
| 825184 | Win / 47 | 20 | Three Bats fought together in round 11: 2 turns and 5 HP lost. Colossus took 5 turns. |
| 825185 | Win / 35 | 19 | Two Ink Leeches plus Fire Wolf cost 28 HP over 5 turns. Recovered to 65 before the 7-turn Hart fight. |
| 825186 | Win / 56 | 20 | Two Ashlings plus Fire Wolf cost 8 HP over 4 turns. Finished Hart with more HP than it entered, indicating meaningful sustain. |
| 825187 | Win / 43 | 19 | Ink Leech + Wolf cost 3 HP; Colossus took 6 turns. Blast remained the main activation, used 15 times. |

The 100-run robustness set, seeds 971010–971109, completed with **80 wins / 20 losses**, no stalled or illegal-action run. 92 runs faced a multi-enemy battle; 62 faced one of the authored numbered groups. Largest observed battle: 5 enemies. Fourteen losses involved an Archon; six ended in non-Archon encounters, including a two-Bat group, a four-enemy mix, and stacked status-heavy enemies. Detailed logs are in `reports/pairs-robustness/`.

Interpretation: this combination is substantially more successful for the current bot than the preceding 49/100 sample. Extra Channel allows more offense or defense while extra encounters also offer more growth and recovery opportunities. Those are plausible explanations, not isolated causal results: spawn structure, grouping, policy threat scoring, and random-number consumption also changed. Equal seeds do not create matched encounters across these versions. A controlled experiment would vary those changes separately. No additional damage, HP, reward, or spawn-weight nerfs were made to force a target win rate.

Grouped targets work mechanically and the easiest setting remains beatable, but concentrated multi-enemy status damage deserves further human playtesting. No enemy cap was silently introduced. The bot reads visible group sizes when evaluating travel risk and handles all individual battle targets through the normal legal-action API.

Packaged verification: the Field displays four ordered pairs and group counts, without page scrolling at 1280×800. A real seeded three-Bat encounter shows three independently inspectable targets and 2 Channel. The full graphical run at seed 825184 reached the win screen at 47 HP, round 20, with no renderer errors; results/history and finished-save deletion passed. `reports/pairs-playthrough.json` records the 88-second run, started from an untouched initial class-selection state and played through ordinary controls plus Watch AI. All 54 rules tests pass. Earlier reports below retain their original versions and results.

---

# Optional pickup verification — rules 1.2.1

Five complete headless runs used weighted-druid-v1.2 and seeds 825183–825187. Results: **2 wins / 3 losses**, no stalled or illegal-action run. Final HP: 0, 49, 0, 39, 0 respectively. Raw actions, reasons and encounter summaries are in `reports/item-pickup-evaluation/`.

The bot declined one pickup on seed 825187, round 5. Other encountered pickups were accepted, including Earth Armor on 825184 and six equipment/card pickups on 825186. All five terminal outcomes and final HP match the previous 1.2.0 sample. This confirms the added decision is handled; five runs are not evidence of a balance improvement. The focused cursed-item test separately verifies that the policy prefers refusal over accepting the curse. Earlier balance observations below remain applicable to these repeated outcomes.

The packaged UI was checked for both Collect and Leave item using explicit saved fixtures; these are interaction tests, not five graphical playthroughs. All 48 rules tests pass. Older reports below retain their original rules versions.

---

# AI playability and five-run report

## Current polish evaluation — rules 1.2.0

Policy: weighted-druid-v1.1; content 1.0.0; observation/action interfaces 1. Seeds 825183–825187 were rerun after fixed item rewards, the scheduled midpoint Tavern, weighted spawns, once-per-Tavern pruning, and variable Hex payments. Logs: `reports/polish-evaluation/`. The policy now values HP and sacrifice costs when evaluating Hex treatment. It remains a naive weighted policy, not a trained model.

| Seed | Result | Endpoint | Interpretation from the recorded choices |
|---|---|---|---|
| 825183 | Loss | Round 16, Cinder Hart after 10 turns | Nine earlier fights reduced HP, followed by upgrades and recovery. Entered the boss at 50 HP; limited Channel and repeated Earth attacks into Fire did not finish quickly enough. Mixed draw/opportunity luck and policy sequencing, not an identified rules exploit. |
| 825184 | Win, 49 HP | Round 19, Void-Colossus in 10 turns | Bought and socketed Storm Opal at the Tavern, gaining Channel. Upgraded Blast and Sapling, then used multiple activations and Recall to keep offense available. A useful strategy supported by available gear; the packaged graphical run reproduces this result. |
| 825185 | Loss | Round 19, Cinder Hart after 12 turns | Reached the boss at 42 HP after several fights. Rest and upgrades helped, but the late log still shows only one activation per turn. The acquired Storm Opal was not socketed before the Tavern closed. Opportunity timing and weak action economy contributed. |
| 825186 | Win, 39 HP | Round 18, Cinder Hart in 9 turns | Bought/socketed Storm Opal and imbued a Gold Bracelet with Ruby. Extra Channel plus strong Fire defense supported repeated Palimpsest activations. Both defense and sustained offense mattered. |
| 825187 | Loss | Round 18, Void-Colossus after 10 turns | Husk Armor imposed the persistent Corrode burden. The bot bought Palimpsest but lacked the Channel development of the wins; its final turns relied on one Cinder Snap activation and limited defense. Cursed-gear luck and policy development both contributed. |

**Two wins, three losses.** These five seeds illustrate behavior, not a calibrated win-rate estimate. The additional 100-run robustness batch (971010–971109) completed **49 wins / 51 losses**, with every run terminal and no illegal-action or nontermination failure. The logs are in `reports/polish-robustness/`.

No new broken rules exploit was established. The existing recommendation to improve the bot's handling of spent cards, elemental matchups, and future action economy remains deferred: this pass changes visibility and the explicitly requested rules, rather than tuning enemies around a weak policy. A fixed Tavern spawn does not guarantee the bot visits it promptly; logged visits occur after round 8 when travel takes time.

A packaged UI playthrough of seed 825184 reached the win screen at 49 HP, round 19, with no renderer errors; history and save deletion passed. Focus/drag/drop, spent allowances, attack/disintegration timing, movement paths, all six Tavern areas, all five Healer cost types, and store inspection have separate graphical checks. Targeted edge-case fixtures are labeled as such and are not presented as natural full runs.

Earlier evaluation below is retained as the original v1 baseline. Changing rules and random draws changes these seeds' trajectories; it is not an isolated balance comparison.

## Original v1 evaluation — rules 1.0.0

Evaluation: Druid, rules/content 1.0.0, observation/action interfaces 1, weighted-druid-v1. Seeds 825183–825187. All five runs were actually executed headlessly; complete decisions, public action descriptions, templated reasons, weights, and encounter records are in `reports/evaluation/`. No search, training, hidden-state access, or scripted victories were used.

| Seed | Result | Endpoint | Causal interpretation |
|---|---|---|---|
| 825183 | Win, 29 HP | Round 19, Cinder Hart in 6 turns | Upgraded Blasts and Cinder Snap, plus a socketed Storm Opal, supplied enough offense. The run reached the boss at 65 HP and lost 36 there. **Strategy supported by favorable opportunities**: it spent 255 Gold on upgrades/rest, and won several small fights in one turn. |
| 825184 | Loss | Round 18, Void-Colossus after 23 turns | Reached the boss at full HP with Earth Armor, Soothe, and extra Channel. The final turns repeatedly activated two Shields and used the Bracelet, but dealt no finishing damage. **Strategy failure**: the policy did not Recall exhausted offense early enough. Defensive survival postponed the loss while the enemy ramp grew. |
| 825185 | Loss | Round 8, Shard-Walker | Dervish Hunter cost 26 HP on round 6. Two rounds later Shard-Walker's activation-negating and piercing rotation defeated the starting-heavy deck. It had 75 Gold but spent none. **Spawn/draw pressure plus weak strategy**: an early pair of Eidolons and no realized recovery/upgrade path. |
| 825186 | Win, 60 HP | Round 20, Cinder Hart in 5 turns | Found Gold Bracelet and Holy Armor, equipped both, and developed three upgraded Saplings. It entered the boss at 57 HP and ended at 60, after taking and healing damage. **Favorable equipment luck with a repeatable strategy**: passive defense/healing frees Channel for growing Allies and attacks. |
| 825187 | Loss | Round 19, Void-Colossus after 11 turns | Entered the boss at 64 HP with a thin economy, a cursed Husk Armor, and only one Channel. Its final decisions were single Blasts, one Shield, and Familiar interception; armor's battle-start Corrode added accumulating pressure. **Strategy and item risk**, rather than proof that the boss is impossible. |

## Aggregate interpretation

Two of five won (40%). Both wins fought Cinder Hart; two losses fought Void-Colossus and one died before an Archon. This sample cannot separate boss balance from equipment and policy quality. The standout contrast is the Gold Bracelet/Holy Armor run: 31 total damage taken, versus 105 in the 23-turn Colossus loss. Passive equipment has a large effect on how much Channel can be spent offensively.

The logs expose a concrete policy weakness: Recall is almost never chosen. The policy only values clearing Spent slots when more than ten slots are occupied. Colossus removes columns, which keeps occupancy below that threshold while still destroying usable offense. The bot then pays Channel for Shields until ramping attacks defeat it. **Deferred improvement:** score Recall by access to reusable damage and next-turn Focus, rather than grid occupancy alone. This is an AI improvement, not a reason to change the game's Recall rule. The v1 bot intentionally remains a naive baseline.

No player exploit was demonstrated in these five runs. The long Colossus fight is a losing defensive loop, not an infinite protection exploit. A possible balance concern is healing behind strong passive Bracelets. **Deferred design recommendation:** before changing either mechanic, compare passive-defense/healing combinations over larger matched-seed runs and with a policy that recycles offensive cards. Enemy cycle ramp is already the design's pressure against indefinite farming.

## Defects fixed during development

- The policy initially oscillated between equivalent equipment slots. It now accounts for the benefit removed from the original slot. That was a bot scoring defect, not a legal player exploit.
- Upgraded Sapling initially risked receiving its +3 HP benefit a second time as direct damage. The implementation now derives its attack solely from current HP. A regression test covers it.
- Acquiring a fourth Armor now pauses the Field before the required carry-limit choice, rather than allowing enemy movement to interrupt that choice.
- Repeated mid-battle quit/resume always preserves the same opening checkpoint. A regression test covers the second resume as well as the first.

## Scale and robustness check

A separate 100-run batch (971010–971109) completed without crashes, illegal moves, or step-limit stalls: 67 wins. It encountered all three Archons, including a Bat plus Glass Choir encounter. These were not used to train weights and are not substituted for the five-run report above. They demonstrate that the batch command scales beyond five and exercise more content; they still do not establish balance.

Exact versions and policy weights accompany each run. Tests separately verify unfamiliar legal actions, changed starting resource values, hidden-state omission, deterministic replay, and atomic defenses. Future training should split training and held-out evaluation seeds, associate checkpoints with all four version fields, and reject incompatible checkpoints. Future search must sample plausible hidden outcomes into isolated state; the real engine RNG and hidden decks must never become policy input.


Post-build 1.3.28: elemental-interaction visuals and durable local run archives do not change balance or policy. Full suite: 178 passing tests. Two archival verification runs of seed 825184 both win with 9 HP after 308 decisions and 19 Field rounds, matching the prior result; these are repeated-seed persistence checks, not a new five-run balance sample. The preceding mini-element five-run evaluation remains the latest balance batch. Headless batches now preserve unique per-run archives with exact states, structured actions, effects, logs, policy/weights, package/rules/content versions and shared source snapshots; repeated seeds cannot overwrite canonical records. Completed event logs are compressed losslessly. Detailed measurement in reports/run-archive-verification.json.


## 7×6 Mind Grid playtest — package 1.3.29

Rules 1.3.17/content 1.1.17; policy weighted-druid-v1.8. The policy changes only its corner detection to use the shared 7×6 geometry; weights and strategy are unchanged and no training occurred. Five matching seeds completed normally, with one victory and four losses. Each trial has its own compressed decision/state archive plus the exact engine/content/policy source snapshot in reports/mind-grid-evaluation/.

| Seed | Previous 5×4 outcome | 7×6 outcome | Field round | Decisions | Last encounter |
| --- | --- | --- | --- | --- | --- |
| 825183 | Loss | Loss | 20 | 367 | Cinder Heart, 8 turns |
| 825184 | Win, 9 HP | Win, 13 HP | 19 | 311 | Void-Colossus, 9 turns |
| 825185 | Loss | Loss | 14 | 195 | Five-enemy encounter, 1 turn |
| 825186 | Loss | Loss | 12 | 177 | Fire Wolf + Dervish Hunter, 1 turn |
| 825187 | Win, 11 HP | Loss | 19 | 388 | Void-Colossus, 12 turns |

The first, third and fourth runs retain their previous outcomes and decision counts. Both Colossus encounters change: one finishes healthier, the other loses after an additional boss turn. This is a small playability/comparison sample, not evidence that 7×6 is globally easier or harder. All runs terminate without illegal moves, crashes or action-limit stalls. No resource, card or enemy rebalance was applied. Human playtesting should evaluate how much the extra room changes Recall/stacking pressure, isolated groups and recovery from telegraphed row/column destruction before introducing Act 2 Corruptions.

Verification: 186 rules tests pass, including new far-edge placement/activation/Recall, adjacency bounds, Ally growth/status processing, 2×2 formations, row bonuses, Towers, corner Keystone, boss telegraphs and 5×4 save migration. Packaged UI checks 42 visible cells in seven columns/six rows, final-space dragging/activation/Transmute, readable status/health/value overlays, full card details, and target-choice controls clear of the grid. Element-interaction and all-three-boss telegraph graphical regressions also pass. No renderer errors; screenshots inspected.

Package 1.3.30 moves new-run starter equipment to the right-side slots; content 1.1.18, rules/policy unchanged. All186 existing tests pass and both new/legacy opening Gem choices were checked directly. No new AI batch for this side-default change; the 7×6 five-run evaluation remains current.

Package 1.3.31 improves Sever and connection visuals only; rules/content/policy unchanged. All 186 tests and isolated graphical interaction checks pass. No new AI batch; the 7×6 five-run evaluation remains current.

Package 1.3.32 (rules1.3.18/content1.1.19) adds Fourfold pattern links and stronger elemental outlines/tints; Opening Rite is now unrecallable with its bonus only on the opening turn. Policy unchanged. All188 tests and two isolated graphical suites pass, including targeted Opening Rite resource/Recall/save tests. No new AI batch or training for this small card restriction and presentation change; the prior 7×6 five-run results remain historical comparison evidence, not a new-version balance evaluation.


## Glass Choir / two-use Shield — package1.3.33

Rules1.3.19/content1.1.20; unchanged weighted-druid-v1.8. Five completed trials retained as compressed versioned decision/state archives in reports/choir-shield-evaluation/.

| Seed | Previous7×6 result | New result | Round | Decisions |
| --- | --- | --- | --- | --- |
| 825183 | Loss | Loss |20|367|
| 825184 | Win13HP | Win9HP |19|309|
| 825185 | Loss | Loss |14|195|
| 825186 | Loss | Loss |12|177|
| 825187 | Loss | Loss |19|388|

The winning Colossus run takes309 decisions versus311 previously, retains9boss turns, and ends4HP lower. Other four outcomes/decision counts remain unchanged. None reaches Choir; focused engine and graphical fixtures verify the new double-stack destruction and20LightCull death attack. This small batch does not establish balance and includes intervening Opening Rite changes since the comparison batch. No training or weight changes.

One initial825187 attempt was interrupted by Windows EPERM on an atomic archive metadata rename. Partial records remain under their original ID; retry completed under a new ID. verification-notes.json records the distinction. Summary contains the five completed exports. All189 tests and graphical checks pass; no game stalls/illegal-action failures in completed runs.


## Selectable event exchange — package1.3.34

Rules1.3.20/content1.1.21; weighted-druid-v1.9 now subtracts the particular offered card/item value from event rewards. Legal actions enumerate exact tradeItem/tradeCard UIDs from eligible owned instances, including equipped and spare gear. No new weights or training. Permanent archives include the precise selected offering.

Five completed seeds825183–187: loss/win9/loss/loss/loss; rounds20/19/14/12/19; decisions367/309/195/177/388. These outcomes and decision counts match the preceding Choir/Shield batch. Seed825186 completes one actual Bracelet trade under the new action schema; the others contain no such committed exchange. All finish without illegal moves, crashes or stalls. Detailed compressed run archives and source snapshots are in reports/event-trade-evaluation/.

All195 rules tests and isolated drag/click/cancel GUI checks pass. Focused tests verify duplicate instance identity, equipped/spare choices, socketed Gem retention, rejection of invalid offers, generic upgraded-card exchange, save/resume and AI scoring. This is a compatibility/playability check, not evidence of balance or trained strength.

Package1.3.35 replaces proximity-only links with real-effect energy connections. Rules1.3.20/content1.1.21/policy1.9 unchanged; all198 tests and graphical interaction/reduced-motion checks pass. No new AI batch for presentation only; package1.3.34 five-run evaluation remains the latest.


## Enemy elemental immunity — package1.3.36

Rules1.3.21/content1.1.22; weighted-druid-v1.10 discounts immune Burn/Poison/Corrode targets and counts susceptible enemies for area Burn. Existing weights retained; no training. Five fully archived headless seeds825183–187 completed with loss/win9/loss/loss/loss, rounds20/19/14/12/19 and decisions368/309/195/177/388. Outcomes match package1.3.34; seed825183 takes one additional decision. No illegal moves, crashes or stalls. Reports and compressed per-decision state archives with build sources: reports/enemy-immunity-evaluation/.

All208 tests pass; focused tests include AI selection of a susceptible target over an immune one, every element/status pair, charge/Fusion paths and Glare/save transitions. Packaged GUI checks all three immunities. Five runs are a playability regression sample, insufficient to establish balance.


Package1.3.37 changes only the human double-click shortcut to target the topmost displayed eligible enemy. Rules/content/policy unchanged; all208 tests and eight packaged shortcut GUI cases pass. No repeated AI batch; package1.3.36 immunity evaluation remains current.


## Optional equipment block — package1.3.38

Rules1.3.22/content1.1.23/policyweighted-druid-v1.11. New skipEquipment legal choice preserves item block and accepts remaining damage through normal Armor. Policy recognizes it explicitly and prefers usable block; weights unchanged, no training. Five archived seeds825183–187: loss/win9/loss/loss/loss, rounds20/19/14/12/19, decisions368/309/195/177/388, unchanged from immunity evaluation. All finish without errors or stalls. Compressed state/decision archives and source snapshots: reports/optional-equipment-block-evaluation/.

All212 tests and packaged skip/partial-block/multiple-hit UI checks pass. Deliberate skipping is exercised by focused tests rather than inferred from AI outcomes; five games do not establish balance.


## Death attribution — package1.3.39

Rules1.3.23/content1.1.24; policy1.11 unchanged. Five seeds825183–187 finish loss/win9/loss/loss/loss with368/309/195/177/388 decisions, matching optional-block evaluation. New structured death details name the actual source: Cinder Hart/Stampede; Shard-Walker/Shard; Dervish Hunter/Slice; Mini-Void/Gnaw. Winning run has no death attribution. The Mini-Void result demonstrates attribution within a boss encounter rather than assigning the boss automatically.

All219 tests and six packaged graphical death flows pass. Full message and structured fields persist in both desktop and headless result archives; new formatter source is included in build snapshots. Evidence reports/death-evaluation/. No combat/policy changes, training, or balance claim.


Package1.3.40/rules1.3.24 adds incoming-attack path/loss metadata, persistent waiting markers and Field portrait/circular Gold. Combat damage calculations and policy1.11 remain unchanged; lastNode metadata survives saves but does not affect decisions. All222 tests and packaged path/actual-loss/held-marker/reduced-motion/map checks pass; outgoing Ring normal/Water/reduced/Skip regressions also pass. No new AI batch or training for this presentation update; package1.3.39 death evaluation remains historical evidence.


Package1.3.41 changes only incoming orb presentation timing/continuity. Three focused traversal tests and packaged impact-time, disintegration, numbered-flight, reduced-motion, equipment-hold and Ring-origin checks pass. No rules/content/policy change, new AI batch, or training; the earlier five-run evaluation remains historical evidence.


## Positional defense and70HP — package1.3.43

Rules1.3.25/content1.1.26/policyweighted-druid-v1.12. Wards are new explicit legal actions alongside Shields/Allies/equipment. Column position limits legal choices, item block passes the grid, and Take hit preserves all unused defenses. The policy recognizes Ward absorption and favors farther columns to retain subsequent defensive options; existing weights remain, no training. New Druid runs start70/70.

| Seed | Outcome | Remaining HP | Field round | Decisions |
| --- | --- | --- | --- | --- |
|825183|Loss|0|13|225|
|825184|Win|14|19|300|
|825185|Loss|0|10|185|
|825186|Loss|0|12|175|
|825187|Win|12|20|364|

All five complete without illegal actions or stalls, with full source/version/state archives in reports/positional-defense-evaluation/. Two wins provide end-to-end playability evidence. This is not a controlled balance comparison: health, defense rules and policy changed together, and five runs are too few for a balance conclusion. All229 rules tests and direct-click/mixed-portion/passed-column GUI checks pass; normal/reduced incoming animation checks also pass.


Package1.3.44 moves the existing skipEquipment decision to the Druid portrait and pulses legal defenders. No legal-action, rule, content or policy changes; no new AI batch. Packaged mouse/keyboard portrait selection, defense preservation, reduced-motion highlights and attack traversal checks pass. The package1.3.43 five-run evaluation above remains historical evidence.


Package1.3.45/rules1.3.26 adds status-application and typed-tick presentation metadata only; content1.1.26/policy1.12 unchanged. All233 tests and packaged Poison/Burn/Corrode normal/Fast/reduced/immune/Skip visual checks pass. Counters, damage, RNG and decisions remain unchanged. No new AI batch or training; package1.3.43 evaluation remains historical evidence.


Package1.3.46/rules1.3.27 adds source-aware friendly status presentation and rust-colored Corrode. Rules counters, damage, RNG and policy are unchanged; no new AI batch or training. All237 tests pass, plus packaged curse/enemy application and stationary player-tick checks in normal/Fast/reduced/Skip modes and existing outgoing status visual regressions. Package1.3.43's five archived runs remain historical playability evidence.


Package1.3.47/content1.1.27 reduces Fire Wolf Fire Bite from Burn4 to Burn2. Actual hit/status resolution verified; all237 existing tests pass. No new AI batch or training; earlier evaluations describe their recorded versions, not this balance adjustment.


Package1.3.48/rules1.3.28 introduces tabbed catalogs and requires a visiting Healer for cursed-item removal; restricted stock cannot be bought. Policy1.12/content1.1.27 unchanged. All239 tests pass with healer legality, payment, stale-action and legacy-save coverage; packaged tabbed Buy/Sell/Healer flows also pass. No training or new full-run evaluation; older runs remain evidence for their recorded versions.


# Gentler opening Motes — package1.3.49

Rules1.3.29/content1.1.28; policy weighted-druid-v1.12 unchanged, no training. First four spawn pairs use a dedicated easy pool; Bat/Beetle/Moth spend non-damaging turns reducing next-turn resources. Full archives and source snapshots: reports/early-motes-evaluation/.

| Seed | Outcome | Field round | Decisions | Cause |
| --- | --- | --- | --- | --- |
| 825183 | Loss | 8 | 110 | Fire Bite |
| 825184 | Loss | 16 | 228 | The Bitter Crossing |
| 825185 | Loss | 7 | 71 | Whirl |
| 825186 | Loss | 13 | 150 | Whirl |
| 825187 | Loss | 19 | 345 | Void fist |

All five complete without errors or stalls. All six fights encountered during pairs1–4 were won; seed825185 encountered none. Zero wins overall: this is execution/early-progression evidence, not proof of overall balance or end-to-end victory for this version. The new pool changes RNG consumption and downstream encounters, so comparison with old runs sharing seed numbers is not a controlled balance experiment. All243 unit tests and packaged temporary-resource/map-inspection checks pass. No further tuning inferred from this small sample.


Package1.3.50/rules1.3.30 restricts both first-pair locations to the16-space radius-two perimeter around the player. Content1.1.28/policy1.12 unchanged. All246 tests pass, including100seed opening placement and exhaustive16-location checks. No new AI batch or training; the prior1.3.49 runs remain historical, and changed location RNG means they do not establish this version’s balance.


Package1.3.51 changes pause-menu navigation to autosave and return to Start. No rules/content/policy changes or new AI evaluation. Packaged Field/battle save-and-Continue checks pass; existing battle restart semantics and archived run identity are preserved.


Package1.3.52 adds eight-direction map buttons that invoke existing legal move actions. No rules/content/policy changes or new AI evaluation. Packaged GUI verifies all directions, edge/zero-movement restrictions, keyboard activation, autosave, animation locking and direct enemy entry while tile clicks retain inspection. No renderer errors; historical run results remain tied to their recorded versions.


Package1.3.53/content1.1.29 reduces Plasma Ball base damage10→8 while retaining +2 per successive pile ball. All246 regression tests pass with updated expected combat totals. No new AI runs or training; prior evaluations remain historical and do not establish balance for this content revision. Rules1.3.30/policy1.12 unchanged.


# Boss cleansing and card balance — package1.3.54

Rules1.3.31/content1.1.30; policy weighted-druid-v1.12 unchanged, no training. Conduit nets1 Channel, Kiln deals20, Archons insert conditional Purify turns, and Hymn targets combat-value stacks. All254 rule tests and packaged charge/Purify/Hymn GUI checks pass. Full versioned traces and sources: reports/boss-balance-evaluation/.

| Seed | Outcome | Field round | Decisions | Cause/result |
| --- | --- | --- | --- | --- |
| 825183 | Win | 18 | 527 | Cinder Hart defeated; 5 HP remaining |
| 825184 | Loss | 13 | 222 | Coal |
| 825185 | Loss | 20 | 266 | Antler |
| 825186 | Loss | 15 | 283 | Slap |
| 825187 | Loss | 19 | 305 | Void fist |

All five runs terminate without stalls or execution errors. One Cinder Hart victory establishes a completed run with this version; four losses and the small sample do not establish boss balance, a reliable win rate or a controlled comparison with older versions. No further tuning inferred from these runs.
