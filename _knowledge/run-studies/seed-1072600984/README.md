# Seed 1072600984: verified through Stratum 3

2026-10-15. Jonathan's original run: 40265167-ff48-416c-a0c6-d3f7737480af. Original run spans 3.0.29–3.0.30; the proof uses frozen current rules/content 3.0.30 throughout, including the corrected Stratum event pools. This is a fresh-seed alternative, not a recovery of his 14-HP Hart position.

The complete line executes **1,385 legal actions from new Game(1072600984)**, wins all three Strata, and finishes at **4 HP**. Every action was independently checked against the legal list; final gameplay state and RNG match exactly. No HP, inventory, reward, RNG, or rule edits. Live profile untouched.

| Boss | HP entering encounter | HP after victory | Player turns |
|---|---:|---:|---:|
| Cinder Hart | 58 | 3 | 7 |
| The Trickster | 24 | 16 | 6 |
| Mind Hive | 14 | 4 | 15 |

Search used varied heuristic controllers and retrospective branching, selecting fresh-run trial 205 through S2, then continuation trial 305 through S3. These are searched legal choices, not an optimal route or a blind first-attempt win. Earlier commentary mistakenly named King Bombadier as the S2 boss; that belonged to another branch. The verified route fights The Trickster.

Run `node verify.mjs` in this directory to independently replay the frozen game. `winning-line.json` contains the complete trace and expected final state; `verification.json` contains milestones and action hash. `original-events.jsonl.gz` preserves the human trace available when the study began. Sources are frozen under `src/`; artwork/UI are unnecessary for headless replay.

## Advice before Cinder Hart

### Reserve healing money, and sell a spare gem if necessary

The original Tavern entry was 36 HP and 353 Gold. Gold Bracelet cost 300 and Storm Opal socketing cost 35, leaving 18 Gold: two short of the 20-Gold rest. Rest was unused. Both an unsocketed Emerald and Ruby were sellable for 22 Gold. A detached legal check sold Emerald and rested, ending at **56 HP and 20 Gold**, keeping the Gold Bracelet, socketed Storm Opal, and Bronze Bracelet. This checks the immediate shopping alternative, not an entire winning continuation from that exact shop.

The successful alternative route instead bought Wind Armor and a second Bronze Bracelet, socketed Storm Opal into the ring, and rested to 70. That package demonstrates that Gold Bracelet is not required to beat this seed; it does not prove the Gold Bracelet purchase itself was wrong. The avoidable mistake was leaving healing unfunded.

### Preserve health before the boss, not only during it

Original early Spark-Wisp, Bat, and Veil Moth fights were lossless. Dark Sentinel later also cost zero HP. The run was not uniformly poor play.

Larger losses were Bell Beetle (67→57), the combined Glass Eel/Needle Imp encounter (54→36), the wolves (36→25), and two Ashlings (25→14). The final Healing Sap restored 14→19 before Hart's opening. These fights, especially the combined encounter, used the health budget Hart needed. The wolf line matched the demonstrated 25-HP victory; it should not be singled out as careless execution. The verified alternative route reaches Hart with 58 HP, but still spends 55 HP beating it.

Review whether a route causes multiple enemies to arrive together, whether a kill now prevents the next attack/status application, and whether a late reward is worth its likely HP cost. This report does not claim every loss was avoidable or that Dark Sentinel should have been skipped.

### Give the deck a reliable plan for the known boss

At original reward decision 111, the offer was Water Blast / Palimpsest / Ward, and Hart was already revealed. Jonathan chose Ward. That is defensible generically, but Water Blast would have supplied direct anti-Fire damage and a persistent Water attunement source for ordinary Blasts and Shields. Existing Living Lattice could supply Water too, but one source in a growing deck is less reliable.

At reward 201, Heat was chosen over Quicksilver Thread and Stone Golem. Heat's Burn cannot hurt Hart. This is an actual offered-card comparison, not an invented opportunity. Avoid equating future general utility with immediate boss readiness when HP is already low.

The successful route has Water Blast, multiple direct attacks and upgraded foundational cards. Its offers differ because choices change RNG consumption; those alternative-route cards are not all opportunities Jonathan passed over.

### Reassess expensive setup and late trades at low HP

Two Focus Energies and Rain Lantern provide potential economy, but only after they are drawn, placed and activated. Hart's continuous Burn means the player may die before that potential pays off. Opening Rite supplies only the opening Focus bonus; it does not make Grove Titan immediately affordable in the recorded boss hand.

The Bronze-for-Titan trade was good long-term value but questionable immediate survival planning at 14 HP against a known Fire boss. Titan costs 3 Focus, deals weak Earth damage into Fire, and the deck had no Transmute. Keeping Bronze would preserve two recurring Guard, though it would not prevent Burn or establish a win by itself. Codex's earlier unqualified recommendation was too optimistic for this immediate fight.

## Limits

The 14-HP current-position search found no win, but was not exhaustive. The full-seed proof establishes that better earlier choices can win, not that Jonathan should have anticipated all the alternate rewards or found the narrow proof route unaided. No gameplay changes, new training, commit, or push were performed.
