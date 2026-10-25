# Manual full-run assessment — complete

Requested: personally choose a fresh run's actions, assess S1–S4 progression and major bosses. No rule changes. Live player save untouched. Runs use frozen source snapshots and legal actions, no AI policy or future draw inspection.

## Attempts

- Seed 24102501: lost to Cinder Hart in S1. Entered at 23 HP after costly grouped ambushes. Several manual mistakes (Rootwall/Reed formation, Rain Lantern effect, Burn attribution) contributed; not evidence that Hart needs nerfing. Full decisions and final state in `codex-growth-manual-24102501`.
- Seed 24102502: won S1–S4, ending at 63/70 HP after defeating the Apex Predator on turn 11. All 1,908 decisions are in `codex-growth-manual-24102502`. Driver `tools/codex-oct25-manual.mjs` is manual legal-action selection, not a policy. No retries or manufactured state within this run.

## Final assessment

Frozen rules/content version: **4.0.22**. Both attempts replayed exactly from their initial states: 347 legal decisions for the first loss, 1,908 for the full victory. Every recorded HP/gold/mode checkpoint and the complete final states matched. See each run's `replay-audit.json`; rerun with `node tools/codex-oct25-audit.mjs`.

| Fight in winning run | Turns | Player HP | Assessment |
| --- | ---: | --- | --- |
| S1 Glass Choir | 8 | 61 -> 51 | Meaningful early fight; some loss was my defense mistake. |
| S2 Black Bile | 8 | 70 -> 70 | Large safety margin with this equipment and repair engine. |
| S3 Cnidarian | 10 | 70 -> 50 | Strongest sustained attrition in this run; escalating replacements mattered. |
| S4 Void Colossus | 5 | 70 -> 70 | Efficient elemental burst and Mirror made this comfortable. |
| S4 Trickster | 7 | 70 -> 46 | Meaningful disruption; 11 damage was an avoidable Hypnosis mistake. |
| S4 Mind Hive | 15 | 70 -> 70 | Complicated late board, but Egg coverage and accumulated defense were sufficient. |
| Apex Predator | 11 | 70 -> 63 | Beatable with substantial margin for this strong recovery deck, despite mistakes. |

This was **not a smooth rise in HP pressure**. S2 and most ordinary S3/S4 encounters were easier than S1 once 11 recurring equipment Guard and healing came online. Cnidarian and Trickster produced genuine pressure; Hive and Predator were complex but well answered by the acquired deck. These are results for selected encounters, not a claim about unplayed bosses such as the Cannon or Bombadier. The failed first seed and the free early Gold Bracelet/Titan in the winning seed are important limits on any balance conclusion.

### Highest-priority balance observations

1. **Early premium equipment access matters more than another price increase alone.** The Gold Bracelet was free. Together with Silver it provided 11 recurring neutral Guard, while limited healing erased small losses in ordinary encounters. Review early premium-drop availability and ordinary S2 pressure before increasing every boss indiscriminately.
2. **Second Spring + a grown, transmuted Titan deserves focused comparison tests.** Two Springs restored four extra Titan uses without removing its grown HP or Light element. Titan dealt 267 damage to the Predator across seven attacks, including a Fury-boosted 69. This was a multi-card engine supported by resources, defense, repairs, Mirror and other attacks; this run does not establish that Titan/Transmute alone solves the game or is mandatory.
3. **Mindfire is an especially efficient late-game outlet for spare Focus.** Zero Channel for up to 30 damage repeatedly helped finish encounters; the final Predator draw supplied the last burst. Test it in high-Focus builds alongside Undertow before deciding on a nerf.
4. **Mirror and Energy Guardian strongly answer individual large hits.** Mirror reflected the full 42-damage World Eater. Guardian swallowed one 23-damage Fire hit. Split attacks and removal still constrain them; neither was a universal answer.
5. **Rootwall remains unusually efficient when its formation holds.** Its 16 Guard for one Channel was excellent in Hive, but card movement and my own flank placements repeatedly disabled it. Thought Bulwark gave flexible 18–24 Guard for two Channel and helped handle the Predator's attack sequence.

No card in this run warrants the claim "never take this." Kiln was too slow for several short fights and was sometimes only useful as Egg coverage, but that is a context problem, not proof it has no role. Plasma's random targeting is a meaningful drawback around Ideons; separate placement was useful, and this run did not demonstrate a need to meld it. Prismatic Sap's 8/4 remained useful support without dominating. Canopy Break delivered large successful hits earlier but failed completely when I overlooked Insanity's broken connections in the final fight. Two Eclipse Seeds were helpful against Hive's opening larvae, yet did not replace late Egg coverage or Drone management.

