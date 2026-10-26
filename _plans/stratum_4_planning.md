# Stratum 4 planning — The Apex

Design draft 0.17 · 2026-10-25 · Jonathan / Codex

Companion to [the main design](astrata_design.md) and [Stratum 3 planning](stratum_3_planning.md). **First playable implementation: package 4.0.0.** Confirmed rules below come from Jonathan's four-floor proposal. The implementation snapshot below supersedes older pending recommendations.

## First playable implementation — 4.0.0, 2026-10-16

Jonathan authorized implementation. The four-floor ascent, paired rematches, deadline hunt, central stairs, rewards, final Predator, art, save compatibility and achievements are now implemented. The choices below resolve the previously open implementation details; they are initial balance values, not a claim of final tuning.

- Ordinary spawn probabilities stay fixed within every floor: 48% Mote, 12% Eidolon, 25% Gold, 15% Item. The fourth pair replaces both slots with Archons; floor 3 pair 1 begins with the Tavern. Reuse the corresponding original Stratum's enemy roster. No random Event spawns in this first Apex build.
- Reserve the center, its two northwest/northeast diagonal approach spaces, and the Archon seals from random spawns. Movement can still bring enemies across these spaces. Entering an open Ascend tile takes precedence over an encounter there, preserving the promised exit route. Floor contents are abandoned on ascent; HP, Gold, deck, equipment and persistent effects carry forward without free healing or a new companion.
- Ordinary enemy HP multipliers on floors 1/2/3: 1.60 / 1.35 / 1.15, rounded up. Add 4 / 3 / 2 damage to each direct hit. S1/S2 rematch Archons: 1.35 / 1.20 HP and +3 / +2 direct damage per hit, in addition to their normal escalation. S3 Archons retain their original HP and damage. Status values and mine damage are not multiplied. Motes retain Hunter/Stalker behavior; other Motes use base-one Wanderer movement, with Restlessness. Archons do not become Restless before their deadline hunt.
- Each returning Archon pays 180 Gold. Each grants its own choice of three Rares, with a 35% chance to replace one with a Legendary. A victory encounter containing Archons has a 50% chance of an optional good equipment/gem reward. Defeating both in one battle presents both card offers before ascent. Existing base victory rewards still apply to ordinary enemies.
- Floor 3's Tavern has full services and one 50-HP rest for 50 Gold. Normal S3 transition Tavern remains. No extra shop or healing between Apex floors. The final room has no movement clock or collection; equipment management remains accessible before starting the fight.
- I Stand Alone checks the saved roster of every map-spawned S4 enemy, including all six rematch Archons, and surviving victory over the Predator. Event-only enemies do not enter the required ledger. The separate Machine Elves retention/non-use achievement is awarded after S4 victory using the existing tracked eligibility.

### Predator first-pass moves

500 HP, Chaos; six-move cycle. Updated in 4.0.13 from 640 HP to shorten attrition while preserving the destruction puzzle. Direct attacks retain +3 damage per completed cycle and +4 per hit at 250 HP or lower. Commands surviving owned Ideons on every move, including conditional cycle-end Purify. At most six owned Ideons and ten owned Corruptions. Destruction targets and Corruptions are telegraphed through the existing systems.

| Move | Direct attack | Additional effect |
| --- | --- | --- |
| Riven Earth | 24 Earth | Telegraph two Nauseas; summon one Hollow Sentinel |
| Rending Fangs | 16 Fire + 16 Fire | Apply pending Corruptions; no Construct destruction (4.0.22) |
| Hollow Hunger | 16 Chaos, then 16 Light | Telegraph two Insanities; summon one Ward Leech |
| Unmake H / V | 26 Arcane | Apply pending Corruptions; alternate fullest row (first cycle) and fullest column (next cycle) |
| Brood of the Summit | 18 Water, then 18 Wind | Telegraph two Hypnoses; summon two Glass Skitters |
| World Eater | 42 Chaos | Apply pending Corruptions; destroy two most valuable Constructs |

