import { enemies } from "./content.mjs";
import { artPaths } from "./art-paths.mjs";
const enteredFloors = new WeakMap();
export function animateApexFloor(app, o, runId) {
  if (o.stratum !== 4 || o.mode !== "field") return;
  const field = app.querySelector(".field");
  if (!field) return;
  const key = `${runId}:${o.apex?.floor || 1}`;
  if (enteredFloors.get(app) === key) return;
  enteredFloors.set(app, key);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  field.animate(
    [{ opacity: 0.3, transform: "scale(0.98)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: 350, easing: "ease-out" },
  );
}
export function apexMarks(f, x, y) {
  const a = f.archons?.find((a) => a.x === x && a.y === y);
  return a
    ? `<span class="apex-seal ${f.defeatedArchons.includes(a.id) ? "fallen" : ""}" title="${enemies[a.id].name} appears here on round 4"><img src="${artPaths["enemy-" + a.id]}" alt="${enemies[a.id].name}"><span>◇</span></span>`
    : "";
}
export function apexIntroMarkup(actions, button) {
  return `<section class="scene apex-intro"><div class="scene-art"></div><div class="scene-copy"><div class="eyebrow">Stratum four</div><h2>The Apex</h2><div class="rule"></div><p>Above the crystal ridges, rivers of fire carve a path toward something that has been waiting for you.</p><p>Three floors. Two familiar Archons on each. Defeat one and take the central stairs, or defeat both to ascend immediately.</p><p>The Archons arrive on round 4. After round 8’s movement, every survivor hunts you together. Defeating the first Archon on that last round gives you one final movement turn to reach Ascend before the survivor hunts.</p><div class="choices">${actions.map((a) => button(a, "primary")).join("")}</div></div></section>`;
}
export function apexSummitMarkup(o, actions, button) {
  return `<section class="scene apex-summit"><div class="scene-art"><img class="apex-beast" src="assets/enemy-apex.png" alt="The Apex Predator"></div><div class="scene-copy"><div class="eyebrow">The Apex</div><h2>The Apex Predator</h2><div class="rule"></div><p>Rock fractures beneath its weight. At the edges of its hide, darkness refuses to hold a shape.</p><p>No pursuit. No further provisions. The beast waits.</p><div class="apex-summit-room" aria-label="Five by five summit room; you enter at the center">${Array.from({ length: 25 }, (_, i) => `<span class="${i === 12 ? "summit-center" : ""}">${i === 12 ? "✧" : ""}</span>`).join("")}</div><div class="choices">${actions
    .filter((a) => a.type === "fightApex")
    .map((a) => button(a, "primary"))
    .join("")}</div></div></section>`;
}
