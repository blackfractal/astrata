# Elemental Synergy and Enhance cards

Jonathan · Approved 2026-11-01 · Implemented in 4.0.45

Adds 13 cards to the 81-card non-Hex Druid pool, bringing it to 94 (99 including five Hexes).

## Shared stats and availability

All thirteen are Spells: 1 Focus placement, 1 Channel activation, 2 uses, 1 Focus recall. Standard once-per-turn activation applies. Available from Stratum 1 onward through the normal reward and shop pools. Twelve elemental variants are common; Prismatic Synergy is rare and printed Arcane. No upgrade recipes are introduced in this pass.

## Synergy — revised 2026-11-22 / 4.0.47

Elemental Synergy deals **7 +1 per other card matching its current attack element in the whole Grimoire**, including other Synergy copies. Count at activation: placed cards use their current element, including committed Attunement and Transmute; cards in draw, hand, discard and Destroyed use their printed element. Count each card once, including underlying Meld cards; exclude the elemental Synergy caster itself. Transmuting the caster changes both its attack element and the element it counts. Prismatic Synergy deals **7 +3 × the lowest count across the six non-Arcane elements**, using the same current-element counting. A missing element means zero bonus. Counts 4/4/4/4/3/4 yield16damage.

Example: Fire Synergy, Cinder Snap and an activated Fire-attuned Blast provide two other Fire cards, for 9 damage. When the Blast's Attunement expires, Synergy returns to 8. A Water-transmuted Fire Synergy counts Water instead of Fire. Covered Meld cards remain separate Grimoire members, using their own current element rather than inheriting the host's Attunement. No new Attune ability is granted to these cards.

## Enhance — revised 2026-11-22 / 4.0.47

Enhance adds **+1 direct damage per hit to attacks matching its current element, for the rest of the battle**. Store cumulative bonuses by element, not on individual cards. Each hit uses its actual attack element, including Attunement and Transmute; a Fire-attuned Blast benefits from Fire Enhance only while attacking as Fire, and gains no permanent personal bonus. Cards need not match when Enhance is activated to benefit later. If Enhance itself is Transmuted, it adds to its new element; previous bonuses retain the element they were granted for. Includes Allies, later placements and placement attacks. Each activation/copy stacks and bonuses survive source Recall/destruction; reset next battle. Does not increase HP, Guard, Ward or status values. Apply before Nausea, multipliers and elemental matchups, once per Plasma Construct hit and separately for each element of a multi-element attack. Anger activates normally; Hypnosis wastes the use without its utility benefit. Damage previews reflect the selected element for that card only: previews never alter board counts, and cancel on switching actions or clicking away. Only committing that card's activation establishes Attunement. Show current bonuses in live numbers, target previews and inspection. Details: `_plans/elemental_synergy_cards.md`.

Example: after Fire Enhance is activated twice, a Blast attacking as Fire gains +2. After its Attunement expires it loses eligibility, not the battle's stored Fire bonus. An Ignis Spark transmuted to Water benefits from Water Enhance instead of Fire Enhance. An Enhance transmuted to Arcane may grant an Arcane bonus even though no printed Arcane Enhance card exists; elemental Synergy still has no Arcane deck-count bonus, and Prismatic still ignores Arcane.

## Presentation, saves and AI

The existing battle-level enhancement totals remain compatible with saves and observations. Grimoire membership is stored once, with live grid instances supplying temporary elements for counting. No preview state is saved. Normal Continue's battle-restart behavior remains unchanged. Existing weighted-policy offer valuation uses printed composition because reward cards have no board Attunement; legal activation damage values include the selected element. This is heuristic support, not trained play.

## Artwork

Generated on Jonathan's DGX Spark at spark-86e6.local using ComfyUI and dreamshaperXL_alpha2Xl10.safetensors. Selected assets: assets/card-{fire,water,earth,wind,light,chaos}{Synergy,Enhance}-v2.png and assets/card-prismaticSynergy-v2.png. Earlier candidates are retained. tools/synergy-art.mjs reproduces the requests; reports/synergy-art-provenance.json records exact prompts, workflows, seeds and paths. Shared art paths and the main manifest are updated.
