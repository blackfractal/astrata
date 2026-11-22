# Five manual Druid runs: corrected-decision follow-up

Frozen rules/content: **4.0.45**. Follow-up completed November 12, 2026. Original results remain in [report.md](report.md); detailed validation, fork rationales, equipment, purchases, and encounters are in [replay-evidence.json](replay-evidence.json).

## Conclusion

**One of the five corrected seed lines completed S4.** Seed 11112605 beat the Apex Predator on player turn 13 with **31/70 HP**, using an earned 56-card deck. The other four lines still lost: two at Black Bile, one at Cinder Hart, and one at Void-Colossus. These are selected corrections to the original five seeds, not five additional independent games or a measured 20% expert win rate.

The successful run supports the core design: victory involved resource throughput, elemental relays, different damage packages, Ideon control, recall, consumables, and deliberate destruction targets. It did not come from one universally sufficient card. It also exposed a pronounced difficulty gap between many ordinary encounters and the hardest ambushes/bosses.

**I cannot certify the goal of near-100% expert success.** I continued making some rules, routing, and execution mistakes, even after the permitted corrections. Nor do four remaining losses prove those seeds unwinnable. A much larger evaluation with consistently stronger play is needed. No balance changes were made during this assessment.

## Replay restrictions and verification

Jonathan authorized correcting clear mistakes recognizable from information available at the decision, but not using subsequently revealed Archons, events, draws, or random outcomes to change earlier choices.

- All decisions were explicit Codex selections of legal actions. No built-in policy, tactical search, or delegated player chose moves.
- The same original seeds and frozen source were retained. No HP, cards, equipment, or RNG state was edited to improve a run.
- Fourteen corrective branches were retained with their parent, exact step, and rationale. Corrections included visible pursuit geometry, lethal arithmetic, Ward isolation, Reed edge legality, Collapse targeting, and defending with grid cards before equipment.
- The successful seed has six forks, two before the endgame and four local S4 corrections. One final correction replaced a queued bracelet action that had accidentally started defending the *next* hit, locking out a prepared Ward and causing 19 avoidable damage. It changed only that defense decision.
- Earlier drafts and purchases were not revised to exploit later boss discoveries. Some earlier errors and suboptimal deck decisions were deliberately left in place.
- **4,761 logged actions across 19 original/branch segments passed legal-action and outcome checks.** Every fork's initial state matched its recorded parent prefix. The five selected full traces contain **4,125 actions and 98 encounters**; all five reproduced their terminal state exactly from the original fresh starts.
- Intermediate saved battle JSONs can differ only in `checkpoint` metadata: this engine replaces that field with a clone when loading a battle, whereas continuous verification does not reload between batches. Gameplay state matched. No in-game retry action was used. The terminal states matched in full, without excluding this field.
- Raw saves, frozen source, battle starts, and action logs are under ignored `snapshots/manual-five-20261111/`. Verification is reproducible with `node tools/review-five-replay-audit.mjs` while those local snapshots exist. Jonathan's live save was untouched.

The observation driver now includes card restrictions, enemy-specific corruption plans, Bile plans, and actual map movement descriptions. This improved on omissions noted in the original report. Failed action selectors did not execute an illegal action, but earlier successful actions in the same batch remained committed.

## Selected results

| Seed | Selected branch | Final encounter | Entry HP | Recorded turns | Outcome |
|---|---|---|---:|---:|---|
| 11112601 | 1-r1 | S2 Black Bile | 42 | 12 | Churn death; Bile 50 HP |
| 11112602 | 2-r3 | S2 Black Bile | 52 | 11 | Churn death; Bile 121 HP |
| 11112603 | 3-r1 | S1 Cinder Hart | 34 | 8 | Burn death; Hart 58 HP |
| 11112604 | 4-r3 | S1 Void-Colossus | 19 | 4 | Chaotic Glare death; Colossus 90 HP |
| 11112605 | 5-r6 | S4 Apex Predator | 70 | 13 | **Victory, 31 HP** |

The recorded encounter counter can advance before a status death. Net HP changes include healing. The paths share prefixes with the original attempts; neither shared fights nor verification replays are independent samples.

Run 2 is an important caution: avoiding the bad combined ambush and preempting Bile improved its entry from 18 to 52 HP, but did not solve the fight. Its engine still started with insufficient Focus and needed too long to establish both damage and defenses. Run 1's more informed Bile replay was not better than the original damage result. These outcomes should not be presented as optimized solutions.

## The completed run: major fights

