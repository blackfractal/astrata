# Stratum 3 planning — The Lucent Depths / Ideons

Playable draft 0.24 · 2026-10-13 · Jonathan / Codex

Companion to [the main design](astrata_design.md) and [Stratum 2 planning](stratum_2_planning.md). Jonathan selected **The Lucent Depths** as the Stratum name on 2026-10-12. Jonathan authorized implementation on 2026-10-12. Package 3.0.0 now implements the first playable S3 encounters. The implementation snapshot below takes precedence for this build; the later discussion sections preserve earlier proposals and open alternatives for review. The deterministic S3 tutorial remains deferred under the encounters-first development order.


## Implemented snapshot — 3.0.0

The Lucent Depths now follows the second transition Tavern. Lucid Guide is granted explicitly on entry, with its story. There are six Motes, three Eidolons, three Archons, eight Ideon kinds, five player cards, three events and thirty new illustrations. Art uses indigo/teal alien crystal caverns, organic ivory/chitin enemies and a candlelit meditation field. No altitude viewer, Tower rules or general Druid movement cards were added.

See [the implementation report](../reports/stratum3-build-report.md) for exact choices made from the open proposals, limitations and validation. Runtime definitions are in `src/depths-content.mjs`. Main design §10.13 is the current rules summary. All first-pass numbers are balance candidates rather than claims of final tuning.

The initial Mind Hive test was too easy because late insects could not cross the grid before the timer expired. Its last spawning waves now emerge in progressively nearer columns, with a full player response before their first command. Failed spawns still do nothing; a full legal board remains legitimate spawn denial.

## Liquid Crystal supplies — implemented 3.0.5

**Liquid Crystal (Stratum 3).** A tiny vial of brightly colored liquid, carried as a one-slot material. S3 starts with three visible supplies: seeded one or two Liquid Crystals (equal probability), one Healing Sap, and, when only one Crystal is chosen, one other potion. No ordinary loot/shop pool entry. Drag a Crystal onto a potion in the Satchel (or use the item details action) to consume the Crystal and permanently double that potion's numeric effect. Each potion accepts one Crystal: Healing Sap 5→10 HP, Focus/Channel +1→+2, Insight 1→2 cards, Star Flask 6→12 Arcane damage. The enhanced potion remains one item/slot and retains its normal phase, targeting and one-consumable-per-turn rules. Combining is free, does not count as using a potion, and is allowed during Field movement, Tavern visits and player Placement/Activation, never during enemy turns/reactions. Mark enhanced potions ×2, keep ordinary/enhanced tray groups separate, and show actual values in all item views. Save the enhancement and archive combination/use effects; expose combination to AI. Crystals have 50-Gold worth/25-Gold sale value; enhancement does not change potion resale value. Do not repopulate an existing field.

**Future ingredient quest (unplanned).** A later side quest may require carrying several ingredients in the Satchel and combining them at the end of S4. Its ingredients, recipe, reward and discovery conditions are not decided. Liquid Crystal currently only enhances potions; do not invent or implement that quest yet.

## Purpose and progression

Stratum 3 teaches **Ideons**: enemy-controlled cards placed inside the player's Mind Grid. Ideons are intrusive thoughts or voices that do not originate with the player. **Ideon is its own card type, not an Ally or Spell.** Its primary role is actively disrupting the player's formation and engine, rather than simply adding another source of ordinary attacks.

- Stratum 1: arrange cards, manage resources, connect elements, and survive card destruction.
- Stratum 2: distinguish cards from the spaces beneath them; manage Corruptions and repair them with Machine Elves.
- Stratum 3: respond to active enemies inside the grid while maintaining a spatial engine.
- Stratum 4, The Apex: combine these skills under sustained pressure. Its climb and gates belong in a separate plan.

The progression is from **disrupting spaces** to **occupying the grid with active hostile cards**. Existing foundation cards should remain useful. Later cards should reward a developed foundation without making their early acquisition completely useless.

## Setting and overworld direction

**Jonathan's direction:** S3 should look substantially different from earlier Strata. Candidate settings include an underground alien landscape, crystal cave or ice cave, with a distinct color scheme. The Stratum name **The Lucent Depths** is approved; detailed art direction remains to refine.

**Art recommendation, not approved:** combine alien caverns and crystalline growths in **The Lucent Depths** (approved name): dark indigo rock, pale cyan mineral light, violet shadows and occasional warm amber organisms. Floating or suspended jellyfish-like creatures suit the Cnidarian; porous crystalline colonies suit the Mind Hive; an ancient crystal focusing mechanism suits the cannon. Preserve the established painterly asset style and the player's candlelit meditation space. Keep bright elemental/status cues readable over quieter, darker battlefield surfaces. A literal ice cave remains an alternative, not an added ice/sliding mechanic.

### Enemy theme and continuity with Astrata

**Jonathan's thematic direction:** S1 has a forest theme, S2 has a steampunk theme, and S3 should explore an **eldritch-horror / alien** enemy theme while remaining recognizably part of Astrata. Apply this to the enemy roster as well as the landscape. Specific creature treatments below are recommendations, not approved designs or a new canonical origin story.

**Recommended visual vocabulary:** translucent membranes, chitin, mineral-grown anatomy, suspended organs, strange symmetries, watchful sensory structures and restrained bioluminescence. Use distinct silhouettes and body plans; do not make every enemy a tentacled blob. Preserve Astrata's painterly rendering, detailed materials, magical elemental colors and readable card composition. Convey otherworldliness through anatomy and behavior while maintaining the existing art style. Regional lighting/palette should connect the creatures to the Lucent Depths without making every creature the same color.

| Encounter concept | Suggested S3 treatment |
| :--- | :--- |
| Cnidarian | A translucent cavern-drifting organism with luminous internal structures and independently hunting tentacles. |
| Mind Hive | A porous alien colony with crystalline chambers and small insects emerging from its living architecture. |
| The Refraction Cannon | An unmistakable weapon silhouette built from grown mineral lenses, chitinous supports and a luminous firing aperture. It can look ancient and alien without repeating S2's brass/steam machinery. |
| Ward leech | A glassy parasite whose swelling body visibly holds the Ward it has stolen. |
| Formation disruptor | A jointed, unsettling creature whose limbs or threads visually explain how it pulls/swaps cards. |
| Guardian Ideon | A compact, distinctive hostile sentinel, visibly belonging to its owner rather than resembling a collectible player Ally. |