Unmake chooses the line with the most cards, including melded cards, regardless of card value; ties choose the topmost row or leftmost column. This restores count-based targeting in 4.0.19 while retaining H/V alternation. The live warning commits at End Turn. Purify does not advance H/V alternation.

Each direct hit gains +3 per completed six-move cycle and +4 at or below half HP. This explicit scaling replaces generic Archon damage scaling for the Predator. Conditional Purify removes Burn/Poison/Corrode before resuming the cycle, while still commanding its Ideons. Chaos immunity follows the normal elemental status rules. Victory completes S4 and retains the closing line “… but Astrata is still restless …”. Hidden S5 and its secret recipes remain unimplemented.

### Verification and tuning boundary

See [build report](../reports/stratum4-build-report.md) and [AI evaluation](../reports/apex-ai-report.md). All nine same-Stratum Archon pairings have rules checks. Five sample ascent runs and five direct Predator trials completed without stalls/errors, but the existing heuristic AI won none. These are declared carry-in fixtures, not fresh S1-through-S4 runs or proof of human balance. Paired S3 bosses and Predator endurance remain the most important playtest targets. No live player save was changed.

## Purpose

The Apex tests the complete build: formations and card survival from the Whispering Weald, Corruption management from the Unfinished Loom, and Ideon management from the Lucent Grotto. Players revisit familiar Archons, choose which matchup their build can handle, and leave before the alternative catches them.

There is one new, unique final boss: **The Apex Predator**. The three preceding floors contain returning Archon fights, not three additional new bosses. The final room gives the Predator the player's full attention, without a map clock or collectibles.

This four-floor structure supersedes the earlier long, five-space-wide map with gates at global rounds 8, 16 and 24, the Tavern after round 24, and the older generic rule that the Predator spawns in pair 16 and hunts. Ascending stairs within The Apex is intentional; travel between Strata remains a journey rather than a descent or ascent.

## Setting and art direction — confirmed

**The Apex is a majestic rocky mountain exterior.** Overworld backgrounds, Event backgrounds and enemy backgrounds share this mountain-climb setting, with rivers of lava and abundant crystal formations throughout. Convey the grandeur of the climb across the shrinking rooms while keeping the imagery unified with Astrata's established illustration style. This direction applies to S4 presentation, including the backgrounds for its returning enemies; earlier-Stratum artwork is not changed by this plan.

**The Apex Predator:** a horrific beast recognizably related to a pig, boar or bison. Its silhouette and physical features should preserve that animal identity, while its edges become fuzzy and indistinct, suggesting a body made partly of dark, evil energy. It should feel massive and monstrous, with a tangible animal form dissolving into an unstable dark presence. The exact balance of pig/boar/bison features remains an art choice rather than a requirement to depict three separate forms.

**Execution recommendations:** use the lava and crystals to illuminate the rocky landscape and contrast with the Predator's dark silhouette. Render the fuzzy edges as intentional wisps or energy breakup, keeping the face and important features readable at enemy-card size. Keep map icons, both marked Archon spaces and the central staircase legible over the rich background. These are visual directions, not new lava/crystal terrain mechanics. Artwork generation and final compositions remain future work.

## Confirmed floor structure

Each of the first three floors has its own eight-round spawn schedule. A round means a **Field movement/spawn round**, not a battle turn or individual player step. There are two spawns per round. References to “spawn 4” and “spawn 8” mean the fourth and eighth **pairs**, respectively.

| Floor | Ordinary rounds | Pair 4 | Exit |
| :--- | :--- | :--- | :--- |
| 1 | Motes, Eidolons, Items or Gold | Two distinct S1 Archons | Defeat either; take the central Ascend staircase |
| 2 | Motes, Eidolons, Items or Gold | Two distinct S2 Archons | Defeat either; take the central Ascend staircase |
| 3 | Pair 1 is **Tavern + one other spawn**; other ordinary slots use the usual floor pool | Two distinct S3 Archons | Defeat either; take the final Ascend staircase |
| 4 | No rounds, movement turns, spawns or collectibles | No Archon pair | Start the Apex Predator fight when ready |

