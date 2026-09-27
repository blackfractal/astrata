# Astrata

A Windows spatial spell-grid roguelike. This build implements the Druid's journey through Stratum 1, based on Astrata design v4.47. This is v1 with 4 Insight, 1 Focus, 2 Channel, 16 paired spawning rounds (32 spawns), a rolling four-pair preview, and grouped enemy encounters (package 1.3.6; rules 1.3.6).

Enemies stop immediately on reaching the player and remain there while the other enemies finish moving, including Pack Movement. Battle begins at the end of the enemy movement phase.

Mind Grid slots have no visible indices. Inventory separates Equipped from Satchel and supports dragging equipment in both directions. Resonance costs 2 Focus to place and 0 Channel to activate for +1 Channel, requires Isolated placement, has one use with no Recall or extra uses, and goes to Destroyed at player-turn end (returning next battle).

New Druid runs start with 12 cards: four Blasts, four Shields, Familiar, Clear Mind, Focus Energy, and Sapling. Existing saves retain their acquired/removed cards; the new base Insight applies at the next Reveal.

## Play

Open `release/Astrata/Astrata.exe` by double-clicking it. Keep the entire `Astrata` folder together. No installation, development server, editor, network connection, or manually installed runtime is required.

- Click a revealed card to inspect its full art and details, then click a lit Mind Grid slot to place it; dragging also works. Placed cards have visible activation buttons and remaining allowances. Click their surface for full details and Recall.
- Enter confirms the main choice. Escape opens or closes the pause menu.
- Hover keywords for explanations. The Rules & keywords button contains the full quick reference.
- Read enemy Tells before ending a turn. Each defense selection absorbs as much of the hit as it can.
- Inventory is available throughout. Equip before or between Field movement steps, or at a Tavern. Drag equipment into slots and Gems into/out of sockets; Gem changes are Tavern-only.
- Click Tavern people/areas for services. The Market separates Buy from Sell/remove, with View controls before transactions. Ordinary paid card removal is once per Tavern; variable-cost Hex treatment is separate.
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

The shared source design is updated through v4.47; changes and decisions are recorded in BUILD_LOG.md. Git commits remain local; nothing has been pushed.

Existing 1.0.0/1.1.0/1.2.0/1.2.1/1.3.0/1.3.1/1.3.2/1.3.3/1.3.4/1.3.5 saves remain loadable. Legacy revealed entries become the second member of each pair, with a new companion rolled once; already spawned entities retain their identities and sizes. Old spawn progress is mapped to pair progress and a pending battle gains the additional base Channel once. Fresh runs have exactly 32 scheduled spawns, including one Tavern in pair 8 and one Archon in pair 16. Old exact replays require their original rules version.

Cards now activate once per turn by default, even with unused Channel or remaining total activations. The per-turn opportunity refreshes next player turn; total used allowance does not. Printed Blink supports repeated paid activation within the total limit. No existing card has been granted Blink in this update. Covered Pile/Fusion activations and Charge building also count. Card controls display Used this turn and disable until eligible again. The earlier documentation-only implementation gap is closed (content 1.1.5).
