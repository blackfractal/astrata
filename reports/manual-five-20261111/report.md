# Five manual headless Druid runs

Version tested: 4.0.45. Started November 11, 2026 (local time).

Follow-up: Jonathan subsequently authorized local corrections of clear, player-information-visible mistakes. Those results, including a full S4 completion, are recorded separately in [replay-report.md](replay-report.md). The original no-retry results below are preserved.

## Conclusion

I completed five fresh runs, choosing the actions myself rather than using the built-in bot. All five ended in defeat: three in S1 and two at Black Bile in S2. This batch demonstrates substantial punishment for bad routing, inefficient openings, and mismatched resource engines. It does **not** establish that the game is nearly always winnable by an expert, nor that any seed was unwinnable. I made material mistakes and did not play at an expert benchmark level consistently.

The clearest balance concern is the contrast between forgiving ordinary encounters with strong equipment and much sharper pressure from aggregated encounters and status-heavy bosses. I would not broadly raise enemy damage based on these results. I also cannot assess S3/S4 progression from this batch: none of these runs reached them.

Several multi-card engines worked in individual encounters without Grove Titan + Transmute. No full-run winning engine was demonstrated here. That distinction matters.

## Protocol and evidence

- Five seeds selected before play: 11112601 through 11112605; normal fresh Druid starts.
- Frozen source copy; no game balance changes during the experiment.
- Explicit legal action selections, including rewards, shopping, equipment, movement, placement, activation, and defenses. No heuristic bot, policy search, automated tactical solver, or delegated player.
- No rewinds, retries, manufactured equipment, edited HP, or draw-order/seed inspection to choose actions. Public card/item/enemy definitions were available for rules knowledge. Archon identity was used after discovery.
- Runs were interleaved. Later decisions benefited from what I learned during the batch; this is not five independent human subjects.
- **2,128 recorded actions, 58 encounters, 53 encounter victories, five terminal losses.** I subsequently replayed every recorded action against the frozen engine. All actions were legal, all recorded HP/gold/mode/step outcomes matched, and all five final state JSONs matched exactly. This replay was verification of existing decisions, not another attempt or search for improved lines.
- Raw states, battle starts, frozen source, and complete decision logs remain under the ignored `snapshots/manual-five-20261111/` directory. The reusable selector driver is `tools/review-five-manual.mjs`. [Evidence and encounter statistics](evidence.json) are retained with this report.
- Jonathan's live game/profile was not used as these runs' save destination. No tuning was applied.

### Important measurement limitations

My compact headless display was not fully equivalent to the UI. It omitted individual card Locked/Frozen/Severed flags, map movement categories unless separately looked up, and Black Bile's enemy-specific `bilePlan` preview. Ordinary grid telegraphs were displayed, but that separate Bile preview was not. These were shortcomings in my review tool, not evidence that the game hides the information. They particularly weaken conclusions about my response to Bile. Legal-action checks prevented illegal plays, but did not prevent poor legal decisions.

The engine's final encounter turn counter sometimes advances before a status death. The table below uses recorded encounter counters, not an inferred number of completed player turns. HP changes are net encounter HP changes and can include healing; “no net HP loss” does not necessarily mean no damage occurred.

## Results

| Run / seed | Final encounter | Entry HP | Recorded turns | Enemy HP remaining | Result |
|---|---|---:|---:|---:|---|
| 1 / 11112601 | S2 Black Bile | 42 | 14 | 41 | Poison death |
| 2 / 11112602 | S2 Black Bile | 18 | 5 | 215 | Burn death |
| 3 / 11112603 | S1 Cinder Hart | 33 | 8 | 54 | Burn death |
| 4 / 11112604 | S1 three Ashlings | 35 | 3 | One killed; survivors 7 and 18 | Coal attack death |
| 5 / 11112605 | S1 Cinder Hart | 42 | 7 | 16 | Stampede death |

**Run 1: Focus, elemental support, and recycling.** Upgraded Blasts, elemental Synergies, Tide Memory, Living Lattice, two Focus Energies, Root to Flame, and later Mindfire/Season's Turn. Gold Bracelet, Water Silver Bracelet, and an Amber Thought supported the engine. Void-Colossus took 14 turns but only one net HP, 55 to 54. In S2, several individual encounters ended at full HP. Hound + Choir took 55 to 41. A later avoidable Echo + Grub ambush took 55 to 42. Against Bile, extra opening Focus enabled a 50-damage first-turn package, but two Channel was too restrictive for simultaneous repair, guarding, and sustained attacks. Bile drained uses faster than I recycled them. Burning/Poison eventually finished the run.

