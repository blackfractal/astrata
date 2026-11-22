# Kineticist — movement character planning

Draft 0.6 · 2026-11-04 · Jonathan / Codex · Design only; no implementation authorized

Companion to [the main design](astrata_design.md). **Kineticist** is a provisional name for the movement character previously assigned to the Sorcerer. Jonathan initially called this character the Alchemist, then recalled the earlier Sorcerer assignment and suggested Kineticist. Preserve the Alchemist's split/fuse direction and the Druid's established formation identity. This plan develops the movement role; it does not change the playable game or finalize a fourth class.

## Direction established by Jonathan

The character gains most of its power, synergy and engine creation through **card movement after placement**, especially during Activation. Start with the same basic Blasts and Shields, but a different signature starting Ally that moves cards and temporarily strengthens them through movement.

The central skill is arranging patterns that evolve over successive turns. Cards move into a useful position, perform a job, then move somewhere else for a different job. Large static formations such as Resonant Grove should be less attractive to this character than open lanes and flexible groups. This is a deck identity, not a universal penalty on full grids or a Druid rebalance.

**One activation includes movement and its effect.** Jonathan clarified that a typical card pays its printed Channel cost and one use once, then either moves one NSEW space and resolves its effect using the new adjacencies, or resolves its effect using the current adjacencies and then moves one NSEW space. Moving, empowering and using that same card are not three separate activations. External movers remain useful for cards that explicitly need assistance, including alternating formations, but are not the default prerequisite for ordinary attacks.

Card families should include:

- Move, then evaluate neighbors and perform the activation effect.
- Perform an activation effect, then require movement.
- Effects unlocked by movement, with different outcomes depending on the destination's neighbors.
- Alternating requirements: for example, one activation requires North/South neighbors and no East/West neighbors; the next requires East/West and no North/South. Another card may need to move the spell or its neighbors to prepare the next use.
- **Damage for each card that moved this turn.**
- **Damage for each new card adjacent to the spell that was not previously adjacent.**
- Store damage from distinct friendly cards touching a collector between its activations; release the stored damage at one enemy, then reset eligibility.
- Movement chains that relocate newly encountered neighbors without activating those neighbors.

The desired outcome is a beautiful working engine whose action order and changing positions matter. Repeatedly shuffling a card for an automatic reward should not replace that planning.

## Proposed movement economy

Everything below is a proposal for discussion, including names, numbers and detailed timing.

Start with the existing Insight, Focus and Channel economies. A normal movement attack uses one activation for its complete move-and-effect sequence. Movement is constrained by legal destinations, action order and the card's remaining uses, not by an extra activation tax on every step. Do not add a fourth permanent resource meter by default.

A basic two-Channel turn can activate two moving cards, each moving and contributing an attack or defense. The first can open a space or create a new neighbor for the second. Specialized external movers can reposition other cards, but should offer enough benefit to justify spending an activation. Free movement granted by a chain costs neither Channel nor uses on the receiving cards; it does not grant their activation effects.

Keep the usual once-per-turn activation restriction unless a card explicitly grants Blink or another stated exception. Movement by itself does not refresh uses, reset charge, repeat a placement effect or clear Spent. Ordinary movement should not automatically refund its costs. Do not deliberately engineer infinite cycles. A rare, difficult infinite that emerges may be acceptable, but having none is also acceptable; see the clarification below.

## Proposed starting package

Retain four starter Blasts and four starter Shields. Proposed support cards are Familiar, Clear Mind and Focus Energy, plus the new signature Ally replacing Sapling: twelve starting cards. Starting HP, equipment and whether every support card remains shared are not finalized. Do not inherit the older Sorcerer HP or Arcane Surge signature automatically.

**Wayward Wisp** — working name for a small animated spirit that bends the paths of nearby spells. Its silhouette should feel mobile and approachable, distinct from the Druid's rooted Sapling.

Candidate stats: Arcane Ally; 1 Focus placement; 6 HP; 4 uses; 1 Channel; 1 Focus recall as an explicit Ally exception.

**Guiding Motion:** move an orthogonally adjacent friendly Construct one orthogonal space into a legal empty space. Its next damage or Guard activation this turn gains +2, consumed by that activation. The enhancement does not stack with another instance of Guiding Motion. It changes neither Ally HP nor status damage. If the target has neither a damage nor Guard activation, movement still works but has no numerical payoff.

The Wisp can defend using its HP. Spending its life to survive may dismantle the movement engine; that is a deliberate decision. Ordinary movement cards can move themselves during activation, so losing the starting Ally does not disable the class. Other support cards should also offer ways to move the shared starter cards.

This is a support-card exception for the shared starters, not the standard activation model. Example starting turn: Wisp moves a Blast beside an elemental source, then the Blast activates with its new attunement choice and temporary damage bonus. On a defensive turn, move a Shield to a more useful interception column and activate it instead. The Wisp supplies movement rather than a free attack of its own.

## Proposed movement and timing rules

