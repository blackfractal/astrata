# Astrata

A Windows spatial spell-grid roguelike. This build implements the Druid's journey through Stratum 1, based on Astrata design v4.79. This is v1 with 4 Insight, 1 Focus, 2 Channel, 16 paired spawning rounds (32 spawns), a rolling four-pair preview, and grouped enemy encounters (package 1.3.37; rules 1.3.21).

Placed cards now show elemental accents, active Shield portions with their remaining block, and persistent matching-Blast/Shield synergy links and bonus badges. Hover a card to see its Attunement sources. Chosen attunement previews color the source card; Transmute colors persist, while last-cast colors are labeled and reset next turn.

Act 1 boss destruction Tells now outline their currently threatened row, column or stack. Warning symbols and card counts update as you place or Recall; deterministic targeting and tie-breakers are unchanged. You have the current player turn to respond before the enemy acts.

Void-Colossus now uses Chaotic Glare after its two Void Fists and Collapse. It randomly selects any element, including Arcane; both its attacks and defensive matchups use that element until the next Glare. Matching-element hits summon a Mini-Void of that element once per activation. Each Mini-Void retains its own birth element for attacks and defense, even after later Glares.

The Glass Choir now uses Chorus (10 Water) on turn four. Its warned Final Note deals 20 Light damage with Cull on death before victory, bypassing Wards and Shields but allowing Allies and equipment already prepared; dying to it loses the run.

Water enemies are immune to Burn, Fire enemies to Poison, and Chaos enemies to Corrode. Immunity follows current element: Chaotic Glare clears any newly prohibited status, without restoring it on later changes. Enemy health panels, details and tooltips show the immunity. Player and Ally status rules are unchanged.

Burn, Poison and Corrode on the player now damage HP directly, bypassing Bracelet block and Armor. Husk Armor subtracts 2 damage from each enemy attack; it does not negate two attacks or reduce its own Corrode.

Blast starts at 4 damage and Shield at 4 block, keeping their adjacency bonuses. HP-healing cards (player or Ally) are rare, have one-quarter the weight of other rare cards, and go to Destroyed immediately after one activation; they return next battle. They cannot Recall or gain extra uses. Enemy starting HP is now another 50% above package 1.3.9, rounded up. Bronze Bracelet refills 2 block each enemy turn. Rootbound Ring adds one separate 2-damage hit after the first damaging attack each player turn, using its socketed element; Ready/Spent shows its availability. Restart the app to load this update; start a new run to get the revised Item Deck distribution. Existing acquired cards and saved enemy HP are preserved.

Ally spillover separates base damage from weakness bonus. Consecutive weak Allies share the remaining bonus; a changed matchup discards it. Resistant Allies convert leftover damage back to base before passing it on. Incoming-attack previews show both parts.

Insight counts down during Reveal and finishes at 0. Ending the player turn refills all counters for the next turn while enemies resolve. Charge-building activations need no enemy selection; targeting appears only when an attack will fire. Kiln releases 30 damage to one enemy and Burn 2 to all enemies.

Enemies stop immediately on reaching the player and remain there while the other enemies finish moving, including Pack Movement. Battle begins at the end of the enemy movement phase.

Mind Grid slots have no visible indices. Inventory separates Equipped from Satchel and supports dragging equipment in both directions. Resonance costs 1 Focus to place and 0 Channel to activate for +1 Channel, requires Isolated placement, has one use with no Recall or extra uses, and goes to Destroyed at player-turn end (returning next battle).

New Druid runs start with 12 cards: four Blasts, four Shields, Familiar, Clear Mind, Focus Energy, and Sapling. Existing saves retain their acquired/removed cards; the new base Insight applies at the next Reveal.

Card backs show a Druid tree-and-roots emblem without the game title. Reveal uses shorter, overlapping deal/flip animations while preserving draw order, with a normal four-card Reveal taking about 1.8 seconds. Fast, Skip, and reduced-motion controls remain available.

The active phase outlines Insight, Focus or Channel in soft green. Placed cards display their current conditional damage. Dragging over an enemy previews adjusted card damage and HP loss, with green/red deltas; leaving or canceling restores the normal number. Card status badges have distinct symbols and hover explanations. Tavern upgrade offers show their specific benefits on hover.

