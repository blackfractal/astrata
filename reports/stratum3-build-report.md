# Stratum 3: The Lucent Depths — first playable build

2026-10-12 · Jonathan / Codex · Package, rules and content 3.0.0 · action schema 8

## Delivered

The normal journey now continues from the second Archon through a transition Tavern and the Lucid Guide introduction into the Lucent Depths. Defeating its Archon completes this build. Launch with the repository's `Astrata.cmd` or `release/Astrata/Astrata.exe`; the portable archive is `release/Astrata-v3.zip`.

- Six Motes, three Eidolons and three Archons: Mind Hive, Cnidarian and the Refraction Cannon.
- Eight enemy-owned Ideon kinds, direct targeting, owner portraits, guardian protection, positional interception, movement, fields, status effects and owner-death cleanup.
- Lucid Guide, Lucid Needle, Scouring Gale, Concord of Seasons and Second Spring. S3 shops guarantee at least two new common/rare cards; earlier card pools remain available.
- Crystal barriers, three new events, discoveries and three Archon achievements.
- Thirty new illustrations: two locations, twelve enemies, eight Ideons, five cards and three events. Existing art retained. Exact prompts, originals and destinations are in [s3-art-provenance.json](s3-art-provenance.json); selected assets and hashes are in [art-manifest.json](art-manifest.json). Generated through built-in `image_gen.imagegen`; its underlying model identifier was not exposed. No DGX Spark generation was used for this batch.
- Shared player/AI legal actions and observations, updated heuristic policy, versioned source snapshots and deterministic replay checks.

## Decisions made during implementation

The main design §10.13 and the current snapshot in the S3 plan supersede older proposal paragraphs for this build.

1. **Turn order:** direct enemy actions, commands to existing owned Ideons in creation order, then new spawns/replacements. Newly spawned Ideons do not act immediately. Ordinary failed spawns remain harmless.
2. **Guardians and area damage:** eligible targets are selected at activation start. Killing a guardian does not retroactively include its protected owner in that activation. Guardians do not protect other Ideons. Hollow Sentinel resists elemental damage by 50% and takes 50% extra Arcane damage.
3. **Corruptions and movement:** Corruptions remain on spaces. Hole prevents ordinary Ideon entry/spawning. Other Corruptions affect player cards rather than hostile Ideons. Displaced player cards encounter Hole/Hypnosis normally; covered Insanity resets. Direct projectile coverage blocks activation, defense and Recall but retains passive adjacency effects.
4. **Lucid Guide:** 12 HP, 12 uses, 1 Focus, 1 Channel, no Recall. Optionally move one orthogonal empty space, then attack an adjacent Ideon for 5 Arcane and mark it for +3 from the next different card. Equipment attacks do not consume the mark. Movement-only is legal. Field restrictions are checked at the activation's starting space. Its upgrade adds 3 HP and 3 damage.
5. **Mind Hive:** a 15-round clock replaces the proposed 100-turn battle. Early testing showed that distant late spawns never reached the player. Final spawning waves now emerge progressively nearer the player: at HP 5/4/3/2, attempt 4/6/8/10 Burrowers within columns 1–4/1–3/1–2/1. Every new insect still grants a response turn. Full-board spawn denial remains a valid strategy. At HP 1 the final command resolves before death; no pointless final spawn.
6. **Cnidarian:** starts with three Tendrils. They target the weakest Ally deterministically, without interception or overflow; without Allies they advance and inflict Poison at the left edge. Replacement multipliers depend on total Tendril deaths. Its normal attacks and Nausea continue alongside them.
7. **Refraction Cannon:** three elemental shots then one destruction shot; 14 launch damage and 12 Pierce arrival damage. Each bullet has 18 HP, moves two spaces and uses parity to stop on the intended column. Target selection uses placed/transmuted card element, rather than an expired temporary attunement. A forecast updates until firing, then the shot is fixed. Normally non-overlapping radius-one fields; no free lane means no projectile, while the direct attack still occurs. No Pain field or immobilization card yet. Shared-use fields track card identity, not a reusable space. Destruction applies after the activation even if the bullet dies during it.
8. **Late cards:** Concord needs three distinct adjacent non-Arcane sources and costs 3 Channel. Second Spring chooses up to four strongest eligible spent combat cards automatically, restores uses only, and excludes resource engines and single-use cards. Neither refreshes same-turn activation restrictions.
9. **Barriers:** ten fixed staggered obstacles, no diagonal corner cutting, routing for stalkers/hunters, explicit Flying exceptions. Spawn tiles and supplies avoid barriers; the center remains open.

## Verification

- `npm test`: **515 passed, zero failures**. New checks cover progression, target legality, area attacks, fields, coverage, Guide movement/marks, owner lifecycle, status ticks, defense origins, boss rules, barriers, new legendaries and replay/save continuity. Existing S1/S2 tests remain included.
- Art audit: **200 required assets; no missing files or provenance gaps**.
- Packaged Electron UI checks cover companion movement/targeting, guardian attacks, covered Ward restrictions, animated bullet travel and reopening a covered card, S3 map/barriers, explicit entry and the victory screen. All five scenarios fit 1440×812 without page scrolling, missing images or renderer errors. Separate disposable QA profiles preserve Jonathan's saves. See [UI results](depths-ui-verification.json) and [screenshots](screenshots/depths).
- Seventeen headless scenarios: all twelve new encounters plus five complete S3 carry-in runs. Every recorded action replayed to an identical final state. Initial states, decisions, results and exact source snapshots are retained in [depths-evaluation](depths-evaluation).

## Five-run assessment

These are explicitly authored **S3 carry-in fixtures**, not runs that earned their equipment through S1/S2. The fixture has 70 HP, 160 Gold, a developed 24-card foundation plus the Guide, 3 starting Focus/4 Channel, Gold/Water and Silver/Fire bracelets, resource rings, Stone Armor and the shield helmet. See `tools/depths-fixture.mjs` for the exact collection. The policy is `weighted-druid-v3`; this was a heuristic update, not learned training.

| Seed | Result | Final HP | Map round | Decisions |
| --- | --- | ---: | ---: | ---: |
| 73001 | Win | 30 | 17 | 668 |
| 73002 | Loss | 0 | 18 | 888 |
| 73003 | Win | 70 | 18 | 813 |
| 73004 | Loss | 0 | 13 | 580 |
| 73005 | Win | 57 | 20 | 1071 |

The isolated Mind Hive fight ended at 32 HP on turn 15. The policy lost to Cnidarian on turn 12 and the Cannon on turn 33. All six isolated Motes fell in two or three turns without HP loss against this strong fixture; the Eidolons cost 2–7 HP. This is evidence of functioning progression and varied pressure, not final balance. Particularly review the gap between single Motes and Archons, Tendril replacement escalation, Hive spawn denial and the policy's ability to prioritize owners instead of killing replaceable Ideons. Five runs are too few for statistical balance conclusions.

## Deliberate limits and next review

The S3 tutorial is deferred as requested until encounter gameplay is reviewed. No altitude viewer, Stratum 4, new general Druid movement class, or learned AI training was added. The build does not claim a tested from-scratch S1-through-S3 victory. Existing prior-version saves are accepted; normal Continue retains its existing battle-checkpoint behavior. QA used isolated profiles and did not replace Jonathan's current run.

Playtest the three Archons and formation-disruption readability next, then tune the numbers before authoring the S3 teaching route. Record subsequent requested polish and time in BUILD_LOG.