**World continuity recommendation:** retain familiar elemental magic, Corruption motifs and the player's established meditation space. Reuse recognizable visual relationships between each enemy and its Ideons; make intruders look like extensions, offspring or projected thoughts of that particular owner. The thematic progression can feel like forest life, constructed life, then unfamiliar forms of life/consciousness, without requiring a literal explanation of their origin yet. Gentle, intelligent Lucid Guide imagery can contrast with threatening enemies while sharing the same painterly world.

**Overworld barriers (Jonathan):** clearly recognizable block-like obstacles, visually reminiscent of Zelda-style map blocks, prevent both player and enemy movement. Use original art suited to the setting. They are overworld obstacles, not Mind Grid Corruptions. Flying creatures **may** be allowed to cross them; this is a proposed explicit movement trait, not yet a universal exception. Overworld flight does not restore the discarded altitude viewer, elevated-card or flying-target combat rules.

**Implementation recommendations:** show obstructed movement and legal routes clearly; ensure map generation leaves traversable paths to required encounters/services. Decide diagonal corner-cutting, flying transit versus resting on a barrier, and interaction with any teleporting/hunter movement before implementation. Do not silently let ordinary enemies pass through obstacles that stop the player. Use barriers to create meaningful route choices while preparing players for The Apex's gates.

## Strength benchmark and possible companion

**Jonathan's current balance direction:** Stratum 3 enemies must be strong against an already developed run: roughly **3–4 Focus and 3–4 Channel per turn**, strong elemental combinations, two Bracelets and two Rings, and access to S3 cards that help handle Ideons. Treat this as a representative test build, not a guaranteed equipment/resource grant or a ceiling. Earlier7Focus/5Channel discussion remains a possible stronger engine, not a minimum required just to enter S3. Test stronger engines too. Do not balance the Stratum around starter-deck resources or assume the new mechanic alone creates enough pressure.

**Recommended pressure tests:** ensure passive equipment alone does not routinely neutralize the whole enemy turn; require competing uses of Channel for attacking the owner, removing intruders, activating defense and maintaining the formation. Focus should matter for deployment and replacement. Use simultaneous, visibly scheduled direct attacks and Ideon disruption where appropriate. An enemy can have deliberately quieter turns, but repeated telegraph-only downtime should not let strong engines stabilize without cost. Do not simply increase every Ideon's HP until clearing one consumes the entire turn; variety, intrusion location and coordinated move cycles should contribute. Evaluate the complete turn and full encounter, not raw boss HP alone. These are testing recommendations, not finalized numbers or global enemy buffs.

**S3 companion direction:** S1 Sapling is Druid-specific; S2 Machine Elves are shared across characters. Jonathan accepts **Lucid Guide** as the S3 companion concept and proposes many activations, moving up to one Mind Grid space and then marking/attacking an adjacent Ideon. Exact acquisition, shared-versus-class-specific policy and card statistics still need approval; no companion is being implemented yet.

**Assistant recommendation:** make Lucid Guide shared across classes, introduced explicitly on entry, and useful support rather than mandatory universal Ideon removal. Keep ordinary attacks and S3 reward cards viable answers if it is not drawn or is destroyed. It should not instantly banish any Ideon regardless of HP, repair Corruptions, or silently ignore enemy field restrictions. Earlier delay/protection alternatives remain unused suggestions, not part of the current mobile-guide proposal.

### Lucid Guide — mobile companion proposal

**Jonathan's proposed behavior:** a large activation allowance; on activation, move up to one space, then mark/attack an adjacent Ideon. Moving is optional ("up to"); it may remain in place beside a target.

**Recommended first test, not approved stats:**1Focus placement,1Channel per activation,12 total activations, ordinary once-per-turn limit; **non-recallable**, following the usual Ally restriction (lifecycle approved by Jonathan on 2026-10-12; the other first-test statistics remain proposals). One combined activation pays for movement and the attack/mark, not separate Channel/use charges for each part. Move the Guide itself one orthogonal space into a legal empty destination, then optionally attack one orthogonally adjacent Ideon and mark it for a bonus from the next attack activation by another player card. Permit movement-only use when no Ideon is adjacent afterward; do not spend a use for a no-movement/no-target action. Attack damage, element, HP, mark bonus/expiry/stacking and upgrade remain to design. Mark should be applied after the Guide's own hit so that hit cannot consume its own new bonus; define equipment-proc and area-attack interactions explicitly before implementation.

The high use count supports sustained hunting without giving the Guide multiple actions in one turn. Finite uses and HP still matter; no automatic Recall or replenishment is proposed. Its self-movement does not establish general movement of other cards as a Druid specialty; the larger card-movement suite remains the Sorcerer's direction.

**Interactions to resolve:** destinations containing Corruptions or Ideons, diagonal versus orthogonal movement if Jonathan prefers otherwise, movement restrictions such as Locked, whole-stack/Meld handling, and attacking an Ideon covering another card. Recommended baseline is ordinary space legality, with no Machine Elves-style Memory Hole exception. Direct projectile coverage still prevents activation, defense and Recall, so the Guide cannot activate its way out while covered. Elemental/shared-use/pain/destruction fields still apply; exact evaluation when moving between different fields requires a declared activation/trigger timing. Do not grant hidden immunity merely because it is the tutorial companion. The Guide itself is an Ally and can be threatened by Cnidarian's tentacles.

### Companion art direction

**Jonathan's direction:** Lucid Guide should resemble a more upright version of the new Familiar rendering. He likes that Familiar image, but finds it too majestic for a basic S1 Ally. Current selected reference is **assets/card-familiar-v3.png**: a luminous four-legged fox/wolf-like spirit with teal-white energy, a flowing mane/tail and a proud posture, painted in the forest setting. Use it as the visual reference for Lucid Guide; this is an art-direction note, not an automatic reassignment of the existing asset.

