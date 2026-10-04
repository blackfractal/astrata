import { CORRUPTIONS } from "./strata.mjs";
import { corruptionPower } from "./corruptions.mjs";
import { artPaths } from "./art-paths.mjs";
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
export function paintCorruptions(o, app) {
  app.classList.toggle("in-loom", o.stratum === 2);
  if (!o.battle) return;
  const b = o.battle;
  for (const el of app.querySelectorAll("[data-slot]")) {
    const i = Number(el.dataset.slot),
      q = b.corruptions?.[i],
      c = b.grid[i].at(-1);
    if (q) {
      const d = CORRUPTIONS[q.kind],
        suppressed = !!c && ["nausea", "insanity"].includes(q.kind);
      el.classList.add("corrupted", "corruption-" + q.kind);
      el.classList.toggle("corruption-covered", suppressed);
      el.classList.toggle("corruption-occupied", !!c);
      const title =
        d.name +
        " · " +
        (q.kind === "mine"
          ? q.remaining + " turns left. "
          : suppressed
            ? "Covered. "
            : "") +
        d.text;
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="corruption-card" aria-hidden="true"><img class="corruption-art" src="${artPaths["corruption-" + q.kind]}" alt=""><span class="corruption-motion">${Array.from({ length: q.kind === "hole" ? 8 : 3 }, (_, n) => `<i style="--particle:${n};--angle:${n * 45}deg;--delay:${-n * 0.37}s"></i>`).join("")}</span><span class="corruption-name">${d.name}</span></span><span class="corruption-seal" tabindex="0" aria-label="${esc(title)}" data-tooltip="${esc(title)}"><b>${d.symbol}</b><small>${q.kind === "mine" ? q.remaining + " turns" : q.kind === "insanity" && !c ? q.value + " HP" : suppressed ? "covered" : ""}</small></span>`,
      );
      if (!c) el.title = title;
    }
    if (c?.mending)
      el.insertAdjacentHTML(
        "beforeend",
        '<span class="mending-ribbon" data-tooltip="Repair completes next player turn if these Elves survive.">Mending…</span>',
      );
    if (c && corruptionPower(b, i, 4) < 4)
      el.insertAdjacentHTML(
        "beforeend",
        '<span class="nausea-warning" data-tooltip="Nausea: damage and newly generated Guard halved.">½</span>',
      );
    const marks = b.enemies.flatMap((e) =>
      (e.corruptionPlan || [])
        .filter((p) => p.slot === i)
        .map((p) => ({ ...p, enemy: e.name })),
    );
    if (marks.length) {
      el.classList.add("corruption-mark");
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="corruption-foretell" data-tooltip="${esc(marks.map((p) => p.enemy + " will apply " + CORRUPTIONS[p.kind].name + " here on its next action.").join(" "))}">${marks.map((p) => CORRUPTIONS[p.kind].symbol).join(" ")} →</span>`,
      );
    }
  }
}
