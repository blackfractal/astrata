# Astrata AI training plan

Draft 0.3 · 2026-11-10 · Owner: Jonathan

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

Jonathan reaffirmed that the expert must have access to **all enemies' move sets and technical rules**, as an experienced player could. Provide a versioned, structured rules catalog: move cycles, damage and scaling formulas, conditional phases, elemental interactions, targeting/tie rules, death effects, possible random branches and their rule-defined probabilities. Do not require rediscovering these rules from scratch. Providing facts does not mean the model already understands their strategic consequences; that still requires training.

Keep this catalog separate from the current run's hidden state. Knowing every possible Archon's behavior does not reveal which Archon was selected. Before revelation, prepare for plausible possibilities; after gossip, a herald, or another player-visible reveal supplies the information, retain that knowledge and update the plan. A reveal grants its actual information, not automatic access to all other hidden encounter data.

For example, the AI can know Cinder Hart's entire pattern before meeting it, but cannot build specifically for Cinder Hart because it read the selected Archon from a private save. After a herald reveals Cinder Hart, preparing Water attacks and appropriate defenses is legitimate. Likewise, knowing the possible Chaotic Glare elements and their probabilities does not reveal the next randomly selected element. Deterministic consequences inferable from public rules/history are allowed; secret precomputed outcomes are not.

**The same input boundary applies to policy and value outputs**, whether they share a network or use separate networks. Do not train a privileged critic on hidden Archon identities, RNG states or actual draw order in this planned baseline. The simulator necessarily retains those facts to execute the game, and completed outcomes may supply normal training rewards/returns, but they are not input features or hints for earlier decisions. Value estimates should reflect uncertainty over futures consistent with what was known then.

Learning to infer likely threats from genuine public evidence is allowed. Memorizing a repeated seed or reconstructing its random stream through encoded IDs is not the intended expertise: omit seed/diagnostic identifiers, audit accidental correlations and evaluate on unseen seeds.

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
4. Test indistinguishable situations: changing hidden facts while preserving the public observation/history must leave both the immediate policy distribution and value estimate unchanged, with model memory and any model sampling randomness held fixed. For search, hold its independent sampling seed fixed during this test.
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

Recommended first learned baseline: one shared recurrent state/rules encoder with separate policy and value outputs, initially considering PPO with legal-action masking or equivalent candidate-action scoring. Two functions do not require two entirely independent neural networks. This is a starting hypothesis to benchmark, not a fixed architecture or algorithm requirement.

The policy covers every player decision: map movement and encounters, events and trades, rewards/skips, Tavern purchases/upgrades/healing/selling/socketing/equipment, and combat placement/activation/targeting/attunement/defense/Recall/consumables. Prefer scoring structured engine-generated legal candidates over a permanent output neuron for every concrete action. Inputs include the candidate's public effects and costs, deck/equipment context and permitted history. Any specialized phase heads still optimize the same checkpoint objective.

The policy learns which action to take. The value model estimates objective-specific future success from the public situation/history. Deck construction, shop spending, and battle decisions should share useful representations and the same eventual objective; specialized phase heads may help later.

Curriculum:

1. Small tactical situations: elemental matchups, defense ordering, activation sequencing, Recall, placement, resource setup, and accepting HP loss for future advantage.
2. Full battles with diverse decks, equipment, starting HP, draws, and enemy combinations. Include strong, awkward, and incomplete engines.
3. Short campaign segments beginning at rewards, shops, or routing choices; carry choices through several encounters so their consequences matter.
4. Complete S1–S4 campaigns, then the full S5 route when available. Use progressively more states produced by the policy itself, not only curated fixtures.

Bootstrap with reviewed human/agent demonstrations where useful, then improve through reinforcement learning. Separate demonstrations using fair observations from puzzle solutions produced with knowledge of the actual future. Do not silently treat omniscient search labels as expert fair-play decisions.

Saved interesting situations can supply training examples and benchmarks. Reserve some entire situations/seed families for evaluation before training begins.