Pair 4 uses both spawn slots for the Archons; it does not add them on top of an ordinary pair. No ordinary Event spawn is specified for this plan. No other scheduled Tavern inside S4 is currently specified.

### Returning Archon choices

Choose two different members of the appropriate roster:

| Floor | Available Archons |
| :--- | :--- |
| 1 | Cinder Hart; Void-Colossus; Glass Choir |
| 2 | The Black Bile; King Bombadier; The Trickster |
| 3 | Mind Hive; Cnidarian; Refraction Cannon |

**Confirmed encounter direction:** reuse the corresponding Stratum's original Motes and Eidolons on each floor, with increased HP and damage. Returning S1/S2 Archons have somewhat higher HP and damage, retaining their familiar mechanics and move lists. **S3 Archons should remain unchanged for the first pass, or receive only minimal adjustments if testing warrants them.** This supersedes blanket HP/damage increases for all returning Archons. No new ordinary enemy roster or redesigned returning-Archon moves are required for this first pass. Apply the S4 Mote movement exceptions below without changing earlier Strata.

Exact S1/S2 increases remain to tune. Keep the S3 Mind Hive's existing 15-turn survival timer and current encounter mechanics for the first pass; do not increase its timer through a generic HP multiplier. Whether returning Archons gain Restlessness during their stationary waiting period also remains open.

## S4 Mote movement — confirmed

No S4 Mote uses **Skittish** movement. Every S4 Mote must be a **Hunter**, **Stalker**, or **Wanderer with base movement 1** (one space in a random direction, with Restlessness). Apply this restriction to the S4 encounter roster even when reusing a creature that is Skittish in an earlier Stratum; earlier-Stratum movement is unchanged. This is the existing Wanderer movement concept with base distance one instead of two; it does not deliberately move toward the player.

The full-clear achievement should test surviving and defeating the enemies, rather than chasing fleeing Motes. This restriction is for Motes; returning Archons keep their confirmed stationary-until-deadline rule.

## Deadline and pursuit

The player must defeat one of the two Archons and reach Ascend by the round-8 deadline. After the deadline:

- If both Archons remain alive, **both hunt together**, forcing a battle against both simultaneously.
- If one remains alive, that survivor hunts and forces another fight if the player has not ascended.
- Killing one does not cancel the other one's hunt, but a round-8 first victory grants the single escape movement described below.

This is a deliberate encounter-choice deadline, not merely increased movement speed that can be evaded indefinitely. Use normal map markers, enemy inspection and round/spawn indicators to communicate the remaining Archons and hunt timing. Do not add a persistent deadline box or separate Archon roster. Both hunters reaching the player must form one battle rather than allowing the first encounter to interrupt the second hunter's arrival.

**Confirmed timing:** pair 8 appears, the player gets that round's normal movement, then surviving Archons hunt during enemy movement. Battles pause the Field clock. Entering an enemy tile still ends that movement turn. Deliberately initiating the first Archon fight in round 7 leaves round 8 to reach Ascend; initiating it in round 8 grants one escape movement after victory (4.0.34). The surviving Archon skips the immediate enemy movement while ordinary enemies move normally; then restore the player's normal full movement allowance without advancing the floor round, spawning a ninth pair, aging enemies or decaying Gold. The survivor hunts at the end of that extra movement if the player has not ascended. Other encounters and Continue do not grant another grace turn. Show the escape opportunity and the resumed hunt explicitly.

