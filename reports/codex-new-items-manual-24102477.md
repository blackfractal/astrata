# Manual playthrough with the new supplies — seed 24102477

Rules/content: **4.0.15**. One headless run, with Codex choosing every action. No policy agent, search, rewinds, retries, or live-save changes. The run used frozen source files so concurrent edits could not change its rules. No gameplay or balance changes were made during this assessment.

**Result: 37 encounter victories, then death to the Apex Predator on turn 8.** S1–S3 and the first three Apex floors were cleared. The final boss had **422/500 HP** remaining. The final deck contained 55 cards.

All **2,292 recorded actions** were replayed from the initial state. Every action was legal; HP and gold matched after every decision, and final RNG, inventory, deck, equipment, statistics, battle and terminal state matched. Evidence is in [the run directory](codex-growth-manual-24102477/), including [verification](codex-growth-manual-24102477/verification.json), [encounters](codex-growth-manual-24102477/encounters.json), frozen sources, initial/final states, battle-entry snapshots and the decision log.

## Difficulty progression

| Section | Encounters won / played | No net HP loss | Net HP lost across battles |
| --- | ---: | ---: | ---: |
| S1 | 7 / 7 | 3 | 59 |
| S2 | 10 / 10 | 5 | 18 |
| S3 | 10 / 10 | 6 | 21 |
| S4 | 10 / 11 | 2 | 120 |

These are battle start-to-end HP differences, including ambush damage and in-battle healing. They are not gross damage totals; healing between encounters is excluded. One selected route is insufficient to estimate win rates or judge every enemy.

| Archon | Turns | Starting → ending HP | Main observation |
| --- | ---: | ---: | --- |
| S1 Cinder Hart | 10 | 51 → 11 | Burn provided a serious clock before the engine developed. |
| S2 Black Bile | 12 | 66 → 59 | Fire Titan was powerful, but maintaining defenses, repairing Bile and replacing drained cards still required work. |
| S3 Cnidarian | 9 | 70 → 62 | Lost 12 HP early and healed 4. Wind defenses and targeted tendril removal stabilized the encounter. |
| Apex floor 1 Cinder Hart | 5 | 64 → 49 | Direct attacks were covered; Burn caused all 15 HP lost. Water Tincture accelerated the opening. |
| Apex floor 2 Black Bile | 13 | 36 → 25 | Status damage remained relevant even with direct attacks covered. Soothe healed 4. |
| Apex floor 3 Cnidarian | 16 | 52 → 36 | Held HP through turn 14, healing to 56, then lost 20 on turn 15 when the last Ally died and tentacles attacked the player. |
| Apex Predator | 8 | 36 → 0 | Failed to establish sustained offense; destruction removed essential defenses before their Guard could be used. |

S2 and much of S3 remained forgiving once the engine was running. This did not translate into an easy S4. Map timing and ambushes caused substantial attrition: the Seamstress ambush after Black Bile took me from 25 to **3 HP**. I then won that fight without further HP loss and healed to 7. The floor-three Tavern's 50-HP recovery was critical; leaving it led to a Rift Chimera ambush that cost 13 HP.

## How the new supplies played

- **Fixed-element Tinctures:** useful strategic purchases. A cheap Fire Tincture removed Titan's Earth vulnerability against a Fire enemy. Water Tincture let Titan attack Cinder Hart for 30 immediately, without drawing/placing Transmute or spending Channel on conversion. Choosing the element in advance was a meaningful limitation.
- **Prismatic Tincture:** strong flexibility at a noticeable price. Fire Titan dealt 106 damage across its three attacks against S2 Black Bile, then remained an interceptor. That did not finish the encounter by itself; several other attacks, defenses and repairs were necessary.
- **Fury Sap:** produced a satisfying burst. Against the Light Borrowed Oracle, Plasma dealt 48 Chaos damage instead of 24. It did not end the entire fight. Random targeting makes it less dependable when Ideons remain alive.
- **Memory Draught:** felt reliably useful without being an instant win. I recalled Wild Conduit, then put it on top of the draw pile to guarantee its return next turn during Cnidarian.
- **Wild Inspiration:** yielded a free Blast activation in S1. Helpful, but modest; this run did not exercise its most dangerous interactions with powerful on-placement or activation effects.
- **Insight Dew:** did not guarantee rescue. During an Apex Needle Imp opening it drew Borrowed Dawn rather than the missing defense, and I still lost HP. This is an appropriate distinction between drawing an option and solving the situation.
- **Channel Draught:** enabled an immediate Titan kill in a three-Mite fight. The single extra action was valuable because it removed an attacker.
- **Crystal-enhanced Star Flask:** 12 Arcane damage plus Lucid Needle removed an old tendril. This was a good emergency tool with a clear target and finite benefit.

I finished with an unused Chaos Tincture and Rustbane. Neither solved the final defensive collapse. I did not encounter or meaningfully test every new consumable; this run is not evidence that the entire supply pool is balanced.

