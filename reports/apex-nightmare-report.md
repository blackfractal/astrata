# Colossal Apex Predator and Rift Chimera — 4.0.1

Jonathan requested a much larger, scarier final beast, filling the frame and blotting out sunlight with corrupt energy, with nightmare eyes and teeth. The selected image uses an extreme low-angle close view: mountains beneath enormous claws, a cavernous mouth, needle-like teeth, luminous slit eyes, and a black-violet body extending beyond the frame. This changes visual scale only; Predator combat numbers and moves are unchanged.

The previous winged wolf/tiger image is preserved as **The Rift Chimera**, a new native Apex Eidolon: 145 HP, Wind, flying Stalker. Initial cycle: 20 Wind; 9 Fire then 9 Earth then 9 Chaos; 22 Light. It shares the native Apex Eidolon pools with Rift Boar, without rematch scaling. These are provisional combat values chosen for a simpler mixed-element encounter.

- New Predator: `assets/enemy-apex.png`.
- Preserved Chimera: `assets/enemy-riftChimera.png`.
- [Exact prompt](apex-nightmare-prompt.txt), [provenance](apex-art-provenance.md).
- Built-in image generation; no CLI or DGX Spark. Originals retained.
- Rules/content/package 4.0.1; existing 4.0.0 and supported older saves remain compatible. No live player save modified.

Validation: 648 regression tests pass, including native Chimera stats and 4.0.0 Continue compatibility; all 209 required artwork entries are present/provenanced. Packaged UI verification includes both Eidolons and the new Predator, along with introduction, map floors and victory. Previous AI evaluation remains explicitly versioned 4.0.0; no new balance claim is made for the expanded 4.0.1 enemy pool.


Jonathan requested mirroring all three monsters horizontally to face the player from the enemy side. The game now mirrors only their artwork through display styling, including battle portraits, map/Archives previews and the Predator introduction. Original PNG pixels and prior variants remain unchanged; text and controls are not mirrored.
