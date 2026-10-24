# Tactical supplies and equipment — 4.0.15

2026-10-24. Jonathan requested the new consumables/equipment, socket prices accounting for both Gem and Setting, ten campaign attempts, and autonomous enemy tuning. Design version 4.236, section 6.7.1 is the rules reference.

## Delivered

Twenty consumables, seven equipment pieces, two potion-dealer events, and 29 generated illustrations are implemented in the engine, legal-action API, loot, Market, inventory, Archives and battle UI. The original five consumables remain available. The Satchel still holds 12 items, and only one consumable may be used per player turn.

| Consumable | Effect | Base price |
| --- | --- | ---: |
| Seven elemental Tinctures | Change a placed card to the printed element for this battle; persists through Recall | 45 |
| Prismatic Tincture | Choose the element at use time | 110 |
| Shifting Sap | Move a whole Construct one orthogonal space | 40 |
| Wild Inspiration | Next draw, free placement and activation, then Discard | 65 |
| Perfect Inspiration | Choose from Draw, free placement and activation, then Destroy | 150 |
| Confluence | Focus and Channel pay one another's costs until the enemy phase | 75 |
| Recall Mist | Free legal Recall of a whole Construct | 40 |
| Memory Draught | Put a Discard card on top of Draw | 40 |
| Rustbane / Cindersalve / Antidote | Clear Corrode / Burn / Poison | 30 each |
| Sealed Breath | Prevent those status applications and damage through the next enemy phase and following status tick | 60 |
| Fury Sap | Double the next damaging card activation's direct damage | 85 |
| Bastion Oil | Double the defense added by the next Shield/Ward activation | 70 |

Perfect Inspiration, Confluence, Sealed Breath, Fury Sap and Bastion Oil enter at S2. The two dealer events offer a single fixed-color bottle for 30 Gold or the choose-at-use bottle for 90 Gold. Regular item drops, shops and eligible battle item rewards can provide supplies. Existing earned Gem rewards have a 25% chance to become a consumable; S2+ earned Setting rewards have a 50% chance to use the new equipment pool. These substitute existing rewards rather than add another reward roll. Reward items may be declined.

| Equipment (S2+) | Tradeoff | Base price |
| --- | --- | ---: |
| Prismatic Bracelet | 4 Guard; choose its defensive element once per player turn | 260 |
| Reservoir Bracelet | 4 Guard, unused Guard retained and replenished by 4, cap 12 | 250 |
| Reclaimer's Bracelet | 3 Guard, +3 for each of the first two Recalls, cap 9 | 230 |
| Last Stand Bracelet | 4 Guard, or 9 when starting the player turn at or below one-third HP | 240 |
| Echo Ring | First consecutive damaging activations with different elements produce a separate 5-damage hit in the second element | 220 |
| Helm of Resonance | Once per turn, attuning through an already activated adjacent card gives +4 damage or +4 Guard/Ward | 200 |
| Armor of Remembrance | Destroyed player cards give 2 temporary body Guard each, cap 8 per round; no passive armor reduction | 210 |

Bracelets and Echo Ring are Settings. These alternatives sacrifice unconditional output for flexibility, timing, reserve capacity, or recovery after destruction. Gold Bracelet remains 7 Guard.

## Boundaries against exploits

All requested consumable concepts were retained. Free placement/activation is the riskiest one, so it obeys card conditions, valid targets, and empty-space placement; it does not bypass a charge requirement or grant an arbitrarily large optional Focus spend. It cannot free-Meld. A charged card may release normally, but charging a card merely charges it. If no legal completion exists, the card stays in hand. Wild Inspiration sends non-recallable cards to Destroyed, closing the permanent-resource recycling loophole. Perfect Inspiration is single-use, expensive, and only enters at S2; it has no separate rarity weighting beyond the item pool.

Recall Mist does not override Cannot Recall. Shifting Sap does not move Corruptions or bypass occupied/forbidden spaces. Fury Sap excludes status ticks and equipment attacks. Bastion Oil multiplies only newly added defense. Sealed Breath pauses existing status values rather than deleting them. None of the new consumables accepts Liquid Crystal: doubling free-card actions, status immunity or already doubled attacks needs a separate design decision. The original five still do.

Every battle buff remains visible after its bottle is consumed. Damage/defense previews include the applicable multipliers and helmet bonus. The Jeweler displays service prices on drop targets, before payment.

## Socket pricing

| Gem | Basic Setting | Intermediate Setting | Gold/new special Setting |
| --- | ---: | ---: | ---: |
| Element gem | 20 | 40 | 60 |
| Insight gem | 35 | 70 | 110 |
| Focus / Channel gem | 60 | 120 | 180 |

The new Settings and Gold Bracelet use the highest tier; other Settings with base value at least 100 use the middle tier. Unsocketing remains 20 or 35 based on the Gem, and First Glimmer remains free. Thus an engine Gem in a powerful Setting is a substantial purchase rather than a cheap finishing step.

## Ten campaign attempts: limited evidence

