# Premium equipment acquisition and future build choices

2026-10-24 · rules/content 4.0.23 · design 4.243

## Implemented

Ordinary free Item pickups no longer contain Gold Bracelet, Focus Ring, Channel Ring, Mirror Armor, or the seven specialty equipment pieces introduced with tactical supplies. Shops retain their existing prices and eligibility. S1 Archon Setting rewards exclude premium gear; S2+ Archon rewards can still offer it. This does not change gems, Holy Armor, equipment stats, or the Apex Predator.

Owned equipment and concrete visible rewards are preserved. Loading an older save filters premium equipment from its unseen Item Deck without consuming RNG or rearranging the remaining entries. New campaigns have different seeded sequences because the eligible event/item pools changed; old-version action scripts need their frozen rules to replay exactly.

Four optional events:

- **The Gilded Heartwood (S1):** Gold Bracelet for 15 permanent maximum HP. Current HP only clamps to the new maximum. Cannot reduce maximum HP below 1.
- **The Keeper's Wager (S1):** 100 Gold, disclosed one-in-three chance of Gold Bracelet; failure loses the entire stake. Both outcomes have a persistent result screen, and the roll occurs only when the wager is accepted.
- **The Counterweight Smith (S2):** 100 Gold plus one selected equipped bracelet and its fitted gem for an empty Gold, Prismatic, or Reclaimer's Bracelet. The chooser shows the gem, current equipment, reward details, and unavailable options. This intentionally offers competing builds.
- **The Sealed Reflection (S2):** optional Censer Engine fight. Mirror Armor becomes an optional reward only after victory; the promised reward survives battle saves/checkpoints and does not leak into later fights.

Existing event art is reused. No new images or enemy tuning. Built-in policy now accounts for permanent maximum-HP costs and disclosed wager odds; this is not a claim that it optimally evaluates these bargains.

## Equipment direction — proposals, not implemented effects

Jonathan wants final builds to have attractive alternatives to Gold Bracelet and Holy Armor. Favor effects tied to decisions already central to the game, with modest bounded bonuses, rather than another universally superior passive item. Holy Armor currently heals at most 4 HP per battle; its popularity does not imply that an alternative needs large healing numbers. Avoid reopening infinite-healing loops.

Existing alternatives deserve exposure and measurement before blanket buffs:

| Equipment | Why a particular build might prefer it |
|---|---|
| Prismatic Bracelet | Four Guard of a chosen element can be more useful than seven of the wrong element against a known attack. Its flexibility matters against multi-element cycles. |
| Reclaimer's Bracelet | Three baseline Guard, rising to nine after two Recalls, rewards actual card churn. |
| Reservoir Bracelet | Retaining unused Guard up to twelve rewards planning around quiet turns and large bursts. It adds only four per turn. |
| Echo Ring | Alternating elemental attack activations earns a separate five-damage hit, once per turn. Strong for a diverse attack engine. |
| Armor of Remembrance | Up to eight temporary Guard per round from destroyed cards may help destruction-heavy encounters, but timing and the lack of passive reduction limit it. |
| Mirror Armor | A reflected large hit can outperform modest healing; its once-per-battle use creates a timing choice. |

Candidates to discuss next; numbers are starting points, not tested balance:

- **Harmonic Armor:** activate cards of two different elements during your turn to gain 4 temporary player Guard for the coming enemy phase, once per turn. Gives elemental chains a defensive payoff without extra activation costs or healing.
- **Armor of Resolve:** the first enemy attack each round that actually damages your HP grants 3 temporary player Guard for later attacks that round. No retroactive protection against the triggering hit; no triggers from statuses or self-damage. Useful against multi-hit sequences, weaker against one enormous attack.
- **Kilnkeeper's Ring:** the first charged damage release each turn gains 4 direct damage. Charging activations do not trigger it. Rewards Kiln/Patient Seed engines rather than every attack deck; define its treatment of multi-hit/area releases before implementation.
- **Dusk Bracelet:** 3 baseline Guard, plus 4 for the next enemy phase if you spent all available Channel on card activations this player turn. Rewards committing to offense; exclude Channel lost to enemy effects and define resource-gain timing before implementation.

Keep Gold's reliable seven Guard. The strongest alternatives should win in their intended engine while retaining fights or deck states where Gold/Holy remain sensible. Next evaluation should compare the same decks and encounters, tracking actual prevention, healing, damage, unused bonuses and extra setup costs, not just nominal item stats.

## Verification and limits

- 760 rules tests pass, including pool creation/refill/transitions, legacy-save preservation, both wager outcomes, costs/eligibility, fitted-gem trades, and victory-only prizes.
- One existing Hollow Scribe spatial-spread test now sets its own combat RNG so unrelated loot pool changes do not alter its fixture. No Scribe behavior was changed.
- Isolated headless Edge checks against the packaged web UI verify the smith chooser/payment/gem surrender, winning and losing wager screens, disabled unsafe HP bargain, and no renderer errors. Screenshot reviewed. No native-window check claimed.
- Packaged runtime and portable ZIP refreshed; live player profile untouched. No fresh balance campaign was run for this acquisition patch, so its effect on S2 difficulty still needs play evidence.