### 4.1 Directly constructed initial weights

Jonathan proposes starting reinforcement learning from **initial neural-network weights directly constructed by Codex**, rather than requiring an entirely random initialization. This is an experiment to include in the training design, not a claim that it will outperform random initialization. It differs from editing an already-trained network: the intended benefit is useful initial behavior that subsequent training can improve or override.

Compare three starting conditions:

| Initialization | Initial behavior | How it is obtained |
|---|---|---|
| Random weights | No deliberately encoded strategic preferences | Conventional architecture-appropriate random initialization |
| Codex-constructed weights | A modest set of useful tactical and strategic tendencies | Direct parameter construction, without a preliminary gradient-training stage for those weights |
| Demonstration-initialized weights | Behavior learned from reviewed examples | Supervised learning from permitted human/agent demonstrations, followed by reinforcement learning |

The demonstration approach is a separate comparison, not a substitute for the direct-construction experiment Jonathan requested. Changing the current hand-written bot's scoring coefficients also would not demonstrate neural weight construction; this experiment needs an actual neural policy and a documented input/action schema.

**Proposed implementation direction:** construct a trainable part of the policy to encode a small set of initial behaviors, while initializing remaining capacity conventionally. Explicit public features such as action damage/cost, elemental matchup, adjacency, enemy intent and deck resources make such construction more approachable than editing weights behind an entirely opaque learned representation. Keep the shared policy/value architecture; any extra feature paths or architectural changes must be documented and controlled in comparisons.

Candidate initial tendencies include killing an enemy to prevent incoming damage, matching attack and defense elements, investing in early resources when a fight will last, protecting valuable cards from visible destruction telegraphs, and evaluating purchases against the deck's resource shortages. These are conditional preferences, not absolute rules. Do not prescribe a single engine or enforce “always preserve HP.” Do not assume each strategic concept corresponds to one identifiable weight.

All constructed parameters should remain trainable unless a particular frozen component is explicitly justified. Avoid extreme logits, saturated activations or an architecture dominated by an unchangeable heuristic. Preserve exploration so the learner can discover strategies that contradict Codex's starting assumptions. The desired result is a useful starting policy, not a neural wrapper around the existing bot.

**Value initialization:** an initial heuristic for promising positions is not automatically a calibrated probability of winning. Keep value estimates conservative in interpretation and learn them from actual returns. Construction of policy weights must not quietly give the value head privileged information. Shared-encoder edits require checking both outputs.

**Fair experiment:**

1. Freeze the rules, observation/action schema, objective and evaluation split before constructing weights. Codex can inspect rules and development situations, but not the held-out evaluation cases or secret current-run state.
2. Use the same architecture and permitted features where possible across all three starting conditions. If direct construction needs a different architecture, label that comparison separately rather than attributing every gain to initialization.
3. Record the construction script, parameter changes, rationale, model/schema versions and checkpoint hashes. Count construction effort, development rollouts, demonstration collection/pretraining and compute costs separately; the direct method is not cost-free merely because it avoids initial gradient descent.
4. Measure behavior before reinforcement learning, then compare learning curves at matched environment interactions and report total compute/time as well. Use multiple training starts and unchanged held-out seed families.
5. Measure eventual S4 success, performance across different engine families, tactical regressions, exploration and value accuracy. Early gains alone do not establish a higher eventual ceiling. S5 comparisons wait for its implemented rules.
6. Retain the constructed initialization only if results justify it. A random start may catch up or surpass it; a useful warm start may instead reduce wasted exploration or help escape common bad habits. Do not assume either outcome.

Direct repair of a later trained checkpoint can remain a separate future experiment for specific repeatable failures or balance updates. It is not the same as the proposed initialization and does not replace the main reinforcement-learning process. No neural weights or training system have been built as part of this planning discussion.

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
3. Learned tactical baseline, comparing random, directly constructed and demonstration-initialized weights (§4.1); measure learning speed and eventual strength before choosing a large compute budget.
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