**Suggested treatment:** give the Guide a taller, upright, deliberate silhouette with the same recognizable spirit-animal face and flowing energy. Preserve the painterly style and sense of intelligence; exact seated/rearing/bipedal posture is still to explore, not a requirement for human anatomy or clothing. Let this S3 companion carry the majestic visual weight. A future Familiar revision can be a smaller, simpler four-legged spirit with a restrained glow, shorter mane/tail and an alert, curious presence appropriate to an early companion. Keep the magical-energy identity; "simpler" should not turn it into an ordinary physical animal.

Preserve Familiar v3 and previous revisions when producing new art. No images have been generated, replaced or switched by this planning update; current game assets remain unchanged.

## S3 cards — practical Ideon answers and demanding legendaries

**Jonathan's direction:** add a couple of cards that help deal with Ideons, then introduce legendary cards that are difficult to place or demand substantial Channel/activation conditions. Continue cumulative, fixed-within-Stratum pools; these new cards enter from S3. No runtime content has been added. Jonathan approved Lucid Needle including Recall 1 Focus, and the revised 1-Channel horizontal-beam Scouring Gale described below, on 2026-10-12. The original full-grid Gale is withdrawn.

**Card specification rule (Jonathan):** every card proposal must state its Recall Focus cost or explicitly state that it is non-recallable, destroyed on use, or otherwise removed at a specified time. Placement cost, activation cost and uses alone are incomplete. Include the lifecycle of spent cards; do not silently assume free recycling.

**Approval status (2026-10-12):** Lucid Needle and the revised Scouring Gale below are approved for future implementation. Jonathan also approved Concord of Seasons Recall 2 Focus, Lucid Guide being non-recallable, and Second Spring being non-recallable and destroyed after activation. Other previously proposed legendary effects/statistics and unresolved companion statistics remain drafts; this approval does not authorize implementation.

| Card | Type / element | Focus | Channel | Uses | Recall / lifecycle | Effect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Lucid Needle | Spell / Arcane | 0 | 1 | 2 | Recall 1 Focus; otherwise remains placed when spent. | Deal 6 damage to a legal hostile target, doubled to 12 against an Ideon. A cheap focused answer that remains usable against ordinary enemies. |
| Scouring Gale | Spell / Wind | 1 | 1 | 2 | Recall 1 Focus; otherwise remains placed when spent. | Fire a beam rightward along this card's row: deal 8 Wind damage to every legally targetable Ideon in that row to its right, then 4 Wind damage to one selected legal off-grid enemy. Friendly cards are unharmed and do not stop the beam. No hit on Ideons to its left or in other rows. |
| Concord of Seasons | Legendary Spell / Arcane source | 4 | 3 | 2 | Recall 2 Focus; otherwise remains placed when spent. | Requires at least 3 distinct non-Arcane elements among connected orthogonally adjacent exposed friendly cards. For each distinct qualifying element (maximum 4), deal 10 damage of that element to all legally targetable enemies/Ideons. Each element strikes once, not once per neighbor. |
| Second Spring | Legendary Spell / Water | 3 | 3 | 1 | Non-recallable; destroyed after its activation resolves. | Choose up to 4 exposed, spent friendly cards with a direct-damage, Shield or Ward activation. Grant each 2 additional activation uses. Does not restore HP, charges, Ward value or the current turn's activation opportunity, and cannot recover Destroyed cards. |

**Approved Scouring Gale direction:** use the horizontal beam for its distinct, easily previewed lane. Placing it toward the player covers more incoming Ideon positions; choosing the wrong row, or letting a crawler pass to its left, reduces its value. It retains a small ordinary-enemy attack when its lane is empty. The original 2-Channel, 16-damage global Ideon sweep is withdrawn. The 1-Channel beam and 8/4 damage are approved initial values, subject to later playtesting. The radius alternative is not the selected design.

**Targeting constraints:** both Needle and Gale obey elemental fields and guardian protection. Gale is not an exception allowing a protected owner to be hit through a surviving guardian. Preview any unavailable final enemy hit; exact same-activation guardian-death/target-selection ordering must be settled before implementation. The enemy at the end is a selected legal off-grid enemy, not an enemy sprite required to line up visually with that grid row. Multiple Ideons in the lane each take the printed hit rather than sharing one damage budget. Check actual Ideon HP, encounter density and Cnidarian reproduction when balancing; clearing several tentacles can worsen the next wave.

Concord rewards a prepared elemental formation and elemental relays rather than equipment alone. With3 qualifying elements it produces three10-damage waves; with4, four waves. Use current committed source elements, not uncommitted hover choices, and apply ordinary elemental matchups separately. Its printed source remains Arcane: multi-element output does not make it legal to activate inside a non-Arcane field. Severed/covered/hostile cards cannot supply the formation. Exact wave order and equipment-proc handling need explicit resolution rules before implementation. It is distinct from Eclipse Seed's delayed30Chaos release: the expensive immediate burst requires a diverse board and3Channel in one turn.

Second Spring preserves a developed foundation after uses run out, trading3Channel now for future turns. Utility-only resource cards such as Focus Energy, Wild Conduit and Opening Rite are excluded; one-use/destroy-on-activation restrictions are not overridden. A depleted Ward remains depleted until a valid revival effect restores it; a spent fully charged Kiln could gain the allowance to release later. It cannot reactivate a card already used that turn, and it does not automatically execute any of the refreshed cards. All legal activations still cost their normal Channel. Mark this as an allowance increase, not a reset of every card parameter. The approved non-recallable, destroy-after-use lifecycle prevents ordinary Recall recycling and an on-board Second Spring refresh loop. Upgrade behavior and eligible-card corner cases remain to settle.

**Balance recommendation:** combine meaningful setup/resource costs with effects that scale from existing formations. Do not stack every possible cost onto every legendary. A legendary should make its expensive commitment worthwhile without removing Ideon counterplay or bypassing the remaining encounter. Test against the3–4Focus/Channel reference and stronger equipment engines; Needle, revised Gale and the specified Recall/lifecycle rules are approved; other legendary and companion details retain their proposal status.

