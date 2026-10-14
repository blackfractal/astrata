# Mind Hive: random 30-card decks

2026-10-13 · game/rules/content 3.0.6 · 20 independent seeds 74101–74120.

Jonathan requested a completely random 30-card deck test after five authored carry-in decks survived the revised Hive without losing HP. This batch tests 20 independently randomized decks. Every one of the 63 player-card definitions is equally likely on each of 30 draws, with replacement. This includes Hexes, companions, starter cards and Legendary cards. No upgrades or guaranteed engine/repair/Ideon cards; exactly 30 cards, with no extra Lucid Guide grant. Deck-building RNG is separate and recorded through seed and exact initial state.

Equipment and starting HP match the earlier five tests: 70 HP; Gold Bracelet with Sapphire, Silver Bracelet with Ruby, Ring of Patience with Amber Thought, Ring of Embers with Storm Opal, Stone Armor and Sturdy Metal Helmet. The same deterministic WeightedPolicy chooses all actions; no training or search. These are synthetic standalone fights, not naturally earned campaigns. The player's save and game balance were not changed.

| Outcome | Result |
|---|---:|
| Wins | 11/20 (55%) |
| Losses | 9/20 (45%) |
| No-damage wins | 0 |
| Winning final HP, mean | 39.8/70 |
| Winning final HP, median | 39/70 |
| Winning final HP range | 18–61 |
| Winning damage taken, mean | 35.1 (healing makes this differ from net HP loss) |
| Loss rounds | One on 12; one on 13; four on 14; three on 15 |
| Final killing sources | Six Mind Eggs; two Thought Burrowers; one Glass Skitter |
| Deterministic replays verified | 20/20 |

Across all hatched eggs, winning decks covered 75.8%; losing decks covered 64.5%. This is descriptive, not proof of causation: decks differ, losses end early, and repair counts also vary. All losses ultimately came from Hive-owned threats, but randomized Hexes can contribute earlier damage or resource penalties. Decks averaged 2.35 Hexes. Sampling all rarities equally can also produce unusually many Legendary cards. Do not treat the 55% as an estimate of naturally assembled S3 decks' win rate.

Assessment: the prepared build's five flawless wins did not generalize to arbitrary decks. The fight punishes weak or mismatched formations, while the authored foundation remains exceptionally effective. This supports examining which engines turn egg-driven discard into a benefit and how safe prepared defenses remain, before simply increasing damage. Strong fixed equipment is a major controlled advantage in both test groups. No balancing changes made from these results.

`summary.json` lists all decks and metrics; per-seed JSON files contain initial/final states and exact decision sequences. `runs/` retains every decision and effect, and source snapshots preserve the build. Reproduce with `node tools/mind-hive-random-decks.mjs`.