The ten runs used an automated controller: WeightedPolicy outside combat decisions, plus six-candidate, one-turn combat rollouts. These were not ten manually chosen Codex campaigns, trained-policy improvements, or successful S1–S4 clears. Every attempt ended in death, with nine ending in S1 and one reaching S2. Early routing and combat mistakes are a major confounder; these results do not establish that human play is too difficult.

| Seed | Last Stratum | Decisions | Last encounter |
| --- | ---: | ---: | --- |
| 24102501 | 1 | 149 | Ink Leech / Shard Walker |
| 24102502 | 1 | 238 | Glass Choir |
| 24102503 | 2 | 510 | Thread Mites / Seamstress |
| 24102504 | 1 | 229 | Void Colossus |
| 24102505 | 1 | 332 | Void Colossus |
| 24102506 | 1 | 272 | Dervish Hunter |
| 24102507 | 1 | 167 | Fire Wolf / Wolf |
| 24102508 | 1 | 117 | Dervish Hunter |
| 24102509 | 1 | 101 | Fire Wolf |
| 24102510 | 1 | 231 | Sludge / Cinder Hart |

Frozen 4.0.14 sources, initial/final states, action traces and final-state replay hashes are in `supplies-campaigns-4.0.14`. All recorded actions replayed legally to matching final states. The run seed numbers are identifiers, not dates. Compact results are in [supplies-evaluation-summary.json](supplies-evaluation-summary.json).

## Controlled boss comparisons and tuning

To exercise late-game equipment despite the early campaign deaths, I ran seven bosses against eight loadouts: the archived baseline and one substitution for each new equipment piece. S2 used an actual archived 30-card engine deck without Grove Titan. S3/S4 used an archived 51-card Titan/Transmute deck. All began fresh at 70 HP with no ambush or Restless bonus. Each received the same six-bottle tactical kit. These are deliberately supplied encounters, not naturally earned campaign inventories. Replacing an equipped item also loses that item's resource/effect bonuses; only compatible socketed Gems transfer.

There were 56 comparisons before tuning, two intermediate eight-fight Trickster batches, and 56 final comparisons. Fixed loadouts and deterministic repeated fights are not independent population samples. Initial states, legal action sequences, outcomes, turn logs and frozen sources are retained in their corresponding evaluation directories. All final comparisons replayed to identical serialized states.

Final surviving HP (`—` = loss):

| Boss | Baseline | Prismatic | Reservoir | Reclaimer | Last Stand | Echo Ring | Resonance Helm | Remembrance |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Black Bile | 50 | 54 | 34 | 52 | 50 | 26 | 46 | 40 |
| King Bombadier | — | — | — | — | — | — | — | — |
| Trickster | 56 | 56 | 60 | 67 | 56 | — | 43 | 52 |
| Mind Hive | 25 | 25 | 33 | 26 | 25 | — | 69 | 29 |
| Cnidarian | — | — | — | — | — | — | — | — |
| Refraction Cannon | — | — | — | — | — | — | — | — |
| Apex Predator | — | — | — | — | — | — | — | — |

**Only enemy adjustment: Trickster's base single attacks 20 → 22; split attacks 7+7 → 8+8.** Its HP, move order, Corruptions, targeting and escalation rules remain unchanged. Before tuning all eight loadouts won, usually with abundant HP; afterward seven won, generally with less HP. This is a modest pressure increase, not evidence that Trickster is now definitively balanced.

No general enemy buff or nerf was justified. Black Bile still appears manageable for this engine and deserves a human review; prior manually chosen lines already showed that planning changes the result substantially. Bombadier, Cnidarian, Cannon and Predator losses are not proof of impossibility, and increasing their numbers on this evidence would be unjustified.

No new item solved every tested fight. The Helm was especially effective against Mind Hive (69 HP versus baseline 25), which is a useful strong matchup rather than sufficient evidence to nerf it. Echo Ring performed worse when its damage replaced useful existing equipment resources. Reservoir was helpful in some fights but worse than baseline in Black Bile. These are desirable tradeoffs, subject to better player testing.

The controller still undervalues some tactical options, including selecting the best Perfect Inspiration card. Its weak routing, horizon and placements limit both campaign and equipment conclusions. A stronger manual campaign remains necessary before calling the whole expansion balanced.

## Verification and delivery

729 rules tests pass, including resource conservation, free-card lifecycle/save handling, non-recallable disposal, status protection, whole-Construct movement, multipliers, gear triggers, boss row destruction and Anti-elemental forecasts. Six isolated packaged Electron checks passed: Tincture targeting, Inspiration's free placement/activation, bracelet element choice, pending buff/boosted damage display, dealer purchase, and Jeweler pricing. No renderer errors were observed. Test saves were isolated from the live profile.

The source, packaged executable resources and portable ZIP are version 4.0.15. The content/art audit passes. [Art provenance](supplies-art-provenance.json) retains all 29 exact generation prompts, original locations and hashes. Images were generated through the built-in image-generation tool; its underlying model identifier was not exposed. Spark was not used for these images.

Replay evidence is preserved in the repository; the portable build includes compact results rather than the large raw evaluation traces. No commit or push was performed.