## Existing stacks remain simple

The altitude viewer, four-level gameplay cap, same-height amplification and height-dependent flying enemies are withdrawn from this plan. Keep the current stack inspection and card-specific stacking rules in all Strata; there is no profile unlock or level-navigation tutorial.

Magnifier Ward replaces Magnifying Glass Tower in the current game. It is a standalone Ward or a melded reinforcement beneath another Ward, not a height multiplier. Heat likewise melds beneath an eligible attack and supplies Burn on two attack activations. Plasma Ball also melds beneath its original host, with a four-ball cap and diminishing combined damage; its allowance and Recall cost grow per added ball. These rules are defined in the main design; Stratum 3 does not introduce a universal tower system.

## Ideons

### Established concept

The term Jonathan used is **Ideon**. These are enemy-controlled intrusions that occupy the Mind Grid as cards. The enemy's move list specifies its direct action and which Ideons it activates, in order. A move can combine a direct attack/effect with one or more Ideon activations, activate Ideons only, act directly only, or activate a selected subset of its Ideons. Do not automatically activate every Ideon on every enemy turn. Any blockable direct attack/effect uses its printed response rules.

When defeated, an Ideon returns to its owner's theoretical enemy deck. Whether and when that Ideon reappears is determined by that enemy's programmed move list, not by an automatic shared respawn timer or the player's draw/discard rules. An actual shuffled enemy deck is not required merely to express this lifecycle. Ideons never become player cards merely because they are defeated. A guardian Ideon protects only its owning enemy unless its text explicitly extends protection. All Ideons disappear when their owner dies. The default interaction rules below are approved; exact simultaneous-resolution details remain to settle.

Ideons differ from:

- **Corruption:** a status attached to a Mind Grid space. It can affect the card on that space, adjacent cards, and/or the player. Some can be covered, suppressed or neutralized under their printed rules. Its location persists independently of cards.
- **Hex:** a player-controlled card whose negative effects depend on what the player chooses to do or not do with it. Being harmful does not make a Hex enemy-controlled.
- **Ideon:** an enemy-controlled card, with its own distinct type and owner-directed activations. Its effects may move it, swap cards, change stats or elements, protect its owner, or attack particular targets.
- **Hypnosis:** an effect compelling a player's own card. An Ideon has hostile ownership from the outset.

The earlier **Ideon Hex** phrase is not an approved hybrid type. A future Hex could explicitly create an Ideon or transfer control, but that transition would need its own rule. While controlled by the player it is a Hex; an enemy-controlled intrusion is an Ideon. Trouble in the Grimoire/discard versus on the grid remains a possible Hex design.

### Approved default Ideon interactions — 2026-10-12

- **Occupancy and failed spawning:** Ideons normally occupy unoccupied spaces. Covering a card or going underneath one requires an explicit ability. If there is no legal spawn space and the Ideon cannot cover/go under cards, it does not spawn. Do not automatically destroy or displace player cards to make room. A full board can therefore deny ordinary spawns; encounter-specific exceptions must be visible and explicit.
- **Attack targets:** ordinary attacks can target any Ideon regardless of its grid location, subject to the attack's own printed restrictions. Positional defense restrictions do not impose a global range limit on offensive targeting. Printed adjacent-only or beam attacks retain their restrictions.
- **Area attacks:** "damage all enemies" includes all enemies and all Ideons. Existing area attacks gain this wider scope in S3. This defines the target set; it does not itself waive explicit immunity or protection rules. Guardian interaction with simultaneous area hits/death still needs a precise resolution rule.
- **Guardians:** protect only their owning enemy unless explicitly specified otherwise; they do not automatically protect other enemies or other Ideons.
- **Defense position:** a defense must be in the Ideon's column or farther toward the intended target, between the shooter and target. For an Ideon in column 4 attacking the player on the left, cards in columns 1–4 may defend and columns 5–7 may not. Subsequent interceptions follow the existing no-backward-travel rule. Same-column defense is allowed; no same-row requirement is introduced. Attacks aimed at Allies still need explicit interception/target-endpoint handling.
- **Elements and statuses:** Ideons react to elemental attacks normally and can suffer Burn, Poison and Corrode under ordinary status/element rules and any explicit traits. Having the Ideon type alone grants no status immunity.
- **Friendly synergies:** Ideons do not contribute to the player's adjacency bonuses and cannot provide attunement sources, even when they have an element. They remain hostile cards rather than friendly formation members.
- **Owner death:** all of an enemy's Ideons disappear when that owner dies. This is owner cleanup, not transfer to player piles. Exact cleanup-versus-kill-trigger ordering remains to specify where relevant.
- **Ownership visibility:** the player must be able to identify which enemy controls each Ideon. Jonathan suggested a corner icon. Recommended presentation: a small matching owner portrait/badge, with owner name and linked highlighting on hover/inspection; distinguish duplicate enemies by owner instance rather than species alone. Exact visual treatment is a UI recommendation.

### Disruption candidates from Jonathan — effects to develop, not finalized cards

Stratum 3 should challenge successful Stratum 2 strategies without making their foundation cards universally obsolete. Specific numbers, names, ranges, target selection and caps below remain open.

| Candidate | Proposed behavior | Strategy challenged |
| :--- | :--- | :--- |
| Ward leech | Latches onto a Ward. Each player card placement and activation drains some of that Ward into the leech's stored reserve. When its owner activates it, the leech heals the owner using that reserve. | Banking a large Ward pool while repeatedly rebuilding/activating an engine. |
| Guardian | Prevents targeting its owner until defeated. Its defensive trait resists every elemental attack (Fire, Earth, Wind, Water, Chaos and Light) but is vulnerable to Arcane. Elemental attacks can still defeat it. | Ignoring intruders to rush the owner; rewards retaining Arcane offense without requiring it. |
| Sticky Ideon | Adjacent player cards cannot Recall while within its influence. | Undertow/Recall refresh loops and easy extraction of endangered cards. |
| Crawling insect | Crosses the Mind Grid; reaching the opposite edge without being killed causes large player damage. | Static formations and delaying removal of an apparently low-pressure intruder. |
| Ally hunter | Aggressively attacks the player's Allies; otherwise occupies space without attacking the player. | Using persistent Allies as both offense and renewable defense. |
| Swapper | Moves itself, swaps with a player card, or exchanges two player cards adjacent to it when commanded. | Reliance on stable adjacency, attunement relays and positional defense. |
| Stat/element meddler | Changes a selected card's stats or element when commanded. | Permanent elemental setups and narrowly optimized engine pieces. |

