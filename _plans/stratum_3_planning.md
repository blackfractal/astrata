# Stratum 3 planning — Ideons

Discussion draft 0.2 · 2026-10-10 · Jonathan / Codex

Companion to [the main design](astrata_design.md) and [Stratum 2 planning](stratum_2_planning.md). Stratum name remains open. This document collects prior decisions and new proposals; it does not authorize implementation or change the current game's rules. Explicitly identified proposals and open questions are not settled requirements. Where these future rules differ from the current main design or executable, reconcile them when implementation is authorized.

## Purpose and progression

Stratum 3 teaches **Ideons**: enemy-controlled cards placed inside the player's Mind Grid. Ideons are intrusive thoughts or voices that do not originate with the player. They may behave as enemy Allies or Spells, rather than merely modifying a space.

- Stratum 1: arrange cards, manage resources, connect elements, and survive card destruction.
- Stratum 2: distinguish cards from the spaces beneath them; manage Corruptions and repair them with Machine Elves.
- Stratum 3: respond to active enemies inside the grid while maintaining a spatial engine.
- Stratum 4, The Apex: combine these skills under sustained pressure. Its climb and gates belong in a separate plan.

The progression is from **disrupting spaces** to **occupying the grid with active hostile cards**. Existing foundation cards should remain useful. Later cards should reward a developed foundation without making their early acquisition completely useless.

## Existing stacks remain simple

The altitude viewer, four-level gameplay cap, same-height amplification and height-dependent flying enemies are withdrawn from this plan. Keep the current stack inspection and card-specific stacking rules in all Strata; there is no profile unlock or level-navigation tutorial.

Magnifier Ward replaces Magnifying Glass Tower in the current game. It is a standalone Ward or a melded reinforcement beneath another Ward, not a height multiplier. Heat likewise melds beneath an eligible attack and supplies Burn on two attack activations. Plasma Ball also melds beneath its original host, with a four-ball cap and diminishing combined damage; its allowance and Recall cost grow per added ball. These rules are defined in the main design; Stratum 3 does not introduce a universal tower system.

## Ideons

### Established concept

The term Jonathan used is **Ideon**. These are enemy-controlled intrusions that occupy the Mind Grid as cards. Enemies can activate their Ideons, producing attacks or other effects from inside the player's formation. Some have HP and must be dealt with before attacks can reach their owning enemy. Exact interception rules remain open.

Ideons differ from:

- **Corruptions:** statuses attached to spaces, represented by ovals; covering or repairing them follows their particular rules.
- **Player cards:** owned by the player and normally activated using the player's Channel.
- **Hypnosis:** an effect compelling a player's own card. An Ideon has hostile ownership from the outset.

A future **Ideon Hex** may offer a choice between trouble while it remains in the Grimoire/discard and a different problem when placed on the grid. That concept is retained, but its exact effects and removal rules are not settled.

### New recommendations for the first implementation

Start with two simple roles: a hostile Ally with HP and an intrusive Spell with a clear effect and remaining uses. Most introductory enemies should add one Ideon with one understandable job. Avoid simultaneously teaching several new Ideons and a new Corruption in the same first encounter.

An Ideon should look like a card, with a persistent hostile-ownership frame and a visible connection to its owner when inspected. Its full details should show who controls it, HP or remaining uses, next action, and how it can be removed. Do not rely only on a different tint: elemental colors already carry meaning.

An attack originating inside the grid should visibly begin at that Ideon. Apply the existing positional defense principle: defenses farther toward the enemy than the attack's origin cannot intercept it. Decide same-column eligibility explicitly. This gives Ideons a clear strategic purpose: a large defense wall is insufficient if a threat appears behind it.

Telegraph both placement and first activation. Recommended introductory timing: warn during a player response window, place the Ideon, then give the player a response before its first activation. Exact timings may vary on clearly described later enemies; do not make an apparent harmless placement produce an unexplained immediate attack.

Machine Elves remain Corruption repair specialists by default. Whether they can affect Ideons is a separate design decision; do not make them universal removal automatically.

### Rules to settle before building

1. **Occupancy:** can Ideons occupy only empty spaces, share Corruption spaces, or join existing stacks? Can players cover them? What happens when the grid is full?
2. **Displacement:** what happens if a movement effect shifts a player card or hostile card into an occupied space? Preserve whole-stack movement where applicable.
3. **Targeting and interception:** which player attacks can target them, and which Ideons prevent targeting the owning enemy? Is protection global, positional, or printed on the individual card?
4. **Enemy economy:** does activating an Ideon replace its owner's normal move, supplement it, or follow a separate telegraphed schedule? Several Ideons must not silently become several extra enemy turns.
5. **Lifecycle:** what happens when its owner dies, when it exhausts its uses, or when a row/column destruction effect hits it? Ideons should not accidentally enter the player's deck or revive as owned cards after battle.
6. **Interactions:** decide whether they count as neighbors for growth, attunement, formations; how Corruptions affect them; and whether hostile and friendly effects can benefit each other.
7. **Counterplay:** which existing cards can answer them, and what additional Stratum 3 cards or companion are needed? Do not require one randomly offered counter card to survive.

## Stratum 3 tutorial outline — proposal

Use deterministic draws, placements, targets, and enemy actions, with the same player-paced explanations and strong actionable highlights as the earlier tutorials.

1. Introduce a clearly telegraphed hostile Ideon. Show its owner and intent, allow the player to attack it, and distinguish destroying a hostile card from repairing its space.
2. Place another Ideon behind a forward defense to demonstrate attack origin and the remaining legal defense choices.
3. Demonstrate an Ideon protecting its owner once interception rules are settled.
4. Finish with a manageable independent battle combining a small number of Ideons with familiar cards and Corruptions. Use gentle idle hints instead of permanent instructions.

Tutorial name, story, companion, enemy names, and exact numbers remain open. Do not reveal the hidden lore or hidden Stratum in player-facing explanations.

## Existing later-content ideas to preserve

- **Horizontal Shear / Vertical Shear:** the earlier Stratum 3 boss concept moves whole stacks across three consecutive rows or columns, starting with the fullest line. Shift the first line by one space, the second by two, and the third by three; wrap both selected lines and card positions. Corruptions stay on their original spaces. This is broader than Stratum 2 Trickster's single-line, two-space Phase Disruption. Tie-breaks, interaction with Ideons, collision rules, and whether this remains one of the final three bosses need confirmation.
- **Overworld barriers:** introduce impassable spaces in Stratum 3 before The Apex uses them for its gates. Do not confuse an overworld barrier with a Memory Hole or hostile card in battle.

## Planning and eventual delivery

Before implementation, finalize the occupancy/targeting rules and a small enemy/card roster. New cards should enter cumulative Stratum pools with fixed probabilities within each Stratum, with a minimum representation of current-Stratum cards at its Taverns; the exact minimum remains open.

Future delivery should cover the deterministic tutorial, normal encounters, three Archons, appropriate events and art, readable ownership and attack-origin effects, save/replay compatibility, and AI-visible legal actions and state. Record Ideon ownership, origin space, intended action, and lifecycle in archives. The AI should use the same rules and information as the player.

Balance testing should examine whether foundation cards retain a purpose, whether Ideons offer multiple usable responses, and whether full-grid positions remain manageable. The intended challenge is choosing how to organize and defend a developed engine, not searching for a hidden hostile card.
