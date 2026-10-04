import fs from "node:fs/promises";
import path from "node:path";
import { cards, items, enemies, events, locations } from "../src/content.mjs";
import { artPaths } from "../src/art-paths.mjs";
const expected = [
  "location-loom-field",
  "location-loom-mind",
  "location-field-topdown",
  "location-weald-topdown",
  "location-tavern-interior",
  ...Object.keys(cards).map((x) => "card-" + x),
  ...Object.keys(items).map((x) => "item-" + x),
  ...Object.keys(enemies).map((x) => "enemy-" + x),
  ...events.map((x) => "event-" + x.id),
  ...locations.map((x) => "location-" + x.id),
];
const missing = [];
for (const id of expected) {
  try {
    const stat = await fs.stat(artPaths[id] || "");
    if (stat.size < 1000) missing.push(id);
  } catch {
    missing.push(id);
  }
}
const manifest = JSON.parse(
  await fs.readFile("reports/art-manifest.json", "utf8"),
);
const noProvenance = expected.filter(
  (id) =>
    !manifest.some(
      (m) =>
        m.id === id &&
        m.file === artPaths[id] &&
        m.prompt &&
        (m.seed ||
          (m.provider === "built-in image_gen" &&
            m.sha256 &&
            m.workflow?.tool === "image_gen.imagegen")) &&
        m.machine &&
        m.model &&
        m.workflow,
    ),
);
const result = {
  required: expected.length,
  selected: Object.keys(artPaths).length,
  missing,
  noProvenance,
  cards: Object.keys(cards).length,
  motes: Object.values(enemies).filter(
    (x) => x.tier === "Mote" && !x.summonOnly && !x.tutorialOnly,
  ).length,
  eidolons: Object.values(enemies).filter(
    (x) => x.tier === "Eidolon" && !x.tutorialOnly,
  ).length,
  tutorialEnemies: Object.values(enemies).filter((x) => x.tutorialOnly).length,
  archons: Object.values(enemies).filter((x) => x.tier === "Archon").length,
  items: Object.keys(items).length,
  events: events.length,
  upgrades: Object.values(cards).filter((x) => x.upgrade).length,
};
console.log(result);
await fs.writeFile(
  "reports/content-audit.json",
  JSON.stringify(result, null, 2),
);
if (missing.length || noProvenance.length) process.exitCode = 1;
