import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "release", "Astrata");
await fs.mkdir(dest, { recursive: true });
if (process.argv.includes("--app-only")) {
  await fs.access(path.join(dest, "Astrata.exe"));
} else {
  await fs.cp(path.join(root, "node_modules", "electron", "dist"), dest, {
    recursive: true,
  });
  try {
    await fs.rename(
      path.join(dest, "electron.exe"),
      path.join(dest, "Astrata.exe"),
    );
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
}
const app = path.join(dest, "resources", "app");
await fs.mkdir(app, { recursive: true });
for (const name of [
  "src",
  "assets",
  "index.html",
  "desktop.cjs",
  "run-archive.cjs",
  "tutorial-profile.cjs",
  "preload.cjs",
])
  await fs.cp(path.join(root, name), path.join(app, name), { recursive: true });
await fs.writeFile(
  path.join(app, "package.json"),
  JSON.stringify({
    name: "astrata",
    version: JSON.parse(
      await fs.readFile(path.join(root, "package.json"), "utf8"),
    ).version,
    main: "desktop.cjs",
    type: "module",
  }),
);
await fs.writeFile(
  path.join(dest, "START_HERE.txt"),
  "ASTRATA\n\nDouble-click Astrata.exe. Keep the entire Astrata folder together.\nNo installation, Node.js, editor or network connection is required.\n\nSave, settings and run history: %APPDATA%/astrata\nMouse controls. Escape opens the menu. Enter confirms the main choice.\nAI step and Watch AI are available during a run.\n",
);
console.log("Packaged", path.join(dest, "Astrata.exe"));

for (const name of ["README.md", "BUILD_LOG.md", "AI_REPORT.md"])
  await fs.copyFile(path.join(root, name), path.join(dest, name));
await fs.mkdir(path.join(dest, "reports"), { recursive: true });
for (const name of [
  "evaluation",
  "enemy-first-evaluation",
  "setting-drop-verification.json",
  "guard-verification.json",
  "charge-release-verification.json",
  "charge-release-evaluation",
  "area-impact-verification.json",
  "reward-layout-verification.json",
  "random-rite-evaluation",
  "conduit-evaluation",
  "conduit-verification.json",
  "sapling-growth-evaluation",
  "sapling-verification.json",
  "equipment-policy-before",
  "equipment-policy-after",
  "equipment-policy-demo-before",
  "equipment-policy-demo-after",
  "equipment-policy-comparison.json",
  "element-defense-evaluation",
  "defense-controls-evaluation",
  "armor-pool-evaluation",
  "attunement-relay-evaluation",
  "attunement-relay-verification.json",
  "defense-controls-verification.json",
  "element-defense-verification.json",
  "polish-evaluation",
  "item-pickup-evaluation",
  "item-pickup-verification.json",
  "phase-arrow-verification.json",
  "pairs-evaluation",
  "pairs-robustness",
  "pairs-ui-verification.json",
  "pairs-playthrough.json",
  "readability-verification.json",
  "reveal-verification.json",
  "reveal-evaluation",
  "reveal-playthrough.json",
  "sever-connections-verification.json",
  "mind-grid-verification.json",
  "mind-grid-evaluation",
  "choir-shield-evaluation",
  "attack-traversal-verification.json",
  "positional-defense-verification.json",
  "positional-defense-evaluation",
  "death-evaluation",
  "death-verification.json",
  "optional-equipment-block-evaluation",
  "optional-equipment-block-verification.json",
  "enemy-immunity-evaluation",
  "enemy-immunity-verification.json",
  "event-trade-evaluation",
  "event-trade-verification.json",
  "board-interactions-verification.json",
  "run-archive-verification.json",
  "grid-telegraph-verification.json",
  "mini-element-verification.json",
  "mini-element-evaluation",
  "chaotic-glare-verification.json",
  "chaotic-glare-evaluation",
  "choir-final-note-verification.json",
  "choir-final-note-evaluation",
  "status-defense-evaluation",
  "ring-origin-verification.json",
  "golem-defeat-verification.json",
  "golem-defeat-evaluation",
  "ward-limit-verification.json",
  "ward-limit-evaluation",
  "double-activation-verification.json",
  "transmute-verification.json",
  "transmute-evaluation",
  "horizontal-layout-verification.json",
  "element-impact-verification.json",
  "status-impact-verification.json",
  "player-status-verification.json",
  "battle-feedback-verification.json",
  "keyword-help-verification.json",
  "dialog-dismiss-verification.json",
  "charge-resources-verification.json",
  "charge-resources-evaluation",
  "spillover-verification.json",
  "spillover-evaluation",
  "resonance-cost-verification.json",
  "resonance-cost-evaluation",
  "equipment-balance-verification.json",
  "equipment-balance-evaluation",
  "balance-verification.json",
  "balance-evaluation",
  "battle-targeting-verification.json",
  "battle-targeting-evaluation",
  "druid-reveal-verification.json",
  "activation-turn-evaluation",
  "activation-turn-verification.json",
  "druid-start-evaluation",
  "druid-start-verification.json",
  "resonance-equipment-evaluation",
  "resonance-equipment-verification.json",
  "movement-stop-evaluation",
  "movement-stop-verification.json",
  "adjacency-evaluation",
  "adjacency-verification.json",
  "polish-robustness",
  "store-verification.json",
  "archon-map-verification.json",
  "return-start-verification.json",
  "direction-pad-verification.json",
  "boss-balance-verification.json",
  "boss-damage-verification.json",
  "tutorial-verification.json",
  "tutorial-hints-verification.json",
  "tutorial-art-prompts.json",
  "tutorial-art-verification.json",
  "tutorial-evaluation",
  "tutorial-normal-evaluation",
  "ward-zero-evaluation",
  "tutorial-edge-verification.json",
  "boss-balance-evaluation",
  "early-motes-verification.json",
  "early-motes-evaluation",
  "healer-verification.json",
  "polish-ui-verification.json",
  "polish-edge-verification.json",
  "polish-playthrough.json",
  "gui-verification.json",
  "manual-controls-verification.json",
  "legendary-rewards-verification.json",
  "upgrade-badge-verification.json",
  "boss-pressure-verification.json",
  "boss-pressure-evaluation",
  "content-audit.json",
  "art-manifest.json",
  "asset-selections.json",
]) {
  try {
    await fs.cp(
      path.join(root, "reports", name),
      path.join(dest, "reports", name),
      { recursive: true },
    );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}
