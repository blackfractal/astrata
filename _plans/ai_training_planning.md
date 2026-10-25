# Astrata AI training plan

Draft 0.1 · 2026-10-24 · Owner: Jonathan

Status: planning only. This records the agreed direction and questions for later detailed design. It does not implement training or expand the current v1 delivery requirement. The existing bot is a hand-written weighted policy; running batches does not automatically train it.

## 1. Intended experts and checkpoints

The goal is a family of expert AIs with distinct objectives, stored as separate model checkpoints. They may start from a shared foundation, but must have separately identifiable weights, training objectives, evaluations, and release histories.

| Expert | Primary objective | Strategic implications |
|---|---|---|
| S4 victory expert | Maximize the probability of defeating the Apex Predator and completing S4 through legal play. | Spend HP, Gold, cards, and consumables when that improves the chance of winning. No obligation to preserve resources for S5 or complete optional achievements. Finishing with 1 HP is a win. |
| Full-route / S5 expert | Meet all applicable requirements to reach S5, defeat S4, enter S5, and defeat Astrata. | Evaluate prerequisites, route choices, inventory reservations, donations, and other opportunity costs alongside survival. S4 victory without access to S5 is not full success. Resources remaining after S4 matter because play continues. |

“Win at all costs” means pursue the objective within the player's legal actions and information rights. It does not authorize hidden-state access, modifying saves, bypassing requirements, or simulator-only actions. Legitimate exploitable strategies found by an expert should be reported for balance review.

The S5 expert is an eventual deliverable. The complete S5 gate, encounter, and prerequisite rules are not yet implemented or finalized. Do not invent missing requirements or label a checkpoint an S5 expert before it can be evaluated against the real route and fight. Until then, prerequisite preparation can be a separately labeled provisional task.

Separate two forms of knowledge:

- **Experienced expert:** knows rules and previously discovered strategies, including the secret route when that knowledge is explicitly permitted for the task. It still cannot see undisclosed facts about the current run.
- **Discovery learner (possible later task):** must discover secrets from available clues. This is not automatically part of training the full-route expert.

Persistent profile unlocks and requirements that must be satisfied within one run must be represented separately. Future evaluation must specify whether the S5 route begins from a qualified profile or includes the cross-run work needed to qualify. A Little Kindness is a known prerequisite in the design, but is not the complete S5 gate.

## 2. Fair information boundary

Model Astrata as a partially observable decision problem: the player knows the visible situation and observation history, not the complete simulator state.

An experienced AI may know all possible enemies and their move sets without knowing which unrevealed enemy or Archon was selected for this run. Before revelation, prepare for plausible possibilities; after gossip, a herald, or a visible encounter supplies the information, update the plan.

| Permitted information | Not permitted before revelation |
|---|---|
| Visible map, inspectable enemies, public movement rules and telegraphs | Secret future movement/random outcomes |
| The player-visible four-pair spawn preview | Later spawn sequence, exact unrevealed enemy identities or events |
| Inspectable deck contents and card counts | Shuffled draw order, except information explicitly established by a player action |
| Known Archon candidates and public encounter probabilities | The chosen unrevealed Archon |
| Revealed rewards, shop stock, and event choices | Future reward rolls and wager outcomes |
| Player-observed history and permitted persistent progress | RNG state, seed, private engine queues or other diagnostic state |

Implementation prerequisites:

1. Create an explicit allowlist of observation fields rather than trusting copies of internal objects with a few fields removed.
2. Audit legal-action parameters, effect previews, logs, IDs, and metadata as possible secondary leaks. Costs and public effects are allowed; hidden results are not.
3. Keep full-state diagnostic/replay records separate from policy inputs. The engine can retain secrets; the agent cannot query them.
4. Test indistinguishable situations: changing hidden facts while preserving the public observation/history must leave the immediate policy distribution unchanged. For search, hold its independent sampling seed fixed during this test.
5. Preserve legitimate information learned through play, including known top-of-draw effects. Do not hide facts the human can actually know.

The current `Game.observe()` hides the unrevealed Archon field and sorts the normal draw pile, but copies substantial internal structures. That is a foundation to audit, not a certified training boundary.

## 3. State and action representation

Use structured data, not screenshots or a flattened paragraph of card text.