**Confirmed forced ascent:** after surviving the deadline hunt battle, the player automatically enters the next floor at its center, as if they had taken Ascend. This applies whether the hunt contains one remaining Archon or both. There is no return to the old floor to collect loot or finish off ordinary enemies. Preserve the battle rewards before completing the transition; their exact presentation order remains an implementation detail. Losing the fight does not advance the player.

This deliberately makes **I Stand Alone** harder: any spawned ordinary enemy left alive when the forced ascent occurs prevents the achievement.

**Ordinary enemies join the hunt:** resolve the enemy movement phase before opening the combined encounter. Motes/Eidolons that reach the player join the surviving Archon(s) in the forced battle. All enemies in that encounter must be defeated before victory and automatic ascent. Those map-spawned enemies count toward I Stand Alone when defeated in the combined fight. Jonathan called this the forced “round 9 fight”; it is the existing deadline encounter after round 8's movement, not a ninth spawn pair.

**Confirmed second-Archon exit:** defeating the second Archon forces ascent immediately upon surviving victory and resolving rewards, regardless of the floor round. There is no return to the map or opportunity for cleanup. This replaces the earlier rule allowing an early clear to remain until round 8. If other enemies share that fight, defeat the entire encounter first; killing the second Archon does not skip surviving enemies, death effects or a possible player defeat. The first Archon's defeat immediately reveals the central Ascend icon, which the player may touch to leave without fighting the second.

## Ascend staircase and room sizes

The first floor Archon's defeat immediately reveals the **Ascend icon in the middle of the room**. From either stationary Archon position it is reachable in one normal two-space movement turn. Taking Ascend puts the player at the center of the next floor; quickly replace the current room with the next room to convey the ascent. There is no walk from an outer entrance. Defeating the second Archon, including in the deadline hunt, triggers ascent automatically after surviving the entire battle and resolving rewards. Returning Archon victories do not end S4 or automatically open a between-Strata Tavern.

Floors become progressively smaller. Floor 2 is smaller than the familiar Field; floor 3 is smaller again; floor 4 is the smallest. This changes the **overworld rooms**, not the 7×6 battle Mind Grid.

**Confirmed Archon positions:** relative to the center `(cx, cy)`, spawn one Archon two spaces northwest at `(cx − 2, cy − 2)` and the other two spaces northeast at `(cx + 2, cy − 2)`. Ascend appears at `(cx, cy)` after either is defeated. With diagonal movement, each starting position is exactly two steps from the staircase. Which selected Archon occupies which side is still to specify.

**Confirmed room sizes and entry:** floors 1–4 are **11×11 → 9×9 → 7×7 → 5×5**. Enter every room at its center, including the first room after the S3 transition Tavern. Floor 4 retains its compact room presentation but has no movement-turn clock. The player initiates the waiting Predator fight.

**Confirmed Archon movement:** both Archons remain stationary at their northwest/northeast positions until the enemy movement phase after round 8's player movement. This overrides their usual overworld movement types for these floors.

**Confirmed map markings:** each of those two spaces has a visible symbol in the floor's map image, marking the Archon spawn location even before pair 4. Keep the marking legible as part of the terrain; the Archon occupies that marked space when it appears. Reveal the two selected Archon identities before they spawn, so players can plan their matchup. Jonathan approved revealing them in the pair preview, or using each Archon's identifying symbol beneath its future spawn space. **Presentation recommendation:** use recognizable identity symbols at the two marked spaces, with names/details on inspection; the precise choice of preview, map symbols or both remains a UI decision.

**Reachability recommendation, not yet approved:** reserve the central staircase tile and the two-step diagonal approaches so other encounters cannot obstruct the promised route after a voluntary fight. The late-hunt distance problem is resolved by automatic ascent after that battle.

**Other spatial decisions pending:** placement distributions for smaller rooms, whether ordinary occupants may stand on Ascend, and whether any barriers are needed. The old sealed-gate layout is not automatically carried forward.

## Optional completion and persistent state