Battles now use a fixed 16:9 composition: player and equipment left, Mind Grid center, enemies right, phase arrows above, and revealed cards below. Equipment surrounds the portrait; glowing wrist icons can select a legal block. Battle tools contains logs, rules and AI controls. Large hands and encounters scroll within their panels. Settings offers 1280×720, 1440×810, 1600×900 and 1920×1080 window sizes plus fullscreen; the stage scales proportionally with black bars on other aspect ratios. Windows are not freely resizable. Restart the app to load this update.

Double-click a placed card's activation button to attack the topmost eligible enemy in the current display order. Multiple attunements still require selection; single-click lets you choose any legal enemy. Other sole-choice activations retain their shortcut. Transmute now visibly names the changed card (for example, Water Blast) and fixes its activation element until it leaves the grid or is transmuted again; existing Shield portions retain their elements.

Ward now has 2 total activations instead of 3; it still starts with 10 ward value and gains 10 per activation.

Player HP floors at zero during lethal-hit animations before You Died appears. Stone Golem starts with 10 HP; its one activation costs 1 Channel and adds 6 current/maximum HP plus Taunt through the coming enemy phase. HP growth stays while placed; Taunt expires. This growth does not trigger healing-card destruction.

## Play

Open `release/Astrata/Astrata.exe` by double-clicking it. Keep the entire `Astrata` folder together. No installation, development server, editor, network connection, or manually installed runtime is required.

- Click a revealed card to inspect its full art and details, then click a lit Mind Grid slot to place it; dragging also works. Placed cards have visible activation buttons and remaining allowances. Click their surface for full details and Recall.
- Activate a placed card, then click highlighted attunement cards and enemies, or drag the activating card onto each highlighted choice. The last required selection commits the activation; Cancel or Escape spends nothing. Healing, Shift, and Transmute also use on-board choices. Clicking a card outside targeting still opens full details.
- Allies show health bars with current HP and the highest HP reached during that placement; growth/healing can raise this display scale without introducing a health cap.
- Close Grimoire, Inventory, Menu and other dialogs with ×, Escape, or a click outside the window.
- Enter confirms the main choice. Escape cancels targeting first, or otherwise opens/closes the pause menu.
- Hover keywords throughout card text, descriptions, status labels and dialogs for brief explanations, including variants such as Locked, Frozen and Severed. Locked prevents Recall and Shift but allows activation; Frozen prevents activation. The Rules & keywords button contains the full quick reference.
- Read enemy Tells before ending a turn. Each defense selection absorbs as much of the hit as it can.
- Inventory is available throughout. Equip before or between Field movement steps, or at a Tavern. Drag equipment into slots and Gems into/out of sockets; Gem changes are Tavern-only.
- Click Tavern people/areas for services. The Market separates Buy from Sell/remove, with View controls before transactions. Ordinary paid card removal is once per Tavern; variable-cost Hex treatment is separate.
- Spell collisions have small element-specific bursts; Arcane uses a gray star. Damage numbers remain above the effect. Rootbound Ring's bonus projectile launches from its equipped icon, which briefly glows when it fires.
- Normal animations show each movement step, damage, and defeats before changing screens. Fast animations is available in Settings/during play; Skip resolves the current presentation immediately.
- The only Field Tavern spawns at slot 8; the Archon at 16. Other rolls use relative weights Mote 40 / Eidolon 10 / Gold 15 / Item 10 / Event 20, with no opening Eidolons.
- AI step chooses one action. Watch AI plays the same run with the baseline weighted policy; Stop AI returns control.

One save slot autosaves decisions. A mid-battle Continue restarts that battle from its opening with the same random state. Death and completion remove the save; Run History persists. The executable stores save/settings/history in Electron's per-user `astrata` application-data directory (normally `%APPDATA%/astrata`).

## Included

50 non-Hex cards and 5 Hexes, 12 Motes, 7 Eidolons, 3 Archons plus a summon, 32 equipment/Gem entries, 12 events, and generated artwork with reproducible provenance. There is one class and one difficulty. Audio hooks exist; this edition is silent. No Synthesis or later Strata.

See `BUILD_LOG.md` for implementation decisions, validation and limitations. `AI_REPORT.md` interprets the original and updated five-run evaluations. `reports/` contains logs, art provenance, and graphical verification screenshots.

## Development

Node.js 24 was used for the build. Dependencies are pinned in `package-lock.json`.

```text
npm ci
node node_modules/electron/install.js
npm test
npm run batch -- 5 825183 reports/evaluation
npm run batch -- 100 971010 reports/another-batch
npm run package
npm run test:gui
```

`npm run start` opens the development desktop app. `npm run package` copies the pinned Electron distribution and game files to a self-contained Windows folder. The app itself has no third-party runtime JavaScript dependencies.

