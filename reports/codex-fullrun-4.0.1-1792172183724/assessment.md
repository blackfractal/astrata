# Manual S1–S4 playthrough assessment

Seed: **885553835**. Frozen release: **4.0.1**. Completed October 16, 2026.

## Outcome and method

The run defeated 49 encounters, completed Strata 1–3 and all three Apex gate floors, then died to the Apex Predator's **World Eater on turn 18**. The Predator had **181 of 640 HP** remaining. The player entered that final battle at 70/70 HP.

Codex selected legal actions in a visible, isolated Electron window, with at least 500 ms between submitted actions; thinking and animation added longer pauses. Jonathan handled part of the opening Spark-Wisp battle before handing control back. No policy chose moves, no rewinds were used, and no balance rules were changed during the run. Decisions used public observations and legal actions rather than future draws or RNG state. The ordinary player profile was not used.

This is one natural run with an increasingly strong build, not an optimal-play proof or a statistical balance test. Several substantial mistakes are documented below. A loss here does not establish that this seed or final fight is unwinnable.

## Difficulty progression

| Segment | Encounters | Total battle turns | Encounters ending at equal/higher HP | Sum of HP at start minus HP at end |
| --- | ---: | ---: | ---: | ---: |
| S1 | 10 | 35 | 3 | 54 |
| S2 | 14 | 39 | 11 | 4 |
| S3 | 15 | 41 | 12 | -4 |
| S4 gate floors | 10 | 27 | 10 | 0 |
| Apex Predator | 1 | 18 | 0 | 70 |

These are **net encounter HP changes**, not damage taken. Healing can conceal damage. Map healing and tavern healing are outside these per-encounter deltas. The recorded whole-run damageTaken counter is 227.

The desired gradual ramp did not appear for this build. S1 created meaningful attrition, S2 became easier as the engine and equipment accumulated, S3 demanded more spatial planning but often allowed full recovery, and the S4 gate climb ended every fight at full HP. The Apex Predator then presented a very large jump in endurance and card attrition.

| Main boss | Turns | Player HP | Notes |
| --- | ---: | --- | --- |
| Glass Choir, S1 | 10 | 41 → 28 | Final Note mattered; saved defenses still left 8 HP damage from the death attack. |
| Black Bile, S2 | 5 | 70 → 66 | Fire-transmuted attacks and the developed engine shortened the fight; Burn caused the remaining loss. |
| Refraction Cannon, S3 | 7 | 70 → 70 | Mirror Armor reflected the first 40-damage Final Blast. Healing recovered other damage. |
| Cinder Hart, S4 floor 1 | 4 | 70 → 70 | Water conversion, Plasma, Titan and healing overcame Burn attrition. |
| King Bombadier, S4 floor 2 | 5 | 70 → 70 | Elemental sequencing and mine repairs were real decisions, but sufficient resources covered them. |
| Cnidarian, S4 floor 3 | 6 | 70 → 70 | Eclipse controlled nearby tendrils; recalls avoided replacement eruptions; Wind offense ended the fight. |
| Apex Predator | 18 | 70 → 0 | Destruction, Corruptions, guardians and repeated multi-element attacks eventually exhausted the engine. |

The three S4 ascents happened at floor rounds **6, 5 and 6**. Taking one gate boss and leaving before the hunt worked comfortably. I did not attempt I Stand Alone, paired Archon battles, or clearing every spawn.

## Build and economy

The final deck had **58 cards**, including two Grove Titans, four Plasma Balls, four Wild Conduits, two Transmutes, two Opening Rites, two Living Lattices, two ordinary Wards, Heartwood Bastion, two Machine Elves, two Bloomcalls, Soothe, Undertow, two Eclipse Seeds, and upgraded basic Blasts/Shields. Both Lucid Needles and Solitude were upgraded. Having a large deck was useful against destruction, but leaving spent cards on the grid prevented those cards from returning to the draw cycle.

The player entered S4 with **10 Insight, 4 Focus, 4 Channel**, two Gold Bracelets supplying **14 Arcane Guard per round**, Mirror Armor, and resource equipment/gems. Opening Rites boosted the first placement turn. Focus Energy increased subsequent Focus further. The run earned 3,218 gold, spent 2,965, and ended with 253.

### Strongest balance candidates

