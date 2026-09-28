import { cards } from "./content.mjs";
import { cardPower, gridNeighbors, enemyDamage } from "./engine.mjs";
export function attackElements(b, c, i, element = c.element) {
  const cycle = ["Fire", "Earth", "Wind", "Water"];
  return cards[c.id].effects.prism &&
    cycle.every((el) =>
      gridNeighbors(b, i).some((j) => b.grid[j].at(-1).element === el),
    )
    ? cycle
    : [element];
}
// A read-only preview of this card's direct hits; gear and secondary effects are separate.
export function attackPreview(b, c, i, enemy, element = c.element) {
  const d = cards[c.id],
    f = d.effects;
  if (
    !(f.damage || f.hpDamage) ||
    f.randomDamage ||
    d.stack === "pile" ||
    (d.charge && c.charge + 1 < d.charge)
  )
    return null;
  const power = cardPower(b, c, i),
    elements = attackElements(b, c, i, element);
  const base = power * elements.length;
  const damage = enemy.flicker
    ? 0
    : elements.reduce((sum, el) => sum + enemyDamage(power, el, enemy), 0);
  const blocked = Math.min(damage, enemy.guard || 0);
  return {
    base,
    damage,
    blocked,
    hpLoss: Math.min(enemy.hp, damage - blocked),
    delta: damage - base,
    elements,
    negated: !!enemy.flicker,
  };
}
