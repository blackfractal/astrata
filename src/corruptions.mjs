import { cards } from "./content.mjs";
import { CORRUPTIONS } from "./strata.mjs";
const top = (stack) => stack.at(-1);
const neighbors = (i) =>
  [i % 7 ? i - 1 : -1, i % 7 < 6 ? i + 1 : -1, i - 7, i + 7].filter(
    (j) => j >= 0 && j < 42,
  );
export function corruptionAt(b, i) {
  return b.corruptions?.[i] || null;
}
export function canMend(c, corruption) {
  return !!corruption && (c.upgrade || !CORRUPTIONS[corruption.kind].advanced);
}
export function canEnter(b, c, i) {
  const q = corruptionAt(b, i);
  if (top(b.grid[i])?.mending) return false;
  if (c.id === "elves") return !b.grid[i].length && canMend(c, q);
  return q?.kind !== "hole";
}
export function corruptionPower(b, i, power) {
  return neighbors(i).some(
    (j) => corruptionAt(b, j)?.kind === "nausea" && !b.grid[j].length,
  )
    ? Math.floor(power / 2)
    : power;
}
export function resetCoveredInsanity(b) {
  for (const [i, q] of Object.entries(b.corruptions || {}))
    if (q.kind === "insanity" && b.grid[i].length) q.value = 1;
}
export function prepareCorruption(g, e, t) {
  const b = g.s.battle;
  b.corruptions ||= {};
  const existing = Object.values(b.corruptions).filter(
    (q) => q.source === e.uid,
  ).length;
  let room = (e.corruptionCap || 1) - existing;
  e.corruptionPlan = [];
  const kinds = [
    ...Array(t.count || 1).fill(t.markCorruption),
    ...(t.alsoCorruption ? [t.alsoCorruption] : []),
  ];
  for (const kind of kinds) {
    if (room-- <= 0) break;
    let candidates = b.grid.flatMap((stack, i) => {
      if (b.corruptions[i] || e.corruptionPlan.some((p) => p.slot === i))
        return [];
      const c = top(stack),
        d = cards[c?.id],
        f = d?.effects;
      if (kind === "hole" && stack.length) return [];
      if (
        kind === "hypnosis" &&
        (!c ||
          g.allowance(c, i) <= 0 ||
          !(f.damage || f.hpDamage || f.shield || f.ward || f.randomDamage))
      )
        return [];
      return [i];
    });
    if (!candidates.length) continue;
    const score = (i) => {
      const c = top(b.grid[i]);
      if (kind === "hypnosis")
        return (
          g.cardPower(c, i) + (cards[c.id].effects.ward || g.shieldPower(c, i))
        );
      if (kind === "nausea" || kind === "hole")
        return (
          (c ? 0 : 10) + neighbors(i).filter((j) => b.grid[j].length).length
        );
      return c ? 0 : 1;
    };
    const best = Math.max(...candidates.map(score));
    candidates = candidates.filter((i) => score(i) === best);
    // Seeded, committed space. Never follow a recalled/moved card.
    const slot = g.pick(candidates);
    e.corruptionPlan.push({ slot, kind });
    g.log(
      e.name +
        " marks " +
        CORRUPTIONS[kind].name +
        " at row " +
        (Math.floor(slot / 7) + 1) +
        ", column " +
        ((slot % 7) + 1) +
        ". One player turn to respond.",
    );
    g.present("corruption", {
      slot,
      name: "Foretold: " + CORRUPTIONS[kind].name,
    });
  }
}
export function applyCorruptions(g, e) {
  const b = g.s.battle;
  for (const { slot, kind } of e.corruptionPlan || []) {
    if (b.corruptions[slot] || (kind === "hole" && b.grid[slot].length)) {
      g.log(CORRUPTIONS[kind].name + " fails at its committed space.");
      continue;
    }
    b.corruptions[slot] = {
      kind,
      uid: g.uid(),
      source: e.uid,
      value: 1,
      remaining: 3,
      createdTurn: b.turn,
    };
    g.log(CORRUPTIONS[kind].name + " corrupts a space.");
    g.present("corruption", { slot, name: CORRUPTIONS[kind].name });
  }
  e.corruptionPlan = [];
  resetCoveredInsanity(b);
}
export function startRepairs(g) {
  const b = g.s.battle;
  for (const [i, stack] of b.grid.entries()) {
    const c = top(stack),
      m = c?.mending;
    if (!m || m.due > b.turn || c.freeze >= b.turn) continue;
    const q = corruptionAt(b, i);
    if (m.slot !== i || (q && q.uid !== m.corruptionUid)) {
      delete c.mending;
      continue;
    }
    delete b.corruptions[i];
    stack.pop();
    b.discard.push({ id: c.id, uid: c.uid, upgrade: c.upgrade });
    (g.s.stats.repairs ||= []).push({
      stratum: g.s.stratum,
      turn: b.turn,
      slot: i,
      kind: m.kind,
      card: c.uid,
    });
    g.present("corruption", {
      slot: i,
      name: "Mended · Elves return to discard",
    });
    g.log(
      "Machine Elves mend " +
        CORRUPTIONS[m.kind].name +
        " and return to discard.",
    );
  }
  resetCoveredInsanity(b);
  for (const [i, q] of Object.entries(b.corruptions || {})) {
    if (q.kind !== "insanity" || b.grid[i].length) continue;
    const loss = Math.min(g.s.hp, q.value++);
    g.s.hp -= loss;
    g.s.stats.damageTaken += loss;
    g.present("hit", {
      target: "player",
      amount: loss,
      element: "Chaos",
      name: "Insanity",
    });
    g.log("Insanity: lose " + loss + " HP.");
    if (g.s.hp <= 0) {
      g.finish(false, "Insanity");
      return;
    }
  }
}
export function corruptionRound(g) {
  const b = g.s.battle;
  resetCoveredInsanity(b);
  for (const [key, q] of Object.entries(b.corruptions || {})) {
    const i = Number(key),
      c = top(b.grid[i]);
    if (q.kind === "mine" && q.createdTurn < b.turn && --q.remaining <= 0) {
      delete b.corruptions[i];
      g.present("corruption", { slot: i, name: "Mind Mine detonates" });
      if (c) {
        g.destroyCard(i, c.uid);
        g.log("Mind Mine destroys its cover.");
      } else
        b.jobs.unshift({
          kind: "hit",
          name: "Mind Mine",
          damage: 18,
          element: "Arcane",
          gridSourceSlot: i,
          source: q.source,
        });
    }
    if (
      q.kind !== "hypnosis" ||
      !c ||
      !g.activationAvailable(c, i) ||
      !g.condition(c, i)
    )
      continue;
    const d = cards[c.id],
      f = d.effects,
      source = b.enemies.find((e) => e.uid === q.source && e.hp > 0);
    if (
      !source ||
      !(f.damage || f.hpDamage || f.randomDamage || f.shield || f.ward)
    )
      continue;
    c.used++;
    c.lastActivatedTurn = b.turn;
    g.present("corruption", { slot: i, name: "Hypnosis · " + d.name });
    if (d.charge && c.charge < d.charge) {
      c.charge = Math.min(d.charge, c.charge + 1);
      continue;
    }
    if (d.charge) c.charge = 0;
    const damage = f.randomDamage
      ? corruptionPower(b, i, 1 + Math.floor(g.rand() * f.randomDamage))
      : g.cardPower(c, i);
    if (damage)
      b.jobs.unshift({
        kind: "hit",
        name: "Hypnosis · " + d.name,
        damage,
        element: c.lastActivationElement || c.element,
        source: q.source,
        gridSourceSlot: i,
      });
    if (f.shield || f.ward)
      source.guard += f.shield
        ? g.shieldPower(c, i)
        : corruptionPower(
            b,
            i,
            f.ward + (c.upgrade ? d.upgrade?.bonus || 0 : 0),
          );
    if (d.destroyAfterActivation) g.destroyCard(i, c.uid);
  }
}
