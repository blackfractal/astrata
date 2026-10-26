import {braceletForecast} from './supplies.mjs';
import { cards, enemies } from "./content.mjs";
import { compelCard } from "./corruptions.mjs";

const top = (stack) => stack.at(-1);
const order = (a, b) => (a % 7) - (b % 7) || a - b;

// Bile has a separate space layer: it can crawl across Nausea or Hypnosis.
function bileRoute(g, e) {
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
  return fresh.length
    ? {
        from: null,
        to: fresh[0],
        ...(e.cycle >= 4 && fresh.length > 1
          ? { additional: [fresh[1]] }
          : {}),
      }
    : null;
}

// Independent offensive pressure: ordinary routing never suppresses these throws.
export function bilePlan(g, e) {
  const route = bileRoute(g, e);
  if (!route) return null;
  const b = g.s.battle;
  const reserved = new Set([route.to, ...(route.additional || [])]);
  const targeted = b.grid.map((stack, slot) => ({slot, c:top(stack)}))
    .filter(({slot,c}) => c && !b.biles?.[slot] && !reserved.has(slot) &&
      g.allowance(c, slot) > 0 && g.cardPower(c, slot) > 0)
    .sort((a,z) => g.cardPower(z.c,z.slot)-g.cardPower(a.c,a.slot) ||
      (z.slot%7)-(a.slot%7) || a.slot-z.slot)
    .slice(0, e.cycle >= 4 ? 2 : 1).map(x=>x.slot);
  return {...route, ...(targeted.length ? {targeted} : {})};
}

export function bileMoves(plan) {
  return plan ? [
    {from:plan.from, to:plan.to},
    ...(plan.additional || []).map(to=>({from:null,to})),
    ...(plan.targeted || []).map(to=>({from:null,to,targeted:true})),
  ] : [];
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
  const line = totals.indexOf(Math.max(...totals));
  return {cycle:e.cycle,axis,line,shifts:[
    {line:(line+count-1)%count,distance:1},
    {line,distance:2},
    {line:(line+1)%count,distance:3},
  ]};
}

function phaseShifts(plan) {
  // Published older single/two-line warnings retain their exact scope on Continue.
  return plan.shifts || (plan.lines || [plan.line]).map(line=>({line,distance:2}));
}
export function phaseMoves(b, plan, step = null) {
  if (!plan) return [];
  return b.grid.flatMap((stack, from) => {
    const line=plan.axis === "H" ? Math.floor(from/7) : from%7;
    const shift=phaseShifts(plan).find(s=>s.line===line);
    if (!shift || (step != null && step>shift.distance)) return [];
    const distance = step != null ? 1 : shift.distance;
    const path = Array.from({length:distance}, (_,n)=>plan.axis === "H"
      ? Math.floor(from/7)*7+((from%7+n+1)%7)
      : ((Math.floor(from/7)+n+1)%6)*7+from%7);
    const hole=path.find(i=>b.corruptions?.[i]?.kind === "hole");
    return [{from,to:path.at(-1),path,hole,distance:shift.distance,occupied:stack.length>0}];
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
  const p = bilePlan(g, e);
  if (!p) return;
  for (const move of bileMoves(p)) resolveGlob(g, e, move);
}
function resolveGlob(g, e, p) {
  const b = g.s.battle;
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
  const b = g.s.battle;
  // Simultaneous one-space translations, with Hole collisions between every step.
  for (let step=1; step<=Math.max(...phaseShifts(plan).map(s=>s.distance)); step++) {
    const stacks = phaseMoves(b,plan,step).map(m=>({...m,stack:b.grid[m.from]}));
    for (const m of stacks) b.grid[m.from]=[];
    for (const m of stacks) b.grid[m.to]=m.stack;
    for (const shield of b.shields) {
      const moved=stacks.find(m=>m.stack.some(c=>c.uid===shield.owner));
      if(moved)shield.slot=moved.to;
    }
    g.present("phaseShift", {source:e.uid,axis:plan.axis,step,
      name:"Phase disruption "+plan.axis,
      moves:stacks.filter(m=>m.stack.length).map(({from,to})=>({from,to}))});
    for (const {to,stack} of stacks) {
      if (!stack.length || b.corruptions?.[to]?.kind !== "hole") continue;
      const removed=stack.map(c=>c.uid);
      for (const c of [...stack])g.destroyCard(to,c.uid);
      b.shields=b.shields.filter(s=>!removed.includes(s.owner));
      g.present("holeFall",{slot:to,step,removed,name:"Memory Hole · Construct destroyed"});
    }
  }
  // Other on-arrival effects still use the final landing space, not transit spaces.
  for (const m of phaseMoves(b,plan)) {
    const q=b.corruptions?.[m.from];
    if(b.grid[m.from].length && q?.kind === "hypnosis")compelCard(g,m.from,q,true);
  }
  g.log("Phase disruption "+plan.axis+": selected lines shift their telegraphed distances, one space at a time. Memory Holes destroy Constructs on any step; Corruptions stay fixed.");
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
    for (const item of braceletForecast(g))
      add(item.element, item.block);
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
