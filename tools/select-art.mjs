import fs from "node:fs/promises";
const manifest = JSON.parse(
  await fs.readFile("reports/art-manifest.json", "utf8"),
);
const paths = {};
for (const m of manifest) paths[m.id] = m.file;
const preferred = [
  "card-cinder",
  "card-heat",
  "card-resonance",
  "card-soothe",
  "enemy-sludge",
  "enemy-leech",
  "enemy-choir",
  "item-channelRing",
  "item-ruby",
  "item-sapphire",
  "item-topaz",
];
for (const id of preferred) paths[id] = "assets/" + id + "-v2.png";
await fs.writeFile(
  "src/art-paths.mjs",
  "export const artPaths = " + JSON.stringify(paths, null, 2) + ";\n",
);
await fs.writeFile(
  "reports/asset-selections.json",
  JSON.stringify(
    {
      selected: paths,
      reason:
        "Latest painting pass by default; retained listed second-pass variants where contact-sheet review found a clearer depiction of the intended subject.",
      secondPassRetained: preferred,
    },
    null,
    2,
  ),
);
console.log(
  "Selected",
  Object.keys(paths).length,
  "assets from",
  manifest.length,
  "generated versions.",
);
