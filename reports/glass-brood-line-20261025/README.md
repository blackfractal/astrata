# Three Glass Broods: verified zero-damage line

Jonathan's restarted S3 fight, seed 1877058977. Three Wind Glass Broods, 72 HP each. Start 67 HP; victory on player turn 4 with 67 HP. No consumables, healing, equipment changes, or live-save writes. Manually selected decisions replayed independently through current 4.0.31 legal actions; every action preserves 67 HP. This is a demonstrated line, not a proof of fastest possible victory. Familiar dies defending; no player HP is lost.

The source save records 4.0.29; tested after normal save migration into 4.0.31. No relevant card in this line depends on the new Starleaf or elemental-engine cards. Mindfire uses the new automatic maximum-Focus rule. Future draws used below are specific to this saved opening. No draw manipulation or random Plasma Ball targeting is required.

Coordinates: columns 1–7 run from player/left to enemy/right; rows 1–6 run top to bottom. Opening Rite starts at row 6, column 2. Keep spaces immediately left and right of Rootwall empty.

## Turn 1: establish Earth defense

Place these five cards (5 Focus total):

| Card | Row | Column |
|---|---:|---:|
| Heartwood Bastion | 3 | 3 |
| Prismatic Sap | 3 | 4 |
| Blast | 4 | 3 |
| Familiar | 4 | 4 |
| Glass Moth | 2 | 4 |

Advance to Activation. Activate Bastion, Prismatic Sap attuned Earth targeting the top Brood, Familiar Conduit attuned Earth, Blast attuned Earth targeting that same Brood, and Glass Moth targeting that same Brood. Sap relays Earth to Familiar; Familiar's Conduit gives Blast +1 damage. Damage is 12 + 8 + 4 = 24, leaving that Brood at 48 HP.

Defend the three 14-Wind attacks:

1. Familiar, then Silver Bracelet for the remaining 2. Familiar dies.
2. Prismatic Sap's Earth Guard, then Bastion.
3. Bastion.

Bastion survives with 4 Ward. Save Mirror Armor. Reservoir keeps its unused Guard.

## Turn 2: reflect the first Brood to death

Place Rootwall at row 5 column 2; Focus Energy directly above it at row 4 column 2; Corner Flame at bottom-left (row 6 column 1); Ignis Spark at row 6 column 3. Opening Rite supplies Rootwall's southern neighbor. Its east/west spaces remain empty.

Activate Bastion (+18 Ward), Rootwall (Arcane), Focus Energy, Earth Prismatic Sap against the top Brood, and Corner Flame against that same Brood. It now has 27 HP.

Defend in this order:

1. Reflect the top Brood's 18 Earth Scuttle with Mirror Armor. Earth beats Wind, so reflection deals 27 and kills it. Its Skitter disappears too.
2. Second Brood's 18 Earth: Sap's 4 Guard, then Rootwall (uses 14 of its 16).
3. Its Skitter's 1 Wind: Rootwall.
4. Third Brood's 18 Earth: Bastion.
5. Its Skitter's 1 Wind: Rootwall's last point.

Bastion retains 4 Ward and one use. Both bracelets retain their Guard this phase.

## Turn 3: kill the second Brood

Place all three newly drawn Ignis Sparks at row 6 columns 4, 5, and 6. Place Mindfire at row 5 column 4. Spend only 4 of your 5 Focus; do not place Transmute or another card.

The bottom row is now:

`Corner Flame | Opening Rite | Ignis | Ignis | Ignis | Ignis | empty`

Each Ignis sees four other Fire cards in its row and deals 13 damage. Opening Rite does not break the row bonus: this is not a contiguous-path requirement.

Against the second Brood, activate Mindfire (automatically spends your remaining 1 Focus for 14 damage), all four Ignis Sparks (52 damage total), then Prismatic Sap attuned Earth (12). Total 78: the 72-HP Brood dies and its Skitter disappears.

Last Brood's 16 Wind: defend with Sap, Silver Bracelet, then Reservoir Bracelet. No Ward needs to be spent. Its newly spawned Skitter does not attack immediately.

## Turn 4: end the fight

Place nothing. Advance to Activation with all 5 Focus.

Mindfire automatically spends 3 Focus for 30 damage. All four Ignis Sparks deal another 52. The last Brood dies, and its Ideons disappear. Finish with 67 HP, 2 Focus, and 1 Channel remaining.

## Main lessons

- Use the Wind enemies' Earth weakness for both Guard and damage.
- Reflection is an offensive finisher: save it for Earth rather than their opening Wind attack.
- Focus damage on one owner; killing it removes its Ideons for free.
- Form Rootwall around the otherwise-spent Opening Rite and Focus Energy.
- Unspent Focus is useful when Mindfire is present. Do not place cards just because you can.

Artifacts: `initial.json` preserves the original read-only save copy; `line.json` records exact legal actions; `verification.json` records independent replay results; `attempt.json` contains the initial/final states and full manual decision history. These files do not replace the user's live game.
