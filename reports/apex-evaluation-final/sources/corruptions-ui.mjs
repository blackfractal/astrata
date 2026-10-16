import { phaseMoves } from "./loom-bosses.mjs";
import { CORRUPTIONS } from "./strata.mjs";
import { corruptionPower, nauseaTargets, cardFrozen } from "./corruptions.mjs";
import { artPaths } from "./art-paths.mjs";
import { forcedDiscardLabel } from "./card-removal.mjs";
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
const eggTones = { Arcane: "#cbd0de", Fire: "#ff9b58", Water: "#79caff", Earth: "#93c37c", Wind: "#c6e6c0", Light: "#f9df81", Chaos: "#bf94f4" };
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
        suppressed = !!c && q.kind === "insanity";
      el.classList.add("corrupted", "corruption-" + q.kind);
      if (q.kind === "egg") el.style.setProperty("--corruption-color", eggTones[q.element] || eggTones.Arcane);
      el.classList.toggle("corruption-covered", suppressed);
      el.classList.toggle("corruption-occupied", !!c);
      const title =
        d.name +
        " · " +
          (q.kind === "egg"
            ? `${q.element} · hatches next Hive turn: ${c ? "cover to " + forcedDiscardLabel(b.grid[i]) : "8 damage"}; then ${q.insect === "drone" ? "Drone" : q.insect === "runner" ? "Glass Skitter" : "Thought Burrower"}. `
          : q.kind === "mine"
          ? q.remaining +
            " turns left; " +
            (q.damage || 18) +
            " " +
            (q.element || "Arcane") +
            " if uncovered. "
          : c && ["anger", "nausea"].includes(q.kind)
            ? "Affects the covering card only. "
          : suppressed
            ? "Covered. "
            : "") +
        d.text;
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="corruption-card" aria-hidden="true"><img class="corruption-art" src="${artPaths["corruption-" + q.kind]}" alt=""><span class="corruption-motion">${Array.from({ length: q.kind === "hole" ? 8 : 3 }, (_, n) => `<i style="--particle:${n};--angle:${n * 45}deg;--delay:${-n * 0.37}s"></i>`).join("")}</span><span class="corruption-name">${d.name}</span></span><span class="corruption-seal" tabindex="0" aria-label="${esc(title)}" data-tooltip="${esc(title)}"><b>${d.symbol}</b><small>${q.kind === "egg" ? q.element + " · 1 turn" : q.kind === "mine" ? q.remaining + " turns" : q.kind === "insanity" && !c ? q.value + " HP" : suppressed ? "covered" : ""}</small></span>`,
      );
      if (!c) el.title = title;
      if (c && ["hypnosis", "insanity", "mine", "egg"].includes(q.kind))
        el.insertAdjacentHTML("beforeend", `<span class="corruption-cover-aura ${q.kind}-cover-aura" aria-hidden="true">${particles(q.kind === "mine" ? 8 : 3)}</span>`);
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
        `<span class="mending-ribbon" data-tooltip="Mending ${esc(CORRUPTIONS[c.mending.kind]?.name || "Corruption")} at row ${Math.floor(c.mending.slot / 7) + 1}, column ${(c.mending.slot % 7) + 1}. ${Math.max(0, c.mending.due - b.turn)} player-turn starts remaining; Elves must survive and stay within reach.">Mending…</span>`,
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
      const fixed = marks.some((p) => p.kind === "hypnosis");
      const behavior = fixed
        ? "Blue · Fixed space: this warning stays here even if its card is recalled, replaced or moved."
        : "Red · Relocating: covering this empty warned space redirects the warning to an empty space beside the most cards, if available.";
      el.classList.add("corruption-mark", fixed ? "corruption-fixed" : "corruption-relocating");
      hazardHelp(el, behavior);
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="corruption-foretell" tabindex="0" data-tooltip="${esc(marks.map((p) => p.enemy + " will apply " + CORRUPTIONS[p.kind].name + " here on its next action.").join(" ") + " " + behavior)}">${marks.map((p) => CORRUPTIONS[p.kind].symbol).join(" ")}</span>`,
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
  const repairs = [];
  const influences = [];
  const influence = (from, to, kind) => {
    const x = point(from), y = point(to);
    if (!x || !y || from === to || !b.grid[to]?.length) return;
    const dx = y[0] - x[0], dy = y[1] - x[1], length = Math.hypot(dx, dy);
    const at = (t, offset = 0) => `${(x[0] + dx * t - dy / length * offset).toFixed(2)} ${(x[1] + dy * t + dx / length * offset).toFixed(2)}`;
    const paths = Array.from({ length: kind === "nausea" ? 4 : 2 }, (_, n) => {
      const bend = (n % 2 ? -1 : 1) * (6 + n * 3);
      const d = kind === "nausea"
        ? `M ${at(0)} C ${at(.17, bend)} ${at(.33, bend)} ${at(.5)} C ${at(.67, -bend)} ${at(.83, -bend)} ${at(1)}`
        : `M ${at(0)} L ${at(.18, bend)} ${at(.34, -bend)} ${at(.46, bend * .3)} ${at(.59, -bend)} ${at(.76, bend)} ${at(1)}`;
      return `<path class="corruption-strand" style="--strand:${n}" d="${d}"/>`;
    }).join("");
    influences.push(`<g class="corruption-influence ${kind}-link" data-influence-from="${from}" data-influence-to="${to}">${paths}</g>`);
  };
  for (const [key, q] of Object.entries(b.corruptions || {})) {
    const from = Number(key);
    if (q.kind === "nausea" && !b.grid[from].length)
      for (const to of nauseaTargets(b, from)) influence(from, to, "nausea");
  }
  for (const { from, to } of b.angerTargets || []) {
    const target = app.querySelector(`[data-slot="${to}"]`);
    target?.classList.add("anger-affected");
    if (target) hazardHelp(target, "Anger targets this card at the next player-turn start, based on the current board. Spends one Channel and a card use without optional Attunement.");
    if (!b.grid[from].length) influence(from, to, "anger");
  }
  if (influences.length)
    mind.insertAdjacentHTML("beforeend", `<svg class="corruption-influence-links" viewBox="0 0 ${mind.clientWidth} ${mind.clientHeight}" aria-hidden="true">${influences.join("")}</svg>`);
  for (const [from, stack] of b.grid.entries()) {
    const c = stack.at(-1),
      m = c?.mending;
    if (!m) continue;
    const source = app.querySelector(`[data-slot="${from}"]`);
    const target = app.querySelector(`[data-slot="${m.slot}"]`);
    const layer = m.kind === "bile" ? b.biles : b.corruptions;
    const inReach =
      from === m.slot ||
      Math.abs(Math.floor(from / 7) - Math.floor(m.slot / 7)) +
        Math.abs((from % 7) - (m.slot % 7)) ===
        1;
    const stalled =
      !inReach ||
      layer?.[m.slot]?.uid !== m.corruptionUid ||
      cardFrozen(b, c, from);
    source?.classList.add("mending-source");
    target?.classList.add("mending-target");
    if (target) {
      target.insertAdjacentHTML(
        "beforeend",
        `<span class="mending-target-ring${stalled ? " mending-stalled" : ""}" aria-hidden="true"></span>`,
      );
      hazardHelp(
        target,
        `Machine Elves are mending this space${from === m.slot ? " beneath themselves" : " from an adjacent space"}.${stalled ? " Repair is waiting: the Elves must be unfrozen and within reach of the original Corruption." : ""}`,
      );
    }
    const x = point(from),
      y = point(m.slot);
    if (x && y && from !== m.slot)
      repairs.push(
        `<path class="mending-thread${stalled ? " mending-stalled" : ""}" data-mending-from="${from}" data-mending-to="${m.slot}" d="M ${x[0]} ${x[1]} L ${y[0]} ${y[1]}"/>`,
      );
  }
  if (repairs.length)
    mind.insertAdjacentHTML(
      "beforeend",
      `<svg class="mending-links" viewBox="0 0 ${mind.clientWidth} ${mind.clientHeight}" aria-hidden="true">${repairs.join("")}</svg>`,
    );
  for (const e of b.enemies) {
    const p = e.bilePlan;
    for (const to of p ? [p.to, ...(p.additional || [])] : []) {
      const slot = to === "player" ? p.from : to;
      const el = app.querySelector('[data-slot="' + slot + '"]');
      el?.classList.add("bile-destination");
      const warning =
        p.to === "player"
          ? "Green · Live Bile route: this Bile will reach you next enemy round: Poison +2."
          : "Green · Live Bile route: Bile arrives next enemy round and consumes one activation. Warning updates if the route changes.";
      el?.insertAdjacentHTML(
        "beforeend",
        `<span class="bile-forecast${p.to === "player" ? " bile-escape" : ""}" aria-hidden="true">${p.to === "player" ? "←" : ""}</span>`,
      );
      if (el) hazardHelp(el, warning);
      if (p.from != null && p.to !== "player")
        arrows.push({ from: p.from, to: p.to, color: "#63e68b" });
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
