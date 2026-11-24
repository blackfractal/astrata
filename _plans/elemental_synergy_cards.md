# Element Synergy and Element Enhance

Jonathan · Revised 2026-11-24 · Implemented in 4.0.50

**Element Synergy and Element Enhance (v4.0.50).** Replace the twelve elemental variants with two common, printed-Arcane Spells: **Element Synergy** and **Element Enhance**. Keep **Prismatic Synergy** as the separate rare Arcane Spell. All three appear from Stratum 1, cost **1 Focus** placement, **1 Channel** per activation, have **2 uses**, and cost **1 Focus** Recall. No new upgrades. The Druid pool now has **84 non-Hex cards (89 including five Hexes)**. The two Element cards require a non-Arcane element: ordinary activation is unavailable without an adjacent valid Attunement source (or a non-Arcane Transmute). Arcane is never a choice. Forced unattuned activation spends its usual resources/use but produces no damage or enhancement. Attunement is selected afresh for each activation and follows normal committed relay/expiry rules. Existing variants migrate one-for-one to the corresponding new card, preserving UIDs, used allowance, upgrades, Transmute and already-granted battle bonuses. Old variants leave reward/shop/Archive pools; discovery of any old variant reveals its new family. Card names remain Element Synergy/Element Enhance, with the current or previewed element shown separately.

## Element Synergy

Attune to Fire, Water, Earth, Wind, Light or Chaos. Deal 7 damage plus 1 per OTHER card matching that element in the entire Grimoire. Count once per UID: placed cards use current elements including committed Attunement/Transmute; draw, hand, discard and Destroyed use printed elements. Underlying Meld cards count separately with their own elements. The caster is excluded. No base damage or Enhance bonus without a non-Arcane element. A second Element Synergy only contributes if currently placed with the matching element; its printed Arcane identity does not contribute from other piles.

## Element Enhance

Attune to a non-Arcane element. Add +1 direct damage per hit for that element for the battle. Two uses can strengthen the same element twice or two different elements once each. Bonuses are stored by element, survive source Recall/destruction, and reset next battle. Each hit qualifies using its actual element; temporary Attunement never captures a permanent personal bonus. Includes Allies, later placements and placement attacks, not HP, Guard, Ward or status values. Apply before Nausea/multipliers/matchups, once per Plasma Construct hit, separately per multi-element hit. A non-Arcane Transmute fixes the caster's usable element normally. Arcane cannot receive a new bonus from this card.

## Prismatic Synergy

Unchanged: 7 Arcane damage plus 3 times the smallest current count among all six non-Arcane elements, using the same pile rules. Missing any element gives zero bonus. This card does not gain Attune and does not require elemental Attunement.

## Presentation and compatibility

Selected-element previews update that card's damage only; never commit the temporary element or change another card's counts. Cancellation, clicking away or switching actions restores the original display. Normal Continue retains its battle-restart behavior. Existing exact snapshots preserve state and undergo identity migration. Retired IDs remain non-enumerable compatibility aliases for old archives; new cards, offers and catalog entries use only canonical IDs. Historical archives and art files are not rewritten. Existing offer weights are not multiplied to compensate for the smaller pool. Heuristic policy evaluates valid elemental choices rather than rewarding the Arcane starting deck.

The two new cards reuse the retained Light Synergy/Enhance illustrations; previous elemental art remains available for future selection. Updated isolated UI checks: tools/synergy-ui-test.mjs.

## Artwork

Generated on Jonathan's DGX Spark at spark-86e6.local using ComfyUI and dreamshaperXL_alpha2Xl10.safetensors. Selected assets: assets/card-{fire,water,earth,wind,light,chaos}{Synergy,Enhance}-v2.png and assets/card-prismaticSynergy-v2.png. Earlier candidates are retained. tools/synergy-art.mjs reproduces the requests; reports/synergy-art-provenance.json records exact prompts, workflows, seeds and paths. Shared art paths and the main manifest are updated.