### Issues to review, not changed during this run

- Wild Inspiration's free Thought Bulwark activation lost its Guard immediately when the potion discarded the card. This makes an apparent defensive hit ineffective.
- Second Spring's "strongest first" selection can use the current value of spent attacks (often zero), producing unintuitive board-order choices. Confirm the intended ranking before changing behavior.
- A visually full row containing an Insanity-frozen card fails Canopy Break's formation. The rule is consistent with broken connections, but the UI should make that cause especially clear.

No balance or game-rule edits were made. All remaining sections are chronological notes; their earlier "pending" statements describe progress at that time. The final replay audit above supersedes them.

## Second attempt findings through S2

Important luck: free Gold Bracelet in S1, free Grove Titan immediately before Choir, several free resource gems. This is a strong equipment run, not a representative sample.

### Glass Choir

Player first, 159 HP, killed turn 8. Player entered 61 HP, finished 51; Holy Armor healed 4. Recall protected Corner Flame from Hymn. Titan placed after the second Hymn on turn 7; Titan, Thorn, Corner provided burst. Energy Guardian completely absorbed Final Note. An avoidable defense mistake on turn 6 let a 9-Wind hit through despite remaining equipment capacity; this loss must not be attributed entirely to boss tuning. First Hymn destroyed two Blasts; later Hymn destroyed a Shield and Cinder.

### S2 ordinary fights

Entered with 3 Focus/3 Channel after selling Bronze+Sapphire and Topaz, socketing spare Focus in Silver, buying/sock­eting a second Rootbound Ring with Channel. Gold/Silver supplied 11 recurring neutral Guard. Holy Armor two 2-HP heals. Picked Bloomcall after the first S2 fight.

- Loop Moth: turn-1 Titan Earth 30 + rings 4 killed its 34 HP before Insanity. No loss.
- Thread Mite: two turns, no loss.
- Sourcap + Thread Mite ambush: five HP lost on ambush, no further player damage; full HP at victory after Holy Armor and Bloomcall. Four turns. Focus/draw/Ward setup, elemental Sapling defense, Titan and Thorn finished.
- Single Sourcap: two turns, no loss, Fire Corner/Blast chain.
- Borrowed Face (96 HP): three turns, ended full HP; Titan and Blasts, Rootwall used as Insanity cover. Equipment/Holy Armor erased one incoming damage.
- Seamstress (132 HP): five turns, full HP. Ward and shield setup, Titan, Chaos Lattice as Blast source, Undertow refreshed Blast, spent Titan intercepted Unravel. Corruptions required placement care but did not threaten player life.
- Frayed Hound ambush: five initial HP + two from Bound, four healed; 70→67. Three turns, Eclipse release killed.
- Bellows Grub: three turns, 62→66 through Holy Armor; Water Blast chain from Tide handled damage. Equipment and Water Shield covered attacks.
- Censer Engine (144 HP): five turns, 66→70. Covered first Mine with free Tide; later Mines never hatched because lethal. Unfavorable Earth-heavy opening still safe. Lattice Water source, Corner/Cinders, Eclipse and Solitude finished.
- Loose Echo: two turns, no damage; Light Solitude weakness and Fire-row Ignis/Corner.

Midpoint: Tools + 100 Gold upgraded Elves. Sold redundant armor/gems, paid 180 to socket Channel in Gold, traded Sturdy Helmet for Mothlight Crown. Entered boss with 5 Insight/3 Focus/4 Channel, 11 equipment Guard.

### Black Bile

276 HP, player first, 70 HP entry. Killed turn 8, finished 70 HP, minimum 63. No consumables used. Titan appeared only on final turn for finishing damage: this was not an early-Titan solution.

- Fire row: Ignis, two Cinder Snaps, Corner Flame; 41 damage on each of turns 2 and 3.
- Elves at far right intercepted three Bile applications and automatically returned to discard. Returned later and repaired Nausea interfering with Rootwall.
- Utility cards covered Nausea, leaving damage cards unaffected. Spent cards retained useful adjacency/source roles.
- Fire Lattice melded beneath Ward; Bile spent its remaining activation, but stored Ward defended afterward.
- Undertow refreshed Corner and later Rootwall. Full vertical Rootwall formation provided 16 Guard, with equipment covering the remainder.
- Manual mistake: recalled Ignis before using its Fire connection; switched to neutral Blast + Clear Mind when legal actions exposed the lost attunement. No rollback.
- Eclipse charged for a turn-8 release, Ignis returned to Fire row, Bloomcall healed remaining seven HP, fresh Titan finished.