**Run 2: Rain, Conduit, and expensive activations.** Rain Lantern, Wild Conduit, Mindfire, Season's Turn, Plasma Ball, and Undertow; equipment supplied three base Channel and a large draw. Base Focus remained one, making the opening fragile. Void-Colossus took 16 turns, 36 to 12 HP. After healing between strata, ordinary S2 encounters were comfortable. A Sourcap + Spoolkeeper + Hound ambush took 55 to 14 despite winning in six turns. The recovery involved Rain supplying Focus, Mindfire killing the Hound, Conduit enabling Season plus defense, and Undertow refreshing Season for the finish. Bile was entered at only 18 HP. My incorrect defense ordering there caused further avoidable damage.

**Run 3: cheap damage with insufficient defensive depth.** Corner Flame, Crashing Wave, Tide, Focus, and a late Grove Titan. Trading a bracelet for Titan gave up immediately useful defense before reliable deployment was established. Three Ashlings took 62 to 38 HP. Cinder Hart was entered at 33; Water conversion helped, but the opening and damage race were too slow against Burn.

**Run 4: ambitious assembly without enough immediate strength.** Arcane Surge, Resonant Grove, Fire Synergy, Conduit, Rain, Focus, Undertow, and Terra Guard. Taking Surge's associated Hex early, then paying to remove it with equipment, had real opportunity costs. A Shard-Walker + Ink Leech encounter took 69 to 34. Another bad sequence led into three Ashlings after Fire Wolf. The loss does not show that Resonant Grove or the intended engine is intrinsically weak; it never became a functioning engine in time.

**Run 5: Plasma conversion and burst.** Two Plasma Balls, Water Tincture, Conduit, Ward/Bastion, Transmute, and several independent damage cards. The Glass Eel + Fire Wolf + Pale Weaver encounter took 68 to 42 net HP. Against Cinder Hart, Water Plasma and then a melded pile dealt substantial damage, but delayed Focus deployment and a long approach to the boss left insufficient tempo. Hart survived with 16 HP. Plasma + elemental conversion was powerful, but did not automatically solve this run.

## Difficulty assessment

### Ordinary encounters and spikes are very different

Across S2, 18 of 20 encounters were won; 15 victories ended at equal or higher HP than they began. Those observations come entirely from two well-equipped survivors, so they have strong survivorship bias. Nevertheless, the contrast within those runs is striking: isolated motes often had little chance to overcome renewable equipment, whereas a stacked ambush could remove a large fraction of HP before the deck was established.

The issue to investigate is **where pressure comes from**, not simply average enemy damage. Mixed elements, opening ambushes, recurring status damage, and activation denial made the difficult encounters difficult. Gold Bracelet did not stop Burn, Poison, or Bile's resource pressure. Increasing all enemy damage would risk making the hard encounter combinations worse without improving the interesting decisions in easy fights.

### Beginner and expert goals remain unproven

I expect these routing and defense-order demands to be very punishing for beginners, but this is an inference, not a beginner playtest. My own mistakes demonstrated a sizeable skill component. “Almost impossible initially” is useful only if players can understand why they lost and improve; an unrecognized automatic movement advance should not be mistaken for healthy strategic difficulty.

Near-100% expert success needs a much stronger controller and a larger held-out seed set. Even five wins would not establish that rate; these five losses certainly do not prove the opposite. Before using future headless runs as a tuning benchmark, expose the complete player-visible plans and restrictions, verify the controller can consistently solve known skill-test positions, and distinguish routing, drafting, and tactical losses.

## Card and equipment assessment