- Grid spaces: coordinates, cards and melded attachments, current elements, remaining uses, HP/Guard/Ward, statuses, Corruptions, Ideons, ownership, and public telegraphs.
- Card collections: hand, draw contents, discard, destroyed, and total deck. Encode unordered collections without implying a hidden draw order.
- Player: HP, resources and their timing, equipment and gems, consumables, Gold, inventory capacity, and objective-relevant public progress.
- Opponents: inspectable stats, patterns, status, current intent, and learned/public behavior.
- Map: visible entities, age/restlessness, movement allowance, preview, barriers, and relevant history.
- Actions: engine-generated legal candidates, with type, source, destination/target, public costs and effects.

Use spatial/card relationships to capture adjacency, element propagation, defense columns, repair reach, and destruction exposure. Compare a small spatial/entity encoder with richer attention or graph representations later; do not commit to an unnecessarily large architecture before a baseline works.

Represent actual rule parameters and effect types as well as card identities. A damage or cost adjustment should be expressible without changing the action vocabulary. A genuinely new mechanic may require new encoder features and training; a natural-language update alone does not guarantee comprehension.

The engine owns legality and resolution. The policy scores the available choices, with valid fallbacks for unfamiliar actions. A memory component retains relevant public history; the learner must never reconstruct memory by reading private save fields.

## 4. Training approach

Recommended first learned baseline: a recurrent policy/value model, initially considering PPO with legal-action masking or equivalent candidate-action scoring. This is a starting hypothesis to benchmark, not a fixed algorithm requirement.

The policy learns which action to take. The value model estimates objective-specific future success from the public situation/history. Deck construction, shop spending, and battle decisions should share useful representations and the same eventual objective; specialized phase heads may help later.

Curriculum:

1. Small tactical situations: elemental matchups, defense ordering, activation sequencing, Recall, placement, resource setup, and accepting HP loss for future advantage.
2. Full battles with diverse decks, equipment, starting HP, draws, and enemy combinations. Include strong, awkward, and incomplete engines.
3. Short campaign segments beginning at rewards, shops, or routing choices; carry choices through several encounters so their consequences matter.
4. Complete S1–S4 campaigns, then the full S5 route when available. Use progressively more states produced by the policy itself, not only curated fixtures.

Bootstrap with reviewed human/agent demonstrations where useful, then improve through reinforcement learning. Separate demonstrations using fair observations from puzzle solutions produced with knowledge of the actual future. Do not silently treat omniscient search labels as expert fair-play decisions.

Saved interesting situations can supply training examples and benchmarks. Reserve some entire situations/seed families for evaluation before training begins.

## 5. Objectives and learning deck strategy

Train each checkpoint toward its own primary success condition. Use milestone signals carefully when needed, especially for the sparse full-route objective, but do not allow repeatable intermediate rewards to become a better strategy than completion.

Avoid large permanent rewards for HP preservation, damage, card count, or resource production. These can encourage refusing necessary damage, farming enemies, hoarding supplies, or building an engine indefinitely. Evaluate any reward shaping against the actual win objective. Avoid excessively discounting future outcomes per interface click; a useful multi-action turn should not be penalized merely for requiring more decisions.

Card value is conditional on the current deck, equipment, phase of the run, possible upcoming threats, and the checkpoint's objective. Training should distinguish, for example:

- Another attack when damage is missing versus an attack the deck cannot afford to activate.
- Early Focus development that costs HP now but improves later turns.
- A general defensive purchase versus a specialist answer after the Archon is revealed.
- Spending the final consumable to beat S4 versus preserving enough resources to survive S5.
- A donation or reserved item that is unnecessary for the S4-only task but essential to the full route.

Do not encode a single “best deck” as the training target. Test engines with multiple interacting cards and varied ways to meet resource, damage, defense, and disruption needs.

## 6. Search as a later tactical aid

Naive random rollouts over entire campaigns are not the proposed training system. After the learned baseline works, consider bounded search for important tactical sequences, guided by learned action priorities and value estimates.

Search must sample plausible hidden states/futures consistent with public observations. It must not clone the live run's secret RNG/draw sequence. Simulated policies receive only simulated player observations; they must not choose early actions differently because the simulator secretly sampled one Archon rather than another. Keep decisions shared until observations actually distinguish the possibilities.

Search and training are distinct: search spends computation on a current decision; training changes reusable model parameters. Search demonstrations may later improve the policy if their information boundary is sound.

## 7. Update-aware retraining

Jonathan explicitly requires experts that can continue learning after game changes, with precise knowledge of what changed and where to concentrate retraining. Retraining must be driven by a versioned change manifest, not merely a new executable and a generic “play more” instruction.

For each update, record:

