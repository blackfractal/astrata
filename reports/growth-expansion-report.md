# Druid engine expansion — 4.0.7

2026-10-17. Implemented Jonathan's approved twenty-card expansion plus Chaos Fracture: 21 new cards with distinct generated artwork. The registry now contains 79 playable cards and five Hexes. Full card costs, effects, Recall rules and Stratum availability are in [the card reference](growth-card-reference.md) and the main design's Druid engine expansion section.

## Confirmed decisions

- Rooted Concentration grants temporary Arcane **player Guard**, separate from equipment. It is optional to spend, sits at the player's defense position, and expires at the next player turn. It cannot stop Pierce, Cull or status damage. Its recurring Focus survives the card destroying itself.
- Borrowed Dawn uses the same next-turn Insight calculation as resource refill, including already-promised bonuses, penalties and Memory Acorn's draw-pile passive. It requires at least four projected Insight before adding its three-Insight debt; pending debt is included in subsequent checks. This is a current-state forecast, not a promise against future enemy debuffs or subsequent pile changes. No future RNG or draw simulation is required.
- Chaos Fracture targets non-Archons, including eligible Ideons. The next direct card attack activation consumes it even if that attack is not Chaos. Every hit from that activation shares the modifier. Rings and status ticks neither consume nor benefit from it; an existing Chaos weakness does not multiply twice.
- New cards unlock cumulatively by Stratum, without changing probabilities midway through a Stratum. Ideon-specific wording stays hidden before S3. New upgrade effects are not invented in this pass; these cards initially have no upgrade offer.

## Integration and verification

Resource conversions, actual revealed-card counts, draw/destroy pile effects, formations, diagonal adjacency, temporary support, attunement, multi-element attacks, targeted placement and Ideon routes are executable legal actions. Human controls, hover previews and AI action descriptions expose the same costs and choices. The policy has additive scoring for the new actions and placements; this is heuristic support, not model training.

691 rules/regression tests pass, including debt, resource limits, dynamic damage, Nausea, Hypnosis, Guard expiration/decline, formations, routes, Fracture and exact-state round trips. Six isolated packaged UI cases pass: Mindfire Focus selection, player Guard, Thornfall placement targeting, Braided Seasons element choices, Forked Current route confirmation, and Starleaf diagonal attunement. No renderer errors. The art audit reports 236 required entries, 245 selected assets and no missing assets or provenance errors. All 21 illustrations were generated separately with the built-in image tool; prompts and original locations are preserved. The underlying image model version is not exposed by the tool.

Run archives now capture every source module so new dependencies remain replayable. Continue retains its existing battle-checkpoint behavior. Tests use isolated profiles; the live save was not modified.

## Campaign attempts and controlled encounters

Two fresh-seed **WeightedPolicy** campaigns were attempted, not manual Codex play. Seed 885553835 died to Fire Wolf after 118 decisions. Seed 17102026 died to Void Colossus after 335 decisions (entered with 37 HP and died on battle turn four). Both ended in S1. Neither is evidence that S2–S4 are balanced or that these seeds are unwinnable for a person.

To exercise later mechanics, 24 fixed-build encounters compare a foundation deck with a deck supplemented by available new cards, three encounters per Stratum. These are constructed fixtures, not earned campaign progress. Neither build uses Grove Titan or Transmute. Both start at 70 HP; S1 uses 1 Focus/2 Channel, S2 3/4, S3 4/4 and S4 5/5. Growth decks have more cards, so differences cannot be attributed causally to one card. Final HP zero denotes defeat; turn is the terminal battle turn.

| Fixture | Final HP | Turn |
| --- | ---: | ---: |
| s1-foundation-hart | 0 | 8 |
| s1-foundation-choir | 0 | 12 |
| s1-foundation-colossus | 0 | 9 |
| s1-growth-hart | 0 | 9 |
| s1-growth-choir | 0 | 14 |
| s1-growth-colossus | 0 | 7 |
| s2-foundation-blackBile | 25 | 18 |
| s2-foundation-bombadier | 0 | 10 |
| s2-foundation-trickster | 45 | 13 |
| s2-growth-blackBile | 49 | 13 |
| s2-growth-bombadier | 0 | 8 |
| s2-growth-trickster | 56 | 12 |
| s3-foundation-mindHive | 0 | 11 |
| s3-foundation-cnidarian | 0 | 8 |
| s3-foundation-refractionCannon | 0 | 8 |
| s3-growth-mindHive | 0 | 14 |
| s3-growth-cnidarian | 0 | 10 |
| s3-growth-refractionCannon | 0 | 8 |
| s4-foundation-riftBoar | 21 | 7 |
| s4-foundation-riftChimera | 36 | 7 |
| s4-foundation-apex | 0 | 6 |
| s4-growth-riftBoar | 54 | 6 |
| s4-growth-riftChimera | 53 | 6 |
| s4-growth-apex | 0 | 6 |

All 26 final trials finished without stalls or invalid actions, and each action sequence replayed to the identical observation. Initial states, decisions, terminal states, per-card action usage and versioned sources are preserved in `growth-evaluation`. Pre-tuning fixtures are retained under `before-trickster-tuning`. Reported per-card action damage can include associated equipment effects; it is not an isolated estimate of the card's printed damage.

## Balance action and findings

The only enemy change in this pass is **Trickster's three direct attacks: base15 → base18**, becoming21 after S2's existing pressure multiplier. Rotation, telegraphs and fixed damage remain. In the paired S2 test, foundation survival changed from66 to45HP; growth survival from63 to56HP. That supports a modest increase without changing the fight's identity.

Do not increase all enemies to compensate for the expanded pool. The fresh campaigns struggled in S1, every tested S3 boss defeated both builds, and the Apex Predator defeated both. S4's ordinary Eidolons were considerably easier for the growth build (54/53HP remaining versus21/36), but two fixed-build results do not justify another broad multiplier. Existing S1, other S2, S3 and S4 numbers remain unchanged.

The clearest alternative engine was S2's Black Bile fight: Starleaf's diagonal damage, Prismatic Sap's damage plus Guard, Borrowed Dawn's temporary Channel and Rooted Concentration's recurring Focus supported a win with49HP, versus25HP for the foundation fixture. This is an engine requiring placement, resource timing and several cards, rather than Titan plus Transmute. It is still one controlled example.

Watch Borrowed Dawn with high Insight, Mindfire with excess Focus, and destroyed-pile support with permanent-resource cards. Their caps and costs are enforced, but their best human lines need more play. Full-row Canopy Break and full-column Verdant Rampart are rules-tested but not meaningfully balance-tested by these encounter fixtures. Route selection and asymmetric formations also exceed this heuristic policy's planning strength. These results do **not** establish that all21 cards are balanced, nor provide a successful end-to-end S1–S4 run.

## Delivery

Updated main design, S2 balance note, card reference, build log and implementation handoff. Packaged runtime and portable ZIP refreshed after verification. No commit, push or live-profile changes. Implementation, art generation, evaluation and packaging took approximately45minutes additional work (estimate; early investigation was not timed precisely).
