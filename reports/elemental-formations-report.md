# Elemental formations and automatic Mindfire — 4.0.31

Jonathan approved the Starleaf/Fire layout tradeoffs, new Water and Wind engines, Starleaf as Light, and automatic maximum Mindfire spending.

## Cards

- Starleaf: Light,8base+6per connected diagonal player space−2per occupied orthogonal player space. Existing1Focus/2Channel/3uses/1Recall. Diagonal Attune preserved; base/Unattune Light.
- Ignis Spark:5base+2otherFire−2Water in its row,minimum0. Existing costs/uses unchanged.
- Rising Gale:Wind Spell,1Focus/1Channel/3uses/1Recall,commonS1.5base+2otherWind−2Earth in its column,minimum0.
- Meandering Current:Water Spell,2Focus/1Channel/3uses/1Recall,rareS1.5base+2perotherWater card on the longest simple NESW path containing it. Cost2Focus is an implementation balance choice for its larger potential formation. Source may lie inside the path; no revisits or summed branches. Max42Water spaces→87damage before modifiers. No card upgrades added.
- Mindfire spends min(3,availableFocus) automatically:6/14/22/30damage at0/1/2/3Focus.0Channel and2uses retained. UI shows cost and live damage; no spend chooser. Inspiration retains actual Focus when projecting free activation, and does not waive damage expenditure.

Row/column effects keep the named Fire/Water or Wind/Earth identities even if source Transmute changes damage element. Effective committed Attune/Conduit relays count; mere previews do not. Exposed spent cards still support formations. Frozen/Severed/Insanity/Ideon-covered cards cannot connect; hidden meld cards and Ideons are not members. Starleaf crowding deliberately counts actual occupied player spaces even when disconnected. Bonuses are shared by engine, enemy-hover damage and connection visualization. Penalties have red dashed links; Water has a flowing highlighted chosen route.

## Exact path and performance

Frontier connectivity dynamic programming scans six cells wide, tracks connected path components/endpoints/required source, prohibits cycles/revisited spaces, and reconstructs one exact longest path. Deterministic rectangle snake shortcut; bounded result cache. Independent exhaustive DFS agrees on90small random branched/looped graphs.45dense irregular boards measured average7.15ms,worst17.99ms in this environment; full42rectangle0.26ms. Timing is an observed sample, not a universal bound. Report samples saved separately.

## Compatibility and verification

796rules tests pass. Legacy placed Starleaf baseArcane becomesLight on old saves/checkpoints while trueTransmute/tincture/committed relays are preserved. Revised Attune default is the printed element; other existing Attune cards remainArcane. Ordinary reward/store pools include both new cards fromS1. No live save changes or rewinds. New offers can alter future seeded RNG choices across versions; archives identify4.0.31.

Packaged isolated Edge UI checks:StarleafLight/damage24/4penalties/Waterselection→UnattuneLight;7cardWaterpath6segments/damage17;Wind7damage/Earthpenalty;Mindfire22damage/2Focuscost,doubleclickconsumesFocusandupdatesnumberto6. No renderer errors. Actual enemy-damage previews tested against results. No fullcampaign balance test claimed.

Built-in image_gen generated two distinct spell illustrations. Assets:assets/card-meanderingCurrent.png and assets/card-risingGale.png. Exact prompts/source paths in elemental-formations-4.0.31/art-prompts.json; hashes/provenance in art-manifest. Model name not exposed. Both inspected, originals retained. Global art audit finds six pre-existing premium-event missing art/provenance entries; neither new card is missing. No unrelated event-art replacement made.

Design4.252,BUILD_LOG234. Thornfall15damage remains a prior proposal, not changed here. No enemy balance changes.
