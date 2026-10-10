# Seed 509609910: verified victory through Stratum 2

2026-10-10. Jonathan's source run: aa2eebb1-8683-4936-8cf1-2651f2b94adf. Package 2.1.16; rules/content 2.1.12. All ten frozen gameplay sources match the original archived build after newline normalization. No game changes or live-profile writes.

A fresh-seed replay executes **924 legal actions**, defeats Cinder Hart at **6 HP**, then defeats The Trickster and completes Stratum 2 at **16 HP**. No HP, inventory, RNG, or rules edits are part of this proof. This is a searched existence proof, not an optimal route or blind first-attempt win.

## Comparison with Jonathan's run

| Milestone | Original | Verified route |
| --- | --- | --- |
| First Tavern | Round 17, 3 HP, 492 Gold | Round 11, 49 HP, 187 Gold |
| First Tavern departure | 23 HP; two Bronze Bracelets; Ring of Patience; Solitude upgrade; second Plasma Ball | 61 HP after rest and paid-HP Sapling upgrade; Bronze + Silver Bracelet |
| Hart entry | First placement at 17 HP, Burning Itch present | 70 HP before enemy-first opening; no Burning Itch |
| Hart result | Current attempt doomed at 1 HP, Hart 78 HP | Victory, 6 HP |
| Between-Strata rest | Not reached | 6 to 56 HP for 50 Gold |
| Trickster | Not reached | 26 to 16 HP; victory in 8 turns |

The original first four fights cost no health; the first seven fights cost only 4 HP total. Later Shard-Walker cost 21 HP and Dervish Hunter cost 20. The winning route avoids both of those Eidolons in Stratum 1, fights Pale Weaver instead, and uses recovery events. This is a choice about preserving the run's health budget, not evidence that those fights are universally wrong to take.

The original route chose Burning Itch for 70 Gold shortly before the Tavern. The verified route takes the swamp's 5-HP/35-Gold alternative and never acquires Itch. It collects 8-, 10-, and 12-HP event recovery along its different route (the last heal caps at 70).

The proven route reaches the Tavern earlier, buys Bronze and Silver Bracelets, and does not buy additional cards there. Its pre-Hart deck has 22 cards versus the original 29; it uses two Focus Energies, Slow Rot, elemental Blasts, and ordinary damage cards. Slow Rot forces one Purify turn and supplies Water attunement for Blast chains; the line recalls and redraws it. It uses neither Grove Titan nor Transmute against Hart. The route still takes an enemy-first Hart opening and barely wins, so not every recorded decision is advice to imitate.

For Stratum 2 it buys the 50-HP intermission rest, equips Lantern Necklace, sockets Amber Thought into Rootbound Ring, buys Fire Armor, sockets Emerald into Bronze Bracelet, and upgrades three Blasts. Later it heals at the midpoint Tavern and sockets two Storm Opals for Channel. It survives a difficult combined Frayed Hound/Sourcap fight at 9 HP before that rest.

## A concrete decision in the original route

After original decision 275, the player was at zero-based (4,2), one step south of the Tavern at (4,1), with 23 HP and one movement left. Original decision 276 moved southwest to (3,3), ending movement and allowing Dervish Hunter to ambush. Moving north instead legally enters the event/Tavern tile before enemy movement. Taking the 5-HP swamp option then enters the Tavern at 18 HP and 412 Gold; healing would restore 38 HP before facing the hunter. That branch's generated shop includes Ring of Embers, Silver Bracelet, and Earth Armor. **This branch was inspected but was not the branch used for the complete winning proof.**

## Limits and reproducibility

Different decisions change seeded RNG consumption and therefore later rewards and shop stock. Slow Rot, Silver Bracelet, and the alternative shop contents must not be described as offers Jonathan ignored in his actual run. The proven route diverges from the beginning, including the starting gem choice; it does not salvage the current 1-HP position.

Earlier hypothetical-HP experiments are separate and are excluded: the same original Hart setup has a verified 50-HP winning line, but no claim of a globally minimal HP threshold was established.

Extract headless-replay.zip and run **node verify.mjs**. It checks every action against the legal action list from new Game(509609910) and matches the final state. No live saves, dependencies, or game UI are needed. The ZIP includes frozen sources, the complete winning action trace, original human event archive, and verification records.