| Encounter | Turns | HP in → out | Main observation |
|---|---:|---:|---|
| S1 Cinder Hart | 6 | 41 → 16 | Early Focus, Water Tincture on Plasma, later melding and burst beat the Burn clock. No Titan was needed. |
| S2 Trickster | 8 | 67 → 26 | A serious test of shifts, Hypnosis, and damage throughput. Some avoidable damage remained. |
| S3 Knotkeeper, ambushed | 7 | 54 → 21 | Starting Ideons behind the defense line and a bad opening created a large spike. |
| S3 Mind Hive | 15 | 43 → 27 | Took 21 HP damage and healed 5. Elves, egg coverage, Guide, and recycling were important; the final wave caused the damage. |
| S4 Cinder Hart | 4 | 70 → 58 | Faster elemental damage engine; the 12 HP loss came from Burn. No Titan was used in this revisit. |
| S4 Trickster | 8 | 57 → 35 | Took 33 damage, healed 11. Another demanding fight; a remaining defense sequencing error accounts for 10 avoidable HP. |
| S4 Knotkeeper, preempted | 5 | 70 → 70 | Better equipment and opening control changed the matchup dramatically. This is not a controlled comparison of ambush alone. |
| S4 Mind Hive | 15 | 70 → 70 | No HP damage or healing. Finished with 62 unused Ward. Clearest low-pressure boss result. |
| Apex Predator | 13 | 70 → 31 | Took 62 damage and healed 23. Required managing destruction, rebuilding, and accepting a large late hit to finish. |

The completed path fought 41 encounters. Ten of its 13 S2 encounters and seven of its 11 S4 encounters ended with no net HP loss. Those figures include healing and are strongly conditioned on this successful, increasingly well-equipped deck.

### What won the Predator fight

Quicksilver Armor enabled preemption. An attempted switch to Mirror correctly removed the extra movement step; I restored Quicksilver and entered wearing it. **The final fight was won without Mirror, Gold Bracelet, or Holy Armor.** Earlier fights did use Mirror. The proposed movement-equipment loophole was not demonstrated and should not be reported as a bug.

The meaningful sequence was:

1. Spread the initial development across rows. Use Prismatic Tincture to turn Titan **Arcane**, letting it kill the Arcane-weak Guardian efficiently. This was a different job from the usual Water/Light Titan plan.
2. Make the first Unmake destroy the row containing two spent Rites and Memory Acorn. Acorn became permanent Focus; the useful formation survived elsewhere.
3. Use Energy Guardian to swallow the first World Eater's entire **46 damage**. That was an excellent matchup-specific card, not an answer to all the other attacks.
4. Use Transmute on a fresh Bastion and Tide-to-Shield attunement with Helm of Resonance to defend the second Fire volley. Recall useful cards before the column Unmake, leaving spent cards as its target.
5. Spend damage allowances before valuable cards were destroyed. Recycle Starleaf with Undertow into a new diagonal formation. Accept the second World Eater's large HP loss after healing, rather than spend every action trying to avoid it.
6. Use Memory Draught to guarantee a starter Blast in the next draw. The final turn dealt **14 from Light Prismatic Sap plus Ring, 12 from a Light Blast receiving Resonance, and 15 from the Nausea-weakened Starleaf**: exactly the remaining 41 HP. Sunfruit healed first.

The 56-card deck was not an efficient tiny loop. Some cards were spent, frozen, or destroyed; the run depended on drawing replacements and reusing survivors. That is a positive result for Astrata's intended larger-deck economy.

## Difficulty progression

**The challenge is substantial, but the ramp is uneven.** S1 punished bad routing and slow setup; the successful deck then made many ordinary S2 encounters comfortable. S3 introduced genuine spatial pressure, particularly through ambushes and Ideons. S4 varied between easy revisits and demanding fights. The Predator was winnable without exceptional starting HP beyond the normal maximum, but was not trivial.

I would not broadly increase all S2/S3/S4 damage from this evidence. Bile still defeated both corrected attempts, and mixed ambushes were much more dangerous than their constituent enemies. Raising every number could worsen those spikes while leaving strong established engines unchallenged in isolated fights.

The strongest candidate for targeted boss investigation is **Mind Hive's preparation window**. In the S4 revisit, early control allowed a Bastion to accumulate 55 Ward, then Magnifier supplied another activation for 73. An exhausted Titan also continued growing as a defensive body, reaching roughly 49 HP before being used to absorb attacks. The final waves consumed surprisingly little of the reserve: the original Bastion ended with 62 Ward.

That was a multi-piece counter-build, and the design explicitly permits some builds to make a particular fight easy. Therefore this result alone does not justify nerfing Bastion or Titan. It does justify testing whether early Hive pressure is too easily converted into enough permanent defense to make its finale uneventful across several different decks. Prefer testing the opening pressure or wave pacing before simply adding more final-wave damage.

## Cards, equipment, and economy

