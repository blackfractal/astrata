# Seed 655758646: rebuilding faster than Bombadier can dismantle the board

Jonathan's completed run `ca4e323d-1d30-459f-93e6-202d49aa17d2`, reviewed 2026-10-11. Won both available Strata, 25 encounters, 33 HP remaining; 31 cards entering the final fight, 32 after the reward. The final encounter included Bellows Grub and King Bombadier, with an enemy-first opening. Winning attempt lasted 13 player turns: 70 starting HP, 50 damage taken, 13 healed (Holy Armor 4, Bloomcall 9), ending at33.

This is a strong recovery-engine run, not evidence that every stage was easy. Dervish took70→29 in8 turns; Glass Choir66→16 in9; Censer Engine61→38 in10; Bombadier70→33 in13. Some other encounters became healing opportunities, notably Spoolkeeper57→61 and Borrowed Hands42→47. Spoolkeeper was fought with its old two-space cap, so that encounter cannot assess the new ten-space cap.

## Evidence and limits

Full trace and final result are preserved here. The run spans packages2.1.23,2.1.25,2.1.27,2.1.29. The completed boss fight used rules2.1.16/content2.1.22, BEFORE the elemental Ward fix. The frozen recorded gameplay sources are in build.json and replay/. No new rules were applied to the tactical comparisons. analyze.mjs replays all162 actions of the final winning attempt (archive1258–1419 after resume1257), checking player and enemy HP after every action.

Archive includes abandoned attempts: Censer and Borrowed Hands were restarted, as was Bombadier after an initial two-turn setup. Boss totals here exclude the abandoned Bombadier branch1231–1256. Action-effect damage can include overkill; boss-analysis.json records raw amounts separately from capped HP lost. Ally impact amounts are damage arriving at the Ally, not necessarily damage stopped; use recorded HP loss rather than summing these as mitigation.

Counterfactuals are retrospective legal lines, not optimality proofs or a claim of perfect-information play. No normal save or gameplay balance was changed for this review.

## What worked

- **Bomb management was excellent.** Five mines were repaired; five were covered and sacrificed Sapling, Clear Mind, two Blasts and Focus Energy. No uncovered mine dealt20Fire in the winning attempt. The final pair remained armed when the boss died. You used some covers before losing them: Sapling attacked/intercepted, Clear Mind drew more cards. Elves kept crucial spaces usable without requiring every Corruption to be repaired.
- **Defensive elemental relays mattered.** The initial Water Shield passed Water to the second Shield and then to Blast. Across the fight Shields stopped80 incoming damage. Later Steam rounds needed both elemental and neutral defense, not simply Water everything.
- **Foundation cards kept doing useful work.** Fourfold Grove's intact2×2 and Water Transmute produced18 direct damage per activation:72 over four activations, plus equipment procs. The upgraded Water Blast contributed repeated efficient damage. Existing cards acted as formation anchors and attunement sources even after spending their uses.
- **Recall and Undertow sustained the board.** Six ordinary recalls and five Undertows refreshed Shield, Wild Conduit, the Ward pair, Fourfold, Water Blast and Kiln. By turn12 both draw and discard piles were empty at the key decision. Most of the31-card deck was on the board or Destroyed; the few recycled cards returned immediately. Large owned deck, tiny late-battle draw loop: this is a distinctive Astrata strategy.
- **Anger became partly useful.** Four forced Wild Conduit activations each gave net+1Channel; other forced actions generated Ward, Shield Guard, a Cinder attack and9 Bloomcall healing. You did not have to repair every Anger. On turn8, Anger used Conduit, then Undertow reset it, allowing another Conduit activation later that same turn.
- **The last offensive push was decisive.** Turn12 dealt68 combined attack/status damage, reducing Bombadier93→25. Taking damage to ensure a next-turn kill is defensible. The improvement is in spending otherwise unnecessary defenders, not automatically replacing the offensive plan with more stall.

## Verified improvements

| Decision | Recorded result | Verified alternative | Limit |
|---|---|---|---|
| Dervish opening | Win turn8,29HP | Previous study wins turn4,45HP;53 with Focus Draught | See ../dervish/README.md; retrospective draws |
| Turn3 vs Grub/Bombadier | Grub survives at5; next turn52HP | Drink owned Channel Draught; keep Storm/Water Shield/Water Blast actions, add Thorn Eruption to kill Grub. Defend to reach turn4 at63HP with both Elves alive | Upgraded Elves are at1HP instead of11; this is not a full-fight superiority proof |
| Turn6 offense | Mend, Transmute Grove, Water Grove:20 immediate damage | Same Mend, then ready Kiln and upgraded Water Blast:38 immediate damage and Burn2 | Delays Grove's lasting setup; continuation not optimized |
| Before final battle | Holy Armor supplies4 healing | Equip already-owned Water Armor before moving to the item; same card actions and additional Armor defenses win turn13 at40HP | Complete legal replay; equipment change costs no Gold |
| Last Steam Wind hit | Take12; win33HP | Use1HP Elves at row1col4, then4HP Elves at row5col3, then take7; replay original final moves and win38HP | Complete legal continuation; no further repairs needed before lethal |