**What moves.** Friendly movement moves a whole Construct, including its Melded attachments. Corruptions remain attached to their spaces. Moving the Construct preserves HP, stored Guard/Ward, damage, uses, charge, element changes, statuses and pending repairs unless an existing specific rule says otherwise. Attachments do not independently multiply movement rewards.

**Where it moves.** Ordinary movement is orthogonal, one space per step, into an unoccupied legal destination. It cannot overlap an Ideon or another friendly Construct. Swapping and teleporting require explicit card text. Memory Holes and other restrictions are respected; a multi-space slide checks every traversed space, so crossing a Hole can destroy the Construct under the established displacement rules. A friendly action should preview such consequences before commitment. Teleporting does not traverse intermediate spaces.

**What prevents it.** Respect Locked and any explicit movement prohibition. Do not assume every Recall or activation restriction also prohibits movement: specify that interaction for each status, covering Ideon and Corruption before implementation. In particular, whether a mover can rescue a card trapped under a covering Ideon needs a deliberate rule.

**Movement versus placement.** Initial placement and Recall/replacement do not count as movement. Enemy displacement can change the board but does not automatically earn a player-turn movement reward. Proposed default: rewards count successful friendly movement during the current player turn only. An attempted move that changes no position does not count. Two completed legal moves out and back both count as movement events, even within the same turn; the distinct-cards-moved payoff still counts that host only once. Returning to an earlier space can satisfy a later activation's mandatory movement.

**Resolution.** The complete sequence costs the printed Channel and one use once. A move-then-effect activation previews the destination and resulting legal effect before spending resources. Commit the chosen sequence once valid; do not allow a canceled destination choice to spend Channel. An effect-then-move card requires a legal destination before activation when its movement is mandatory. Resolve the effect, then the movement; the displayed order is part of its tactical cost. If an intervening effect destroys the card, its movement is skipped rather than resurrecting it.

**Connections.** Recompute adjacency, attunement sources, formation effects and defensive eligibility as positions change. Moving a charged Ward forward can improve interception options but also exposes it to different threats. No special exemption from the usual source-column defense rule.

## Proposed accounting for movement payoffs

### Distinct cards moved this turn

Count distinct friendly Construct hosts that have successfully moved during this player turn. A host moved three times counts once. A four-card Melded Construct counts once. Recalling and replacing the same card does not earn another count. A host that moved and later died still contributed to this turn's movement, although it cannot activate afterward. Reset the count at the next player turn.

Example card text: **Deal 6 damage, plus 2 for each other friendly card moved this turn.** “Other” explicitly excludes the attacking card. Another design may include itself, but its text must say so. This rewards mobilizing several pieces instead of looping one piece between two squares.

### Newly adjacent cards

Recommended baseline: record the identities of orthogonally adjacent friendly Construct hosts at the start of the player turn. For a newly placed card, record its neighbors immediately after placement. On activation, compare current neighbors with that recorded set.

A qualifying new neighbor must currently be adjacent, must not have been adjacent at that baseline, and must have become adjacent through movement of either card. Merely placing a new card beside the spell does not qualify for this movement-specific bonus. A neighbor that leaves and returns after being adjacent at baseline is not new. A card encountered briefly along a route does not count unless still adjacent when the effect resolves.

Example card text: **Deal 5 damage, plus 3 for each new neighbor gained through movement this turn.** Moving the spell itself can earn this bonus, as can bringing other cards to it. Maximum four current orthogonal neighbors keeps the payoff readable. Mark qualifying neighbors in the preview.

These are separate measurements: a globally mobile board can power the first; a local rearrangement can power the second. Do not collapse these or the collector below into an ambiguous “Momentum” keyword.

### Touch reservoir — accumulated between activations

Jonathan's proposed card stores damage when friendly cards touch it. Each friendly card contributes at most once between the collector's activations. Activating it releases all stored damage at one enemy and resets the contributing-card set, allowing those same cards to contribute again.

Recommended detailed interpretation, pending approval:

- Touch means orthogonal adjacency, identified by stable Construct host identity. Either the collector or the neighbor can move to establish contact. Attachments do not count as separate touching cards.
- On initial placement, count each current friendly neighbor once. Later placement of a neighbor also establishes contact. Unlike the movement-specific new-neighbor payoff above, this card rewards contact itself; movement makes repeated charging possible.
- Store a proposed +3 damage for each distinct contact. Stored damage persists across turns until released; the contributors need not remain adjacent or alive. Repeated contact with the same identity before release adds nothing.
- Release clears the stored damage and contributor set immediately. Existing neighbors do not automatically refill it simply by remaining stationary. They must separate and touch again after release, or a different card must establish contact. Otherwise a static cluster would regenerate the charge without movement.
- Reset occurs before any explicit post-release movement, so a new contact caused by that movement can charge the next release. Moving out and back after release is legitimate; moving out and back before release cannot count an already recorded neighbor twice.
- Recall/fresh placement clears stored damage and contact history. No extra maximum charge is proposed yet; its finite uses, available distinct cards and time spent holding the charge must be tested.