## Architecture

- `src/content.mjs`: declarative cards, items, enemies, events, and glossary.
- `src/engine.mjs`: deterministic rules, random generator, state machine, complete legal decisions, public observations and checkpoints.
- `src/policy.mjs`: configurable weighted baseline; replace `choose(observation, legalActions)` for a new policy.
- `src/ui.mjs` and `src/style.css`: graphical presentation and human controls over the same legal decisions.
- `desktop.cjs` / `preload.cjs`: isolated Electron window, atomic file saves, settings, run history.
- `tools/art.mjs` / `tools/revise-art.mjs`: ComfyUI generation, machine/model/workflow/prompt/seed records.
- `tests/rules.test.mjs`: focused rules and replay regression tests.

The shared source design is updated through v4.63; changes and decisions are recorded in BUILD_LOG.md. Git commits remain local; nothing has been pushed.

Existing 1.0.0/1.1.0/1.2.0/1.2.1/1.3.0/1.3.1/1.3.2/1.3.3/1.3.4/1.3.5/1.3.6/1.3.7/1.3.8/1.3.9 saves remain loadable. Legacy revealed entries become the second member of each pair, with a new companion rolled once; already spawned entities retain their identities and sizes. Old spawn progress is mapped to pair progress and a pending battle gains the additional base Channel once. Fresh runs have exactly 32 scheduled spawns, including one Tavern in pair 8 and one Archon in pair 16. Old exact replays require their original rules version.

Cards now activate once per turn by default, even with unused Channel or remaining total activations. The per-turn opportunity refreshes next player turn; total used allowance does not. Printed Blink supports repeated paid activation within the total limit. No existing card has been granted Blink in this update. Covered Pile/Fusion activations and Charge building also count. Card controls display Used this turn and disable until eligible again. The earlier documentation-only implementation gap is closed (content 1.1.5).


Run data: the desktop build retains every completed result in `%APPDATA%/astrata/history.json`, with no ten-run cap. Detailed records now live in `runs/<runId>/` (`metadata.json`, append-only `events.jsonl` (losslessly compressed to `.jsonl.gz` on completion/forfeit), `latest.json`, `result.json` when completed). Archives retain unfinished/forfeited runs and every resumed attempt; the Continue save is separate. `builds/<hash>.json` preserves package identity and engine/content/policy sources. Legacy results are imported without invented timestamps/build versions; details discarded by older builds cannot be recovered. Records stay local. Headless batches keep the same unique archives inside their report directory; `run-<seed>.json` and `summary.json` remain convenience exports of the latest batch. No automatic pruning. The unsupported browser-only fallback uses localStorage and remains subject to browser storage quotas; the Windows executable is the durable archival target.

The Mind Grid is now 7 columns × 6 rows (42 spaces) for playtesting future Corruption space. All existing spatial rules use the larger board; default resources/card values are unchanged. Older 5×4 saves keep stack coordinates, with new spaces added on the right and bottom. Corruptions remain planned Act 2 content.

New runs start with the Bronze Bracelet and Rootbound Ring equipped on the right wrist and right finger. Existing runs retain their equipment arrangement.

Severed cards have jagged purple borders on all four sides and no connection links. Neutral adjacency, elemental Attunement and gold synergy links are now brighter and thicker with visible endpoints; clearing Sever restores valid links.

Fourfold Grove shows its qualifying 2×2 with four side links, one diagonal and a doubled-damage badge. Elemental outlines and translucent art tint replace the bright left stripe; activated Shields retain their chosen colors for the turn. Opening Rite begins placed, grants first-turn Focus and cannot be recalled, including through whole-stack Recall.

Shield now has two activations per placement. Glass Choir destroys the two highest-value complete stacks (total printed Focus, then remaining activations, then reading order); both targets are telegraphed. Its on-death Final Note is a fixed 20 Light Cull hit: Wards/Shields are bypassed, Allies/equipment still defend.

Event exchanges now open an offer chooser with Equipped and Satchel groups, inspectable items and rewards, drag-to-trade or click confirmation, and a no-cost Back option. Lantern Trader lets you choose any eligible owned Bracelet; only that copy is surrendered, and its Gem stays in your Satchel. Exact offered IDs are available to AI and saved in run records.

Board connections now represent real effects only. Glowing energy strands flow toward recipients; mutual bonuses flow both ways. Plain adjacency creates no line, and long-range effects reveal on inspection. Reduced motion keeps static strands.
