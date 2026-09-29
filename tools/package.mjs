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
  "preload.cjs",
])
  await fs.cp(path.join(root, name), path.join(app, name), { recursive: true });
await fs.writeFile(
  path.join(app, "package.json"),
  JSON.stringify({
    name: "astrata",
    version: "1.3.20",
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
  "ward-limit-verification.json",
  "ward-limit-evaluation",
  "double-activation-verification.json",
  "transmute-verification.json",
  "transmute-evaluation",
  "horizontal-layout-verification.json",
  "element-impact-verification.json",
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
  "healer-verification.json",
  "polish-ui-verification.json",
  "polish-edge-verification.json",
  "polish-playthrough.json",
  "gui-verification.json",
  "manual-controls-verification.json",
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
