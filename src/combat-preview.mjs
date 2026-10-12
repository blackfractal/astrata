import { protectedOwner } from "./ideons.mjs";
import { cards } from "./content.mjs";
import {
  cardPower,
  cardEffects,
  gridNeighbors,
  enemyDamage,
  attunementSourceElement,
} from "./engine.mjs";
export function attackElements(b, c, i, element = c.element) {
  if (cards[c.id].effects.concord)
    return [
      ...new Set(
        gridNeighbors(b, i)
          .map((j) => attunementSourceElement(b, b.grid[j].at(-1)))
          .filter((el) => el !== "Arcane"),
      ),
    ].slice(0, 4);
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
    f = cardEffects(c);
  if (
    !(f.damage || f.hpDamage || f.guide) ||
    f.randomDamage ||
    d.stack === "plasmaMeld" ||
    (d.charge && c.charge < d.charge)
  )
    return null;
  const power =
      (f.guide
        ? 5 + (c.upgrade ? d.upgrade?.bonus || 0 : 0)
        : cardPower(b, c, i)) * (f.ideonDouble && enemy.ideon ? 2 : 1),
    elements = attackElements(b, c, i, element);
  const base = power * elements.length;
  const damage =
    enemy.flicker || (!enemy.ideon && protectedOwner(b, enemy.uid))
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