Ward-leech decisions still needed: drain per trigger; exact triggering scope and timing; whether depletion follows ordinary Ward rules; reserve capacity; whether healing consumes the reserve; and what killing/detaching it does to stored Ward. Attachment could be visual or mechanical; do not silently introduce a hostile Meld. Sticky effects need explicit whole-stack/Undertow interaction. Crawlers need a visible route, movement and occupied-space rules. Ally-targeted attacks need an explicit interception rule.

**Guardian refinement (Jonathan):** resistance to all elements and weakness to Arcane replaces the Arcane-only immunity proposal. Strong elemental builds may brute-force it; powerful Arcane attacks earn a more efficient answer. Proposed initial values, not yet approved balance numbers: elemental attack damage ×0.5, Arcane attack damage ×1.5, rounding up normally. Thus a printed10-damage hit deals5 elemental or15 Arcane. This is an explicit local defensive trait, not a change to the global element cycle or Arcane's normal neutrality; use this trait instead of additionally multiplying by a normal defensive elemental matchup. HP, status interactions and respawn cadence remain to settle. Show the resistance and vulnerability clearly on inspection and in damage previews.

### New recommendations for the first implementation

Start with one simple disruptive Ideon and one guardian, both explicitly typed Ideon. Most introductory enemies should add one Ideon with one understandable job. Avoid simultaneously teaching several new Ideons and a new Corruption in the same first encounter. HP, uses and defeat conditions must be explicit per Ideon; do not import Ally/Spell behavior by implication.

An Ideon should look like a card, with a persistent hostile-ownership frame and a visible connection to its owner when inspected. Its full details should show who controls it, HP or remaining uses, next action, and how it can be removed. Do not rely only on a different tint: elemental colors already carry meaning.

An attack originating inside the grid should visibly begin at that Ideon. Apply the approved positional defense rule: same-column defenses and defenses between the source and intended target are eligible; defenses behind the source are not. This gives Ideons a clear strategic purpose: a large defense wall is insufficient if a threat appears behind it.

Telegraph both placement and first activation. Recommended introductory timing: warn during a player response window, place the Ideon, then give the player a response before its first activation. Exact timings may vary on clearly described later enemies; do not make an apparent harmless placement produce an unexplained immediate attack.

Machine Elves remain Corruption repair specialists by default. Whether they can affect Ideons is a separate design decision; do not make them universal removal automatically.

### Rules to settle before building

1. **Occupancy exceptions:** defaults and failed spawns are settled above. Specify interaction with Corruption spaces, player placement over Ideons, and individual cover/under-card abilities; do not assume those abilities form friendly Melds.
2. **Displacement:** what happens if a movement effect shifts a player card or hostile card into an occupied space? Preserve whole-stack movement where applicable.
3. **Resolution and interception:** settle guardian protection during simultaneous area attacks, multiple guardians, and interception of Ally-targeted attacks. Ordinary targeting, all-enemy target scope and same-column defense eligibility are settled above.
4. **Enemy move list:** for each move, specify the direct action, selected Ideons, their order and any repeated activations. Display the whole upcoming sequence. Owner-controlled scheduling is settled; the individual cycles are not.
5. **Lifecycle details:** defeated Ideons return to the owner's theoretical deck and reappear only as programmed. Owner death removes all owned Ideons. Still decide cleanup/kill-trigger ordering, exhaustion of any printed uses, and row/column destruction interactions.
6. **Interactions:** friendly adjacency bonuses/attunement exclude Ideons, and ordinary elemental/status rules apply. Still specify Corruption effects on Ideons and other individually printed cross-ownership effects.
7. **Counterplay:** which existing cards can answer them, and what additional Stratum 3 cards or companion are needed? Do not require one randomly offered counter card to survive.

## Reusable enemy concepts — suggestions, not a committed boss roster

Jonathan approved developing ordinary Mote/Eidolon encounters from these unused boss concepts and additional brainstorming. Some S3 enemies must continue using Corruptions; Ideons do not replace S2 mechanics. Individual rosters and move lists remain to be designed. Jonathan requested retaining these ideas even if they become Eidolons or Motes rather than Archons. Names, numbers and cycles are provisional; simplify a concept to one signature Ideon for an introductory enemy. Unused concepts should remain available for later content.

| Working concept | Core behavior and suggested sequence | Player decisions |
| :--- | :--- | :--- |
| The Kindly Hunger | A soothing entity using Ward leeches. Attack + telegraph leeches; place leeches + moderate attack; **Drink Deep** commands surviving leeches to heal their owner; **Empty Embrace** makes a strong mixed-element attack against drained defenses. Suggested leech reserve is consumed on healing and lost on leech death, not yet approved. | Develop while feeding a leech, kill it before the healing command, or shift defense toward Shields/Allies. |
| The Knotkeeper | **Binder** Ideons prevent adjacent Recall; **Shuttles** swap adjacent player cards when commanded. Place intruders, command a swap into a Binder's influence, then threaten the trapped formation with a clearly telegraphed disabling/destruction effect. Broader Shear could be an escalation or belong to another enemy. | Kill Shuttle before movement, kill Binder to restore Recall, spend the endangered card, or rebuild around its new position. |
| The Endless Procession | Mobile insects: a **Runner** crosses quickly and hurts the player on arrival; a slower **Burrower** swaps with occupied player cards as it advances. **March** commands all surviving insects; **Chosen Messenger** visibly selects one for extra movement alongside a direct attack. | Prioritize by announced movement and arrival risk rather than distance alone; use area attacks to control numbers. Jonathan prefers Mind Hive or Endless Swarm for the boss direction below. |
| The Borrowed Face | A **Dyer** changes one adjacent card's underlying element; a **Mirrorling** exchanges two adjacent player cards' underlying elements. Follow disruption with mixed-element attacks. Proposed scope preserves already-created Shield Guard portions. | Kill the meddler, Transmute afterward, or adapt to the elements now attached to different jobs. |
| Ally-hunting specialist | Ideons attack player Allies but otherwise only occupy grid space. Suggested as an Eidolon encounter; could scale to another role. | Protect key Allies, remove the hunters, or exploit their limited targets with a different build. |