1. **Mirror Armor deserves the first focused review.** Its repeatable value across battles canceled many opening ambush hits, and reflecting the Cannon's 40-damage Final Blast provided both substantial prevention and offense. The item mattered before the second Gold Bracelet existed. Review its price and per-battle value before concluding that Gold Bracelets explain everything.
2. **Equipment plus healing erased attrition.** Two Gold Bracelets were powerful, but Bloomcall, Soothe, Necklace of Dew and healing supplies turned several imperfect battles into equal-HP finishes. A heal being single-use within each battle still permits substantial recovery across many easy encounters. Avoid labeling all 70→70 fights flawless.
3. **Transmute plus a large attack is broadly strong.** Titan and Plasma could exploit weaknesses across different bosses. Transmute currently targets any placed card; it is not limited to adjacency. Jonathan's adjacency question suggests a potentially useful restriction to test, but none was applied. The final boss destroyed both Transmutes and both Titans, so this run did not demonstrate that the pair solves the whole game.
4. **Plasma Ball has unusually efficient damage per Focus and Channel.** Its 16-damage base attack and meld scaling were valuable through several strata. Random selection can hit an Ideon instead of the main enemy, which was a real drawback in the final battle. Test it with and without Transmute rather than evaluating only favorable elemental shots.
5. **Conduits, Rites and resource gems compound.** Multiple Conduits let one turn include damage, defense, repair and healing. Frequent resource-gem opportunities helped establish the engine early. However, by late Predator turns all four Conduits were sitting spent on the grid; I failed to recycle them soon enough. They are not automatically infinite resources.
6. **Living Lattice plus Ward plus Undertow is a strong recovery package.** It repeatedly revived depleted defenses and changed their element. It still required Focus, Channel, positioning and suitable destruction targets. Nausea halved several planned Ward gains, and the final boss eventually overwhelmed it. This evidence supports testing the package, not declaring it a game-solving exploit.

I did not find evidence sufficient to call a particular upgrade universally broken. Upgraded basic attacks/defenses and Solitude were useful; pricing should be tested alongside the economy rather than inferred from this one successful purchase sequence. Eclipse helped in the Cnidarian fight, but this run did not test the current Mind Hive or every S3 boss pairing.

### Plasma Ball: meld versus separate placement

Melding was useful in actual play, especially when Channel was needed for defense, healing or repairs. The decision log contains seven successful Plasma meld placements. These included a two-ball Fire Construct against Black Bile, a three-ball Water Construct against the S4 Cinder Hart, a two-ball Construct against Bombadier, and several two-ball Constructs against the Predator. The three-ball Water attack supplied 28 base damage, or 42 against the Fire Hart, for one Channel.

For two ordinary, unupgraded balls before elemental modifiers: melding gives one 24-damage activation for one Channel; separate placement permits two 16-damage activations, totaling 32 that turn for two Channel. Separation therefore offers greater immediate damage when Channel is plentiful, while melding frees Channel for other jobs and uses one space. The once-per-turn activation rule makes that distinction meaningful. Melding also extends the host's activation allowance, increases whole-Construct Recall cost, and lets a previously Transmuted host apply its element to the combined attack.

The downside is concentrated risk: one destroyed space can remove several cards, and one random shot can spend the entire combined hit on a low-HP Ideon. At Predator turn 14, the two-ball Construct dealt 24 damage and then both cards were lost together to Rending Fangs; I deliberately used it as a sacrifice to preserve a Water Ward. The run demonstrates that melding has a real purpose, but does not establish that each such choice was optimal versus separate placement. Keep the meld/separate decision; review Plasma's overall damage efficiency independently of that mechanic.

## What the Apex Predator exposed

The final fight demanded both sustainable offense and protection of the cards that produce it. I gradually spent more turns rebuilding defenses while dealing little damage. Guardians consumed attacks, destruction removed permanent sources of power, and unrepaired Insanity turned empty spaces into continuing HP loss. Once both Transmutes, all Plasma Balls and both Titans were gone, the deck had too little active damage to keep pace.

The fight was not simply a larger HP target: on destruction turns, a freshly strengthened Ward could become one of the most valuable targets and disappear before defending. The targets changed as cards were activated or recalled. Preserving a defensive card sometimes required sacrificing an expensive attack card as a decoy.