The potion and Armor were already owned. They were not hypothetical shop offers. Channel Draught and Focus Draught both remained unused at victory. Conserving them has value in a future longer run, but in this build's final boss an immediate survival/tempo benefit deserves more weight.

The120Gold Thorn Eruption upgrade did not pay off against Bombadier: Thorn was placed on turn3, remained without damage-dealing neighbors, stayed Earth against Fire, and was never activated in the winning attempt. This is poor formation utilization in this fight, not proof the upgrade/card is weak. It could have supplied the exact extra turn3 kill above. It also existed before the S2 choices, so the shop decision should not be judged using future information alone.

## Balance candidates, in priority order

### 1. Undertow plus Kiln placement charges

Kiln stood beside two Fire sources and started fully charged. It fired on turns9,12,13 without ever using a charging activation. On turns12 and13, Undertow cost1Focus and re-placing Kiln cost2Focus; re-placement immediately restored both charges and the allowance. This converts3Focus into avoiding two charging actions, allowing another20-damage release for1Channel (22 with the two equipment procs), plus Burn2.

This is the most suspicious interaction: the deck repeatedly bypasses the defining charge cost rather than merely increasing damage. However, it still needs two Fire anchors, Undertow in hand,3Focus, a safe placement space and1Channel. It is not infinite and should not be described as free. It also realizes Jonathan's desired high-Focus/low-Channel archetype, so do not erase it indiscriminately.

First small balance experiment: Kiln Recall1→2. Undertow+re-place then consumes4Focus instead of3. This preserves the interaction but competes more directly with defense rebuilding. If still dominant, revisit whether placement charges can be repeatedly restored within a battle. That is a larger rule exception and needs explicit design approval. Do not globally nerf Undertow solely from this one pairing.

### 2. Passive resource equipment and extremely fast recycling

Final opening resources were5Insight/4Focus/3Channel. Two socketed Amber Thoughts and Ring of Patience supplied three of those Focus, without drawing or activating Focus Energy. Across13 player turns, that is39 extra baseline Focus compared with the Druid's1. Rain Lantern only needed one manual activation; Focus Energy was used as a bomb cover and never activated. Four Amber Thoughts appeared during the run, including spare ones beyond the two used.

Storm Opal cost100Gold, plus35 to socket, versus150 for Wild Conduit, which must be placed, drawn, used and refreshed. Opal's permanent Channel removes substantially more setup friction. I would test rarer resource Gem access and/or a higher price (e.g.200Gold for Opal as an experiment) before cutting foundation card damage. This run does not establish a statistically balanced price. Midpoint shop timing and other purchases mean a price change has real opportunity costs.

### 3. Anger plus Wild Conduit

Anger ranks utility cards cheaply, but a forced Conduit is a resource gain rather than a waste. Its before-Placement timing additionally permits an Undertow reset and a second activation that turn. Four forced and four manual Conduit activations occurred in the final fight. This is clever play; occasional beneficial Corruption outcomes are good. The repeatable engine is what merits scrutiny.

If Anger is intended to be reliably harmful, revise how it values Channel generators or how forced activations interact with same-turn resets. Do not silently change the global Recall allowance rule. Another reasonable decision is to preserve this as deliberate counterplay and price Conduit/refresh access accordingly.

### Things I would not nerf first

- **Gold Bracelet:** it stopped49 damage in this fight, very strong, but Shields stopped80. The Bracelet was an item reward, not a300Gold purchase; raising its store price would not affect this run. Availability matters as much as price. One long fight is not proof7Guard is balanced, but the sustain/refresh engine is more distinctive here.
- **Fourfold + Transmute:**18 direct damage per Channel is strong, but needs a2×2 formation,1Focus placement, a Transmute activation, and re-Transmute after Recall. It rewards the intended foundation/formation gameplay. If testing a numeric nerf, Fourfold base6→5 preserves the identity while lowering formed Water damage18→15. I would test this after the resource/refresh interactions rather than nerfing Transmute globally.
- **Machine Elves:** two copies earned their place. They spent5Channel to defuse5 mines, performed interception, and competed with attacks. Successful bomb answers should remain rewarding.
- **Thorn Eruption:** its recent offensive-neighbor requirement already made it unproductive in this formation. No evidence from Bombadier for another nerf.

The Water Ward bug made the run harder, not easier: the reported16WaterWard→1 result should have left6 under the later fix. Do not credit that fix for this win. Likewise this fight did not reach the four-completed-cycle bomb-count escalation; it cannot evaluate the three-mine pressure phase.

## Suggested commit message for the current uncommitted round

```text
Polish card art and battle UI; fix elemental Wards and Continue

- Refresh Cinder Snap, Familiar and Sapling artwork, preserving prior revisions
- Preserve Shield attunement when confirming activation
- Apply elemental defense to Wards and update previews, AI and design rules
- Raise Spoolkeeper's Corruption cap to ten and restore save compatibility
- Clarify Draw/Discard/Destroyed, show Grimoire totals, and fit the Jeweler satchel
- Record Dervish practice replay, completed-run analysis and verification evidence
```

This describes the actual working diff rather than already-committed Meld redesigns. No commit or push was performed.