## Mind Hive / Endless Swarm — Jonathan's survival-boss proposal

Preferred direction over the earlier ordinary damage-race Procession. **Mind Hive** plays on "hive mind"; **Endless Swarm** is an alternate name. Neither name is finalized. This is a proposed future encounter, not implemented gameplay.

- All attacks directed at the Hive itself deal **0 damage**. The player fights its insect Ideons and survives until the Hive exhausts itself rather than directly killing it with attacks.
- **Clarified by Jonathan: lose exactly1HP per turn, independent of the number of insects created.** Swarms do not accelerate the countdown; failed/blocked spawning must not stop it. The original100HP/100-turn duration is withdrawn as too long. Use a fixed, substantially shorter battle duration; its exact turn count remains undecided.
- Early turns may produce individual insects and occasional small swarms. The **last few turns must be dramatically worse than the preceding turns**, with repeated swarms and overwhelming grid pressure. A very strong engine should still struggle around2–3 turns remaining; the player may need to accept damage across several turns to survive. The old90/80/etc and10-through1 thresholds were examples tied to the withdrawn100HP duration, not fixed thresholds for the shorter encounter.
- When the Hive reaches **0 HP**, it dies and **all its insects die with it**. The defeat of the owner ends its swarm rather than requiring cleanup of every insect.
- Preserve insect counterplay and the earlier Runner/Burrower movement ideas as candidates. Exact species, HP, attacks, routes, spawning positions, caps and activation sequences are not settled.

**Initial pacing recommendation, not yet approved:** test15 turns/15HP, with five turns to establish the formation, six of increasing pressure, then four sharply escalating survival turns. Late waves should outpace routine removal and make prioritization/defense matter; exact spawn counts depend on insect durability, movement and available spaces. Display a prominent turns-remaining countdown rather than making the player infer it from an ordinary HP bar. Define exactly when the per-turn decrement occurs, how many full player response windows are guaranteed, and how the final wave can matter under the summon/first-activation timing. Do not promise15 full rounds while resolving a start/end-of-turn ordering that silently removes one.

**Other implementation questions:** can statuses, reflected damage, HP-setting effects or healing alter the Hive's countdown, or is it wholly self-depleting? Without a legal spawn space, an insect does not spawn unless its explicit covering/under-card ability permits it. The countdown still continues. Which insects activate on spawning turns, and does death at0 cancel all remaining queued insect actions immediately? Show remaining reserve/countdown, next wave and commanded insect intents clearly. Do not allow board saturation to stall an otherwise invulnerable Hive forever.

**Balance recommendation, not an added mechanic:** achieve the desired late overwhelm through visible spawn rates, movement and attacks. Do not secretly scale to the player's defenses or impose an unavoidable scripted HP deduction merely to guarantee damage. Efficient early play should save cards/HP for the finale, and better decisions should still reduce the damage taken. Keep mass insect movement and attacks readable without excessive per-insect animation/decision delays.

## The Cnidarian — Jonathan's Archon proposal

A jellyfish-like monster creates **Tentacle Ideons** that hunt the player's Allies. Candidate Archon, not an implemented or finalized encounter. It develops the Ally-hunter idea into a threat that also matters when the player has no Allies.

