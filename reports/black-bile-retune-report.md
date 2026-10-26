# Black Bile pressure retune — 4.0.29

Jonathan found Black Bile too easy with his Fire engine and requested more Bile, including strongest-damage-card targeting, stronger attacks, then a Trickster rematch with the same setup.

The latest archived Black Bile fight lasted six player turns, from67HP to57HP. Its HP fell167→43 during turn5:124 damage. Only0–2 Bile globs were active in the per-turn snapshots. Ordinary spreading displaced fresh casts, allowing an established attack engine to operate mostly untouched.

## Changes

- Preserve ordinary routing: one spread/left-edge escape, or one rightmost fresh throw (two after first full cycle).
- Independently throw at one strongest eligible damaging card every enemy round, two after first full cycle. Purify and left-edge escape do not suppress these throws.
- Current damage per hit includes row/adjacency/meld/Ally HP effects and Nausea. No elemental matchup, equipment proc, future resource spending or multi-hit multiplier is used in this ranking. Ties prefer rightmost then topmost. No duplicate destinations, spent targets, already-Biled targets or non-damage fallback.
- Shared plan drives green live warnings and resolution. Targeted throws originate from the boss, not the spreading glob. Each arrival drains one use; no recurring drain while stationary. Elves and Poison rules unchanged.
- Final opening S2 damage: Flood18Earth, Burning Bile22Fire+Burn2, Churn16Earth→12Fire, Acrid20Fire+Burn1. +2 per hit/fullcycle, existing +3 at/below half HP, Restlessness and buffs. S4 multiplier preserved. HP276 unchanged.

## Validation and limits

783 rules tests passed. New cases cover dynamic Fire-row valuation, ties, duplicate exclusions, spent cards, spreading plus fresh throws, Poison/Purify alongside targeting, reloads, cycle and half-HP scaling. Updated older route fixtures isolate the unchanged routing using non-damaging cards; integrated tests assert the new combined pressure.

Isolated packaged Edge checks verify early two-target and later four-target forecasts, plus simultaneous player escape and targeted throw. No renderer errors. These are synthetic UI/rules checks, not a new full balance playthrough or proof of optimal difficulty.

## Requested rematch

Prepared from the original pre-Bombadier Tavern state, preserving deck32,67/70HP,47Gold,all equipment/gems/inventory. Intercept the original battle entry to substitute Trickster while retaining enemy-first timing; otherwise Trickster's different map behavior would not enter the encounter on this move. Dazzle22Light is pending at turn0. Prepared state: black-bile-retune-4.0.29/trickster-start.json. Back up current save before installing; retain run archives.

Thornfall15damage remains a discussion-only proposal; no card changes here.
