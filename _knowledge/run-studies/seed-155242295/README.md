# Seed 155242295: a verified win through Stratum 2

2026-10-04. Jonathan asked whether his most recent lost seed could be beaten through Stratum 2. Source run: `77fa123b-0ad3-4c9c-ae53-963232e6e44d`, package2.1.1, rules/content2.1.1. Latest UI-only package2.1.2 uses the same rules. His original run lost to Void-Colossus's Collapse after entering at17HP.

**Yes.** A fresh seeded game replayed921 legal actions and reached the normal Stratum2 victory result. The first363 actions are Jonathan's exact original choices, through the ambushed Void-Colossus battle entry. No earlier route, reward, equipment, card or HP changes were necessary. Then125 replacement actions beat Void-Colossus, followed by433 continuation actions through Stratum2. No HP, RNG, cards, stats or enemy rules were edited during the winning replay.

| Fight | Entry HP | Victory HP | Turns |
|---|---:|---:|---:|
| Void-Colossus |17|11|13|
| King Bombadier |61|2|12|

The winning opening uses both Bracelets against the ambush, places Terra Guard and Sunfruit in the rightmost column, heals with Sunfruit and attacks with Terra Guard. Terra Guard intercepts the next attack. Turn2 develops Focus Energy and Blast in that column, accepting their loss to Collapse while reducing its empty-space damage. Turn3 builds Sapling/Tide Memory/Rain Lantern with Kiln nearby, uses the Channel Draught and develops draw. This is a specific verified route, not a claim that each move is optimal.

The continuation takes Grove Titan, Emerald and a Silver Bracelet from Colossus's rewards, rests at Lantern Rest, equips the second Silver Bracelet, sockets Sapphire and upgrades Storm Canopy (sacrificing Sunfruit), a Shield and Sapling. It reaches Bombadier at61HP and wins narrowly. Purchases/choices also include imperfect play; finding a win does not establish the best possible finish.

Method:224 whole-seed heuristic attempts did not win; this exposed poor policy choices rather than proving impossibility. A guided scoring search from the exact17HP boss snapshot found its first win on candidate13. A continuation search found its first full victory on candidate35. Candidate policies use public observation/legal actions with varied weights and independent choice noise; no future deck order or RNG was fed into scoring. Repeated attempts were allowed, so this is a searched existence proof, not a blind first-attempt win or a balance/win-rate estimate. All game code remained unchanged.

## Preserved proof

- `verification.json`: outcome, source hashes and transition milestones.
- `winning-line.json.gz`: all921 action keys/labels and final state.
- `headless-replay.zip`: frozen source, original run archive, exact snapshots, winning segments and verifier. Extract to a separate directory and run `node verify.mjs` (Node24 was used). It starts from `new Game(155242295)`, resolves every recorded key against current legal actions, and checks both victories, final HP/RNG/deck/inventory. This is a headless verification bundle, not a double-click playable puzzle/executable.
- `colossus-line.md`: spoiler solution for the exact final battle entry.

The normal user profile, Archives and dead run were read only. No game app was launched, closed or manipulated for this search. Intermediate candidates/scripts remain under `_research/seed-155242295`.
