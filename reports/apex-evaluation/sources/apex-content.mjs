// First-pass Apex balance. Earlier-Stratum definitions remain unchanged.
export function registerApex(enemy) {
  enemy("apex", "The Apex Predator", "Archon", "Chaos", 640, "Sentinel", [
    { name: "Riven Earth", damage: 24, element: "Earth", markCorruption: "nausea", count: 2, summonIdeon: "guardian", summonCount: 1, commandIdeons: true },
    { name: "Crushing Tusks", damage: 28, element: "Fire", applyCorruption: true, grid: "destroy", target: "valuable", count: 2, commandIdeons: true },
    { name: "Hollow Hunger", element: "Chaos", sequence: [{ damage: 16, element: "Chaos" }, { damage: 16, element: "Light" }], markCorruption: "insanity", count: 2, summonIdeon: "leech", summonCount: 1, commandIdeons: true },
    { name: "Unmake", damage: 26, element: "Arcane", applyCorruption: true, grid: "row", target: "row", commandIdeons: true },
    { name: "Brood of the Summit", element: "Water", sequence: [{ damage: 18, element: "Water" }, { damage: 18, element: "Wind" }], markCorruption: "hypnosis", count: 2, summonIdeon: "runner", summonCount: 2, commandIdeons: true },
    { name: "World Eater", damage: 42, element: "Chaos", applyCorruption: true, grid: "destroy", target: "valuable", count: 2, commandIdeons: true },
  ], "Commands its surviving Ideons on every move, including Purify. Riven Earth summons a Hollow Sentinel; Hollow Hunger a Ward Leech; Brood summons two Glass Skitters. At most six owned Ideons. Corruptions are warned one move before application; destruction is telegraphed. Direct damage rises by 3 per full cycle and another 4 below half HP. Cycle-end Purify clears damage statuses when needed.",
  "Sustain and rebuild your formation. Clear the Sentinel to attack its owner, repair dangerous spaces, and Recall valuable cards before destruction. Its elemental attacks require several defenses.",
  { stratum: 4, corruptionCap: 10, ideonCap: 6, apexPredator: true });
}
