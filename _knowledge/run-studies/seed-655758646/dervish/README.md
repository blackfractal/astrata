# Dervish Hunter: protecting the damage engine

Jonathan's run `ca4e323d-1d30-459f-93e6-202d49aa17d2`, seed **655758646**, captured 2026-10-10. Package 2.1.25, rules 2.1.15, content 2.1.21. Exact starting state is archived event 168: 70 HP, Dervish Hunter 53 HP, Restless 1, incoming ambush Slice 9 Wind. Bronze Bracelet absorbs 2; the first player turn starts at 63 HP. This initial 7 damage is unavoidable with the defenses equipped at battle entry.

The full recorded action sequence was replayed, matching player and enemy HP after every action. Jonathan won on turn 8 at 29 HP, after healing 11 HP with Bloomcall (52 total damage taken). Verified alternatives win on turn 4: **45 HP without consumables**, or **53 HP using the owned Focus Draught**. These are demonstrated improvements, not a proof of optimal play. Both preserve the exact seed, equipment and legal action rules. Planning later turns uses the recorded draw sequence; these are retrospective solutions, not claims that the initial decision had perfect information.

## What mattered

- Familiar was placed alone, then activated Arcane Conduit without adjacent Blast/Shield beneficiaries or an elemental defense benefit. Its interception still saved 6 HP, but the activation itself did nothing useful. An unused Channel would not itself be a mistake if no better activation were available; the larger opportunity was choosing Ignis Spark instead of Familiar.
- Cinder Snap in the far corner supplied no useful connection. Putting Ignis Spark in the same row makes it deal 7. Leave one space between them for a future Sapling. The Earth-socketed Rootbound Ring deals its own 3-damage proc against the Wind Dervish on the first attack each turn.
- Sapling was isolated and therefore did not grow. It attacked once, then died absorbing the first Whirl. Its Earth element is valuable on both offense and defense. Growing and protecting it enables a second stronger attack and a later interception.
- Dervish remained at 29 HP through turns 3, 4 and 5. The second Whirl cost 14 HP. A defensive turn is not inherently wrong, but repeated turns without damage gave the enemy another increasingly strong cycle.
- Focus Energy was not in the first four reveals, so this was not a failure to activate an available early Focus engine. It first appeared on turn 5 in the recorded line.

## Verified line without consumables

Coordinates use columns from player to enemy (1–7), rows top to bottom (1–6). Place Ignis at row 3 column 4 and Cinder Snap at row 3 column 6, leaving row 3 column 5 open for Sapling.

| Turn | Placement and activation | Defense and outcome |
|---|---|---|
| Ambush | Use Bronze Bracelet. | Start turn 1 at 63 HP. |
| 1 | Place Cinder Snap and Ignis Spark. Activate Cinder, then Ignis: 16 total including the ring. | Bracelet, then take the remainder. 56 HP; enemy 37. |
| 2 | Place Sapling between them. Activate Cinder, then Sapling: 15 total. Sapling grows from 4 to 6 HP. | Preserve Sapling: use Bracelet and take Whirl's remaining damage yourself. 40 HP; enemy 22. |
| 3 | Place Bloomcall immediately above Sapling (row 2 column 5). Activate Sapling first: 12 including ring, then grow to 9 HP. Activate Bloomcall for 5 healing. | Sapling intercepts the 10 Wind Slice, losing 5 HP and surviving at 4. Player 45 HP; enemy 10. |
| 4 | Activate Ignis Spark: 7 plus the Earth ring's 3. No new placement needed. | Win at 45 HP. |

Taking damage deliberately on turn 2 preserves a reusable source of damage and later defense. It avoids the second Whirl entirely.

## Verified Focus Draught alternative

Same turn 1. On turn 2, drink Focus Draught, place Sapling between the Fire cards and Shield immediately above Sapling. Activate Sapling, then the Shield attuned to Earth. Use the Shield's 6 effective Guard against Wind plus the Bracelet, preserving Sapling. Turn 3: place Bloomcall at row 2 column 6 (adjacent to Shield and Cinder), activate Sapling, then Bloomcall for 7 healing. Sapling absorbs the subsequent Slice. Turn 4: activate Cinder Snap then Ignis Spark to win at **53 HP**. This spends the potion rather than saving it for another fight.

## Replay and evidence

- [Open the exact fight](../../../situations/dervish-tempo/Open%20full%20fight.cmd), then choose Continue. Each launch creates a separate practice profile; normal Continue remains at the earned reward screen.
- Original save, exact event archive, opening snapshot and both alternative action traces are stored here.
- `analyze.mjs` reproduces Jonathan's line and verifies both alternatives against the compatible engine.
- The practice manifest preserves the complete 2.1.25 portable build and snapshot checksums under `_knowledge/situations/dervish-tempo`.
