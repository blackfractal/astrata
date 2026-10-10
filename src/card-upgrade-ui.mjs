import { corruptionPower } from "./corruptions.mjs";
import { cards } from "./content.mjs";
import {
  cardPower,
  plasmaContributions,
  cardEffects,
  insightGain,
  matchingNeighbors,
  gridNeighbors,
} from "./engine.mjs";
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function upgradeBadge(c) {
  return c.upgrade
    ? `<span class="upgrade-badge" role="img" aria-label="Upgraded card" data-tooltip="Upgraded card. Inspect for the full upgrade effect."><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z"/></svg></span>`
    : "";
}
export function statBreakdowns(b, c, slot, shieldGear = 0) {
  const d = cards[c.id],
    f = cardEffects(c),
    up = c.upgrade ? d.upgrade?.bonus || 0 : 0;
  const live =
    b && Number.isInteger(slot) && b.grid[slot]?.some((x) => x.uid === c.uid);
  const rows = [];
  function row(label, base, upgrade, connections, total, equipment = 0) {
    const parts = [
      `${base} ${f.hpDamage && label === "Damage" ? "current HP" : "base"}`,
    ];
    if (upgrade) parts.push(`${upgrade} upgrade`);
    if (connections)
      parts.push(
        `${connections} ${label === "Shield" ? "adjacent Shield / Conduit" : "placement / synergy"}`,
      );
    if (equipment) parts.push(`${equipment} equipment on activation`);
    const sick =
      live &&
      ["Damage", "Shield", "Ward gain"].includes(label) &&
      corruptionPower(b, slot, 4) < 4;
    if (sick) total = corruptionPower(b, slot, total);
    rows.push({
      label,
      text: `${parts.join(" + ")}${sick ? " → Nausea ×½, rounded down" : ""} = ${total} ${label.toLowerCase()}.`,
    });
  }
  if (c.id === "plasma" && live) {
    const parts = plasmaContributions(b, c, slot);
    rows.push({
      label: "Damage",
      text: `${parts.join(" + ")} diminishing Plasma damage${corruptionPower(b, slot, 4) < 4 ? " → Nausea ×½, rounded down" : ""} = ${cardPower(b, c, slot)} damage. One random target; host element applies to the combined attack.`,
    });
  } else if (f.damage || f.hpDamage) {
    const base = f.hpDamage ? (c.hp ?? d.hp) : d.effects.damage || 0,
      bonus = f.damage ? up + f.damage - (d.effects.damage || 0) : 0;
    const total = live
      ? cardPower({ ...b, corruptions: {} }, c, slot)
      : base + bonus;
    row("Damage", base, bonus, total - base - bonus, total);
  }
  if (f.shield) {
    const adjacent = live
      ? (f.matchingShield || 0) * matchingNeighbors(b, c, slot)
      : 0;
    const gear = live && d.name.includes("Shield") ? shieldGear : 0;
    row(
      "Shield",
      f.shield,
      up,
      adjacent,
      f.shield + up + adjacent + gear,
      gear,
    );
  }
  for (const [key, label] of [
    ["ward", "Ward gain"],
    ["heal", "Heal"],
    ["burn", "Burn"],
    ["poison", "Poison"],
    ["corrode", "Corrode"],
  ])
    if (f[key]) {
      const adjacent =
        live && key === "heal"
          ? (f.adjHeal || 0) * gridNeighbors(b, slot).length
          : 0;
      row(label, f[key], up, adjacent, f[key] + up + adjacent);
    }
  if (f.insight || f.adjInsight) {
    const neighbors = live ? insightGain(b, c, slot) - (f.insight || 0) : 0;
    row(
      "Insight next turn",
      f.insight || 0,
      0,
      neighbors,
      (f.insight || 0) + neighbors,
    );
  }
  return rows;
}
export function statHelp(b, c, slot, shieldGear = 0) {
  const rows = statBreakdowns(b, c, slot, shieldGear);
  return (
    rows.map((x) => x.text).join(" ") +
    (rows.some((x) => ["Damage", "Shield"].includes(x.label))
      ? " Before elemental matchups; equipment attacks resolve separately."
      : "")
  );
}
export const statAttribute = (s) => esc(s);
