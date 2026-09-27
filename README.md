# Astrata

A Windows spatial spell-grid roguelike. This build implements the Druid's journey through Stratum 1, based on Astrata design v4.36. This is v1 with optional Field item pickups (rules/package 1.2.1).

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

The source design document was not modified. Git commits remain local; nothing has been pushed.

Existing 1.0.0/1.1.0/1.2.0 saves remain loadable. Already spawned entities and revealed queues are retained; the new fixed schedule governs newly rolled batches. A fresh run receives the exact new one-Tavern schedule. Old exact replays require their original rules version.
