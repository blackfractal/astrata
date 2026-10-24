# Manual balance review — 4.0.7 runs, 4.0.8 tuning

2026-10-17. Jonathan requested several headless runs with Codex choosing every decision and independently deciding what to tune.

## Scope and results

Three fresh seeded runs, 1,896 decisions, no built-in policy/search, hidden draw-order inspection, rewinds or changes to the live player save. Explicit batches contain my selected actions; illegal selections stop without acting. All recorded actions replay exactly against archived 4.0.7 sources, including per-action HP/Gold and final RNG, deck, equipment, statistics and battle state.

| Seed | Decisions | Result |
| --- | ---: | --- |
| 17101701 | 197 | Died in S1 to a Dervish Hunter + Shardwalker ambush. Five prior victories. |
| 17101702 | 288 | Died to Void Colossus on turn 17, with 38 boss HP remaining. Four prior victories. |
| 17101703 | 1,411 | Cleared S1, S2 and S3; 29 victories. Preserved at the Mind Hive reward with 20 HP. S4 has **not** been played in this run. |

This is two completed losses and one ongoing campaign at a deliberate review checkpoint, **not three completed four-Stratum campaigns**. It is a small, nonrandom sample with learning between runs, not a win-rate estimate. New tuning was applied only after these baseline runs. There has not yet been a full campaign on 4.0.8.

For the third run:

| Stratum | Encounters won | Net encounter HP lost | Encounters with no net HP loss |
| --- | ---: | ---: | ---: |
| S1 | 10 | 31 | 3 |
| S2 | 7 | 11 | 5 |
| S3 | 12 | 53 | 8 |

Net HP includes in-fight healing; it is not raw damage taken. Taverns heal between these segments. S2 comprised six ordinary encounters costing only 1 HP in total and Black Bile costing 10 HP. Two S3 double ambushes cost 37 and 11 HP; the other ten encounters together cost a net 5 HP. These contrasts matter more than the aggregate win count.

## Changes applied in 4.0.8

1. **S2 Mote HP: approximately +12.5% over 4.0.7.** Their existing base-health multiplier changes from 1.20 to 1.35, rounded upward. Damage, moves, Eidolons, Archons and tutorials are unchanged. Returning S2 Motes in the Apex inherit their source HP change. Existing active battles retain saved HP.

| Mote | Previous HP | New HP |
| --- | ---: | ---: |
| Sourcap Tender | 34 | 38 |
| Loop Moth | 30 | 34 |
| Dew Thief | 36 | 41 |
| Thread Mite | 24 | 27 |
| Frayed Hound | 48 | 54 |
| Hollow Scribe | 41 | 46 |
| Bellows Grub | 46 | 52 |
| Loose Echo | 39 | 44 |

The purpose is to make an established engine answer another small decision instead of routinely erasing the encounter. Controlled replay of the six original ordinary S2 encounters, preserving build/draw/RNG and changing only starting enemy HP, leaves the Mite, Echo and Hound alive with 3, 5 and 3 HP after the old winning sequence. Both Sourcaps and the paired Mites still die on the original sequence. This is a threshold check, **not six adapted post-tuning playthroughs** or proof of a final difficulty level.

2. **Mirror Armor: 110 → 180 Gold.** Reflection remains optional, once per battle, with normal elemental interaction. It was used in every one of the third run's 19 S2/S3 encounters, against 240 total points of incoming raw damage, and often also shortened the fight. That is **not** 240 HP saved: other defenses could have absorbed some of it. Its availability so cheaply at the first transition Tavern was the issue. The extra 70 Gold creates a meaningful competition with resource gems, healing and other equipment. Standard resale remains half worth, so its sale value is now 90. Owned armor retains its ability; no retroactive charge.

3. **Forked Current: direct main-enemy fallback 40 → 24 damage.** The rightmost-column requirement, 2 Focus, 2 Channel, 2 uses and 2 Recall stay. Its Ideon path still shares **40 + 8 per Ideon, capped at 80**. The former direct attack did 60 against Kindly Hunger with no chain or supporting formation. Replaying that exact activation now deals 36; preview and committed damage agree. In Mind Hive, the actual two-Ideon chain still deals 28 to each target. This preserves the distinctive use while making the easy fallback less dominant.

4. **Field-loot correction:** entering later Strata rebuilt the item deck with starter cards, despite the reward/shop exclusions. I encountered a literal `card:blast`, not a potion. New later-Stratum item decks now exclude starters except Focus Energy; loading also filters those prohibited cards from the still-unseen item deck without consuming RNG. Already shown offers and owned cards are left intact.

S1 enemy stats, S3 enemy/boss stats, Apex Predator, healing, resource equipment effects, Crosswind Reed, Rootwall and the other new cards are unchanged.

## What the runs taught me

**S1 still punishes route and tempo errors.** My first loss followed a double-Eidolon ambush near the Tavern and delayed engine setup. The second was a defensive deck with only one Focus Energy and two Channel, an overly expensive early Opening Rite purchase, unused late Gold, poor damage recycling, and valuable cards lost to Collapse. I also forgot Recall must happen during Placement. These losses are not evidence that S1 needs another blanket increase, nor proof the seeds were unwinnable.