Assessment so far: S2 mechanics demanded thought, but this strong equipment build had a very large survival margin. Equipment plus once-per-battle healing makes ordinary fights recovery opportunities. Bloomcall is not infinite healing, yet its value is substantial. Rootwall's 1-Channel 16 Guard and Undertow recycling are strong. No balance changes made from this sample.

## S3 entry

Second Eclipse chosen at boss reward; Ring of Patience and Channel gem awarded. At inter-Stratum shop: socketed Channel in Patience (120), replaced/sold Channel Rootbound Ring, sold Emerald, bought Necklace of Dew (90) and Lucid Needle (100), socketed spare Channel in necklace (60). Now 5 Insight/4 Focus/5 Channel, damage ring +2, Gold+Silver Guard11, Holy Armor + Dew two triggers each. 70 HP, 12 Gold. One upgraded Elves, no Transmute. Two Eclipse Seeds. Driver step689, `depthsIntro`; next action `enterDepths`.

Replay verification and final report remain pending until run completion.


## S3 results (second manual attempt)

Reached Cnidarian at full HP, round 16, player-first, 324 boss HP. Prior ordinary encounters generally took 2–3 turns and returned to full health through equipment healing. Borrowed Oracle event took five turns and finished 65 HP; targeted Lucid Needle removed its Guardian efficiently. One mixed Blind Seer/Glass Brood battle and a subsequent Brood took four turns each, but Bloomcall erased their losses.

