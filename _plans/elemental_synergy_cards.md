# Elemental Synergy and Enhance cards

Jonathan · Approved 2026-11-01 · Implemented in 4.0.45

Adds 13 cards to the 81-card non-Hex Druid pool, bringing it to 94 (99 including five Hexes).

## Shared stats and availability

All thirteen are Spells: 1 Focus placement, 1 Channel activation, 2 uses, 1 Focus recall. Standard once-per-turn activation applies. Available from Stratum 1 onward through the normal reward and shop pools. Twelve elemental variants are common; Prismatic Synergy is rare and printed Arcane. No upgrade recipes are introduced in this pass.

## Synergy

Fire, Water, Earth, Wind, Light and Chaos each have a Synergy card. Deal 7 damage of that card's current attack element, plus 1 per OTHER card of its printed element in the whole Grimoire. Other copies of the same Synergy count; the activating copy does not. Two other printed Fire cards make Fire Synergy deal 9 base damage.

Count printed card definitions, ignoring Attunement and Transmute. Include draw, hand, grid, discard and Destroyed; moving, recalling or destroying a card does not change the Grimoire count. Underlying Meld cards still count separately. Printed-element Hexes also count as cards in the Grimoire. Transmuting Fire Synergy changes its outgoing attack element, but it still scales from printed Fire cards.

Prismatic Synergy deals 7 + 3 times the LOWEST count among Fire, Water, Earth, Wind, Light and Chaos. Arcane never contributes. Counts 4/4/4/4/3/4 produce 16 damage; a missing element yields base 7. Its own Arcane card never contributes to those counts.

## Enhance

Fire, Water, Earth, Wind, Light and Chaos each have an Enhance card. On activation, all other matching PRINTED-element damage cards in the Grimoire gain +1 direct damage per hit for the rest of the battle. Includes Allies, later draws/placements, and placement attacks. Does not increase Ally HP, Guard, Ward, or Burn/Poison/Corrode values. Multiple activations and copies stack.

The buff is stored at battle level, surviving Recall/destruction of its source and recalling/replacing affected cards. It ends when the battle ends. No Arcane Enhance exists. Transmute or Attunement never changes which cards receive a buff or which printed element an Enhance empowers. A Fire-transmuted Blast does not qualify for Fire Enhance; a Water-transmuted Ignis Spark still does.

Apply the bonus before Nausea, attack multipliers and elemental matchups. A Plasma Construct receives it once on the combined attack, not once per underlying card. All-enemy and multi-hit attacks receive it on each hit. Anger activates Enhance normally; Hypnosis consumes a use without granting its utility effect.

## Presentation, saves and AI

Live attack numbers, target previews and inspection breakdowns include these bonuses. Enhance sends simultaneous elemental pulses to matching placed damage cards, while its text makes the battle-long Grimoire effect clear. Save/observation data preserves printed Grimoire membership and enhancement totals. Old saves initialize missing data without granting bonuses. Normal Continue's existing battle-restart behavior is unchanged; exact battle snapshots preserve the exact buff state.

The built-in weighted policy recognizes deck composition when valuing these cards and scores Enhance activations for matching attacks. This is heuristic support, not trained proficiency or a claim of campaign balance.

## Artwork

Generated on Jonathan's DGX Spark at spark-86e6.local using ComfyUI and dreamshaperXL_alpha2Xl10.safetensors. Selected assets: assets/card-{fire,water,earth,wind,light,chaos}{Synergy,Enhance}-v2.png and assets/card-prismaticSynergy-v2.png. Earlier candidates are retained. tools/synergy-art.mjs reproduces the requests; reports/synergy-art-provenance.json records exact prompts, workflows, seeds and paths. Shared art paths and the main manifest are updated.