| Candidate | Evidence and judgment |
|---|---|
| **Discordia Pulse** | Still the clearest weak-role candidate from the catalog: 1 Focus, 1 Channel, one use, random 1d12 to a random enemy, versus Plasma's same basic costs, 16 damage, two uses, and melding. This is a rules comparison, not a completed Discordia deck test. It needs a distinct compensating job. |
| **Opening Rite duplicates** | Three copies consistently accelerated openings without occupying normal draws. Their permanent spaces became useful destruction bait in the Predator fight. Very strong consistency support; duplicate acquisition/value deserves scrutiny, but no standalone win was shown. |
| **Heartwood Bastion + Magnifier** | Strong persistent defense, especially with a long quiet opening. The Hive reserve is the concrete concern. Against Predator, recall, element changes, limited uses, and destruction still mattered. |
| **Grove Titan** | Useful damage and a growing body even after its attacks are spent. Passive growth of an exhausted Titan deserves a separate survival-fight test. It did not solve the whole run: Hart was won without it, both Titans were eventually destroyed by Predator, and other damage finished the fight. |
| **Plasma Ball** | Both separate placement and melding had real uses. Light conversion plus melding supplied efficient late boss damage. Random targeting was a liability around Hive and other Ideons; it is not an unconditional attack solution. |
| **Thought Bulwark + large reveal + Resonance** | Produced 28 Light Guard in the Predator fight for two Channel. Strong synergy, but it required draw, an activated attunement source, equipment, and correct timing. A good multi-piece engine example. |
| **Bloom and Sunfruit** | Two Blooms plus Sunfruit healed 23 during Predator. Finite per-battle healing is working, but duplicate Blooms are attractive sustain picks and can reduce attrition between bosses. Watch acquisition/draft rate before reducing all healing. |
| **Helm of Resonance** | Helped both defense and offense, including a starter Blast finisher. Its once-per-turn bonus rewarded activation ordering rather than merely raising all attacks. Strong, interesting equipment; not proven excessive by this run. |
| **Energy Guardian** | Absorbing World Eater was spectacular and appropriate for its specific purpose. It could not handle the repeated split-element volleys or destruction. No general nerf supported. |
| **Resource equipment** | The successful engine reached about 3 base Focus / 4 Channel before temporary or battle boosts. Three free Storm Opal drops in S3 provided considerable flexibility, including sale value. One seed cannot estimate drop frequency, but resource-gem availability remains an important consistency lever. |
| **Gold Bracelet / Mirror** | No Gold Bracelet was acquired in the winning line. Mirror helped earlier, but Quicksilver was better for the final preemption. These results argue against treating either item as mandatory. They do not measure their relative power in otherwise identical builds. |
| **Scorched Resolve, full-line formation payoffs, Enhance cards** | Often unattractive to this particular resource-limited or destruction-sensitive deck. That is not enough to call them universally bad. I did not demonstrate a completed engine centered on these cards. |

Two economy/content checks are more concrete than global damage tuning: the S2 event Bell Beetle had only **21 HP / a 4-damage attack**, and the Graftkeeper event offered Conduit for **25 gold**, compared with the observed 100-gold shop price. Discounts and easy events can be intentional; these are candidates to review for accidental old-Stratum scaling or excessive value, not confirmed bugs.

## Different engines actually used

- **Burst conversion:** Opening Rites establish placement, Focus supports later turns, Conduit/Dawn supply activation throughput, and converted/melded Plasma turns that throughput into a short boss damage window. This beat S1 Hart.
- **Elemental relay:** A printed or Transmuted source feeds an activation, that activated card feeds another attunement, and Resonance rewards the order. Tide → Water Shield and Sap → Light Blast were concrete defensive and offensive uses.
- **Draw-to-defense:** Clear Mind/Tide and reveal size support Bulwark; Dawn borrows Channel at a future draw cost. These are interacting resource choices, not interchangeable flat bonuses.
- **Survival/control:** Elves remove dangerous eggs, Guide/Needle kill specific Ideons, cheap cards cover other eggs, Bastion stores defense, and exhausted Allies remain bodies. This carried both Hive fights.
- **Formation reuse:** Starleaf uses existing diagonals, Undertow refreshes it and moves it to a new formation, while spent cards remain useful neighbors or destruction bait. The final Predator damage combined this with a guaranteed starter Blast.

These are multiple tactical engines **within one completed deck**, plus partial engines in the other seeds. They do not yet prove that five substantially different Druid archetypes can all win reliably. There was too much shared reliance on generic resource throughput to make that broader claim.

## Recommended next steps

1. Keep the Predator unchanged on this evidence. Its alternating destruction rewarded planning, and a legal earned-deck win exists with a meaningful HP cost.
2. Investigate Discordia's role and the specific event scaling/prices above.
3. Test Hive's early preparation window with several different survival/control builds. Distinguish an intended favorable matchup from a generally ineffective finale.
4. Compare resource acquisition and boss pressure across held-out seeds. Do not conclude that all S2 bosses need more damage when Bile remains a bottleneck in the tested lines.
5. Establish stronger repeatable play before reporting an expert win rate. Remaining errors included mistaking ordinary Recall for Undertow, putting Elves directly on Insanity when it prevents activation, and over-batching defense reactions. Those errors are controller limitations, not evidence for enemy nerfs.

The beginner goal also needs actual beginner playtests. These runs show demanding rules and spatial decisions; they cannot tell us whether a new player finds the difficulty understandable, motivating, or merely confusing.
