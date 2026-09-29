import { cards, glossary } from "./content.mjs";
import { attackElements, attackPreview } from "./combat-preview.mjs";
import { cardPower } from "./engine.mjs";
export function damageMarkup(b, c, slot) {
  return `Deal <b class="damage-value">${cardPower(b, c, slot)}${attackElements(b, c, slot).length > 1 ? " ×4" : ""}</b>`;
}
export function targetPreview(ctx, source, slot, actionFor) {
  const number = source?.querySelector(".damage-value");
  const normal = number?.textContent;
  let target = null;
  function clear() {
    if (number) {
      number.textContent = normal;
      number.classList.remove("damage-up", "damage-down");
      number.removeAttribute("data-tooltip");
    }
    ctx.app
      .querySelectorAll(".target-damage-preview")
      .forEach((el) => el.remove());
    target = null;
  }
  function show(choice) {
    const action = actionFor(choice);
    if (!action || !number) {
      clear();
      return;
    }
    if (target === choice) return;
    clear();
    const b = ctx.o.battle,
      c = b.grid[slot].at(-1);
    const enemy = b.enemies.find((e) => e.uid === action.target);
    if (!enemy) return;
    const v = attackPreview(b, c, slot, enemy, action.element);
    if (!v) return;
    target = choice;
    const tone = v.delta > 0 ? "damage-up" : v.delta < 0 ? "damage-down" : "";
    const label = `${v.damage}${v.delta ? ` (${v.delta > 0 ? "+" : ""}${v.delta})` : ""}`;
    const help = `${v.base} base → ${v.damage} ${v.elements.join("/")} card damage against ${enemy.name}. ${v.blocked} absorbed by Guard; ${v.hpLoss} HP lost.${v.negated ? " Flicker negates this activation." : ""} Equipment hits, covered-card effects and status damage resolve separately.`;
    number.textContent = label;
    if (tone) number.classList.add(tone);
    number.dataset.tooltip = help;
    const badge = document.createElement("div");
    badge.className = "target-damage-preview " + tone;
    badge.dataset.tooltip = help;
    badge.textContent = `${label} damage · ${v.hpLoss} HP`;
    choice.append(badge);
  }
  function leave(e) {
    if (target?.contains(e.target) && !target.contains(e.relatedTarget))
      clear();
  }
  return { show, clear, leave };
}
const icons = {
  Taunt:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
  Lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  Freeze: '<path d="M12 2v20M3 7l18 10M3 17L21 7M8 4l4 4 4-4M8 20l4-4 4 4"/>',
  Sever:
    '<path d="M9 4H6a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h3M15 10h3a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-3M14 3L9 12h6l-5 9"/>',
  Burn: '<path d="M13 2c2 7-3 6-1 11 2-1 3-3 3-5 5 4 6 13-3 14C3 21 2 15 6 9c0 4 2 4 3 3-2-4 2-6 4-10Z"/>',
  Poison:
    '<path d="M9 2h6M10 2v7L4 19q-1 3 3 3h10q4 0 3-3L14 9V2M7 15h10M10 18h1M14 19h1"/>',
  Corrode:
    '<path d="M8 2s-5 6-5 9a5 5 0 0 0 10 0c0-3-5-9-5-9ZM18 8s-3 4-3 6a3 3 0 0 0 6 0c0-2-3-6-3-6ZM2 22h5l2-3 3 3h10"/>',
  Depleted: '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM3 21 21 3"/>',
  Spent: '<circle cx="12" cy="12" r="9"/><path d="M6 12h12"/>',
  Used: '<path d="M5 2h14M5 22h14M7 2v5l10 10v5M17 2v5L7 17v5"/>',
};
export function statusBadges(ctx, c, i) {
  const d = cards[c.id],
    b = ctx.o.battle,
    states = [];
  if (c.taunt)
    states.push([
      "Taunt",
      "Taunt",
      glossary.Taunt +
        (c.tauntUntil != null ? " Ends after this enemy phase." : ""),
    ]);
  if (c.lock) states.push(["Lock", "Locked", glossary.Lock]);
  if (c.freeze >= b.turn) states.push(["Freeze", "Frozen", glossary.Freeze]);
  if (c.sever) states.push(["Sever", "Severed", glossary.Sever]);
  for (const name of ["Burn", "Poison", "Corrode"]) {
    const value = c.status?.[name.toLowerCase()] || 0;
    if (value) states.push([name, `${name} ${value}`, glossary[name], value]);
  }
  if (c.zeroWard)
    states.push([
      "Depleted",
      "Ward depleted",
      "This Ward has no defense remaining and cannot activate.",
    ]);
  else if (d.limit > 0 && !ctx.game.allowance(c, i))
    states.push(["Spent", "Spent", glossary.Spent]);
  else if (!d.blink && c.lastActivatedTurn === b.turn)
    states.push([
      "Used",
      "Used this turn",
      "This card has already activated this turn. It may activate again next player turn if allowance remains.",
    ]);
  return states.length
    ? `<div class="card-statuses">${states
        .map(
          ([key, label, help, value]) =>
            `<span class="card-status status-${key.toLowerCase()}" data-card-status="${key}" role="img" aria-label="${label}" data-tooltip="${ctx.esc(label + ": " + help)}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[key]}</svg>${value ? `<b>${value}</b>` : ""}</span>`,
        )
        .join("")}</div>`
    : "";
}
export function upgradeHelp(d) {
  const u = d.upgrade;
  if (!u) return "";
  const f = d.effects,
    n = u.bonus || 0,
    gains = [];
  if (f.damage) gains.push(`Damage ${f.damage} → ${f.damage + n}`);
  if (d.hp) gains.push(`Initial HP ${d.hp} → ${d.hp + n}`);
  if (f.shield) gains.push(`Shield ${f.shield} → ${f.shield + n}`);
  if (f.heal) gains.push(`Heal ${f.heal} → ${f.heal + n}`);
  for (const [key, label] of [
    ["burn", "Burn"],
    ["poison", "Poison"],
    ["corrode", "Corrode"],
    ["ward", "Ward gain"],
  ])
    if (f[key]) gains.push(`${label} ${f[key]} → ${f[key] + n}`);
  return [u.text, ...gains].join(" · ");
}

export function gridTelegraphs(ctx) {
  const warnings = new Map();
  const icon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2Z"/><path d="M12 9v5m0 3v1"/></svg>';
  for (const t of ctx.o.battle.telegraphs || []) {
    const rule =
      t.kind === "row"
        ? "Fullest row; ties choose the topmost row."
        : t.kind === "column"
          ? "Fullest column; ties choose the leftmost column."
          : t.target === "valuable"
            ? "Two most valuable complete stacks: sum printed Focus, then remaining activations, then reading order. Both targets are chosen before destruction."
            : "Tallest complete stack; ties choose the first occupied space in reading order.";
    const help = `${t.enemy} — ${t.name}: destroys ${t.cards} card${t.cards === 1 ? "" : "s"} on the upcoming enemy turn. ${rule} Covered cards count. Live preview: changes with your placements, Recalls and remaining activations.`;
    const enemy = ctx.app.querySelector(`[data-enemy-uid="${t.source}"] .info`);
    const label = document.createElement("div");
    label.className = "grid-threat-label";
    label.dataset.tooltip = help;
    label.innerHTML =
      icon +
      `<span>${t.cards ? `${t.cards} card${t.cards === 1 ? "" : "s"} threatened` : "No cards threatened"} · next enemy turn</span>`;
    enemy?.append(label);
    for (const i of t.spaces) {
      if (!warnings.has(i)) warnings.set(i, []);
      warnings
        .get(i)
        .push({ help, occupied: t.targets.includes(i), source: t.source });
    }
  }
  for (const [i, threats] of warnings) {
    const slot = ctx.app.querySelector(`[data-slot="${i}"]`);
    if (!slot) continue;
    slot.classList.add("grid-threat");
    slot.dataset.threatSources = threats.map((t) => t.source).join(",");
    const help = threats.map((t) => t.help).join(" ");
    slot.setAttribute(
      "aria-label",
      slot.getAttribute("aria-label") + ". Warning: " + help,
    );
    const outline = document.createElement("span");
    outline.className = "grid-threat-outline";
    outline.setAttribute("aria-hidden", "true");
    slot.append(outline);
    if (threats.some((t) => t.occupied)) {
      const badge = document.createElement("span");
      badge.className = "grid-threat-badge";
      badge.dataset.tooltip = help;
      badge.setAttribute("role", "img");
      badge.setAttribute("aria-label", "Destruction warning");
      badge.innerHTML = icon;
      slot.append(badge);
    }
  }
}