**S2 ordinary fights were too short for the third build.** It had Bronze + Silver bracelets, not Gold; the advantage was resource growth, Mirror, a useful damage formation and varied elements. Most encounters ended in one or two player turns. Increasing their HP modestly addresses time-to-kill while avoiding more unavoidable ambush damage. Black Bile already created a real 9-turn test: Nausea interfered with output, Bile consumed allowances, and Burn/Poison caused the actual attrition.

**S3 is uneven, rather than uniformly easy.** Isolated Broods were quick, but two Eidolon fights lasted five to seven turns even without HP loss. The Brood/Knotkeeper ambush cost 37 HP before I stabilized; another bad map move caused a second double ambush. Binders broke my intended Reed/Rootwall formations. I needed Cinder to soften a Binder before Ivy could kill it and chain into the next one. Those are useful choices; more blanket damage would punish already-dangerous combinations.

**Crosswind Reed is strong, but has a genuine spatial price.** Sixteen attunable damage for one Channel is excellent and did much of the S1 boss work. Spent cards and Opening Rite make its supports cheap. However, both empty spaces must remain empty, including Ideons; in S3 that caused real failures and repair work. I am leaving 16 unchanged while watching its pick rate and practical uptime. Rootwall has the analogous placement constraint. I repeatedly found the formation harder to maintain than its printed number suggests.

**Several new cards produced engines without Titan.** This deck never acquired Grove Titan, a Gold Bracelet, Eclipse Seed or Storm Canopy before the S3 clear:

- Focus Energy + Rain Lantern + Tide Memory supplied placement, recycling and enough cards to cover eggs.
- Mindfire converted spare Focus into an immediate kill without consuming scarce Channel. Against a 50-HP Drone, Mindfire 30 + Water Blast 10 + Prismatic Sap 10 was exact lethal.
- Cinder or Gale softened Ideons so Predatory Ivy's kill-triggered jumps could work. Guide's mark also helped finish a Drone through that chain.
- Prismatic Sap combined a relevant attack, small Guard and an elemental relay; its flexibility mattered more than a huge single number.
- Compost Ward became useful after cards reached Destroyed, but its two-Channel cost still competed with immediate kills. Root to Flame was useful in the second run to turn otherwise spare Focus into an extra defensive activation.

**Mind Hive currently rewards preparation very strongly.** Entered at 20 HP, healed 2 with Unbinding Dew, lost 2 on the final command, finished at 20. Guide removed larvae, Elves suppressed several Drone eggs, and early quiet turns allowed Bastion + Magnifier to bank 73 Ward and Compost + Magnifier to bank 43. At victory, 73 and 35 remained. The final 2 HP loss was avoidable: I spent equipment before enough card guard, crossed the one-way defense boundary, and could no longer return to the Shield/Wards.

That is a watch item for the Hive's pacing, **not evidence that Ward alone solves S3**. This line also needed the correct opening tools, repeated egg repairs, Ideon kills, draw support and card recycling. No boss adjustment in this pass. If it remains too safe across less favorable draws, the next experiment should strengthen middle-wave pressure rather than globally nerf every Ward.

## Limitations and follow-up

- Most of the 21 new cards were not exercised enough for individual balance conclusions. Do not treat this report as certification of Canopy Break, Verdant Rampart, Borrowed Dawn, or the entire new pool.
- No new S4 evidence. The third campaign is reproducible and ready for a later S4 continuation under its archived 4.0.7 rules.
- Changing purchase prices and HP can change routes, buys, kills, half-HP thresholds and subsequent RNG consumption. The local comparisons do not predict a full counterfactual campaign.
- My condensed headless display omitted Bile markers/body Guard even though the game's observation already exposes them. Fixed the driver projection; this was **not an engine observation bug**. Full public observation remains available for inspection. Illegal/misjudged actions and their reasons are preserved, including mistaken Resonance isolation and blocked formations.

## Evidence and validation

- `reports/codex-growth-manual-17101701`, `...17101702`, `...17101703`: initial state, exact battle starts, sources, decisions and current state. First two also contain terminal results. Third has an explicit `stratum3-cleared.json` checkpoint and no claimed terminal result.
- `tools/verify-growth-manual.mjs`: exact frozen-source verification of all 1,896 actions. Each run has `verification.json` and `encounters.json`.
- `tools/growth-manual-diagnostics.mjs` and `reports/growth-manual-diagnostics.json`: reflection uses, activation counts, changed HP, matched S2 sequences and the exact Forked Current comparison. Run the verifier first to materialize frozen imports.
- Manual driver now resumes using its archived source modules, so continuing old evidence cannot silently use today's balance changes.
- **695 rule tests passed**; asset audit: **236 required, 245 selections, no missing art/provenance**. New tests cover direct Forked damage/preview/elemental effects and unchanged chain pool, Mote-only HP scope and save preservation, Mirror purchase cost, and starter-loot exclusion. No UI launched for this headless review. Packaged application and portable ZIP refreshed to 4.0.8.

Approximately 70 minutes for manual play, analysis, implementation, verification, documentation and packaging (estimate). No live save edits, commits or pushes.