- Tentacles become stronger each turn they remain alive. Which stats grow, by how much, and at which turn boundary remain open.
- Killing a tentacle causes the Cnidarian to replace it. Replacement quantity escalates with cumulative tentacles killed in this battle: deaths1–3 each produce1 replacement; deaths4–6 each produce2; deaths7–9 each produce3; and so on. This specifies increasing numbers, not yet an independently increasing activation/spawn frequency. Count replacement tentacles in subsequent deaths as normal.
- While any player Ally remains on the board, tentacles target Allies. With no Allies remaining, tentacles drift toward the player. Upon reaching the player-side edge (Jonathan's "back row"; column1 in the current left-player/right-enemy layout), they begin inflicting Poison.
- Pressure comes from both aging tentacles and multiplying replacements. Clearing every tentacle indiscriminately should not be the automatic best response, but leaving old tentacles indefinitely should also be dangerous.

| Cumulative tentacle death number | Replacements for that death |
| :--- | :--- |
| 1–3 | 1 |
| 4–6 | 2 |
| 7–9 | 3 |
| 10–12 | 4 |
| Further deaths | Continue adding1 replacement per group of3, subject to eventual agreed capacity rules. |

**Recommendations, not approved rules:** newborn tentacles start at base strength rather than inheriting the killed tentacle's growth, making selective kills a way to reset a dangerous individual. Resolve replacements on a visible owner move/command rather than instantly in the middle of a player attack; show pending counts and next replacement tier. For simultaneous deaths, assign tiers in a stable deterministic order and show the total resulting brood. Keep the Cnidarian itself damageable so this can be a race to kill the owner while selectively managing its limbs, distinct from Mind Hive's fixed survival countdown. Existing Ideon scheduling still applies: the owner move specifies which tentacles attack/move/act, rather than silently giving every tentacle an independent full enemy turn.

**Rules still to settle:** starting tentacle count; boss HP/element/direct moves; tentacle HP/element, growth and attack values; spawning positions and timing; whether replacements consume an owner action; active population limit and replacement scheduling (ordinary spawns fail without a legal space); whether all tentacles or only commanded ones grow; deterministic Ally selection; whether defenses can intercept an attack aimed at an Ally; whether newly appearing Allies stop/reverse an advancing tentacle or merely change its next target; drift speed/path and occupied spaces; Poison amount/frequency and whether it replaces movement/attack at the edge; cleanup-trigger ordering (all tentacles disappear on owner death). Clarify what counts toward the kill counter if tentacles are removed by enemy effects or environmental destruction. No active cap or excess-replacement conversion has been chosen; absent explicit exceptions, failed spawns simply do not occur.

**Balance goals:** Allies can divert tentacles from the player but risk being destroyed; replacing/killing a chosen old tentacle buys relief at a visible long-term population cost. Area attacks remain useful but can cross replacement thresholds, so preview that consequence. The first three one-for-one kills offer limited safer resets. Killing the fourth tentacle begins population growth. Avoid an endlessly replenishing wall that blocks all damage to the owner unless there is an explicit alternate victory route.

## The Refraction Cannon — moving-field Archon

A giant cannon launches energy balls across the Mind Grid toward the player. Small diamond-shaped projectile visuals are suggested. The balls emit moving areas of influence whose colors indicate different rules. They can be attacked and stopped. Every launch includes a separate normally defended attack; surviving bullets eventually strike with Pierce. The boss name is approved; HP, intrinsic element and exact projectile stats remain open; this is future planning, not implementation.

**Approved name and theme (Jonathan, 2026-10-12): The Refraction Cannon.** Keep the explicit weapon identity within the Lucent Depths' outer-horror, alienlike aesthetic and Astrata's painterly world. Suggested treatment: an unsettling grown weapon with organic/mineral lenses, chitinous supports and a luminous firing aperture. Its silhouette should communicate a cannon while its anatomy feels otherworldly. This is not S2-style steampunk artillery; exact anatomy and composition remain art-development choices. Earlier Engine/Prismatic/Thoughtlance names are superseded.

**Jonathan's spacing direction:** arrange normal firing/movement so bullets ordinarily do not overlap. Cards that prevent Ideon movement are a possible future mechanic; stopping a bullet could cause later bullets/fields to catch up and make the situation worse. No immobilizing card has been approved or specified here. Distinguish overlapping projectile centers from overlapping influence fields: separate spaces alone do not prevent incompatible field restrictions.

**Scheduling recommendation, not approved:** preview future positions and field footprints when selecting each firing lane. Prefer a legal non-overlapping shot at the strongest eligible elemental card, preserving the approved parity entry and two-space stride. Target-ranking exceptions, field radius and the fallback when no non-overlapping shot exists remain to decide; do not silently add extra speed or change a fired bullet's path. Normal unobstructed schedules can avoid overlap while player-induced delays still create it. Resolution of such overlaps remains necessary, including conflicting element fields; do not silently make stopped bullets intangible or let them pass through one another.

**Recommended classification:** each projectile is an Ideon controlled by the cannon, carrying its own field. The field moves with the projectile and is not a persistent Corruption attached to each affected space. This distinguishes the mechanics without inventing a new status category. The owner move list specifies launches and movement/activation commands. **Confirmed travel stride: two spaces left per movement turn**, with the starting column selected by target-column parity as described below. Exact launch-versus-first-movement ordering remains to settle.

**Firing cycle — Jonathan's refinement:** continuously fire two or three elemental bullets, then one destruction-field bullet, and repeat. The elemental shot targets the strongest elemental player card currently on the field and uses its elemental counter. Include Allies, not just Spell-type cards: the explicit example is a strong Earth Grove Titan drawing a Fire bullet. If no elemental player cards are available, substitute the shared-use-field bullet. Pain-field bullets remain in the reusable idea bank but are not included in this proposed repeating cycle. Exact two-versus-three count and damage/HP values remain undecided; three elemental/fallback shots followed by one destruction shot is a suggested first test, not approved numbers.

| Target element | Counter-element bullet |
| :--- | :--- |
| Earth | Fire |
| Wind | Earth |
| Water | Wind |
| Fire | Water |
| Light | Chaos |
| Chaos | Light |
| No elemental target | Shared-use field; Arcane shot |

The bullet flies **right to left along the target's row**, eventually covering that card's space for **one full player turn**, then continues left. Its elemental field requires the bullet's element: Fire aimed at Earth requires Fire activations within the field. **Recommended trajectory commitment:** choose and visibly commit the row, element and target space when firing; later Recall, movement or Transmute does not make the projectile home in or silently change element.

**Entry parity — confirmed by Jonathan:** use the same row as the target. For an odd-numbered target column (1,3,5,7), spawn in the rightmost column7: path **7 → 5 → 3 → 1 → exit**. For an even-numbered target column (2,4,6), spawn in the second-rightmost column6: path **6 → 4 → 2 → exit**. Every movement advances two spaces left; no shortened first step is required. This uses one-based player-facing columns (player left, enemy right). The spawning position is a real resting position, so a target in column7 or6 must get the full covered player turn there rather than the bullet immediately moving past it on its launch turn. Keep left-edge impact ordering explicit, especially the even path which exits from column2 without resting in column1. The cannon must not merely animate across any target during an enemy turn without the promised covered player turn.

**Two distinct damage events:** each launch also delivers an equivalent elemental/Arcane attack from the cannon through the normal positional defenses (Wards, Shields, Allies and equipment, subject to ordinary rules). The traveling projectile is a separate attackable threat, not that launch hit moving slowly. If it reaches the player-side boundary, it deals **Pierce damage of its element**, or Arcane for a non-elemental field, bypassing Wards, Shields and Allies; only equipment can defend. This follows the existing Pierce definition. Destroying the projectile prevents its later arrival hit but does not undo the launch attack. Destruction/shared-use fields do not change the normal defense eligibility of their accompanying launch hits. Actual damage magnitudes, whether launch/arrival use identical amounts, and launch/movement/impact order still need specification; do not accidentally apply both damage events when spawning.

**Strongest-card selection recommendation:** reuse the existing destructive-boss valuation of damage/defense potential as a starting point, including Ally HP, Ward/Guard and remaining activation potential, with stable reading-order ties. Final individual-card versus whole-host/Meld valuation, elemental eligibility, and handling of temporary committed Attunement remain to settle. Show the chosen target and firing lane in the Tell; explicitly define whether a pre-shot forecast updates as the player changes the board. A forecast may be live before firing while the fired projectile's trajectory stays committed.

**Direct coverage — confirmed by Jonathan:** the projectile can cover a player card occupying its current space. That card cannot **activate, defend, or Recall** while directly covered. This is temporary obstruction, not a Meld or change of ownership; moving/destroying the projectile removes that obstruction, subject to any other effects still present. A matching element does not override direct coverage. How this affects underlying Meld members, ongoing passive bonuses and stored Shield portions must be explicit before implementation.

| Field variant | Effect on cards within its influence |
| :--- | :--- |
| Elemental field | Only cards using the required element may activate. **Confirmed:** evaluate the element chosen for that activation, including Attunement, rather than only the underlying card element. An Arcane Blast can therefore qualify by choosing a valid matching source. This does not grant Attunement to cards that lack it. **Transmute is itself Arcane:** when inside a non-Arcane elemental field it cannot activate merely because its intended result would change another card to the required element. Check the source card's activation element, never its target's resulting element. A Transmute outside that restriction may still change a target inside it if normal targeting allows; it cannot bypass the projectile's direct-coverage prohibition. |
| Shared-use field | Only one card within the field may activate during a player turn; after that activation, other cards in the group cannot activate that turn. Whether Blink can repeat the same chosen card or the field allows only one activation total remains open. |
| Pain field | Activating a card within the field also damages the player. Amount, damage type and defense/bypass rules remain open. |
| Destruction field | Activating a card within the field causes that card to be destroyed. Recommended timing is after its activation effects finish, so a final useful activation is possible; timing and host/Meld handling are not yet approved. |

**Presentation recommendations:** use a distinct center projectile plus translucent influence boundary; combine color with a symbol/name for each restriction. Keep player art/elements legible. Clearly distinguish the directly covered, fully disabled card from neighboring cards that may still activate under the field rule. Show the projectile's HP, path, next position and remaining travel to the player, and explain affected activation choices before spending resources. Influence shape/radius is undecided; a diamond-shaped projectile does not by itself set a diamond-shaped field radius. If fields overlap, list every applicable rule without relying on blended colors.

**Counterplay:** destroy a projectile to reopen covered cards and remove its field; use a valid elemental activation to keep working within a field; spend the shared-use allowance on the most valuable action; accept a damage cost or sacrifice a nearly spent card for an important effect; or leave a manageable projectile alive and plan for its eventual impact. All are candidate lines, not guarantees that each is legal under every overlapping field.

**Rules still to settle:** exact left-edge arrival versus leaving the grid, movement through occupied spaces, multiple projectiles sharing/crossing spaces, Corruption interactions, field shape/radius, field overlap and mutually incompatible element requirements, shared-use counter identity/reset and Blink handling, placement underneath a projectile, target access to the projectile covering a card, HP and immunity/resistance, and removal on impact (owner death already removes all owned projectiles). Arrival defense is settled as equipment-only Pierce. Pain/destruction effects need a defined trigger snapshot and resolution order, including whether destroying the source projectile during the activation prevents that activation's penalty. Field restrictions must be reflected in legal actions, Attunement choices and AI observations, not just visual overlays. Attacks against player cards trapped underneath must never accidentally hit the wrong ownership layer.

**Initial scope recommendation:** prototype one field at a time and limit simultaneous projectiles initially. The boss can later mix fields to pressure a developed engine, but multiple elemental restrictions must not make every way to attack the projectiles inaccessible. No spawn cap or overlap rule has yet been approved.

## Stratum 3 tutorial outline — deferred proposal

**Jonathan's development order:** build out and test the actual S3 encounters and mechanics before committing to the tutorial. The outline below is retained as a provisional reminder, not a fixed sequence to implement first. Final tutorial content should follow the playable rules and observed learning needs.

Use deterministic draws, placements, targets, and enemy actions, with the same player-paced explanations and strong actionable highlights as the earlier tutorials.

1. Introduce a clearly telegraphed hostile Ideon. Show its owner and intent, allow the player to attack it, and distinguish destroying a hostile card from repairing its space.
2. Demonstrate a spatial disruption (such as a swap) and its effect on adjacency or defense. If that Ideon attacks, also show how its origin limits legal defenses.
3. Demonstrate an Ideon protecting its owner once interception rules are settled.
4. Finish with a manageable independent battle combining a small number of Ideons with familiar cards and Corruptions. Use gentle idle hints instead of permanent instructions.

Tutorial name, story, companion, enemy names, and exact numbers remain open. Do not reveal the hidden lore or hidden Stratum in player-facing explanations.

## Existing later-content ideas to preserve

- **Horizontal Shear / Vertical Shear:** the earlier Stratum 3 boss concept moves whole stacks across three consecutive rows or columns, starting with the fullest line. Shift the first line by one space, the second by two, and the third by three; wrap both selected lines and card positions. Corruptions stay on their original spaces. This is broader than Stratum 2 Trickster's single-line, two-space Phase Disruption. Tie-breaks, interaction with Ideons, collision rules, and whether this remains one of the final three bosses need confirmation.
- **Overworld barriers:** use the block-like player-and-enemy obstacles described above before The Apex uses them for its gates. Flying traversal remains a possible explicit trait. Do not confuse an overworld barrier with a Memory Hole or hostile card in battle.

## Planning and eventual delivery

Develop a small playable enemy/card roster and settle its remaining interaction details first, then test ordinary encounters and the three Archons before committing to the tutorial. Retain Corruptions in selected S3 enemy move lists alongside Ideons and direct attacks; the mix and actual cycles remain to design. New cards should enter cumulative Stratum pools with fixed probabilities within each Stratum, with a minimum representation of current-Stratum cards at its Taverns; the exact minimum remains open.

Future delivery should cover the deterministic tutorial, normal encounters, three Archons, appropriate events and art, readable ownership and attack-origin effects, save/replay compatibility, and AI-visible legal actions and state. Record Ideon ownership, origin space, intended action, and lifecycle in archives. The AI should use the same rules and information as the player.

Balance testing should examine whether foundation cards retain a purpose, whether Ideons offer multiple usable responses, and whether full-grid positions remain manageable. The intended challenge is choosing how to organize and defend a developed engine, not searching for a hidden hostile card.