New discoveries:
- Anger used the first-attack ring bonus before my chosen attacks; I miscounted a lethal by 2. No rollback.
- Plasma Ball can randomly hit Ideons. An attempted owner lethal instead killed an insect, extending the fight. This is a real targeting tradeoff.
- Several manual formation mistakes (Solitude beside Bloomcall; covering Nausea on Rootwall's flank) were caught by legal-action validation. Illegal requests did not mutate state. These are play mistakes, not evidence of enemy overtuning.
- Wild Inspiration drew Thought Bulwark during Cnidarian. The free activation produced Guard, but discarding its owner removed all of that Guard; shields=[] and bodyGuard=0 immediately afterward. Likely supply/defense interaction to review, not fixed during this run.

### Cnidarian: victory on turn 10, 70 -> 50 HP

Six tentacle kills including early Guide and Eclipse releases escalated the replacements. Two Seeds provided early damage/control; one was transmuted to Wind. Elves repaired Nausea and were recalled before dying. Magnifier revived a depleted Ward, and Lattice changed it to Wind, but neighboring cards prevented further isolated Ward activations. Rootwall and chained Wind Shields carried several rounds.

A Wind-transmuted Titan entered on turn 6, dealt useful damage, then was worn down and killed by tentacles. It did not solve the fight. On turn 9 I completed a full lower row and used adjacent Wild Conduit to attune Canopy Break to Wind: 84 damage plus the ring bonus. Bloomcall healed 9 but destroyed itself, breaking the row. On turn 10 a Blast filled the vacated slot; even Nausea-halved Wind Canopy Break finished the remaining 25 HP.

Used one Wild Inspiration (ineffective defensive result noted above). No healing potions used. Net loss 20 HP despite 6 equipment healing and 9 Bloomcall healing, approximately 35 player damage over the fight. This was a much stronger difficulty step than Black Bile. Fire-heavy draws, my formation mistakes, and the escalating replacements all mattered. Kiln was placed late but never activated; not enough time to charge it.

Boss reward: Mindfire, Quartz, Reclaimer bracelet. Before S4 healed 20 HP for 50 Gold, sold Reclaimer and spare resource gems to retain existing socketed Focus/Channel equipment, replaced Holy Armor with Mirror Armor, bought second Wild Conduit, Fury Sap and Channel Draught. No balance edits. Next: enter Apex, driver step1195. Final replay verification still pending.

## S4 ascent (second manual attempt)

- Floor 1: Undead Wolf, 88 HP, two turns with no player damage. Water Plasma plus Mindfire; Mirror absorbed its attack. Void Colossus, 257 HP, five turns, 70 -> 70. Banked Ward early, spent damage cards before their column collapsed, reflected the 25-damage Collapse with Mirror. After Glare changed it to Light, a full-row Canopy Break transmuted to Chaos dealt 84 and finished it. No supplies used.
- Floor 2: two Thread Mites and a Sourcap ambush were both handled without lasting damage. Trickster, 349 HP, seven turns, 70 -> 46. Mirror reflected opening Light into its Chaos weakness. Recalled a Hypnosis target but mistakenly replaced it with Ignis: later forced activation caused 11 avoidable self-damage. Accepted another substantial hit to preserve Titan; Bloomcall healed four. Second Spring restored spent attacks and enabled the finish. No supplies used.
- Final Tavern: restored to 70 HP, sold duplicate Mirror, replaced damage ring with a second Ring of Patience, moved Focus gem into it. Base resources now 5 Insight/5 Focus/5 Channel; equipment Guard remains 11. Upgraded Lucid Guide and bought another Channel Draught and Healing Sap. Lost the first-attack +2 ring bonus. Glass Brood afterward took three turns, no HP loss.
- Floor 3 Mind Hive: entered at round 6 with ten opening larvae; survived all 15 battle rounds, 70 -> 70, no consumables. Two Eclipse releases helped initial and middle waves; targeted attacks handled Drones. One upgraded Machine Elves repaired two Drone Eggs across separate draws, then cycled via covering another Egg. Titan supplied damage early and a large reservoir of defense after its uses ran out. Rootwall repeatedly supplied 16 temporary Guard, Ward banked 31, Mirror stopped a final 20-Chaos Drone attack. Egg coverage used many cheap utility/spent cards. Insect swaps sometimes exposed previously covered Eggs, requiring reactive defense. Several Solitude/Rootwall formation mistakes were made without rollback. Selected Fourfold Grove reward and ascended immediately, before the other Archon hunted.

Second Spring issue to review: its strongest-first selection evaluates spent cards using current stack value, which can be zero, leaving board order to decide between several printed high- and low-power attacks. The observed restores did not reliably match the intuitive strongest printed cards. No implementation change made.

At step 1733: Apex floor 4, 70 HP, all healing supplies and Fury Sap retained, two Channel Draughts. Gold 243 cannot be spent here. This deck's equipment and breadth made most ascent encounters comfortable. Cnidarian and Trickster imposed meaningful losses; Hive became primarily an Egg-coverage and defense-allocation test, with considerable remaining margin. Final Predator fight and replay audit pending.

## Apex Predator: victory on turn 11, 70 -> 63 HP

Opened with Titan and three growth neighbors, taking seven Earth damage rather than reducing Titan HP. Necklace restored two HP across the first two rounds. Water Lattice melded beneath Magnifier produced 16 Water Ward and efficiently handled both initial Fire hits. Arcane Mindfire and Lucid Guide removed Sentinels. Spent-card placement kept the first Unmake on an expendable row; recalled the depleted Ward meld and reusable Thorn beforehand.

First World Eater exposed a major manual mistake: I placed Canopy Break to complete a row, overlooking that the Insanity-covered Blast could not connect. Canopy never activated and was destroyed along with a partly charged Eclipse. No rollback. Mirror reflected all 42 World Eater damage. Renewed Burn forced a Purify turn, used for Second Spring, extra Focus and a Hypnosis repair. A second mistake was expecting the repair to finish before that enemy phase: Guide still attacked through Hypnosis, costing a spent Ember Guardian and six player HP after equipment.

Adjacent Transmute changed Titan to Light on turn 8. Fury Sap then boosted it to 69 damage; Solitude added 15. Fire-attuned Thought Bulwark answered the enraged Earth hit. Energy Guardian swallowed one next-round Fire attack; neutral Bulwark and equipment handled the other. The second Second Spring restored Titan again; one saved Channel Draught allowed its attack and Bulwark in the same round. Familiar, Elves and Guide absorbed the next mixed sequence while preserving Titan. On turn 11, Titan dealt 48, a redrawn Mindfire converted three spare Focus into 30, and Corner Flame finished the remaining five before Unmake V.

Total player damage in this fight: 16; healing: two from necklace and seven actual from Bloomcall. Finished 63 HP. Used Fury Sap and one Channel Draught; healing potions and the other Channel Draught remained. Titan's seven attacks dealt 20, 23, 26, 69, 39, 42 and 48. This win relied on restoration and preservation of a developed engine, not a second fresh Titan or unlimited healing. Finished with 57 deck cards including the final Prismatic Core reward.

Final verification: both exact replays passed; outcome `win`, step 1908, 63 HP for seed 24102502. Live player profile was not modified.