- Previous/new rules, content, observation, and action versions; source hashes.
- A human-readable explanation and machine-readable changed entities, fields, old/new values, timings, legality changes, and effect semantics.
- Whether the change is numerical, behavioral, new content, a bug fix, or an interface change.
- Affected dependencies and likely interactions, labeled as hypotheses where not verified: e.g. bracelet acquisition affects shops, routing, Gold allocation, and early defense setup.
- Focused regression fixtures, expected rule behavior, and tasks that should receive extra training coverage.
- Compatibility of existing checkpoints and recorded trajectories, including required feature migrations.

Proposed retraining cycle:

1. Validate the new rules and observation boundary with deterministic tests.
2. Evaluate each old expert on the new rules to identify actual regressions, separately from predicted effects.
3. Initialize new candidate checkpoints from compatible prior weights. Supply current structured rule values and permitted change information. Never supply current-run secrets under the guise of an update.
4. Oversample affected situations while retaining a broad mixture of ordinary battles/campaigns to avoid forgetting unaffected skills.
5. Re-simulate compatible old situations under the new engine where useful. Do not reuse old transitions, outcomes, action legality, or value targets as though they occurred under changed rules. Frozen historical replays remain valid only with their original rules.
6. Retrain S4 and full-route candidates against their separate objectives. A change may help one task and hurt the other.
7. Evaluate targeted regressions and broad held-out campaigns before promoting either candidate. Keep the previous checkpoint for comparison or rollback.

The manifest directs the training pipeline and curriculum. Unless deliberately designed and trained for it, a neural policy does not learn a new mechanic simply by being handed patch notes. Infrastructure must translate updates into features, demonstrations, sampled scenarios, and learning targets.

Keep game mechanics fixed within a training/evaluation experiment. Prefer separate game-tuning and agent-training cycles so results remain interpretable. Small controlled parameter variation can be studied for robustness, but does not replace evaluation on the actual release rules.

## 8. Evaluation and checkpoint records

Evaluate S4 success and full-route success separately. For the full route, also report prerequisite completion, S5 access, and conditional S5 victory, so failures are attributable. Distinguish profile-wide unlock progress from current-run requirements.

Use held-out seeds, multiple training starts, varied decks/equipment, and tests without individual powerhouse cards. Include fair-information tests, unseen familiar-effect cards, small rule changes, and novel mechanics with explicit fallback expectations. Do not publish broad win-rate claims from a handful of runs or selected wins.

Track completion, deaths by Stratum/encounter, HP and cards lost, resource/consumable use, illegal-action attempts, routing, information purchases, and performance across build families. Compare against the weighted bot and reviewed human decisions. Failure analysis must separate poor policy choices from suspected balance problems; bot losses alone do not establish unfairness.

Each promoted checkpoint should record its objective, parent checkpoint, model/feature schemas, rules compatibility, training configuration and budget, change manifests used, dataset/seed splits, evaluation results and uncertainty, limitations, and artifact hashes. Freeze evaluation seeds and prevent repeated tuning against the final test set.

## 9. Proposed milestones and unresolved details

1. Fair-observation/action audit plus hidden-state invariance tests.
2. Headless training adapter, version/change-manifest format, and benchmark suite.
3. Learned tactical baseline; measure throughput and learning before choosing a large compute budget.
4. S4 campaign expert and repeatable update/retraining demonstration.
5. Separate full-route checkpoint after S5 requirements and gameplay are sufficiently defined.
6. Optional tactical search, specialized experts, and larger-scale robustness work if measurements justify them.

Later detailed planning must settle architecture, feature schemas, history length, algorithm/hyperparameters, simulator throughput, hardware, training budgets, promotion thresholds, reward shaping, and S5/profile semantics. No training-time or expertise guarantee is made in this draft.

## 10. References and current implementation

- Main design §10.5–10.5.1 defines engine-owned legal actions, fair future simulation, and versioned evaluation.
- `src/engine.mjs`: observation, legal actions, seeded simulation and saves.
- `src/policy.mjs`: current static weighted policy.
- `tools/batch.mjs`: unattended evaluation and versioned run recording; not a training loop.
- [Recurrent Model-Free RL Can Be a Strong Baseline for Many POMDPs](https://arxiv.org/abs/2110.05038): supports evaluating a memory-based baseline before more elaborate algorithms.
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347): candidate baseline training method.
- [A Closer Look at Invalid Action Masking in Policy Gradient Algorithms](https://arxiv.org/abs/2006.14171): legal-action restriction in policy learning.
- [Monte-Carlo Planning in Large POMDPs](https://papers.nips.cc/paper_files/paper/2010/file/edfbe1afcf9246bb0d40eb4d8027d90f-Paper.pdf): reference for planning from uncertainty rather than the actual hidden state.