**I Stand Alone — confirmed:** defeat every Mote, Eidolon and Archon that actually spawns on the S4 overworld, **and defeat the Apex Predator**. **Event-only enemy fights are excluded:** they are not required for this achievement. Track encounter origin, not just enemy type, so event opponents do not enter the required roster. This includes both returning Archons on every floor. After the first Archon, taking the staircase is voluntary and choosing the second fight remains possible. Defeating the second Archon forces ascent; clear other required map enemies before committing to that fight, unless they will join it. Leaving a spawned enemy alive on an abandoned floor prevents the achievement, even if the Predator is later defeated.

Count actual spawns, not hypothetical enemies in future pairs that never occur. There is no additional requirement to wait through every scheduled pair. Record map-spawned enemies and their defeats across all floors, including every member of grouped encounters and enemies joining the forced hunt. Award only after a surviving victory over the Apex Predator. Event-only opponents do not create missing-kill requirements.

Preserve the separate prior achievement concept: retain Machine Elves from S2 through the end of S4 without ever placing or activating them. Secret Predator/hidden-S5 conditions remain separate planning work. This document does not define new secret-item recipes or reveal secret requirements to players.

**Recommended transition behavior, not yet approved:** carry the normal run's HP, Grimoire, equipment, Satchel, Gold and persistent Curses/Hexes between floors, with ordinary between-battle resets and no free healing. Do not treat every floor as a new Stratum or grant a new companion. Leaving a floor abandons its remaining loot and enemies; no backtracking. Retain records of everything spawned, defeated and abandoned for achievements and analysis.

**No post-victory cleanup:** the floor has no ninth spawn pair, and the player gets no further movement after defeating the second Archon and winning its entire encounter. Automatic ascent leaves remaining loot and enemies behind. A floor cannot remain active with both Archons defeated while waiting for round 8.

## Tavern and rewards

**Confirmed Taverns:** retain the normal full-service transition Tavern after S3, before entering The Apex. Inside S4, the Tavern is the first spawn of floor 3's first pair, accompanied by one other spawn. It offers full services and one rest restoring **up to 50 HP for 50 Gold**, using the usual maximum-HP cap and once-per-visit rule. It is the last scheduled preparation stop before the S3 rematch and Predator. No Tavern is added between Apex floors.

**Confirmed reward direction:** returning Archons grant substantial Gold and a rare-card offer, with the possibility of a legendary and of a good item. Exact Gold, rarity odds, item odds/quality and offer handling when two Archons are defeated together remain to specify. Reward generosity is intentional; consider it when tuning the floor-3 shop and final fight. S4 card/item pools, shop stock and Tavern dialogue remain to design.

## Apex Predator — original design direction

The Predator waits alone on floor 4. No countdown, scavenging or pursuit forces the player into combat. Give a clear action to start the fight and let the player inspect their build beforehand. **Confirmed direction:** a long, high-HP endurance fight testing everything learned so far. It destroys cards, applies Corruptions, deploys and commands Ideons, and deals threatening attacks. It should be an absolute menace, demanding sustained use and rebuilding of the player's engine. No new fourth combat system is needed. Its exact HP, damage, elements, move cycle, escalation, destruction targets, Corruption selection and Ideons remain to design. Its approved appearance is specified under Setting and art direction.

The intended role is the culmination of the run and the hardest fight up to this point. The preceding floor choices should affect the resources and build brought here. Avoid prescribing specific required cards before designing and testing the encounter.

Victory follows the main design's normal-run ending, including the closing line “… but Astrata is still restless …”. Hidden S5 progression is separate from this ordinary victory path.

## Presentation, determinism and implementation checks

Implementation checks for the first playable build:

