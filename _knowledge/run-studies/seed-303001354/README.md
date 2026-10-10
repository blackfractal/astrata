# Seed 303001354: verified victory through Stratum 2

2026-10-06. Jonathan asked whether his latest lost game was beatable under the updated rules, and what a winning line did differently. Source run: `d44aafa5-930d-4fd2-a77e-198d19c5c134`, package **2.1.13**, rules/content **2.1.10**. All ten archived gameplay source files match the search copy after normalizing line endings only. No balance or game-code changes were made.

**Yes.** A replay from `new Game(303001354)` executes **911 legal actions** and wins through Stratum 2 at **51/70 HP**. Its first **294 retained actions are Jonathan's**, unchanged through entering the Stratum 1 Tavern at **8 HP and 370 Gold**. His earlier route, rewards, equipment and both Eidolon fights can therefore remain exactly as played.

The original trace includes three reloads of battle-start checkpoints. Verification removes the abandoned attempts and replays the retained choices as one continuous legal run; it does not inject archived states to bypass those battles.

| Milestone | Jonathan's recorded run | Verified alternative |
| --- | --- | --- |
| After Shard-Walker | 25 HP | 25 HP, identical play |
| After Dervish Hunter | 3 HP | 3 HP, identical play |
| First Tavern entry | 8 HP, 370 Gold | Same |
| First Tavern departure | 8 HP | 28 HP |
| Pale Weaver | 8 → 10 HP | 28 → 35 HP |
| Cinder Hart | 10 → 0 HP; loss | 35 → 3 HP; victory on turn 8 |
| Between-Strata rest | Not reached | 3 → 53 HP for 50 Gold |
| Trickster | Not reached | 47 → 51 HP; victory on turn 11 |

## What changed

### Reserve healing money, retain the engine, add inexpensive armor

Jonathan bought Ring of Patience and Sapphire, and paid 110 Gold in socketing/unsocketing fees. Those fees left 15 Gold, five short of the 20-Gold rest. Jonathan explained that he had forgotten the newly introduced service costs.

The alternative first pays **20 Gold to heal 20 HP**. It still buys Ring of Patience, sockets Storm Opal into it, changes Bronze Bracelet to Sapphire, and sockets Clear Quartz into the original Rootbound Ring. It additionally buys and equips **Stone Armor for 30 Gold**, and funds the extra spending by selling the loose Ruby and the newly unsocketed Emerald for **22 Gold each**. All transactions use the current legal prices. It leaves with 9 Gold. No free socketing, duplicated items or invented inventory.

### Use the existing potion and improve recovery before the boss

The alternative uses the carried **Focus Draught during Pale Weaver**, placing Sunfruit, Clear Mind and Shield on its first player turn. Jonathan's potion remained unused at death. Sunfruit and a well-supported Bloomcall help this line leave the fight at 35 HP.

**Later offers differ.** Different legal combat choices and draws change the seeded RNG progression. The alternative receives Slow Rot and Sapphire after Pale Weaver; Jonathan's actual offer was Undertow/Thorn Choir/Sunfruit, followed by Ruby. Slow Rot was **not a card Jonathan overlooked in that reward**. The alternative later receives Thorn Choir from an event; Jonathan obtained Wild Conduit instead. This is a valid same-seed alternative trajectory, not identical rewards with different selections.

### Exploit Water and Corrode against Cinder Hart

The line places Slow Rot on turn 1 and uses it twice. Its Water element anchors a Blast attunement chain, and Corrode damages Hart and triggers its cycle-end **Purify**, delaying another ordinary attack. On turn 4 Hart spends its action purifying; Corrode ticks for 5 immediately before that cleanse.

Other notable decisions:

- Water-attuned Blasts supplement Water Blast; the line does not rely on Burn, to which Hart is immune.
- Sunfruit intercepts an attack as a **12-HP Ally** rather than immediately healing 5 and destroying itself.
- Spent Water Blast is Recalled on turn 6 and drawn/placed again on turn 7. It provides the final attack on turn 8.
- Bloomcall is placed with three neighbors on turn 7: **9 healing**, taking the player from **2 to 11 HP** before Wildfire and Burn leave 3 HP.
- There is no Transmute activation in the final winning Hart line, although it was considered during search.

The position remains tight. Adding rest alone has not been independently proven sufficient; the demonstrated win includes these other changes and different subsequent offers.

### Convert survival into Stratum 2 strength

After Hart, take Grove Titan, Ruby and Silver Bracelet. Pay for the **50-HP intermission rest**, equip the Silver Bracelet, socket the newly acquired Sapphire into it, upgrade two Blasts, and pay the printed 8-HP cost to upgrade Sapling. Enter the Loom, collect available recovery, and later rest at its midpoint Tavern, buy/equip Wind Armor and upgrade another Blast.

The continuation wins multiple Loom battles and defeats **The Trickster**, ending at 51 HP. This establishes that Stratum 2 is reachable and beatable on this alternative trajectory. It is not a representative difficulty estimate for all seeds or builds.

## Verification and search limitations

- Frozen source, full original trace and verification code are in `headless-replay.zip`. Extract to a separate folder and run **`node verify.mjs`** using Node 24. No dependencies, live profile or UI are needed.
- `winning-line.json.gz` contains the 911 action keys and final state. Every action is resolved against the legal list during verification. Fresh-seed replay also matches the original Tavern entry and the searched final HP, Gold, RNG, deck and equipment.
- `verification.json` records milestones, retained/reloaded history and source hashes. `source-comparison.json` links those sources to the original build. `hart-milestones.json` records key combat effects.
- Early exploration tried 660 Tavern continuations, 400 enhanced Tavern continuations and 480 alternatives starting at Shard-Walker without finding a full win. Those failures were not treated as proof of impossibility.
- A guided search branching over player turns found the successful Hart line. It evaluates simulated outcomes, so this is a searched existence proof, **not a blind first-attempt win**. Candidate scoring uses observations and legal actions rather than directly reading hidden draw order/RNG. The first tested continuation from the Hart victory won Stratum 2.
- Re-extracted proof bundle independently replayed successfully. No HP, inventory, RNG, enemy behavior or game rules were edited in the winning line. Jonathan's actual profile was read only; no game app was launched or closed.
