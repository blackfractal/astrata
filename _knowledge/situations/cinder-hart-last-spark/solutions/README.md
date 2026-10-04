# Solutions — spoilers

Coordinates: rows 1–6 top to bottom; columns 1–7 from player toward enemies.

## Final turn: board-only lethal

No placement, no Plasma Ball and no Wild Conduit required. Begin Activation with the existing 3 Channel.

1. Water Blast at **R4 C3**: 11 Water damage plus 5 from the two Rootbound Ring hits = **16**. Hart 27 → 11.
2. Blast at **R4 C2**: choose Water from the adjacent Water Blast; deal **9**. Hart 11 → 2. This activated Blast now relays Water.
3. Blast at **R5 C2**: choose Water from the Blast above; deal **8**. Hart 2 → −6 internally (display floors at zero). Victory at **4 HP**, 0 Channel.

Both ordinary Blasts have one activation left. The second Blast cannot select Water until the first has activated in Water. The unused/spent adjacent Blast at R3 C2 still contributes to the first Blast's adjacency damage; unused allowances and adjacency contributions are different concepts.

### Graduated hints

1. Count available Channel and remaining activations before using anything in hand.
2. Check the two adjacent ordinary Blasts on the left side of Water Blast.
3. An activated attunement can be passed to the next card this turn.

### Assessment

- Baseline success: find any legal win from the exact state.
- Strong resource reading: explain that Wild Conduit is not required.
- Strong board reading: find the winning line without using either newly drawn damage or resource cards.
- Explain the order, Water relay, finite card uses, adjacency bonus and why another enemy turn is dangerous.
- Record hints used and the explanation. These are local skill indicators, not a validated ranking scale.

## Jonathan's actual finish

Placed Plasma Ball and Wild Conduit, then activated Conduit, Water Blast (16 including Rings), Plasma Ball (8), Water-attuned Blast (9). Won with 4 HP. Conduit provided an unused extra Channel; the three attacks cost the original 3 Channel. This line is fully preserved in the action replay.

## Second Stampede defense

Use Fire Shield at **R2 C5**, then Glass Moth at **R6 C5**, Ember Nest at **R2 C4**, and Glass Moth at **R6 C4** as prompted through the two hits. This is Jonathan's recorded sequence; validate exact legal choices from the replay when teaching. It absorbs both 11-Earth hits without direct HP loss.

Holy Armor heals 2 at the following player-turn start, then Burn deals 8: 10 + 2 − 8 = **4 HP**, opening the final-turn position. The defense tests element-adjusted absorption, unused Ally bodies and movement toward decreasing column numbers.

## Full fight

`jonathan-replay.json` is the authoritative sequence of legal action keys and resulting HP values. It includes both early Focus Energies, banked Ward, Clear Mind, Water Blast recycling, Wild Conduit recycling, Plasma recycling and the last-turn finish. Earlier searched solutions live in the research directory but are not substituted for Jonathan's actual winning line.

Previous Burn-dependent rescue advice belonged to older rules and is not valid for this preserved build.
