# Trickster pressure and staggered shifts — 4.0.30

Jonathan's archived win lasted six player turns,67HP→67HP. Per-turn snapshots had only0–6 active Corruptions. He requested stronger attacks, more Corruptions, destruction when crossing (not just landing on) Memory Holes, and expanded displacement. After considering two nonadjacent lines, he chose the original staggered three-line pattern.

## Delivered rules

- Select fullest row/column by individual card count including melds; ties topmost/leftmost. Lock the whole pattern when the Tell first appears.
- H: row above1right,fullest2right,rowbelow3right. V: columnleft1down,fullest2down,columnright3down. Neighbor selection and movement wrap at grid boundaries.
- Translate simultaneously one space at a time. At each step a Hole immediately destroys the complete arriving Construct, removes its Shield pools, and prevents further movement. Corruptions stay fixed. Hypnosis remains final-landing-only.
- Warnings show1/2/3 distances, first lethal Hole along each route, and final Hypnosis hazards. Animate each step, disintegrate at the Hole, then continue survivors. Existing published legacy single/two-line warnings keep their scope on Continue; new warnings use staggered shifts.
- Opening single attacks30Light/30counter/30Chaos; split attacks12Chaos+12Light and12Light+12Chaos. Cycle scaling+3single/+2per split hit; existing Restless/S4 scaling retained, no extra half-HP damage. HP264 unchanged.
- Dazzle marks4Holes,6belowhalfHP; Hmarks3Hypnosis; Vmarks4Nausea. Counts remain limited by legal eligible spaces; no added untelegraphed arrivals when HP crosses the threshold after warning.

## Verification

789 rules tests passed. Coverage includes H/V paths, first/second/third-step Holes, edge wrapping, complete Constructs, Shield removal, simultaneous occupied cells, staggered distances, locked targets/reload/legacy warnings, final-only Hypnosis, larger waves, scaling and threshold timing.

Packaged isolated Edge checks cover both axes:21H/18V warning cells,correct1/2/3labels,first-step andthird-step destruction animations, and no continuation ghost after the first-step death. Screenshots and recorded DOM events at trickster-retune-4.0.30/ui. These are rules/UI checks, not a newly played balance encounter. No live save rewind or profile mutation requested or performed this turn.

Design4.251 and Stratum2 planning updated. The game must be relaunched to load updated code if it was already running.
