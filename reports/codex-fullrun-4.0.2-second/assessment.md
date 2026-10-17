# Second manual run and approved pressure pass

Game **4.0.2**, seed **885553835**, October 16, 2026.

## Result and limits

The run won **27 encounters**, cleared S1 and S2, then died to the **Refraction Cannon's third Final Blast on turn 15**. The Cannon had **128/360 HP** remaining. It entered the fight against a 70/70 HP player; the killing attack was 72 Chaos, of which Bastion and the Silver Bracelet absorbed 27. S4 was **not reached**, so this run does not validate the revised S4 difficulty.

Codex selected legal actions headlessly, without the built-in AI, search, rewinds, health edits or access to future draws. The first 245 decisions reused the earlier run's decisions; replay stopped when its distant Transmute was no longer legal. Subsequent decisions were chosen manually. An independent replay from the archived initial state and frozen source verified all **1,230 actions**, every recorded HP/gold transition, and the final RNG, deck, equipment, statistics and battle state. The normal player profile was not used.

This is one attempt with substantial mistakes. It does not establish that the seed is unwinnable, that the Cannon is overtuned, or that any particular combination is mandatory. The routes, rewards, S2 boss, purchases and available resources diverged from the first run. This is not a controlled same-build comparison.

## Changes delivered

- S2 main enemies: **+20% HP, +15% direct attack damage**.
- S3 main enemies: **+20% HP and direct damage**. Their Ideon attacks and Mind Eggs also receive +20% damage. Ideon HP stays unchanged, preserving counterplay thresholds such as Lucid Guide versus tendrils. Mind Hive retains its 15-round timer.
- S4 returning enemies: another **+10% HP/damage** after source-Stratum tuning and the existing rematch modifiers. Native Apex Eidolons receive +20% HP/damage. **Apex Predator and its owned Ideons remain unchanged.**
- Damage rounds to the nearest integer, separately per hit; HP rounds upward. Tiny one-damage insect attacks therefore remain one, rather than silently doubling. Status applications, ordinary Mind Mines, Corruption counts and spawn schedules are unchanged. Tutorials and S1 enemy numbers are unchanged.
- Purchased shop offers remain in their original slots with disabled **Sold** buttons, including after Continue.
- Transmute only targets **orthogonally adjacent placed cards**. Description, legal actions and UI targets agree.
- Four distinct top-down Apex field backgrounds and a small cliffside candlelit meditation background are selected. Previous artwork remains preserved. Prompts and provenance are in `../apex-art-4.0.2.json`.

Expected engines remain approximately 3 Focus/3 Channel in S2, 4–5 of each in S3, and about 5 or more of each in S4. These are tuning assumptions, not granted resources or caps. Existing active-fight HP is preserved on Continue; newly created encounters use the revised HP. No additional healing, Mirror Armor, Plasma Ball or Opening Rite nerfs were made.

## Progression observed

| Segment | Encounters | Battle turns | Equal/higher ending HP | Net encounter HP lost |
| --- | ---: | ---: | ---: | ---: |
| S1 | 10 | 35 | 3 | 64 |
| S2 | 9 | 37 | 4 | 28 |
| S3 before Cannon | 8 | 24 | 7 | 7 |
| Cannon | 1 | 15 | 0 | 70 |
| S4 | Not reached | — | — | — |

These are start-minus-end HP totals, not gross damage: healing within fights can conceal damage; tavern/map healing is outside the totals. The raw damageTaken counter is 225 and includes incoming lethal overkill. Earned 1,584 Gold, spent 1,520, ended with 64 Gold and 47 cards.

The first run's S2 had 14 fights, 39 turns and only 4 net HP lost. This run had fewer fights, more attrition, fewer purchases and a different boss. S2 pressure increased meaningfully in this attempt. S3 ordinary fights were still mostly comfortable, followed by a much harder boss. The desired smooth ramp is therefore **not yet demonstrated**.

| Boss | Turns | Player HP | Observation |
| --- | ---: | --- | --- |
| Glass Choir | 10 | 41 → 18 | Adjacent Transmute changed the old line; Final Note still mattered. S1 enemy stats were not buffed. |
| King Bombadier | 11 | 52 → 48 | Bloomcall healed 9: 13 gross damage despite only 4 net loss. Water Titan burst and a late Plasma meld helped finish. |
| Refraction Cannon | 15 | 70 → 0 | Survived the first two Finals, but lost the damage race and could not cover the third. |

## New discoveries

**Ordinary encounters and bosses need separate attention.** Hollow Scribe died in two player turns before its Hole pattern developed. Blind Seer died in one player turn despite an ambush; Mirror Armor plus two Plasma attacks and a Blast were enough. Seven of eight pre-Cannon S3 encounters lost no net HP, with little healing to explain that result. Another universal S3 increase would also strengthen the already demanding Cannon. Targeted opening pressure, durability thresholds or encounter composition deserve the next experiment.

**Economy and route strongly shape the difficulty curve.** This deck entered the Cannon with base 7 Insight, 3 Focus and 4 Channel, one Silver Bracelet (4 Guard), and Mirror Armor. Two Focus Energies eventually raised battle Focus to 5. The previous run had two Gold Bracelets and a much richer deck. I traded away the Bronze Bracelet and its gem for Titan, then spent heavily on resource rings and sockets. That traded recurring defense for engine capacity; it was not free power. This attempt provides no fresh evidence for a Gold Bracelet nerf because it never acquired one.