Working card: **Contact Capacitor**, Arcane Object; proposed costs 1 Focus / 1 Channel / 3 uses / 1 Recall. It releases stored damage without mandatory self-movement; other moving cards can visit it. This is an intentional stationary payoff in a mobile engine. Do not label its reservoir ordinary Charge, which has different existing rules.

### Movement relay — free relocation, no free activations

Jonathan proposes an activation that moves its source, then lets newly adjacent friendly cards move. The recommended version keeps every recipient's later mandatory activation movement intact: being moved by the relay does not pay that requirement in advance. A recipient may move back to its previous space when it activates, and that is valid movement.

Proposed bounded recursive version for discussion:

1. Activate the relay source, paying its printed cost and one use. Move it one legal NSEW space.
2. Compare neighbors immediately before and after that step. Newly adjacent friendly hosts may each take one optional legal NSEW step without activating or spending a use. This comparison is local to that movement event, unlike the turn-start baseline for New Constellation.
3. A recipient's free step may in turn offer the same opportunity to its newly adjacent friendly neighbors. Resolve one card at a time in player-selected order, recomputing legal positions and contacts. The relay source and every recipient can move at most once in this entire relay. A declined opportunity counts as handled for that relay, preventing repeated prompts.
4. Previously processed cards cannot relay again, even if encountered by another branch. With a finite board, this bounds the chain. No automatic effects based on activation, no damage/Guard activation and no Channel generation occur merely because a recipient moved. Movement and contact passives do update.
5. Spent or already-activated cards may move if their movement is otherwise legal; they gain no activation allowance. Locked cards cannot move. Skip a branch without a legal destination. Normal hazards and covering restrictions apply.
6. Finish the relay before another normal activation. A recipient with a legal activation can then use it at the ordinary cost. If it says “move, then attack,” it must move again; if it says “attack, then move,” it still must finish with a legal move. Neither may waive that step based on the relay.

Example: Relay moves next to Spark. Spark takes a free step, becoming adjacent to Aegis, which takes its free step. Later, Spark activates for 1 Channel, moves back into the space it previously occupied, checks those neighbors and attacks. Spark has moved twice but contributes only once to Gathering Force's distinct-card count.

