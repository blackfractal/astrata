import { cards, MIND_COLUMNS } from "./content.mjs";
import {
  attunementElements,
  gridNeighbors,
  squarePattern,
  cardAllowance,
  corner,
} from "./engine.mjs";
const unique = (xs) => [...new Set(xs)];
const color = (element) => `var(--${element})`;
const gradient = (elements) =>
  elements.length === 1
    ? color(elements[0])
    : `linear-gradient(135deg, ${elements.map((e, i) => `${color(e)} ${(i * 100) / elements.length}%, ${color(e)} ${((i + 1) * 100) / elements.length}%`).join(",")})`;
export function cardInteraction(b, c, i) {
  const d = cards[c.id];
  if (b.grid[i].at(-1)?.uid !== c.uid) return null;
  const neighbors = gridNeighbors(b, i);
  const attunes = !!(d.attune && !c.transmuted && c.element === d.element);
  const providers = attunes
    ? neighbors.filter((j) => b.grid[j].at(-1).element !== "Arcane")
    : [];
  const matching =
    d.effects.matchingDamage || d.effects.matchingShield
      ? neighbors.filter((j) => b.grid[j].at(-1).id === c.id)
      : [];
  const portions = b.shields.filter(
    (p) => p.owner === c.uid && p.slot === i && p.block > 0,
  );
  const cast =
    attunes && c.lastActivatedTurn === b.turn ? c.lastActivationElement : null;
  const transmuted = !!(c.transmuted || c.element !== d.element);
  const colors = transmuted
    ? [c.element]
    : portions.length
      ? unique(portions.map((p) => p.element))
      : [cast || c.element];
  return {
    attunes,
    neighbors,
    providers,
    matching,
    pattern: d.effects.square ? squarePattern(b, c, i) : [],
    choices: attunementElements(b, c, i),
    portions,
    cast,
    transmuted,
    colors,
    bonus:
      matching.length *
      (d.effects.matchingDamage || d.effects.matchingShield || 0),
    bonusType: d.effects.matchingShield ? "block" : "damage",
  };
}
export function boardConnections(b) {
  const links = [];
  const add = (from, to, type, element, reason, owner = null, both = false) => {
    if (from === to || b.grid[from].at(-1)?.sever || b.grid[to].at(-1)?.sever)
      return;
    links.push({ from, to, type, element, reason, owner, both });
  };
  const live = (c, i) => cardAllowance(b, c, i) > 0 && !c.zeroWard;
  for (const [i, stack] of b.grid.entries()) {
    const c = stack.at(-1);
    if (!c) continue;
    const d = cards[c.id],
      m = cardInteraction(b, c, i),
      active = live(c, i);
    if (active)
      for (const j of m.providers)
        add(j, i, "attune", b.grid[j].at(-1).element, "Attunement choice");
    for (const j of m.matching)
      if (i < j) {
        const other = live(b.grid[j].at(-1), j);
        if (active || other)
          add(
            active ? j : i,
            active ? i : j,
            "synergy",
            null,
            "Matching card bonus",
            null,
            active && other,
          );
      }
    if (d.growth || (active && (d.effects.adj || d.effects.adjHeal)))
      for (const j of m.neighbors)
        add(
          j,
          i,
          "benefit",
          c.element,
          d.growth ? "Growth from neighbor" : "Adjacency bonus",
        );
    if (active && d.effects.row && !c.sever)
      for (const [j, other] of b.grid.entries())
        if (
          j !== i &&
          Math.floor(i / MIND_COLUMNS) === Math.floor(j / MIND_COLUMNS) &&
          other.at(-1)?.element === c.element
        )
          add(j, i, "benefit", c.element, "Same-element row damage");
    if (active && d.condition && !["corner", "isolated"].includes(d.condition))
      for (const j of m.neighbors)
        if (b.grid[j].at(-1).element === d.condition)
          add(j, i, "benefit", d.condition, "Activation requirement");
    if (d.keystone && corner(i))
      for (const [j, other] of b.grid.entries()) {
        const target = other.at(-1),
          def = cards[target?.id];
        if (
          target &&
          !def.singleUse &&
          def.limit > 0 &&
          live(target, j) &&
          (j % MIND_COLUMNS === i % MIND_COLUMNS ||
            Math.floor(j / MIND_COLUMNS) === Math.floor(i / MIND_COLUMNS))
        )
          add(i, j, "allowance", "Light", "+1 activation allowance");
      }
    if (!active || !m.pattern.length) continue;
    const [tl, tr, bl, br] = m.pattern;
    for (const [a, z] of [
      [tl, tr],
      [tl, bl],
      [tr, br],
      [bl, br],
    ])
      add(a, z, "pattern", null, "Fourfold 2×2 damage bonus", i, true);
    const opposite = m.pattern.find(
      (j) =>
        Math.floor(j / MIND_COLUMNS) !== Math.floor(i / MIND_COLUMNS) &&
        j % MIND_COLUMNS !== i % MIND_COLUMNS,
    );
    add(opposite, i, "pattern", null, "Fourfold opposite corner", i);
  }
  return links;
}
export function previewElement(ctx, i, element = null) {
  const slot = ctx.app.querySelector(`[data-slot="${i}"]`);
  if (!slot?.dataset.baseColors) return;
  const label = slot.querySelector(".element-label");
  slot.classList.toggle("element-preview", !!element);
  slot.style.setProperty(
    "--card-colors",
    element ? color(element) : slot.dataset.baseColors,
  );
  slot.style.setProperty(
    "--card-primary",
    element ? color(element) : slot.dataset.basePrimary,
  );
  if (label)
    label.textContent = element
      ? `Preview ${element}`
      : slot.dataset.baseElementLabel;
  if (element) slot.dataset.previewElement = element;
  else delete slot.dataset.previewElement;
}
export function inspectLinks(ctx, i = null) {
  for (const link of ctx.app.querySelectorAll(".board-link"))
    link.classList.toggle(
      "link-inspected",
      i != null &&
        (Number(link.dataset.from) === i ||
          Number(link.dataset.to) === i ||
          link.dataset.patternOwner === String(i)),
    );
}
function severBorder(slot) {
  const ns = "http://www.w3.org/2000/svg",
    w = slot.clientWidth,
    h = slot.clientHeight;
  const svg = document.createElementNS(ns, "svg");
  svg.classList.add("sever-border");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("aria-hidden", "true");
  const zigzag = (length, point) => {
    const count = Math.max(4, Math.round((length - 5) / 6));
    return Array.from({ length: count + 1 }, (_, n) =>
      point(2.5 + ((length - 5) * n) / count, n % 2 ? 5.5 : 2.5),
    );
  };
  for (const [edge, points] of [
    ["top", zigzag(w, (along, depth) => [along, depth])],
    ["bottom", zigzag(w, (along, depth) => [along, h - depth])],
    ["left", zigzag(h, (along, depth) => [depth, along])],
    ["right", zigzag(h, (along, depth) => [w - depth, along])],
  ]) {
    const d = points.map(([x, y], n) => `${n ? "L" : "M"}${x},${y}`).join(" ");
    for (const type of ["shadow", "cut"]) {
      const line = document.createElementNS(ns, "path");
      line.setAttribute("d", d);
      line.classList.add(`sever-${type}`);
      line.dataset.edge = edge;
      svg.append(line);
    }
  }
  slot.classList.add("severed-card");
  slot.setAttribute(
    "aria-label",
    slot.getAttribute("aria-label") +
      " · Severed: no adjacency or pattern connections",
  );
  slot.append(svg);
}