**Adjacent Transmute creates actual layout costs.** A Ward that needs isolation cannot activate while Transmute sits beside it. Jonathan clarified the intended investment: place Transmute beside the Ward, change the Ward's element, then Recall Transmute during the next Placement phase. The Ward keeps that element until recalled/destroyed and can activate once isolated again. This is a viable alternative to Living Lattice, not an incompatibility between the cards. Converting Titan and Plasma also required reserving adjacent spaces rather than converting anything anywhere. Transmute remained valuable: Water Titan helped against Bombadier, and Light conversion enabled useful Cannon damage. It no longer supplied effortless global flexibility.

**The Cannon attacks engine access as well as HP.** In this archived 4.0.2 run, a bullet could occupy a Mind Mine space, preventing a cover placement until the bullet was removed during Activation—too late to place that turn. This was the bullet's exact occupied space, not the surrounding diamond: the field already allowed placement of any element and restricted activations. An elemental field could disable the Transmute needed to change another card's element. The radius-two field also conflicts with Lucid Needle's radius-two bonus: the nearby Needle may itself be unable to activate in the required element. Distant attacks and preparation before the bullet arrives matter.

**The Cannon's targeting changes while the player builds.** Placing or charging a stronger elemental defense can change the upcoming shot and its counter-element. A newly charged Earth Bastion drew Fire pressure rather than the Wind attack I had initially planned around. The forecast is available, but decisions must use its updated value after placements and activations. This is an especially important teaching/UI interaction.

**Plasma has a useful split-versus-meld decision.** A meld helped recover from a three-Mite ambush with reduced Channel; separate Balls helped attack different Cannon bullets. A three-card Construct reached 28 damage for one Channel, but required 3 Focus to recall and was vulnerable to field restrictions. Random targeting repeatedly spent attacks on bullets rather than the boss. Plasma was strong, but did not solve this run.

**Opening Rite still deserves observation.** Three copies enabled very strong first-turn deployments, including Titan in ordinary S3 fights. Their spent bodies were also costly space commitments: one beside my Solitude left it unusable for much of the Cannon fight. I would first test stronger opposing opening patterns rather than automatically nerf every good engine card.

**Healing did not erase this run's pressure.** One Bloomcall helped Bombadier and healed 9 during the Cannon fight, but could not be reused there. Between-Stratum recovery mattered. The earlier concern about accumulating many healing cards remains valid as a separate experiment; this run does not justify simultaneously reducing all healing and increasing all enemies again.

## My mistakes and a better line of play

- I let too many spent Shields, Blasts, Cinders and utility cards occupy the grid. Recalls needed to happen sooner so the deck could cycle and critical placements had room. During analysis I also repeatedly overlooked that Recall belongs to Placement; rejected selectors did not advance the game.
- I placed Solitude beside an Opening Rite, so its isolation requirement failed. Recovering it with Undertow on turn 15 was far too late.
- I clustered key cards where the Cannon's diamond fields restricted several at once. Both Machine Elves were lost, leaving later mine handling dependent on cover sacrifices.
- Mirror Armor was spent on an early attack, unlike the prior run that saved it for Final Blast. I did survive the first two Finals with other defenses, but at a substantial cost in Ward capacity and actions.
- I often prioritized immediate defense without preserving enough damage throughput. The Cannon still had 241 HP after the second Final. Saving more HP on a single turn is not necessarily the better line against escalating attacks.
- A better attempt would reserve adjacent Transmute access, recycle spent defenses earlier, protect at least one mender, and establish reliable targeted offense sooner. These are hypotheses, not a tested winning route.

The retained battle-entry snapshot permits a separate retry later. This report keeps the original loss intact.

## Verification and evidence

- 651 rules tests passed; asset audit found 213 required assets, 222 selected versions, no missing art or provenance.
- Ten packaged Apex UI cases passed, including distinct decodable floor art and cliffside battle art. Screenshots were inspected.
- Packaged shop checks passed for all four buying categories: unchanged slot geometry, disabled Sold buttons and persistence after Continue.
- `verification.json`, `encounters.json`, `decisions.jsonl`, `initial.json`, `final.json`, `sources.json` and `battle-*.json` retain the run and exact replay evidence. `tools/verify-second-run.mjs` reproduces the verification.
- Post-run cleanup corrected scaled Ideon description numbers and the Mind Egg animation label; combat rules were not changed during the run. Frozen run sources remain untouched.

Recommended next step: inspect the ordinary encounters that still end before their mechanics matter, and retry the archived Cannon position with cleaner planning before making another blanket increase. S4 still needs a new end-to-end balance observation; its rules and UI checks are not a substitute for that playthrough.


## Follow-up proposals — 2026-10-17 (not applied)

Strengthen ordinary S3 encounters selectively so their Ideon/Corruption mechanics have time to matter; prioritize opening durability or earlier threats over a universal damage increase. S2 deserves a smaller pass targeting long setup cycles and weak openings; the second run already showed more attrition. Mixed-element sequences and formation/Recall pressure are candidates. Leave S3 boss numbers pending cleaner retries; no blanket Transmute/Plasma/healing nerfs. Observe multiple Opening Rites against better enemy openings before deciding on a nerf. These are recommendations, not newly approved tuning.

Approved Cannon clarification:4.0.5 places charging mines after enemy-round bullet movement/launches, ensuring fresh mines are not beneath bullets when the player gets control. This fixes the obstruction observed in this archived4.0.2 run without changing its frozen replay or granting placement onto Ideon centers.
