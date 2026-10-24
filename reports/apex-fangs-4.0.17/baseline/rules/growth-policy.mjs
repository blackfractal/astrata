import { cards } from "./content.mjs";
import { formationReady, formationSlots, diagonals } from "./growth-rules.mjs";
import { enemyDamage, hasDirectDamageActivation, adjacent } from "./engine.mjs";
// Small feature adjustments; all actions still come from the authoritative legal list.
export function growthScore(o, a) {
  const b = o.battle;
  if (!b) return 0;
  const d = cards[a.effects.card],
    f = a.effects;
  if (a.type === "placeStrike") {
    const e = [...b.enemies, ...(b.ideons || [])].find(
      (e) => e.uid === a.target,
    );
    const n = enemyDamage(f.damage, f.element, e);
    return Math.min(e.hp, n) + (n >= e.hp ? 12 : 0) - a.costs.focus * 2;
  }
  if (a.type === "place" && d?.expansion === "growth") {
    let n = 0;
    if(d.effects.forked || d.effects.ivy){
      const targets=(b.ideons||[]).filter(e=>e.hp>0&&adjacent(a.slot).includes(e.slot));
      const edgeShot=d.effects.forked&&a.slot%7===6&&b.enemies.some(e=>!e.hive);
      n+=targets.length?12+targets.length*3:edgeShot?10:-22;
    }
    if (d.formation) {
      const copy = {
        ...b,
        grid: b.grid.map((s, i) =>
          i === a.slot ? [{ id: d.id, element: d.element }] : s,
        ),
      };
      const slots = formationSlots(copy, { id: d.id }, a.slot),
        filled = slots.filter((i) => copy.grid[i]?.length).length;
      n += formationReady(copy, { id: d.id }, a.slot) ? 14 : -28 + filled * 4;
    }
    if (d.diagonalAttune)
      n += diagonals(a.slot).filter((i) => b.grid[i].length).length * 4;
    if (d.effects.borrowInsight)
      n +=
        b.grid.filter(
          (s) => s.length && s.at(-1).used < cards[s.at(-1).id].limit,
        ).length > 2
          ? 5
          : -8;
    if (d.effects.ashesBuff)
      n +=
        Math.min(6, b.destroyed.length) *
          adjacent(a.slot).filter(
            (i) =>
              b.grid[i].length && hasDirectDamageActivation(b.grid[i].at(-1)),
          ).length -
        10;
    if (d.id === "memoryAcorn") n -= 4; // Taking it out of Draw gives up its passive Insight.
    return n;
  }
  if (a.type !== "activate") return 0;
  let n = 0;
  if (f.borrowInsight) n -= 8;
  if (f.loseFocus) n -= b.turn < 5 ? 24 : 12;
  if (f.spendFocus) n -= f.spendFocus;
  if (f.focusSpend) n -= f.focusSpend * 1.2;
  if (f.bodyGuard)
    n += Math.min(
      f.bodyGuard,
      b.enemies.reduce((sum, e) => sum + (e.tell?.damage || 0), 0),
    );
  if (f.ashesBuff)
    n +=
      Math.min(6, b.destroyed.length) *
      adjacent(a.slot).filter((i) => {
        const c = b.grid[i].at(-1);
        return (
          c &&
          hasDirectDamageActivation(c) &&
          c.lastActivatedTurn !== b.turn &&
          c.used < cards[c.id].limit
        );
      }).length;
  if (f.fracture) {
    const target = [...b.enemies, ...(b.ideons || [])].find(
      (e) => e.uid === a.target,
    );
    n += target.chaosFracture
      ? -15
      : b.grid.some(
            (s) =>
              s.at(-1)?.element === "Chaos" &&
              hasDirectDamageActivation(s.at(-1)),
          )
        ? 6
        : -4;
  }
  if (a.secondaryElement) {
    const target = [...b.enemies, ...(b.ideons || [])].find(
      (e) => e.uid === a.target,
    );
    n += target ? enemyDamage(f.damage, a.secondaryElement, target) : 0;
  }
  if (f.route)
    n +=
      f.route.reduce((sum, p) => {
        const e = [...b.enemies, ...(b.ideons || [])].find(
          (e) => e.uid === p.uid,
        );
        return sum + Math.min(e.hp, enemyDamage(p.damage, a.element, e));
      }, 0) - f.damage;
  return n;
}