export function boardInteractions(ctx) {
  const b = ctx.o.battle,
    mind = ctx.app.querySelector(".mind");
  if (!mind) return;
  for (const [i, stack] of b.grid.entries()) {
    const c = stack.at(-1);
    if (!c) continue;
    const slot = ctx.app.querySelector(`[data-slot="${i}"]`),
      m = cardInteraction(b, c, i);
    slot.classList.add("has-element");
    if (c.sever) severBorder(slot);
    const statusCount = slot.querySelectorAll(".card-status").length;
    slot.style.setProperty(
      "--status-reserve",
      `${Math.min(statusCount, 3) * 18 + 4}px`,
    );
    slot.dataset.baseColors = gradient(m.colors);
    slot.dataset.basePrimary = color(m.colors[0]);
    slot.dataset.visualElements = m.colors.join(",");
    slot.style.setProperty("--card-colors", slot.dataset.baseColors);
    slot.style.setProperty("--card-primary", slot.dataset.basePrimary);
    const wash = document.createElement("span");
    wash.className = "element-wash";
    wash.setAttribute("aria-hidden", "true");
    slot.append(wash);
    const panel = document.createElement("div");
    panel.className = "card-element-panel";
    const label = document.createElement("span");
    label.className = "element-label";
    label.textContent = m.transmuted
      ? `${c.element} ↺`
      : m.portions.length
        ? "Shield block"
        : m.cast
          ? `Cast ${m.cast}`
          : m.attunes && m.choices.some((e) => e !== "Arcane")
            ? "Attune"
            : c.element;
    slot.dataset.baseElementLabel = label.textContent;
    label.dataset.tooltip = m.transmuted
      ? `Transmuted to ${c.element} for this placement. Existing Shield portions keep their original elements.`
      : m.portions.length
        ? "Active block retains its chosen element. It does not change the card's element for neighboring Attune."
        : m.cast
          ? `Last activation this turn: ${m.cast}. The card itself remains ${c.element}; next activation chooses anew.`
          : m.attunes
            ? `Next activation choices: ${m.choices.join(", ")}. Choose on activation; neighbors supply choices, not a permanent element change.`
            : `${c.element} card.`;
    panel.append(label);
    if (
      m.attunes &&
      !m.portions.length &&
      !m.cast &&
      m.choices.some((e) => e !== "Arcane")
    ) {
      const swatches = document.createElement("span");
      swatches.className = "attune-swatches";
      for (const element of m.choices) {
        const dot = document.createElement("span");
        dot.className = "attune-swatch";
        dot.style.setProperty("--swatch", color(element));
        dot.dataset.tooltip = `${element} available from an adjacent card`;
        dot.setAttribute("role", "img");
        dot.setAttribute("aria-label", `${element} attunement available`);
        swatches.append(dot);
      }
      panel.append(swatches);
    }
    if (m.portions.length) {
      const row = document.createElement("div");
      row.className = "shield-portions";
      for (const p of m.portions.slice(0, 2)) {
        const chip = document.createElement("span");
        chip.className = "shield-portion";
        chip.dataset.portion = p.uid;
        chip.dataset.element = p.element;
        chip.style.setProperty("--portion", color(p.element));
        chip.textContent = `${p.block} ${p.element}`;
        chip.dataset.tooltip = `${p.block} remaining ${p.element} block. This portion keeps its element until spent or the enemy phase ends.`;
        row.append(chip);
      }
      if (m.portions.length > 2) {
        const more = document.createElement("span");
        more.className = "shield-more";
        more.textContent = `+${m.portions.length - 2}`;
        more.dataset.tooltip = m.portions
          .slice(2)
          .map((p) => `${p.block} ${p.element} block`)
          .join(" · ");
        row.append(more);
      }
      panel.append(row);
    }
    slot.append(panel);
    if (m.pattern.length) {
      const badge = document.createElement("span");
      badge.className = "synergy-bonus pattern-bonus";
      badge.textContent = "2×2 · ×2";
      badge.dataset.tooltip =
        "Intact 2×2 block: double damage, already included below. All four exposed cards must be present and not Severed. One qualifying block is shown; multiple blocks do not multiply the bonus again.";
      slot.querySelector(".nums")?.append(badge);
    }
    if (m.bonus) {
      const bonus = document.createElement("span");
      bonus.className = "synergy-bonus";
      bonus.textContent = `↔ +${m.bonus}`;
      bonus.dataset.tooltip = `+${m.bonus} ${m.bonusType} per activation from ${m.matching.length} adjacent ${cards[c.id].name}${m.matching.length > 1 ? "s" : ""}. Already included in the activation value; existing Shield block does not change retroactively.`;
      bonus.setAttribute(
        "aria-label",
        `Adjacency bonus: ${m.bonus} ${m.bonusType}`,
      );
      slot.querySelector(".nums")?.append(bonus);
    }
    slot.addEventListener("pointerenter", () => inspectLinks(ctx, i));
    slot.addEventListener("pointerleave", () =>
      inspectLinks(
        ctx,
        ctx.app.querySelector(".target-source")
          ? Number(ctx.app.querySelector(".target-source").dataset.slot)
          : null,
      ),
    );
    slot.addEventListener("focusin", () => inspectLinks(ctx, i));
    slot.addEventListener("focusout", (e) => {
      if (!slot.contains(e.relatedTarget)) inspectLinks(ctx, null);
    });
  }
  const ns = "http://www.w3.org/2000/svg",
    svg = document.createElementNS(ns, "svg"),
    box = mind.getBoundingClientRect();
  svg.classList.add("board-links");
  svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  svg.setAttribute("aria-hidden", "true");
  const edge = (
    from,
    to,
    type,
    element,
    owner = null,
    both = false,
    reason = "",
  ) => {
    const a = ctx.app
        .querySelector(`[data-slot="${from}"]`)
        .getBoundingClientRect(),
      z = ctx.app.querySelector(`[data-slot="${to}"]`).getBoundingClientRect();
    const horizontal =
      Math.floor(from / MIND_COLUMNS) === Math.floor(to / MIND_COLUMNS);
    const diagonal = !horizontal && from % MIND_COLUMNS !== to % MIND_COLUMNS;
    const right = from % MIND_COLUMNS < to % MIND_COLUMNS;
    const forward = from < to;
    const x1 = diagonal
      ? right
        ? a.right - 5
        : a.left + 5
      : horizontal
        ? forward
          ? a.right - 13
          : a.left + 13
        : (a.left + a.right) / 2;
    const x2 = diagonal
      ? right
        ? z.left + 5
        : z.right - 5
      : horizontal
        ? forward
          ? z.left + 13
          : z.right - 13
        : (z.left + z.right) / 2;
    const y1 = diagonal
      ? forward
        ? a.bottom - 5
        : a.top + 5
      : horizontal
        ? a.top + a.height * 0.32
        : forward
          ? a.bottom - 3
          : a.top + 3;
    const y2 = diagonal
      ? forward
        ? z.top + 5
        : z.bottom - 5
      : horizontal
        ? z.top + z.height * 0.32
        : forward
          ? z.top + 3
          : z.bottom - 3;
    const link = document.createElementNS(ns, "g");
    link.classList.add("board-link", `link-${type}`);
    link.dataset.from = from;
    link.dataset.to = to;
    link.dataset.linkType = type;
    link.dataset.reason = reason;
    const distance =
      Math.abs(
        Math.floor(from / MIND_COLUMNS) - Math.floor(to / MIND_COLUMNS),
      ) + Math.abs((from % MIND_COLUMNS) - (to % MIND_COLUMNS));
    if (distance > 1 && !diagonal) link.classList.add("link-distant");
    const title = document.createElementNS(ns, "title");
    title.textContent = reason;
    link.append(title);
    if (owner != null) link.dataset.patternOwner = owner;
    if (diagonal) link.classList.add("link-diagonal");
    link.style.setProperty(
      "--link-color",
      type === "synergy" || type === "pattern"
        ? "#ffdf82"
        : color(element || "Arcane"),
    );
    const coords = {
      x1: x1 - box.left,
      y1: y1 - box.top,
      x2: x2 - box.left,
      y2: y2 - box.top,
    };
    const dx = coords.x2 - coords.x1,
      dy = coords.y2 - coords.y1;
    let curve = `M${coords.x1},${coords.y1} Q${(coords.x1 + coords.x2) / 2 - dy * 0.13},${(coords.y1 + coords.y2) / 2 + dx * 0.13} ${coords.x2},${coords.y2}`;
    // Long row/column auras run in the gutter and reveal on inspection.
    if (distance > 1 && !diagonal) {
      if (horizontal) {
        const gutter = a.top - box.top - 2;
        curve = `M${(a.left + a.right) / 2 - box.left},${a.top - box.top + 5} V${gutter} H${(z.left + z.right) / 2 - box.left} V${z.top - box.top + 5}`;
      } else {
        const gutter = a.left - box.left - 2;
        curve = `M${a.left - box.left + 5},${(a.top + a.bottom) / 2 - box.top} H${gutter} V${(z.top + z.bottom) / 2 - box.top} H${z.left - box.left + 5}`;
      }
    }
    for (const cls of [
      "link-rail",
      "link-glow",
      "link-core",
      "link-flow",
      ...(both ? ["link-flow link-flow-return"] : []),
    ]) {
      const path = document.createElementNS(ns, "path");
      path.setAttribute("class", cls);
      path.setAttribute("d", curve);
      path.setAttribute("pathLength", "100");
      link.append(path);
    }
    svg.append(link);
  };
  for (const connection of boardConnections(b)) {
    const { from, to, type, element, owner, both, reason } = connection;
    edge(from, to, type, element, owner, both, reason);
  }
  mind.append(svg);
}