### Significant play errors and limitations

- S1: chasing value led into the Fire Wolf + Needle Imp ambush, losing 22 HP. A shop selection error bought Water Armor and Insight Dew instead of the intended selection; the purchase stood.
- S2: a defense command mistake in Sourcap Tender + Censer Engine accounted for 9 avoidable damage within that encounter's 15 net loss.
- S3: placing Solitude adjacent to Opening Rite prevented its intended activation and contributed to 4 avoidable HP loss against an Echo Polyp.
- Predator turn 2: I misread dynamically reprioritized destruction targets; the defensive Ally was removed before the attack, contributing to 14 HP loss.
- Predator: I underestimated Nausea's reductions on multiple planned defensive activations. The nominal value in a plan was sometimes larger than the actual legal effect.
- Predator turn 13: I recalled Living Lattice intending to re-place it immediately. Ordinary Recall sends it to discard; only Undertow supplies that immediate hand return. The failed placement did not execute, but the Recall had already consumed Focus.
- Predator turn 16: I selected the leftmost Ward before a Shield farther right. The no-backtracking rule correctly made the Shield ineligible, causing **6 avoidable damage**.
- More fundamentally, I recycled the Conduits and strong attacks too late, sacrificed both Transmutes, and let spent cards occupy the grid while subsequent hands lacked functional defense. The run's large Insight number did not fix cards that were not in the draw/discard cycle.

These errors mean the Predator result is a lower bound on what this build could accomplish. They do not explain away the observed contrast between the comfortable climb and the final endurance test.

## Suggested next balance experiments

Keep the current Predator rules until a cleaner attempt establishes how much of the loss was execution. First test the same pre-Predator build with earlier recall/recycling, protected Transmute access, and deliberate Nausea repair. Treat that as a separate experiment; this run remains the unrewound baseline.

For the broader ramp, prioritize the S2/S3 ordinary encounters and S4 gate approach. Many individual enemies died before their mechanics developed. Test opening pressure, mixed-element sequences and encounter composition before applying a blanket HP increase to everything. Preserve the satisfying elemental defense puzzles in Bombadier.

Then test Mirror Armor value, resource-gem availability, and repeatable between-fight healing separately. Changing all three simultaneously would make the cause of improvement difficult to identify. No single-card or two-card combination in this run defeated the entire game.

### Follow-up proposal: fewer healing cards

Jonathan suggested reducing the number of cards that heal. Record this as a balance experiment, not an approved gameplay change. A smaller healing-card pool and/or less frequent healing-card offers could make accumulated damage matter more and restore the value of paid tavern recovery and finite healing potions. Start by testing reduced access to healing cards, especially additional copies, while keeping individual heals useful; deleting distinct healing designs or weakening every heal at once would obscure which change helped.

The relevant issue is repeated recovery across encounters, even when each card is correctly Destroyed after one use within a battle. This run eventually had two Bloomcalls plus Soothe, alongside equipment and consumable healing. Compare net HP progression, gold spent on recovery, and survival for both well-defended and weaker builds. Fewer healing offers could also increase seed dependence if obtaining one remaining heal becomes disproportionately valuable, so measure that tradeoff rather than assuming rarity alone solves the issue. Leave tavern frequency unchanged for the initial experiment.

## UI observations

- Keeping purchased shop slots in place with a Sold placeholder would reduce target movement and selection mistakes. This was discussed, not implemented.
- Transmute's global range is easy to confuse with adjacent Attunement. Make the targeting distinction explicit in its details/target highlight.
- Display effective, reduced Ward/Guard values consistently when Nausea applies. The penalty mattered repeatedly in this fight.
- The existing no-backtracking defense rule worked. My failed Shield selection after a leftmost Ward was a play error, not a rule bug.

## Evidence

- `current.json` / `final.json`: terminal state, public observation and legal actions.
- `decisions.jsonl`: submitted selectors, reasons, responses and failures.
- `initial.json`: initial seeded state.
- `encounters.json`: full 50-encounter summary, including the final loss.
- `view.png`: final result screen.
- `app/`: frozen release copy used by the visible driver, with the manual control hook.
- `profile/`: isolated run profile. Keep separate from the normal player's save.

No gameplay, balance, design-document or shop-layout changes were made as part of this assessment.
