import { cards, MIND_COLUMNS } from "./content.mjs";
import { attunementElements, gridNeighbors } from "./engine.mjs";
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
    providers,
    matching,
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
        (Number(link.dataset.from) === i || Number(link.dataset.to) === i),
    );
}
export function boardInteractions(ctx) {
  const b = ctx.o.battle,
    mind = ctx.app.querySelector(".mind");
  if (!mind) return;
  const models = new Map();
  for (const [i, stack] of b.grid.entries()) {
    const c = stack.at(-1);
    if (!c) continue;
    const slot = ctx.app.querySelector(`[data-slot="${i}"]`),
      m = cardInteraction(b, c, i);
    models.set(i, m);
    slot.classList.add("has-element");
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
    const ribbon = document.createElement("span");
    ribbon.className = "element-ribbon";
    ribbon.setAttribute("aria-hidden", "true");
    slot.append(ribbon);
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
  const edge = (from, to, type, element) => {
    const a = ctx.app
        .querySelector(`[data-slot="${from}"]`)
        .getBoundingClientRect(),
      z = ctx.app.querySelector(`[data-slot="${to}"]`).getBoundingClientRect();
    const horizontal =
      Math.floor(from / MIND_COLUMNS) === Math.floor(to / MIND_COLUMNS);
    const forward = from < to;
    const x1 = horizontal
      ? forward
        ? a.right
        : a.left
      : (a.left + a.right) / 2;
    const x2 = horizontal
      ? forward
        ? z.left
        : z.right
      : (z.left + z.right) / 2;
    const y1 = horizontal ? (a.top + a.bottom) / 2 : forward ? a.bottom : a.top;
    const y2 = horizontal ? (z.top + z.bottom) / 2 : forward ? z.top : z.bottom;
    const line = document.createElementNS(ns, "line");
    line.classList.add("board-link", `link-${type}`);
    line.dataset.from = from;
    line.dataset.to = to;
    line.dataset.linkType = type;
    for (const [k, v] of Object.entries({
      x1: x1 - box.left,
      y1: y1 - box.top,
      x2: x2 - box.left,
      y2: y2 - box.top,
    }))
      line.setAttribute(k, v);
    line.style.setProperty(
      "--link-color",
      type === "synergy" ? "var(--gold)" : color(element),
    );
    svg.append(line);
  };
  for (const [i, m] of models) {
    for (const j of m.matching) if (i < j) edge(i, j, "synergy");
    for (const j of m.providers) edge(j, i, "attune", b.grid[j].at(-1).element);
  }
  mind.append(svg);
}