Working card: **Chain Reaction**, Arcane Spell; proposed costs 1 Focus / 1 Channel / 2 uses / 1 Recall. Its effect is the relay itself. Recursive reach may be too strong at this price; a one-wave version (only the source's new neighbors move, with no further propagation) is the simpler fallback. Recursion and costs remain proposals, not approved rules.

## Candidate cards

These illustrate engines, not an approved catalog. All numbers are starting hypotheses. Each uses the normal once-per-turn activation rule. Costs are Focus / Channel / total uses / Recall Focus. No upgrades are specified yet.

| Working name | Element / type | Costs | Proposed effect |
| --- | --- | --- | --- |
| Impulse | Arcane Spell | 0 / 1 / 3 / 1 | Move one adjacent friendly Construct one orthogonal space. Its next damage activation this turn gains +3. |
| Traveling Spark | Fire Spell | 1 / 1 / 3 / 1 | Move this card one space, then deal 7 damage. If now adjacent to a Fire card, apply Burn 1. Movement mandatory. |
| Slipstream Aegis | Wind Spell | 1 / 1 / 3 / 1 | Gain 6 Guard, then move one space. Guard stays with this card; movement mandatory. Its final position determines interception eligibility. |
| Crosscurrent | Water Spell | 1 / 1 / 4 / 1 | Deal 12 damage. Alternates between NS-only and EW-only formations; begins NS. Requires both opposite neighbors and neither perpendicular neighbor. Successful activation toggles the requirement. Cannot move itself. |
| Gathering Force | Earth Spell | 1 / 1 / 3 / 1 | Move this card one NSEW space, then deal 6 damage, +2 for each other friendly Construct moved this turn. One activation covers both. |
| New Constellation | Light Spell | 1 / 1 / 3 / 1 | Move this card one NSEW space, then deal 5 damage, +3 for each qualifying new adjacent friendly Construct this turn. |
| Exchange of Places | Arcane Spell | 1 / 1 / 3 / 1 | Swap two friendly Constructs adjacent to this card. Both count as moved. Both destinations must be legal; no intervening-space traversal. |
| Tidal Relay | Water Spell | 1 / 1 / 3 / 1 | Move one NSEW space, then gain 8 Guard if adjacent to Water or deal 8 damage if adjacent to Fire. Choose one if both qualify; deal 4 damage if neither qualifies. |
| Receding Flame | Fire Spell | 1 / 1 / 3 / 1 | Deal 10 damage, then move one space toward the player. Cannot activate from the leftmost column or without a legal destination. |
| Returning Current | Wind Spell | 1 / 1 / 3 / 1 | Move an adjacent friendly Construct one space toward the enemy; give its next Guard activation this turn +3. Combines with cards that retreat after attacking. |
| Countermarch | Arcane Object | 2 / 1 / 3 / 2 | Move up to two adjacent friendly Constructs one space each, sequentially. At least one move required. Second move may use space vacated by the first. |
| Contact Capacitor | Arcane Object | 1 / 1 / 3 / 1 | Store +3 damage per distinct friendly contact between activations; release all stored damage at one enemy and reset. See contact timing above. |
| Chain Reaction | Arcane Spell | 1 / 1 / 2 / 1 | Move one NSEW space and offer free movement to new neighbors, with bounded relay propagation as proposed above. Does not activate recipients. |
| Kinetic Release | Chaos Spell | 2 / 2 / 2 / 2 | Deal 12 damage, +4 for each other friendly Construct moved this turn, capped at four contributors. Large payoff that still requires an engine and spare Channel. |

Names and elemental assignments should communicate effects without obliging every movement card to be Wind. Include affordable Arcane movement so an early deck can function before finding elemental partners. The common Blasts and Shields remain useful beneficiaries rather than becoming compulsory replacements immediately.

## Elemental movement engines

Jonathan wants multiple elemental movement cards, including an effect that optionally moves all Water cards. The visual and mechanical ambition is **Water as a river, Wind as a tornado, Earth as a staircase, and Fire rising from bottom to top**. Each should produce a distinct rhythm of changing positions, rather than four recolors of the same movement effect.

The patterns below are proposals. All movement plus the activating card's stated effect happens in a single activation. Group movement does not activate the other cards, spend their uses, or waive their later mandatory activation movement.

### Water — flowing routes and circulating currents

Water travels along a player-chosen orthogonal route. The route can bend, allowing cards to pass through different neighborhoods instead of requiring a straight line. A river engine can carry a card past a contact collector, bring an attack beside a new elemental source, and carry a defender to a useful interception column.

**Rivercourse:** on activation, draw one continuous, non-branching orthogonal route without repeated spaces. Move any chosen Water cards on that route one step forward along it, then this spell deals damage based on how many actually moved. The card at the route's end needs an empty destination; cards behind it can enter the spaces being vacated. A declared closed loop may circulate as an explicit group-movement exception. The route is a preview for this activation, not a permanent extra board layer.

**Changing Tides:** on activation, move any number of friendly Water cards one NSEW space each, then gain Guard on this card based on the number moved. This is the broad “move all Water cards, if desired” candidate. Each card may stay; the player controls destinations. It should be a more expensive or rarer coordinator than Rivercourse because it does not require a shared route.

**Brookstep:** a common self-moving attack. Move one space, then deal damage, with a bonus if the move established a new Water neighbor. Its ordinary activation already advances the river; a coordinator is helpful but not required.

Rivercourse rewards an organized route. Changing Tides offers flexibility when enemies break that route. Avoid making every Water engine depend on finding both.

### Wind — circulation around an eye

Wind rotates cards around a center. Use the eight-space perimeter of a 3×3 area around the coordinating card: each step around this ring is NSEW, not a diagonal jump. Cards successively become orthogonally adjacent to the center, then move to corner positions, then return. That naturally changes who can supply attunement or receive adjacency effects.

**Cyclone Eye:** rotate any chosen Wind cards one position clockwise or counterclockwise around its eight-space perimeter, then deal damage. Choose one direction for that activation. A complete legal ring can rotate simultaneously; a stationary card or blocking Ideon can obstruct a partial rotation. A center too close to an edge has an incomplete ring, so only individual legal steps within the board are available; it does not wrap across the grid.

**Crosswind:** move this card one NSEW space, then deal damage with a bonus if the movement direction is perpendicular to its previous successful activation movement. Its first activation receives the base effect. This makes turning useful without prescribing a single permanent circle.

Wind's strength is returning cards to useful stations through circulation. Its tradeoff is maintaining an open perimeter and handling an enemy that interrupts the circuit. The coordinator is not meant to double as a static adjacency bonus that makes movement optional for optimal play.

### Earth — alternating steps and terraces

Earth advances in a stair-step: one horizontal move on one activation, one vertical move on the next. The movement and resulting attack or Guard effect are one activation each time. This creates a visible alternating rhythm without requiring two Channel just to make one card take its step.

**Terrace Walker:** move one space on its indicated axis, then gain Guard based on its new Earth neighbors. Start horizontal; after a successful activation switch to vertical, and vice versa. The player chooses either legal direction on the required axis, so it can climb or descend and eventually retrace a staircase. External movement does not advance this activation-axis state.

**Faultstep:** move any chosen Earth cards one space horizontally, then this spell attacks; its next activation instead moves them vertically before attacking. All chosen cards use the indicated axis, but each can choose its direction. Switch the axis after successful activation. This can shift a collection of Earth cards through successive terraces without requiring a solid rectangle.

Earth can keep substantial defense while moving it among lanes. Its constraint is predicting the next axis and leaving somewhere legal to step, rather than staying inside one large static Earth formation.

### Fire — rising and spending position

Fire moves north, from the bottom toward the top of the screen. This is vertical board movement, not movement toward the enemy, who remains on the right. Rising cards pass through different neighbors, become more powerful in useful positions, and eventually need to be recycled or brought back down.

**Rising Ember:** move this card one space north, then deal damage, with a bonus from its new Fire neighbors. Cannot activate at the top edge unless another effect first moves it to a space with a legal northern step.

**Updraft Furnace:** move any chosen Fire cards one space north, then deal damage based on the number actually moved. A column can advance together if its leading destination is free. A Fire card can benefit from this free movement and still make its own mandatory northward step on activation, if another space is available.

**Falling Cinder:** deal damage based on current Fire neighbors, then move this card one space south. It provides a contrasting return motion and can open space for rising cards. It does not reset other cards or automatically transport an entire engine back to the bottom.

Fire should have ways to descend, Recall or change direction through other cards, but northward movement should not wrap to the bottom by default. Reaching the top is a real spatial cost, just as a charge card eventually spends its uses. Test whether finite uses already make this cost sufficient before adding more penalties.

### Candidate costs for discussion

These are new proposals, not balance commitments or final names. Costs use Focus / Channel / total uses / Recall Focus. Numeric effects belong to the activating card; moved recipients do not attack automatically.

| Card | Element / type | Costs | Initial effect hypothesis |
| --- | --- | --- | --- |
| Rivercourse | Water Spell | 1 / 1 / 3 / 1 | Route movement, then 5 damage +1 per other Water Construct moved by this activation. |
| Changing Tides | Water Spell | 2 / 2 / 3 / 2 | Optional board-wide Water movement, then gain 4 Guard +2 per other Water Construct moved by this activation. |
| Brookstep | Water Spell | 1 / 1 / 3 / 1 | Move, then 7 damage; +3 if it gained a new Water neighbor through that step. |
| Cyclone Eye | Wind Object | 2 / 1 / 3 / 2 | Rotate selected Wind cards, then 6 damage +1 per card actually rotated. |
| Crosswind | Wind Spell | 1 / 1 / 3 / 1 | Move, then 7 damage; +3 for turning perpendicular to its previous activation move. |
| Terrace Walker | Earth Spell | 1 / 1 / 3 / 1 | Required-axis move, then gain 5 Guard +2 per adjacent Earth Construct; alternate axis. |
| Faultstep | Earth Spell | 2 / 1 / 3 / 2 | Group axis movement, then 6 damage +1 per other Earth Construct moved; alternate axis. |
| Rising Ember | Fire Spell | 1 / 1 / 3 / 1 | Move north, then 7 damage +2 per adjacent Fire Construct. |
| Updraft Furnace | Fire Object | 2 / 1 / 3 / 2 | Group northward movement, then 6 damage +1 per other Fire Construct moved. |
| Falling Cinder | Fire Spell | 1 / 1 / 3 / 1 | Deal 7 damage +2 per adjacent Fire Construct, then move south. |

These cards expand the design candidates, not the implemented Druid pool. Light and Chaos movement identities remain open; there is no need to force them into the four physical patterns before their role is clear.

### Proposed group movement rules

- **Optional participation:** the player chooses a subset of eligible cards, including none when the text says “may.” Staying put earns no movement bonus. The coordinator still pays its normal activation cost and resolves its base effect. A card that says it must itself move retains that requirement.
- **Element eligibility:** recommend using each host's current effective element, including active Attunement and Transmute, at the start of the group action. Freeze that eligible set for this action; movement does not recruit new members halfway through. This deliberately differs from Synergy's printed-Grimoire counting. A newly selected but uncommitted attunement preview does not qualify.
- **One move each:** each chosen Construct moves at most once per group activation. Melded cards travel with their host and count as one. The coordinator can participate only when the geometry and card text allow; Cyclone Eye stays at its center.
- **Vacated destinations:** allow a chosen card to move into another chosen card's vacated space. Plan the group before committing it. No two cards may end on the same space, and a card that stays continues to occupy its space. If a chain ends at an obstruction, reject or revise that chain in the preview; do not silently move only half of the selected plan.
- **Simultaneous groups:** explicit route, rotation and group-shift effects permit coordinated movement, including a closed cycle with no empty space. This is a specific exception to ordinary one-card movement into empty spaces. Other cards cannot arbitrarily swap by claiming to be a group.
- **Contacts and timing:** for a one-step simultaneous group, compare contact before and after the committed group, then resolve destination hazards and surviving-card effects in a defined order before the coordinator's attack/Guard effect. A pair traveling together while staying adjacent has not gained a new contact. Do not reward fleeting animation overlaps. Precise lethal-hazard trigger ordering remains a design item before implementation.
- **No hidden relay:** moving a Chain Reaction card as part of an elemental group does not activate its relay effect. Only effects explicitly triggered by movement can respond without activation. A group move never grants extra uses or a second normal activation.

### What makes the combined engines interesting

A Water route can pass beside Contact Capacitor while Wind cards rotate around it. Earth defenders can alternate between two useful positions while Fire attacks rise through the gaps. Players may specialize in one element or combine two rhythms. The movement should create damage, defense and contact opportunities during useful activations, rather than demand an entire preparatory turn before anything happens.

The main concern is **input burden**: “move all Water cards” becomes tedious if it demands ten unrelated destination dialogs every turn. Offer a route/direction preview, allow individual opt-outs and adjustments, then commit the group once. Keep free-form movement for cards whose flexibility justifies that additional decision. Animate the coordinated flow clearly enough to see the engine without forcing long waits for every card.

## Brainstorm: steam engines, turbines and movement reactions

Jonathan proposes an engine in which Earth moves toward Fire, that interaction moves Water, and Water movement drives Wind. Windmills gain power from Wind circulating around them; dams gain power from Water flowing alongside them. These are desired possibilities, not approved card text or a requirement to collect one exact four-card combination. Everything below develops alternatives for discussion. Costs, rarity, stored-power caps and upgrade effects remain open; do not implement these sketches as finalized cards.

### A local steam engine

Use existing elements. Steam is the visual result of a Fire–Water interaction, not a seventh element, and friendly Earth cards do not automatically suffer Burn or destruction just because a Fire card is nearby.

One possible arrangement:

1. **Fuelstone** (Earth) activates: move one NSEW space, then perform its normal attack or Guard effect. Moving into adjacency with a furnace also feeds the engine.
2. **Kindling Furnace** (Fire) has an explicit movement reaction: when a friendly Earth card moves from nonadjacent to adjacent, offer one adjacent Water card a one-space move. The Furnace's ordinary paid activation has a useful attack of its own. This passive reaction does not activate that attack.
3. **Boiler Current** (Water) has a reaction: after it moves while adjacent to Fire at either the departure or arrival space, offer one adjacent Wind card at its destination a one-space move. Its paid activation still has its own movement plus attack/Guard effect.
4. **Vaporwheel** (Wind) takes that offered step. A nearby **Windmill** gains stored power if this was a qualifying step around its perimeter.
5. Later, activate the Windmill to release stored power as damage or Guard, according to the eventual card design. That release spends normal Channel and a use; arriving Wind cards do not freely activate it.

The player's initial Fuelstone activation has already performed a useful job while starting the cascade. The later Windmill activation spends accumulated value. No extra activation is charged at each passive transfer, and no ordinary card activation is granted for free.

This engine requires physical proximity. It should not move an arbitrary Water card across the board because an Earth card touched an unrelated Fire card somewhere else. Preview the actual links and legal destinations. If there is no legal recipient or destination at one stage, that branch stops; the initiating card still completes its own legal effect.

**Partial engines must work.** Furnace plus an ordinary Water Shield can reposition a defense without a Boiler. Boiler plus an ordinary Fire source can move Wind without Fuelstone. A Windmill can collect power from Wind cards moving under their own activations without either of those components. Fuelstone is one possible Earth mover, not the only acceptable fuel. A full steam engine offers efficiency and coordination, not the only viable way to play these cards.

### Harvesting flow instead of static adjacency

**Windmill:** choose a rotational direction for the current collection cycle. Gain power when a Wind card makes one orthogonal step along the eight-space perimeter around the Windmill in that direction. Moving into the ring radially does not count as turning it. A card circling through multiple positions can contribute over time; ordinary adjacency without movement gives nothing. Clockwise versus counterclockwise should be visible in the preview, with direction changes allowed at a clearly defined point such as after release.

**Hydro Dam:** choose one side on placement. Gain power when a Water card moves one orthogonal step tangentially along that face. For a north-facing Dam, an east/west move between its northwest and north spaces, or north and northeast spaces, qualifies. Crossing in front of it is flow; repeatedly approaching it head-on is not. The three-space face makes a readable small channel. Placement orientation should be explicit, with a preview; rotating a placed Dam could be a separate effect rather than a free assumption.

**Windmill versus Dam:** the Windmill rewards turning and circulation around a center. The Dam rewards a straight channel along one face and could store Guard rather than damage. Neither should just count all nearby elemental movement with interchangeable artwork.

**Metering proposal:** each distinct moving host can contribute once to a given collector per initiating activation and its resulting cascade. This permits another useful activation later in the turn to contribute again, while stopping one passive chain from repeatedly pumping the same collector with the same card. A modest visible storage cap could limit stalling; values are not decided. This differs deliberately from Contact Capacitor, whose identity-based eligibility resets only when it releases its stored damage.

### Additional mechanisms worth exploring

| Concept | Movement interaction | Why its placement or timing matters |
| --- | --- | --- |
| **Bellows** | A Wind card moving into adjacency pushes one adjacent Fire card a space away from the Bellows. | Converts circulation into Fire travel; changes the Fire card's next activation neighbors. |
| **Sluice Gate** | An Earth card leaving one designated adjacent space allows a Water card to step into the newly vacated space. | Earth physically opens the channel; a stationary Earth wall closes it. |
| **Condensing Coil** | A Wind card moving out of adjacency brings a nearby Water card one space closer to the Coil. | Gives the steam engine a return path without inventing an automatic element conversion. |
| **Counterweight** | Movement on one side permits an opposite-direction move on the other side. | Two defenses can exchange forward/backward jobs while the mechanism occupies a central space. |
| **Ratchet** | Store power only for alternating horizontal and vertical steps nearby. | Rewards Earth stair-step rhythms; straight back-and-forth motion cannot do the same job. |
| **Heat Exchanger** | A Water card entering adjacency grants the next nearby Fire attack a bonus; a Fire card leaving grants the next nearby Water Guard activation a bonus. | Rewards an ordered exchange rather than merely parking both elements beside it. |
| **Flywheel** | Gain a small bonus when a qualifying movement circuit continues on successive turns, losing only that streak bonus when interrupted. | Offers sustained rhythm without erasing all stored power when an enemy disrupts one turn. |
| **Pressure Valve** | Spend accumulated power for a stronger effect now, or a smaller effect plus a useful relocation. | Gives an engine an emergency outlet when its normal route becomes dangerous. |

Start with two or three clear reaction relationships and collectors before adopting all these mechanisms. An engine that requires five unique rare pieces would be too brittle. A deck should combine broad categories such as Earth movers, Fire sources and Water defenders, while one or two specialist cards change what their movement accomplishes.

### Guardrails for understandable cascades

Recommended default model for ordinary cards, pending approval. These limits support understandable finite chains. Do not introduce special reset exceptions merely to make an infinite possible.

- Each normal paid activation creates one movement cascade, including its explicit moves and all resulting reactions. Each reacting support card may fire its movement reaction **once per cascade**, even if multiple qualifying contacts occur. A declined optional reaction is handled for that cascade rather than repeatedly offered.
- A host may receive at most **one extra movement from reactions** in that cascade, in addition to any movement explicitly required by the initiating card's own activation. This bounds a Furnace–Boiler–Bellows loop. The source may receive an extra step too, but cannot re-trigger a support already handled.
- A later ordinary paid activation creates a fresh cascade. A card moved for free earlier can activate normally, must perform its own required movement, and may return to its previous space. Once-per-turn activation and finite card uses still apply.
- The recursive Chain Reaction spell must share this reaction allowance rather than run a second independent free-movement budget. Its more restrictive once-per-participant rule still applies within its own relay. Reconcile the exact scheduler before implementation; do not nest independent relay loops.
- Extra movement does not confer damage, Guard, Channel, placement effects or activation-use refreshes unless a card explicitly supplies a movement-triggered effect with its own eligibility and limits. Ordinary triggered attack effects are not implied.
- Let the player choose among meaningful branches and decline reactions. Once choices are made, resolve in a deterministic visible order. Avoid a separate popup for every step: preview the path and highlight the next meaningful choice on the board.
- Contact eligibility depends on actual before/after positions, not an animation brushing past another card. Group moves use their committed group state. Blocking, damage and destruction can stop later branches; do not move or charge from a card that no longer exists.

These caps are proposals for understandable ordinary chains. Any exceptions should serve a useful card design, not a planned infinite, and remain legible and player-controlled. The goal is one activation visibly setting several pieces in motion while the player can still explain why every movement happened.

### Promising first engine experiments

1. **Water + Dam:** three Water cards, one straight channel, one Dam. Does choosing which cards advance produce useful damage and defense without tedious destination selection?
2. **Wind + Windmill:** a partial ring with two or three Wind cards. Can it function before the player fills the whole perimeter, and can it recover from losing one lane?
3. **Earth + Fire + Water:** one Furnace and ordinary elemental cards. Does moving the Earth card both help this turn and make the next turn interesting?
4. **Full steam loop:** add a Boiler and a Wind collector. Compare the additional payoff with the Focus, card draws, space and Channel spent assembling it. It should be stronger through coordinated movement and useful finite cascades. Do not add components specifically to turn it into an infinite.
5. **Disrupted engine:** remove one component, corrupt a channel or place an Ideon in a route. Check whether there are alternate useful activations rather than an all-or-nothing machine.

## Infinite cycles — tolerated outcome, not a design goal

Jonathan clarified on 2026-11-04: **do not deliberately design or plan infinite cycles. Having no infinite cycles at all is completely acceptable.** If an infinite emerges from otherwise useful card interactions, it may be acceptable when it is rare and difficult to assemble. This supersedes the earlier infinite-engine design target and speculative reset mechanisms.

Here, a true infinite means a repeatable productive sequence entirely within one Activation phase, without any enemy cycle or turn refresh. An engine that runs sustainably across many turns, or performs a long but finite cascade, is not an infinite.

Design cards for satisfying movement, changing formations and finite combinations. Do not add activation resets, placement-phase exceptions, renewable reaction resets or resource refunds specifically to complete an infinite. Keep the proposed ordinary reaction limits unless a separately justified card mechanic warrants an exception.

If testing reveals an infinite, examine its actual deck requirements, assembly difficulty, resource and activation costs, legal positions, and payoff. A frequent or trivial infinite is a balance concern. A rare, demanding emergent combination need not be removed solely because it is infinite. No infinite needs to exist for this class to succeed.

Regardless of balance, reaction resolution must remain interruptible and must never hang the game. Technical loop handling should distinguish a productive legal combination from an accidental no-progress cycle; this is an implementation concern for later, not a reason to build infinite-enabling cards now.

## Example engines and their decisions

**Advance and retreat.** Receding Flame attacks and retreats. Returning Current advances it on a later turn, perhaps beside a new attunement source or away from a telegraphed hazard. The payoff is reliable damage plus relocation, paid for with support activations and space. Do not grant infinite uses simply because it returns to its original location.

**Alternating crossroads.** Two anchor cards establish a vertical pair with Crosscurrent between them. A mover transports Crosscurrent to a separate horizontal pair on the next turn. It alternates between those stations. Another version moves the anchors around Crosscurrent. The player needs gaps, enough movement reach, and a defensive plan for both configurations; four permanently adjacent anchors would invalidate both modes.

**Moving constellation.** New Constellation moves between small groups of support cards. Each destination offers new neighbors and a different damage opportunity. A compact full rectangle has fewer useful destinations, while two separated clusters make the engine breathe. The baseline resets each turn, so returning to yesterday's cluster can pay again without rewarding a same-turn back-and-forth loop.

**Movement while doing useful work.** Traveling Spark moves and attacks; Slipstream Aegis gains Guard and moves; Gathering Force moves and attacks for 10 after those two distinct other cards moved. This costs three Channel for three useful activations, not extra activations to move each attacker. At two Channel, use just Spark and Aegis for a functioning attack/defense turn.

**Visiting the reservoir.** Two moving attacks each touch Contact Capacitor while doing their own damage, storing 6 total. The Capacitor releases that damage on its activation. Those cards must leave and re-establish contact to charge it again. Routes and activation order determine whether the release is worth spending Channel now or saving for a larger burst.

**Relay choreography.** Chain Reaction repositions several cards without activating them. Their own activations then move them again and resolve their effects. Moving a card away can open the space a later card needs; moving it back can restore a defense formation. The value is creating an actionable sequence, not refreshing card uses.

**Defense as a moving formation.** Gain Guard before moving a defender to an interception column; on the next turn move it away from an incoming destruction line. The player balances where the card must activate, where it must defend and where it can safely end the turn. Repositioning is a benefit already, so its associated damage bonuses should be modest at first.

## Encounter and balance considerations

- Open space is part of the engine's cost. Preserve meaningful choices between filling the grid and leaving routes; do not solve crowding by enlarging the grid for this character alone.
- Memory Holes, Ideons and field effects can break routes. Provide several independent movers and ordinary fallback attacks so one blocked route does not make the entire deck inert.
- Movement should help with telegraphed destruction but must not erase it for free. Moving an entire productive line should take more resources than saving one important card.
- Dense formations should remain a possible secondary strategy. Discourage them through opportunity cost and movement requirements, not an arbitrary class penalty.
- Avoid a mandatory starter-Ally dependency. Test runs that lose it early, miss premium movement cards, or must spend most Channel defending.
- Track damage per Channel including setup, useful repositioning, resource growth, surviving uses and open-space requirements. Comparing only the final attack number would misprice these cards.
- Movement into a buff source and back out should not preserve a continuous aura unless the effect explicitly grants a timed buff.
- Enemy-forced displacement, hypnosis, friendly swaps, delayed effects, destroyed hosts and Melded attachments need deterministic ownership and timing rules before coding.

## Presentation and accessibility

Show movement destinations before commitment. Preview damage, new connections, lost connections and final defensive position. Animate the movement before its resulting attack when that is the card's stated order; do not teleport visually through intermediate hazards for a slide.

Use a restrained moved-this-turn marker and highlight only neighbors contributing to the selected activation. Alternating cards should plainly show **Next: NS** or **Next: EW**, with the relevant spaces highlighted on inspection. Show global movement count only when it matters to the selected card, rather than adding permanent explanatory HUD text.

Support click-to-select and click-to-destination alongside dragging. Compound activations should remain cancelable while choosing, with one clear final commitment. A preview must distinguish mandatory movement from an optional follow-up.

## Decisions for a later design pass

1. Confirm the character name and whether Kineticist replaces the Sorcerer label entirely.
2. Finalize starting Ally identity, lifespan, costs and whether recalling it is an explicit exception.
3. Keep ordinary move-and-effect sequences within one activation. Balance specialized external movers and the relay without making them prerequisites for every attack.
4. Approve distinct-movement, new-neighbor and contact-reservoir timing, plus whether relay propagation is recursive or just one wave. Returning to a prior space is valid movement; a free prior move does not waive a later mandatory activation move.
5. Define precise interactions with Locked, Frozen, Insanity, Hypnosis, covering Ideons and ongoing Machine Elves repairs.
6. Select an initial card pool, rarity/Stratum distribution, upgrades, shared cards, HP and starting equipment. Do not simply copy all 94 Druid cards into this pool.
7. Approve elemental group movement geometry, effective-element eligibility and simultaneous contact/hazard ordering. Check broad group movement against the value of ordinary self-moving cards.
8. Build a deterministic class tutorial later: one combined move-and-attack activation, one Guard-then-move activation, one alternating formation, and a movement relay followed by an ordinary activation.

No game code, balance values, artwork, saves or packaged builds are changed by this planning document.