- Display **The Apex · Floor N** and **Round N/8**, with the two-spawn preview preserving the scheduled Archon pair and Tavern slot. Floor 4 has no misleading round counter.
- Use the standard Stratum map layout, titled **The Apex**, without a floor-number label, purple deadline box or Archon-name strip (4.0.35). Keep hunt timing in enemy inspection and the entry explanation. Show Ascend appearing and keep it visually distinct from loot.
- Choose floor contents and Archon pairs through the saved run RNG. Save floor, round, remaining Archons, hunt status and staircase availability; Continue must not reroll or reset a deadline.
- Archive floor transitions, both Archon identities, encounters, rewards and abandoned contents with the rules version. Keep optional full-clear achievements auditable.
- Verify pair-4 replacement, floor-3 Tavern scheduling, a single two-Archon battle after a missed deadline, lone-survivor hunting, automatic center-entry after the second Archon victory at any round (only once the full encounter and rewards resolve), stair reachability, voluntary second fights, achievement failure for abandoned enemies, Wanderer base-one movement, and the final room's absence of a map clock.

## Next design decisions

The floor geometry, center entry, stationary Archons, hunt timing, automatic post-hunt ascent, encounter-reuse direction and Tavern recovery are confirmed. Next specify numerical S1/S2 rematch/reward tuning and the Predator's actual moves. Immediate ascent after the second Archon's battle victory is confirmed, alongside voluntary exit through Ascend after the first. Settle remaining spawn/collision and shop details during that design pass. Implementation was subsequently authorized; see the first-playable snapshot above.


### Predator art revision and Rift Boar

Jonathan reassigned the first boar/bison image to an Eidolon and requested a much more terrifying wolf/tiger or combined-predator final boss, potentially winged. The selected replacement is a winged wolf–tiger with saber teeth and dark-energy edges. This supersedes the original boar-like Predator art direction; its 640 HP and six-move mechanics remain unchanged. Crushing Tusks is now named Rending Fangs.

The Rift Boar is a native Apex Chaos Eidolon, Stalker, 135 HP. Cycle: Rift Gore (18 Earth), Cinder Breath (12 Fire then 12 Chaos), Rending Charge (22 Chaos, Pierce). Native numbers are not multiplied by the returning-enemy scaling. It joins the Eidolon pool on all three ascending floors, and its map spawn counts toward I Stand Alone. Earlier Strata cannot offer it. This is an initial implementation choice for its combat role.


### Colossal Predator appearance and Rift Chimera (game 4.0.1)

The prior winged wolf/tiger becomes **The Rift Chimera**, an Apex Eidolon. The final **Apex Predator** is a far larger nightmare: nearly fills the frame, mountains dwarfed by its claws, wings/body beyond the frame, presence blotting out sunlight and replacing it with black corrupt energy, extreme luminous-dark contrast and horrifying eyes/teeth. This supersedes earlier final-boss artwork descriptions. Visual scale only; Predator HP/damage/mechanics unchanged.

Rift Chimera first-pass implementation:145HPWind,flying Stalker; Wing Buffet20Wind, Threefold Breath9Fire+9Earth+9Chaos, Night Pounce22Light. Native Apex Eidolon pool on all three ascending floors; no returning-enemy scaling. Prior art remains preserved under its new enemy asset name. Existing4.0.0 saves remain compatible.


Presentation preference: Apex Predator, Rift Boar and Rift Chimera artwork is mirrored horizontally in game, facing toward the player on the left. Mirror the art only, including previews; do not reverse card text or interface layout.


## Approved pressure and environment refinement — 4.0.2

Returning enemies receive an additional 10% HP and direct damage over the prior rematch modifiers; S2/S3 source tuning is inherited once. Native Rift Boar and Rift Chimera receive 20% HP/damage (162 and 174 HP). Mind Hive stays a 15-round survival timer. The Apex Predator and its owned Ideons remain unchanged. Target roughly 5 Focus and 5 Channel or more by S4; do not grant resources automatically.

Four distinct top-down field images now distinguish the floors. The battle background depicts a small candlelit meditation mat at a cliff, overlooking lava and crystals. Original art remains archived alongside these selections.
