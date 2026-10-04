import { cards, enemies } from "./content.mjs";
import { compelCard } from "./corruptions.mjs";

const top = (stack) => stack.at(-1);
const order = (a, b) => (a % 7) - (b % 7) || a - b;

// Bile has a separate space layer: it can crawl across Nausea or Hypnosis.
export function bilePlan(g, e) {
  const b = g.s.battle;
  const active = Object.keys(b.biles || {})
    .map(Number)
    .filter((i) => b.biles[i].source === e.uid)
    .sort(order);
  const edge = active.find((i) => i % 7 === 0);
  if (edge != null) return { from: edge, to: "player" };
  const eligible = (i) =>
    i >= 0 &&
    i < 42 &&
    !b.biles?.[i] &&
    top(b.grid[i]) &&
    g.allowance(top(b.grid[i]), i) > 0;
  for (const from of active) {
    const row = Math.floor(from / 7),
      col = from % 7;
    const next = [
      ...(row > 0 ? [from - 7, ...(col > 0 ? [from - 8] : [])] : []),
      ...(row < 5 ? [from + 7, ...(col > 0 ? [from + 6] : [])] : []),
    ]
      .filter(eligible)
      .sort(order);
    if (next.length) return { from, to: next[0] };
  }
  const fresh = b.grid
    .map((_, i) => i)
    .filter(eligible)
    .sort((a, z) => (z % 7) - (a % 7) || a - z);
  return fresh.length ? { from: null, to: fresh[0] } : null;
}

export function phasePlan(b, e, axis) {
  if (e.phasePlan?.cycle === e.cycle && e.phasePlan.axis === axis)
    return e.phasePlan;
  const count = axis === "H" ? 6 : 7;
  const totals = Array.from({ length: count }, (_, line) =>
    b.grid.reduce(
      (n, stack, i) =>
        n +
        ((axis === "H" ? Math.floor(i / 7) : i % 7) === line
          ? stack.length
          : 0),
      0,
    ),
  );
  return { cycle: e.cycle, axis, line: totals.indexOf(Math.max(...totals)) };
}

export function phaseMoves(b, plan) {
  if (!plan) return [];
  return b.grid.flatMap((stack, from) => {
    if ((plan.axis === "H" ? Math.floor(from / 7) : from % 7) !== plan.line)
      return [];
    const to =
      plan.axis === "H"
        ? Math.floor(from / 7) * 7 + (((from % 7) + 2) % 7)
        : ((Math.floor(from / 7) + 2) % 6) * 7 + (from % 7);
    return [{ from, to, occupied: stack.length > 0 }];
  });
}

export function refreshBossPlans(g) {
  const b = g.s.battle;
  if (!b) return;
  for (const e of b.enemies.filter((x) => x.hp > 0)) {
    if (enemies[e.id].bile) e.bilePlan = bilePlan(g, e);
    const move =
      enemies[e.id].rotation[e.cycle % enemies[e.id].rotation.length];
    if (move.disrupt && !e.purifyPending)
      e.phasePlan = phasePlan(b, e, move.disrupt);
  }
}

export function resolveBile(g, e) {
  const b = g.s.battle,
    p = bilePlan(g, e);
  if (!p) return;
  b.biles ||= {};
  const old = p.from == null ? null : b.biles[p.from];
  if (p.from != null) delete b.biles[p.from];
  g.present("bileMove", {
    source: e.uid,
    from: p.from,
    to: p.to,
    name: "Bile",
  });
  if (p.to === "player") {
    g.applyFriendlyStatus("poison", 2, {
      source: e.uid,
      gridSourceSlot: p.from,
    });
    g.log("Bile reaches you: Poison +2. That glob disappears.");
    return;
  }
  const c = top(b.grid[p.to]);
  c.used++;
  g.present("status", {
    target: "card",
    slot: p.to,
    name: "Bile · −1 activation",
  });
  if (c.id === "elves") {
    g.log(
      "Machine Elves intercept Bile, spending one activation and removing it.",
    );
    (g.s.stats.repairs ||= []).push({
      stratum: g.s.stratum,
      turn: b.turn,
      slot: p.to,
      kind: "bile",
      card: c.uid,
    });
    if (g.allowance(c, p.to) === 0 && !c.mending) {
      b.grid[p.to].pop();
      b.discard.push({ id: c.id, uid: c.uid, upgrade: c.upgrade });
    }
  } else {
    b.biles[p.to] = old || { kind: "bile", uid: g.uid(), source: e.uid };
    g.log(
      "Bile arrives at row " +
        (Math.floor(p.to / 7) + 1) +
        ", column " +
        ((p.to % 7) + 1) +
        "; " +
        cards[c.id].name +
        " loses one activation.",
    );
  }
}

export function disrupt(g, e, plan) {
  const b = g.s.battle,
    moves = phaseMoves(b, plan);
  const stacks = moves.map((m) => ({ ...m, stack: b.grid[m.from] }));
  g.present("phaseShift", {
    source: e.uid,
    axis: plan.axis,
    name: "Phase disruption " + plan.axis,
    moves: stacks
      .filter((m) => m.stack.length)
      .map(({ from, to }) => ({ from, to })),
  });
  for (const m of stacks) b.grid[m.from] = [];
  for (const m of stacks) b.grid[m.to] = m.stack;
  // Activated Shield pools travel with their owners, never remain at old slots.
  for (const shield of b.shields) {
    const m = stacks.find((m) => m.stack.some((c) => c.uid === shield.owner));
    if (m) shield.slot = m.to;
  }
  const destroyed = new Set();
  for (const { to, stack } of stacks) {
    if (!stack.length) continue;
    const q = b.corruptions?.[to];
    if (q?.kind === "hole") {
      g.present("corruption", {
        slot: to,
        name: "Memory Hole · entire stack destroyed",
      });
      for (const c of [...stack]) {
        destroyed.add(c.uid);
        g.destroyCard(to, c.uid);
      }
    } else if (q?.kind === "hypnosis") compelCard(g, to, q, true);
  }
  b.shields = b.shields.filter((s) => !destroyed.has(s.owner));
  g.log(
    "Phase disruption " +
      plan.axis +
      ": whole stacks wrap two spaces; Corruptions stay fixed.",
  );
}

export function antiElement(g) {
  const b = g.s.battle,
    totals = {};
  const add = (element, value) => {
    if (element && element !== "Arcane" && value > 0)
      totals[element] = (totals[element] || 0) + value;
  };
  for (const shield of b.shields) {
    if (top(b.grid[shield.slot] || [])?.uid === shield.owner)
      add(shield.element, shield.block);
  }
  for (const { c } of g.activeWards()) add(c.element, c.ward);
  // Equipment refills when Enemy begins; preview that same available pool.
  if (b.phase === "enemy") {
    for (const item of b.bracelets) add(item.element, item.block);
  } else {
    for (const item of g.equipped())
      add(item.element, item.definition.effect.block || 0);
  }
  const armor = g.equipped().find((x) => x.slot === "torso");
  if (armor)
    add(armor.element, b.phase === "enemy" ? b.armorBlock : g.armorCapacity());
  const values = Object.entries(totals).sort((a, z) => z[1] - a[1]);
  if (!values.length || values[0][1] === values[1]?.[1])
    return { element: "Arcane", totals };
  const counters = {
    Fire: "Water",
    Water: "Wind",
    Wind: "Earth",
    Earth: "Fire",
    Light: "Chaos",
    Chaos: "Light",
  };
  return { element: counters[values[0][0]] || "Arcane", totals };
}
