import { protectedOwner, ideonActivationReason } from "./ideons.mjs";
import {
  cards,
  enemies,
  MIND_COLUMNS as W,
  MIND_ROWS as H,
} from "./content.mjs";
import { cardSevered, corruptionPower } from "./corruptions.mjs";
import {
  adjacent,
  attunementSourceElement,
  gridNeighbors,
  hasDirectDamageActivation,
} from "./engine.mjs";
const top = (s) => s?.at(-1);
export const destroyedCount = (b) => (b.destroyed || []).length;
export const acornIn = (b, pile) =>
  (b[pile] || []).some((c) => c.id === "memoryAcorn");
export function diagonals(i) {
  const x = i % W,
    y = Math.floor(i / W);
  return [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].flatMap(([dx, dy]) =>
    x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H
      ? [(y + dy) * W + x + dx]
      : [],
  );
}
export function sourceSlots(b, c, i) {
  const candidates = cards[c.id].diagonalAttune ? diagonals(i) : adjacent(i);
  return cardSevered(b, c, i)
    ? []
    : candidates.filter(
        (j) => top(b.grid[j]) && !cardSevered(b, top(b.grid[j]), j),
      );
}
export function formationSlots(b, c, i) {
  const form = cards[c.id].formation,
    x = i % W,
    y = Math.floor(i / W);
  if (form === "row") return Array.from({ length: W }, (_, k) => y * W + k);
  if (form === "column") return Array.from({ length: H }, (_, k) => k * W + x);
  return form === "horizontal"
    ? [i - 1, i + 1]
    : form === "vertical"
      ? [i - W, i + W]
      : [];
}
export function formationReady(b, c, i) {
  const form = cards[c.id].formation;
  if (!form) return true;
  if (cardSevered(b, c, i)) return false;
  const player = (j) =>
    j >= 0 &&
    j < W * H &&
    top(b.grid[j]) &&
    !cardSevered(b, top(b.grid[j]), j) &&
    !(b.ideons || []).some((e) => e.hp > 0 && e.slot === j);
  if (["row", "column"].includes(form))
    return formationSlots(b, c, i).every(player);
  if (adjacent(i).length !== 4) return false;
  const filled = formationSlots(b, c, i),
    empty = adjacent(i).filter((j) => !filled.includes(j));
  return (
    filled.every(player) &&
    empty.every(
      (j) =>
        !b.grid[j].length &&
        !(b.ideons || []).some((e) => e.hp > 0 && e.slot === j),
    )
  );
}
export function ashesBonus(b, c, i) {
  if (!hasDirectDamageActivation(c)) return 0;
  return Math.max(
    0,
    ...gridNeighbors(b, i).map((j) => {
      const p = top(b.grid[j]);
      return p.ashesUntil === b.turn ? p.ashesPower || 0 : 0;
    }),
  );
}
export function growthDamage(b, c, i, n) {
  const f = cards[c.id].effects;
  if (f.diagonalDamage) n += sourceSlots(b, c, i).length * f.diagonalDamage;
  return n + ashesBonus(b, c, i);
}
export function growthGuard(b, c, i) {
  const f = cards[c.id].effects;
  return (
    (f.shield || 0) +
    (c.upgrade ? cards[c.id].upgrade?.bonus || 0 : 0) +
    (f.revealGuard || 0) * Math.min(10, b.revealedCount ?? b.revealInsight ?? 0)
  );
}
export function wardGain(b, c, i) {
  const f = cards[c.id].effects;
  return corruptionPower(
    b,
    i,
    (f.ward || 0) +
      (c.upgrade ? cards[c.id].upgrade?.bonus || 0 : 0) +
      (f.destroyedWard || 0) * Math.min(8, destroyedCount(b)),
  );
}
export function recurringFocus(g) {
  return (
    g.bonuses().focus +
    (g.s.battle.permanent.focus || 0) +
    (acornIn(g.s.battle, "destroyed") ? 1 : 0)
  );
}
export function projectedInsight(g) {
  const b = g.s.battle;
  return Math.max(
    1,
    g.bonuses().insight +
      (b.next.insight || 0) +
      (acornIn(b, "deck") ? 1 : 0) -
      (b.discard.some((c) => c.id === "fog") ? 1 : 0),
  );
}
export function growthReason(g, c, i) {
  const b = g.s.battle,
    f = cards[c.id].effects;
  if (!formationReady(b, c, i))
    return "Required formation is incomplete or disconnected";
  if (f.spendFocus && b.focus < f.spendFocus)
    return `Needs ${f.spendFocus} remaining Focus`;
  if (f.loseFocus && recurringFocus(g) <= f.loseFocus)
    return "Must retain at least 1 recurring Focus";
  if (f.borrowInsight && projectedInsight(g) < f.borrowInsight + 1)
    return `Needs ${f.borrowInsight + 1} projected Insight next turn (currently ${projectedInsight(g)})`;
  return null;
}
export function braidedElements(b, c, i) {
  if (c.transmuted || c.element !== cards[c.id].element) return [c.element];
  const els = [
    ...new Set(
      sourceSlots(b, c, i)
        .map((j) => attunementSourceElement(b, top(b.grid[j])))
        .filter((el) => el !== "Arcane"),
    ),
  ];
  return els.length ? els : ["Arcane"];
}
export function forkedRoute(b, slot, target, mainTarget = null) {
  const ideons = (b.ideons || []).filter((e) => e.hp > 0),
    mains = b.enemies.filter((e) => e.hp > 0);
  const first = ideons.find((e) => e.uid === target);
  if (!first)
    return slot % W === W - 1 && mains.some((e) => e.uid === target)
      ? [target]
      : [];
  if (!adjacent(slot).includes(first.slot)) return [];
  function walk(e) {
    const next = ideons
      .filter(
        (z) =>
          z.slot % W === (e.slot % W) + 1 &&
          Math.abs(Math.floor(z.slot / W) - Math.floor(e.slot / W)) <= 1,
      )
      .sort((a, z) => a.slot - z.slot || a.uid - z.uid);
    const paths = next.map((z) => [e, ...walk(z)]);
    paths.push([e]);
    paths.sort(
      (a, z) =>
        Number(z.at(-1).slot % W === W - 1) -
          Number(a.at(-1).slot % W === W - 1) ||
        z.length - a.length ||
        (a.find((x,k)=>x.slot!==z[k]?.slot)?.slot ?? 0) -
          (z.find((x,k)=>x.slot!==a[k]?.slot)?.slot ?? 0),
    );
    return paths[0];
  }
  const route = walk(first),
    ids = route.map((e) => e.uid);
  if (
    route.at(-1).slot % W === W - 1 &&
    mains.some((e) => e.uid === mainTarget)
  )
    ids.push(mainTarget);
  return ids;
}
export function forkedShares(b, route) {
  if (!route.length) return [];
  const count = route.filter((uid) =>
      (b.ideons || []).some((e) => e.uid === uid),
    ).length,
    pool = Math.min(80, 40 + count * 8),
    share = Math.floor(pool / route.length),
    remainder = pool % route.length;
  return route.map((uid, i) => ({
    uid,
    damage: share + (i < remainder ? 1 : 0),
  }));
}
export function growthTarget(b, c, i, e) {
  const f = cards[c.id].effects;
  if (f.fracture) return enemies[e.id]?.tier !== "Archon";
  if (f.mainTarget) return !e.ideon;
  if (f.ivy) return e.ideon && adjacent(i).includes(e.slot);
  if (f.forked) return e.ideon ? adjacent(i).includes(e.slot) : i % W === W - 1;
  return true;
}
export function growthVariants(b, c, i, element, target, ex) {
  const f = cards[c.id].effects;
  if (f.focusDamage)
    return Array.from(
      { length: Math.min(3, b.focus) + 1 },
      (_, focusSpend) => ({ ...ex, focusSpend }),
    );
  if (f.braided) {
    const els = braidedElements(b, c, i);
    if (!els.includes(element)) return [];
    return [
      null,
      ...els.filter(
        (el) =>
          el !== element && el !== "Arcane" && !ideonActivationReason(b, i, el),
      ),
    ].map((secondaryElement) => ({ ...ex, secondaryElement }));
  }
  if (f.forked) {
    const route = forkedRoute(b, i, target);
    if (!route.length) return [];
    const last = (b.ideons || []).find((e) => e.uid === route.at(-1));
    const mains =
      last?.slot % W === W - 1
        ? b.enemies
            .filter((e) => e.hp > 0 && !protectedOwner(b, e.uid))
            .map((e) => e.uid)
        : [];
    return (mains.length ? mains : [null]).map((mainTarget) => ({
      ...ex,
      mainTarget,
    }));
  }
  return [ex];
}
export function growthActionEffects(b, c, i, target, ex) {
  const f = cards[c.id].effects;
  return {
    ...(f.focusDamage ? { focusSpend: ex.focusSpend } : {}),
    ...(f.forked
      ? { route: forkedShares(b, forkedRoute(b, i, target, ex.mainTarget)) }
      : {}),
    ...(f.braided ? { secondaryElement: ex.secondaryElement } : {}),
    ...(f.seasonGuard
      ? {
          shield:
            c.previousActivationElement &&
            c.previousActivationElement !== ex.element
              ? corruptionPower(b, i, f.seasonGuard)
              : 0,
        }
      : {}),
  };
}
