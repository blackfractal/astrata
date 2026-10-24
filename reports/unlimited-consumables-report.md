# Consumable timing and feedback — 4.0.21

2026-10-24. Jonathan requested unlimited consumable use and explicitly approved healing, cures and protection during pending enemy attacks, retaining phase requirements for other supplies.

- Removed the per-player-turn and per-movement-round allowance, including immediate healing at item pickups. Old save markers are ignored.
- Healing Sap, Antidote, Cindersalve, Rustbane and Sealed Breath can be used during a pending defense choice. They do not advance or replace the pending attack. Other supplies retain player-phase and target requirements; automatic animation, status resolution and death are not new interrupt windows.
- Each bottle is still consumed permanently. Existing buff behavior remains: Fury and Bastion do not stack another copy on an unspent buff. No changes to Satchel capacity, prices or supply quantities.
- Tray reports the number of currently usable bottles, replacing the misleading single-use allowance. Ordinary unavailable items no longer claim they are in a lesson. Cure items explicitly report the missing ailment.
- Updated item text, enhanced-potion text, tutorial and design v4.241 section 6.7. Saved battle checkpoints still restore both inventory and battle state together.

Verification: 749 rules tests pass. Tests cover repeated use in a turn and movement round, old save markers, enhanced bottles, defensive supplies preserving an incoming hit, status protection blocking its Burn application, and phase/target restrictions.

Packaged web UI tested in isolated headless Edge: in a Cinder Hart defense fixture, used two Healing Saps, Cindersalve and Sealed Breath without advancing the 5-damage incoming attack; HP40→50, Burn4→0, protection active. Antidote without Poison correctly disabled with “No Poison to remove”; Channel Draught disabled during defense. No renderer errors. Screenshot/result at `unlimited-consumables-ui/`. Native Electron Playwright attachment failed with a protocol assertion; the UI check instead served the packaged app files in headless Edge, using isolated browser storage. No live profile or user game was modified.

Runtime and portable ZIP updated to4.0.21. No balance playthrough performed: removing the allowance deliberately increases burst potential, and this change has not yet been measured against the Apex fixture.