| Candidate | Evidence / judgment | Recommended next step |
|---|---|---|
| **Discordia Pulse** | Clearest underpowered candidate from the rules comparison: 1 Focus, 1 Channel, 1 Recall, one use, random 1d12 damage to a random enemy. Plasma has the same costs, same element/random target, 16 damage, two uses, and meld utility. Discordia's base expected damage is 6.5 and even its maximum is lower. This is a catalog comparison, not a successful Discordia build test. | Give it a distinct job or meaningful compensating benefit. Merely being offered without Plasma does not make its design competitive. |
| **Gold Bracelet** | Both runs that reached S2 had one. Run 1 survived a 14-turn Colossus fight with almost no net loss. Renewable seven Guard can conceal a slow offensive engine against some cycles. However, routing, other gear, and healing confound the comparison; both runs still lost. | High-priority comparison at the same checkpoints with alternative bracelets. Do not conclude a universal nerf is justified from this sample alone. |
| **Opening Rite** | Three copies gave run 1 five opening Focus without consuming ordinary draw slots. Its value is unusually independent of which attacks are drawn. Space occupancy and inability to recall are genuine costs. | Watch duplicate-copy value and selection rate. Strong reliability tool; not shown to be a standalone win condition. |
| **Mindfire + extra Focus** | Zero Channel converted otherwise stranded Focus into meaningful damage. Fire Tincture produced a strong Bile opening, and remained on the card when it was recalled and later placed again during that battle. | Preserve this useful alternative resource engine. Evaluate the complete setup/recall cost before nerfing its ceiling. |
| **Rain / Conduit / Root to Flame** | These solved different resource bottlenecks. Rain supplies next-turn Focus; Conduit supplies current Channel; Root to Flame trades spare Focus for Channel. Run 1's Bile fight showed that having more Focus alone does not solve a Channel shortage. | Good engine components, not interchangeable automatic picks. More evidence is needed on whether every successful deck needs one specific component. |
| **Plasma Ball** | Effective immediate damage; melding offered a Channel-efficient burst in run 5. Random targeting caused friction in multi-enemy fights, and the strong Water meld still lost to Hart. | No immediate nerf supported. Compare total output, draw/placement cost, and exposure to destruction, not just the largest hit. |
| **Living Lattice** | Element selection made it both defense and an attunement source. Later revived a depleted Magnifier through melding. Depletion and Bile draining still constrained it. | Strong flexible support. No evidence it solves the game alone. |
| **Meandering Current** | It was used repeatedly in S2 and helped a Water path concept. Its two-Focus placement was harder to accommodate than a Synergy's one-Focus placement. | Setup-sensitive watch item, not a “never take.” Test a completed Water engine before changing it. |
| **Crosswind Reed** | The empty-N/S and occupied-E/W requirements materially delayed its use in run 5; it eventually supplied a useful attack. | Formation burden deserves testing, but one awkward draw sequence does not establish that 16 attunable damage is underpowered. |
| **Holy / movement / elemental armor** | Holy Armor's finite healing helped attrition; elemental armor helped matchups; movement equipment could change preemption opportunities. I mishandled when a movement increase takes effect. | Alternatives have distinct jobs. This batch does not establish a universally best armor. |

I cannot identify a proven must-take card or a two-card combination that wins the entire game from these runs. Likewise, skipping an offered card because it did not fit the current deck is not evidence that nobody should take it.

## Engines demonstrated, and their missing pieces

1. **Focus conversion:** Focus Energy / Amber Thought / Rain -> surplus Focus -> Mindfire, with Root to Flame converting some surplus into Channel for defense. Needs draw/recycling and enough survivability to invest. Run 1 had the resources but insufficient continuing Channel against Bile; run 2 used the conversion to remove a dangerous Hound.
2. **Activation throughput:** Conduit + extra Channel equipment -> Season's Turn or several cheap attacks; Rain supports placement, and Undertow returns a spent key card for redeployment. Run 2's three-enemy recovery was the strongest concrete example. It was a multi-piece line, not one card carrying the fight.
3. **Elemental relay:** Living Lattice or a printed elemental card -> attuned Shield/Blast -> another adjacent attunable card, with upgraded starter cards providing efficient payloads. This worked against Colossus and S2 enemies. Requires good activation order, available uses, and protection from disruption.
4. **Water infrastructure:** Rain, Tide, Lattice, Slow Rot, Crashing Wave, Water Synergy, and Meandering Current can provide both resources and a connected damage path. Run 1 demonstrated portions of this engine. It did not demonstrate a reliable full-run Water build, and drawing enough Water cards does not automatically solve Channel pressure.

The positive result is that different resource arrangements changed the correct plays. The unresolved question is whether enough of those arrangements can be assembled reliably from ordinary offers and remain sustainable through S3/S4.

## Execution errors and follow-up priorities

My consequential errors included failing to account for pursuers after an encounter, advancing movement unintentionally, attempting to gain an extra step by equipping movement armor mid-turn, using equipment before an available Ward, premature Ward depletion, and insufficient recall/repair planning. Bile's omitted preview compounded that last issue. These should not be converted into enemy nerfs.

Recommended order:

1. Correct the review observation surface and prove strong play on known positions before collecting an “expert win rate.”
2. Review Discordia's role, and compare renewable equipment across controlled checkpoints.
3. Investigate the gap between isolated motes and stacked ambushes. Retain meaningful map decisions, but measure the gap explicitly.
4. Check Choir of Borrowed Hands' corruption cap: in run 1, leaving its two Hypnosis spaces under spent cards neutralized much of its ongoing disruption. Review that behavior before increasing raw damage.
5. Test complete alternative engines through S3/S4 with stronger play. Do not claim the current batch validated their endgame viability.

No game tuning was made as part of this assessment.
