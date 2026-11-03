# Elemental Synergy and Enhance — 4.0.45

Jonathan approved the shared costs, counting rules and battle duration on 2026-11-01. Added six elemental Synergy cards, Prismatic Synergy and six elemental Enhance cards. The Druid pool is now 94 non-Hex cards (99 including Hexes).

All thirteen cost 1 Focus to place, 1 Channel per activation, have 2 uses and cost 1 Focus to recall. Available from S1 onward; elemental variants are common and Prismatic is rare. No new upgrade recipes.

Synergy counts the entire printed Grimoire, across piles and melds, excluding its own copy. Transmute and temporary Attunement do not change those counts. Prismatic uses the smallest count across all six non-Arcane elements. Enhance adds battle-long, cumulative damage to matching printed-element direct attacks, including Allies and later placements, without increasing HP, Guard or status damage. Bonuses survive recall but clear next battle. Live values, full-detail breakdowns, simultaneous enhancement pulses and heuristic AI evaluations support the new rules.

## Artwork

Selected thirteen second-pass images generated on Jonathan's DGX Spark through ComfyUI using DreamShaper XL (dreamshaperXL_alpha2Xl10.safetensors, NVIDIA GB10). Both passes are preserved. Exact prompts, seeds and workflows: synergy-art-provenance.json; reproducible generator: tools/synergy-art.mjs. Art registry includes the selected files.

## Verification

- All 833 engine tests pass, including nine new tests for counting, transformations, recall, old-save hydration, Anger/Hypnosis, Allies, random and area damage, placement attacks and UI damage text.
- Isolated source and packaged renderer checks both pass with no console errors. Screenshots were reviewed. Checks confirm all thirteen art assets load, Fire Synergy changes 9 to 10 after Enhance and deals 10, an enhanced Sapling gains damage without HP, exact archived snapshots retain buffs, and Archives contains seven Synergy and six Enhance cards.
- Normal Continue still restarts a battle from its existing checkpoint; this feature does not change that behavior.
- No live player profile or save edited. No campaign balance claim: these cards have mechanics and UI coverage, not full-run balance testing. Repeated Enhance recall can deliberately build cumulative damage.
- Repository-wide art audit still reports six preexisting missing premium-event image aliases (gildedHeartwood, keepersWager, keepersWagerWon, keepersWagerLost, counterweightSmith, sealedReflection). New-card art loads successfully.

Design: _plans/elemental_synergy_cards.md and main design v4.265. Packaged app version 4.0.45.
