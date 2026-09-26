import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "release", "Astrata");
await fs.mkdir(dest, { recursive: true });
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
    version: "1.0.0",
    main: "desktop.cjs",
    type: "module",
  }),
);
await fs.writeFile(
  path.join(dest, "START_HERE.txt"),
  "ASTRATA\n\nDouble-click Astrata.exe. Keep the entire Astrata folder together.\nNo installation, Node.js, editor or network connection is required.\n\nSave, settings and run history: %APPDATA%/astrata\nMouse controls. Escape opens the menu. Enter confirms the main choice.\nAI step and Watch AI are available during a run.\n",
);
console.log("Packaged", path.join(dest, "Astrata.exe"));
