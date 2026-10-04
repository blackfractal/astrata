import { phaseMoves } from "./loom-bosses.mjs";
import { CORRUPTIONS } from "./strata.mjs";
import { corruptionPower } from "./corruptions.mjs";
import { artPaths } from "./art-paths.mjs";
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
const particles = (count) =>
  Array.from(
    { length: count },
    (_, n) => `<i style="--particle:${n};--delay:${-n * 0.73}s"></i>`,
  ).join("");
function hazardHelp(el, help) {
  el.dataset.tooltip = [el.getAttribute("title") || el.dataset.tooltip, help]
    .filter(Boolean)
    .join(" ");
  el.removeAttribute("title");
  el.setAttribute(
    "aria-label",
    [el.getAttribute("aria-label"), help].filter(Boolean).join(" · "),
  );
}
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
          ? q.remaining +
            " turns left; " +
            (q.damage || 18) +
            " " +
            (q.element || "Arcane") +
            " if uncovered. "
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
    if (b.biles?.[i]) {
      el.classList.add("has-bile");
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="bile-motion" aria-hidden="true">${particles(5)}</span>`,
      );
      hazardHelp(el, "Bile: " + CORRUPTIONS.bile.text);
    }
    if (c?.mending)
      el.insertAdjacentHTML(
        "beforeend",
        '<span class="mending-ribbon" data-tooltip="Repair completes after its remaining turns if these Elves survive and remain adjacent.">Mending…</span>',
      );
    if (c && corruptionPower(b, i, 4) < 4) {
      el.classList.add("nausea-affected");
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="corruption-motion nausea-aura" aria-hidden="true">${particles(3)}</span>`,
      );
      hazardHelp(
        el,
        "Nausea: damage and newly generated Guard halved. The displayed values already include this reduction.",
      );
    }
    const marks = b.enemies.flatMap((e) =>
      (e.corruptionPlan || [])
        .filter((p) => p.slot === i)
        .map((p) => ({ ...p, enemy: e.name })),
    );
    if (marks.length) {
      el.classList.add("corruption-mark");
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="corruption-foretell" data-tooltip="${esc(marks.map((p) => p.enemy + " will apply " + CORRUPTIONS[p.kind].name + " here on its next action.").join(" "))}">${marks.map((p) => CORRUPTIONS[p.kind].symbol).join(" ")}</span>`,
      );
    }
  }
  const mind = app.querySelector(".mind");
  if (!mind) return;
  const arrows = [];
  const point = (i) => {
    const el = app.querySelector('[data-slot="' + i + '"]');
    return el
      ? [el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight / 2]
      : null;
  };
  for (const e of b.enemies) {
    const p = e.bilePlan;
    for (const to of p ? [p.to, ...(p.additional || [])] : []) {
      const slot = to === "player" ? p.from : to;
      const el = app.querySelector('[data-slot="' + slot + '"]');
      el?.classList.add("bile-destination");
      const warning =
        p.to === "player"
          ? "This Bile will reach you next enemy round: Poison +2."
          : "Bile arrives next enemy round and consumes one activation. Warning updates if the route changes.";
      el?.insertAdjacentHTML(
        "beforeend",
        `<span class="bile-forecast${p.to === "player" ? " bile-escape" : ""}" aria-hidden="true">${p.to === "player" ? "←" : ""}</span>`,
      );
      if (el) hazardHelp(el, warning);
      if (p.from != null && p.to !== "player")
        arrows.push({ from: p.from, to: p.to, color: "#cad63c" });
    }
    if (e.tell?.disrupt) {
      for (const m of phaseMoves(b, e.tell.phasePlan)) {
        const el = app.querySelector('[data-slot="' + m.from + '"]');
        el?.classList.add("phase-warning");
        const danger = b.corruptions?.[m.to]?.kind;
        el?.insertAdjacentHTML(
          "beforeend",
          `<span class="phase-label" data-tooltip="Whole stack moves to row ${Math.floor(m.to / 7) + 1}, column ${(m.to % 7) + 1}. ${danger === "hole" ? "Memory Hole destroys the whole arriving stack." : danger === "hypnosis" ? "Hypnosis immediately activates the arriving top card against you." : "Corruptions stay fixed."}">${e.tell.disrupt === "H" ? "→" : "↓"}2${m.occupied && danger === "hole" ? " ×" : m.occupied && danger === "hypnosis" ? " ◎" : ""}</span>`,
        );
        if (m.occupied)
          arrows.push({
            ...m,
            axis: e.tell.disrupt,
            color: danger === "hole" ? "#ff8067" : "#dba8ff",
          });
      }
    }
  }
  if (arrows.length) {
    mind.insertAdjacentHTML(
      "beforeend",
      `<svg class="loom-route-lines" viewBox="0 0 ${mind.clientWidth} ${mind.clientHeight}" aria-hidden="true"><defs><marker id="loom-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>${arrows
        .map((a) => {
          const x = point(a.from),
            y = point(a.to);
          if (!x || !y) return "";
          const wrap = a.axis && a.to < a.from;
          const d = wrap
            ? a.axis === "H"
              ? `M ${x[0]} ${x[1]} L ${mind.clientWidth - 2} ${x[1]} M 2 ${y[1]} L ${y[0]} ${y[1]}`
              : `M ${x[0]} ${x[1]} L ${x[0]} ${mind.clientHeight - 2} M ${y[0]} 2 L ${y[0]} ${y[1]}`
            : `M ${x[0]} ${x[1]} L ${y[0]} ${y[1]}`;
          return `<path d="${d}" stroke="${a.color}" marker-end="url(#loom-arrow)"/>`;
        })
        .join("")}</svg>`,
    );
  }
}