## Equipment and economy

**Armor of Remembrance** was useful repeatedly: destroyed cards provided temporary player Guard, rewarding deliberate sacrifice. Its expiry mattered, and I sometimes failed to spend it before equipment. It softened card destruction without replacing lost offensive capacity. The final fight still overwhelmed it.

**Gold Bracelet** was a major upgrade, but I did not acquire it until Apex floor three. The purchase cost 300 gold, with a further 110 to socket the available Quartz. That was a substantial investment. It brought refreshed equipment Guard from 6 to 11 and made ordinary encounters easier, but did not solve Cnidarian or the Predator.

The gem/Setting pricing created genuine tradeoffs. I rejected an Echo Ring socket costing 180 gold and used a Focus Ring socket costing 120 instead, retaining Focus as well as Channel. By late S3 the equipment supplied four Focus and four Channel per turn; Quartz raised Insight to six. That foundation supported multiple card engines, but the final boss exposed the cost of spending Focus on recalls rather than deployment.

## Cards and interactions worth watching

**Mindfire is the clearest candidate for further targeted testing.** Spending three Focus for 30 Arcane damage at zero Channel killed an Apex floor-one Wolf immediately. Its Focus requirement constrained it elsewhere, and the Predator forced me to use its two activations for only six damage each because placement consumed all available Focus. Test its early-encounter breakpoints before changing its peak damage.

**Borrowed Dawn has a real downside.** It enabled complex turns, but repeated use left only three revealed cards on Predator turns five and six. Those were poor turns to have fewer options. I accepted that debt to survive, but it contributed to the collapse.

**Soothe encourages stalling even though it is single-use.** I deliberately delayed finishing Echo Polyp to obtain its four-HP heal. There is no infinite healing loop here, but safe fights can become opportunities to search for healing. This is worth monitoring separately from raw heal amount.

**Plasma melding was situational.** Against Apex Cnidarian, a two-ball Construct gained efficient damage per Channel and another use. My first placement beside uncovered Nausea halved its damage; covering Nausea restored it. Its random attacks repeatedly hit tendrils instead of the boss, and a killed tendril's return eventually destroyed the Construct. Separate cards would have reduced that concentrated loss. This was not a universal improvement over separate Plasmas.

**Keystone finally earned its space** in the corner during the long Cnidarian fight, extending several bottom-row cards and a same-column Construct. **Thornfall** killed an aged tendril without Channel and later contributed guaranteed boss damage. **Crosswind Reed** supplied valuable damage when its formation was intact. These supported a broader engine than Titan plus Transmute alone.

Foundational Shields and Blasts remained relevant for inexpensive defense, attunement chains, adjacency and finishing damage. A fresh Titan died to Cnidarian's tendrils before getting an activation, demonstrating a real counter to relying on one large Ally.

## My errors and the final loss

This was not an optimal playthrough. I made several avoidable placement errors: invalid Rootwall formations, placing a support that disappeared when Soothe activated, forgetting Nausea's adjacency reach, and putting Resonance beside a new Plasma. The legal-action interface caught some invalid actions; other legal but poor decisions cost resources and turns.

At the Predator I also misjudged the changing destruction targets. Recalling Rootwall and Thought Bulwark on turn two redirected Rending Fangs to Familiar and Lattice. I had planned to use the Lattice's stored Ward against Fire, but it was destroyed first. The resulting attack and Sentinel damage cost 11 HP. Later I deliberately used Kiln as a destruction decoy, but placed its replacement Lattice beside Nausea, halving the Ward gained. These mistakes should not be attributed to enemy imbalance.

The 55-card deck provided reserves for long fights but was too inconsistent in the final opening. I failed to deploy either permanent Focus early, spent two turns dealing no damage, took repeated Insight debt, and lost my best formation to Unmake. By turn eight the boss still had 422 HP. This was a clear loss, not a near-win caused solely by its HP total.

## Recommendations

1. **Keep the new items provisionally unchanged.** They created useful decisions and several recoveries, without making this route an automatic win.
2. **Investigate Mindfire versus ordinary enemy HP thresholds**, especially reused S1 enemies in S4. A 30-HP Wolf was trivial at this stage.
3. **Continue focused testing of S2/S3 encounters after engine setup.** Many cost no net HP despite some mistakes. Prefer testing specific encounters and several builds over another blanket increase based on this route.
4. **Do not nerf the Predator solely from this loss.** Replay its entry snapshot separately with corrected targeting knowledge and a stronger opening plan before drawing a difficulty conclusion. That would be a new experiment, not part of this uninterrupted run.
5. **Check how clearly the UI communicates retargeting and Guard loss on destruction.** Both were decisive. This headless run establishes the rules interaction, not whether the current visual presentation adequately explains it.

No balance changes were applied from this single sample. The strongest evidence is that the supplies add tactical options, S2/S3 still offer substantial recovery room once established, and S4 demands both better map planning and more disciplined card deployment.
