import { cards, cycle } from "./content.mjs";
import { compelCard, resetCoveredInsanity } from "./corruptions.mjs";
import { ideonDefs } from "./depths-content.mjs";
import { adjacent, offense, stackValue } from "./engine.mjs";
const top = (s) => s?.at(-1);
export const livingIdeons = (b) => (b?.ideons || []).filter((e) => e.hp > 0);
export const hostiles = (b) =>
  [...b.enemies, ...livingIdeons(b)].filter((e) => e.hp > 0);
export const ideonsAt = (b, slot) =>
  livingIdeons(b).filter((e) => e.slot === slot);
export const coveredByIdeon = (b, slot) =>
  ideonsAt(b, slot).some((e) => e.covers);
export const protectedOwner = (b, uid) =>
  livingIdeons(b).some((e) => e.guardian && e.owner === uid);
export const legalHostiles = (b) =>
  hostiles(b).filter((e) => e.ideon || !protectedOwner(b, e.uid));
export const stickyAt = (b, slot) =>
  livingIdeons(b).some((e) => e.sticky && adjacent(e.slot).includes(slot));
export const fieldIdeons = (b, slot) =>
  livingIdeons(b).filter(
    (e) => e.field && (e.slot === slot || adjacent(e.slot).includes(slot)),
  );
export function ideonActivationReason(b, slot, element) {
  if (coveredByIdeon(b, slot)) return "Covered by an Ideon";
  for (const e of fieldIdeons(b, slot)) {
    if (e.field === "element" && element !== e.element)
      return `Refraction requires ${e.element}`;
    if (
      e.field === "shared" &&
      e.fieldUsedTurn === b.turn &&
      e.fieldUsedCard !== top(b.grid[slot])?.uid
    )
      return "Another card used this field this turn";
  }
  return null;
}
export function drainLeeches(g) {
  const b = g.s.battle;
  for (const e of livingIdeons(b).filter((e) => e.behavior === "leech")) {
    for (const i of adjacent(e.slot)) {
      const c = top(b.grid[i]);
      if (cards[c?.id]?.type !== "Ward" || c.ward <= 0) continue;
      c.ward--;
      e.reserve = (e.reserve || 0) + 1;
      if (!c.ward) c.zeroWard = true;
      g.present("defend", {
        slot: i,
        loss: 1,
        amount: 1,
        name: "Leech drains Ward",
      });
    }
  }
}
export function settleIdeons(g) {
  const b = g.s.battle;
  b.ideons ||= [];
  for (const e of b.ideons) {
    const owner = b.enemies.find((o) => o.uid === e.owner);
    if (!owner || owner.hp <= 0) {
      if (e.hp > 0)
        g.present("hit", {
          target: "enemy",
          uid: e.uid,
          amount: 0,
          dead: true,
          element: e.element,
        });
      e.hp = 0;
      e.removed = true;
    } else if (e.hp <= 0 && !e.removed) {
      e.removed = true;
      if (e.kind === "tentacle" && owner.id === "cnidarian") {
        owner.tentacleKills = (owner.tentacleKills || 0) + 1;
        owner.pendingTentacles =
          (owner.pendingTentacles || 0) +
          1 +
          Math.floor((owner.tentacleKills - 1) / 3);
      }
      g.log(`${e.name} is defeated.`);
    }
  }
  b.ideons = b.ideons.filter((e) => e.hp > 0);
}
export function spawnIdeon(g, owner, kind, options = {}) {
  const b = g.s.battle,
    d = ideonDefs[kind];
  const occupied = new Set(livingIdeons(b).map((e) => e.slot));
  let spaces = b.grid.flatMap((s, i) =>
    !occupied.has(i) &&
    (d.covers || !s.length) &&
    b.corruptions?.[i]?.kind !== "hole"
      ? [i]
      : [],
  );
  if (options.maxColumn != null)
    spaces = spaces.filter((i) => i % 7 <= options.maxColumn);
  if (options.slot != null) spaces = spaces.filter((i) => i === options.slot);
  if (!spaces.length) {
    g.log(`${owner.name}: no legal space for ${d.name}.`);
    return null;
  }
  spaces.sort((a, z) => {
    if (kind === "leech" || kind === "binder" || kind === "shuttle") {
      const value = (i) =>
        adjacent(i).reduce(
          (n, j) =>
            n +
            (kind === "leech"
              ? top(b.grid[j])?.ward || 0
              : b.grid[j].length * 10),
          0,
        );
      if (value(a) !== value(z)) return value(z) - value(a);
    }
    return (z % 7) - (a % 7) || a - z;
  });
  const e = {
    ...d,
    ...options,
    id: "ideon_" + kind,
    kind,
    ideon: true,
    uid: g.uid(),
    owner: owner.uid,
    ownerName: owner.name,
    slot: spaces[0],
    hp: d.hp,
    maxHp: d.hp,
    status: { burn: 0, poison: 0, corrode: 0 },
    guard: 0,
    born: b.turn,
    age: 0,
  };
  b.ideons ||= [];
  b.ideons.push(e);
  g.log(
    `${owner.name} places ${e.name} in column ${(e.slot % 7) + 1}, row ${Math.floor(e.slot / 7) + 1}.`,
  );
  g.present("ideonSpawn", {
    uid: e.uid,
    slot: e.slot,
    name: e.name,
    element: e.element,
  });
  return e;
}
export function initializeIdeons(g) {
  const b = g.s.battle;
  b.ideons ||= [];
  for (const e of b.enemies)
    if (e.id === "cnidarian")
      for (let n = 0; n < 3; n++) spawnIdeon(g, e, "tentacle");
}
export function cannonPlan(g, owner, t) {
  const b = g.s.battle;
  const candidates = b.grid.flatMap((s, i) =>
    top(s)
      ? [{ slot: i, element: top(s).element, value: stackValue(b, i).power }]
      : [],
  );
  const elemental = candidates
    .filter((c) => c.element !== "Arcane")
    .sort((a, z) => z.value - a.value || a.slot - z.slot);
  const all = [
    ...elemental,
    ...candidates.filter((c) => c.element === "Arcane"),
    ...Array.from({ length: 6 }, (_, r) => ({
      slot: r * 7 + 6,
      element: "Arcane",
      value: 0,
    })),
  ];
  const bullets = livingIdeons(b).filter((e) => e.behavior === "bullet");
  const safe = (c) =>
    bullets.every((e) => {
      const start =
        Math.floor(c.slot / 7) * 7 + ((c.slot % 7) % 2 === 0 ? 6 : 5);
      for (let k = 0; k < 4; k++) {
        const x = (start % 7) - k * 2,
          other = (e.slot % 7) - (k + 1) * 2;
        if (
          x >= 0 &&
          other >= 0 &&
          Math.abs(x - other) +
            Math.abs(Math.floor(start / 7) - Math.floor(e.slot / 7)) <=
            2
        )
          return false;
      }
      return true;
    });
  const chosen = all.find(safe);
  const element =
    chosen && chosen.element !== "Arcane"
      ? Object.keys(cycle).find((el) => cycle[el] === chosen.element)
      : "Arcane";
  return {
    targetSlot: chosen?.slot ?? null,
    slot: chosen
      ? Math.floor(chosen.slot / 7) * 7 + ((chosen.slot % 7) % 2 === 0 ? 6 : 5)
      : null,
    field: t.destructionShot
      ? "destroy"
      : element === "Arcane"
        ? "shared"
        : "element",
    element: t.destructionShot ? "Arcane" : element,
    skipped: !chosen,
  };
}
export function depthsTell(g, e, t) {
  if (t.cannon && (!g.s.battle || g.s.mode !== "battle")) {
    t.name += " · field chosen from your battle formation";
    return t;
  }
  if (t.cannon) {
    t.cannonPlan = cannonPlan(g, e, t);
    t.element = t.cannonPlan.element;
    t.name += ` · ${t.cannonPlan.skipped ? "lane occupied; launch withheld" : t.element + " field, row " + (Math.floor(t.cannonPlan.slot / 7) + 1)}`;
  }
  if (t.hiveWave) {
    t.waveCount =
      e.hp === 1 ? 0 : e.hp <= 5 ? 2 * (7 - e.hp) : e.hp <= 9 ? 2 : 1;
    t.waveColumn = e.hp <= 5 ? Math.max(0, e.hp - 2) : e.hp <= 9 ? 4 : 6;
    t.name =
      e.hp === 1
        ? "Final command · Hive dies afterward"
        : `Swarm ${t.waveCount} · columns 1–${t.waveColumn + 1} · ${e.hp} rounds remain`;
  }
  return t;
}
function moveIdeon(g, e, to) {
  const b = g.s.battle,
    from = e.slot;
  if (
    to < 0 ||
    Math.floor(to / 7) !== Math.floor(from / 7) ||
    ideonsAt(b, to).length ||
    b.corruptions?.[to]?.kind === "hole"
  )
    return false;
  if (b.grid[to].length && !e.covers) {
    if (!e.swap || b.grid[from].length) return false;
    b.grid[from] = b.grid[to];
    b.grid[to] = [];
    for (const shield of b.shields) if (shield.slot === to) shield.slot = from;
    resetCoveredInsanity(b);
    if (b.corruptions?.[from]?.kind === "hypnosis")
      compelCard(g, from, b.corruptions[from], true);
  }
  e.slot = to;
  g.present("ideonMove", {
    uid: e.uid,
    fromSlot: from,
    slot: to,
    element: e.element,
    name: e.name,
  });
  return true;
}
export function commandIdeon(g, uid) {
  const b = g.s.battle,
    e = livingIdeons(b).find((e) => e.uid === uid);
  if (!e) return;
  const owner = b.enemies.find((o) => o.uid === e.owner && o.hp > 0);
  if (!owner) return;
  e.age++;
  const hit = (damage, more = {}) =>
    b.jobs.unshift({
      kind: "hit",
      name: e.name,
      damage,
      element: e.element,
      source: owner.uid,
      gridSourceSlot: e.slot,
      ...more,
    });
  if (e.behavior === "leech") {
    const amount = Math.min(e.reserve || 0, owner.maxHp - owner.hp);
    owner.hp += amount;
    e.reserve = 0;
    g.log(`${e.name} heals ${owner.name} for ${amount}.`);
    return;
  }
  if (e.behavior === "swap") {
    const slots = adjacent(e.slot).filter((i) => b.grid[i].length);
    if (slots.length < 2) return;
    const [a, z] = slots;
    [b.grid[a], b.grid[z]] = [b.grid[z], b.grid[a]];
    for (const shield of b.shields)
      if (shield.slot === a) shield.slot = z;
      else if (shield.slot === z) shield.slot = a;
    g.present("activate", { slot: a, name: "Nerve Shuttle swaps stacks" });
    for (const i of [a, z]) {
      if (b.corruptions?.[i]?.kind === "hole")
        for (const c of [...b.grid[i]]) g.destroyCard(i, c.uid);
      else if (b.corruptions?.[i]?.kind === "hypnosis")
        compelCard(g, i, b.corruptions[i], true);
    }
    resetCoveredInsanity(b);
    return;
  }
  if (e.behavior === "strike") {
    hit(e.damage);
    return;
  }
  if (e.behavior === "tentacle") {
    const allies = b.grid
      .flatMap((s, i) =>
        cards[top(s)?.id]?.type === "Ally" && top(s).hp > 0
          ? [{ c: top(s), i }]
          : [],
      )
      .sort((a, z) => a.c.hp - z.c.hp || a.i - z.i);
    if (allies.length) {
      const { c, i } = allies[0],
        damage = offense(e.damage + e.age, e.element, c.element),
        loss = Math.min(c.hp, damage);
      c.hp -= loss;
      g.present("hit", {
        target: "card",
        slot: i,
        amount: loss,
        element: e.element,
        gridSourceSlot: e.slot,
        dead: c.hp <= 0,
      });
      g.log(`${e.name} strikes ${cards[c.id].name} for ${loss}.`);
      if (c.hp <= 0) g.destroyCard(i, c.uid);
      return;
    }
    if (e.slot % 7 === 0) {
      g.applyFriendlyStatus("poison", 2, {
        source: owner.uid,
        gridSourceSlot: e.slot,
      });
      return;
    }
    moveIdeon(g, e, e.slot - 1);
    return;
  }
  if (e.behavior === "bullet" || e.behavior === "crawl") {
    if (e.slot % 7 < e.speed) {
      hit(e.damage, { pierce: e.behavior === "bullet" });
      e.hp = 0;
      e.removed = true;
      return;
    }
    moveIdeon(g, e, e.slot - e.speed);
  }
}
export function scheduleDepths(g, owner, t) {
  const b = g.s.battle,
    jobs = [];
  if (t.commandIdeons)
    for (const e of livingIdeons(b).filter((e) => e.owner === owner.uid))
      jobs.push({ kind: "ideonCommand", uid: e.uid });
  if (t.summonIdeon)
    jobs.push({
      kind: "ideonSpawn",
      owner: owner.uid,
      ideon: t.summonIdeon,
      count: t.summonCount || 1,
    });
  if (t.tentacles) jobs.push({ kind: "tentacleReplace", owner: owner.uid });
  if (t.hiveWave && t.waveCount)
    jobs.push({
      kind: "ideonSpawn",
      owner: owner.uid,
      ideon: owner.hp <= 9 || owner.hp % 3 === 0 ? "burrower" : "runner",
      count: t.waveCount,
      options: { maxColumn: t.waveColumn },
    });
  if (t.cannon && !t.cannonPlan.skipped)
    jobs.push({
      kind: "ideonSpawn",
      owner: owner.uid,
      ideon: "bullet",
      count: 1,
      options: t.cannonPlan,
    });
  if (t.hiveWave) jobs.push({ kind: "hiveTick", owner: owner.uid });
  b.jobs.unshift(...jobs);
}
export function depthsJob(g, j) {
  const b = g.s.battle,
    owner = b.enemies.find((e) => e.uid === j.owner && e.hp > 0);
  if (j.kind === "ideonCommand") {
    commandIdeon(g, j.uid);
    settleIdeons(g);
    g.checkBattle();
    return true;
  }
  if (j.kind === "ideonSpawn") {
    if (owner)
      for (let k = 0; k < j.count; k++)
        spawnIdeon(g, owner, j.ideon, j.options);
    return true;
  }
  if (j.kind === "tentacleReplace") {
    if (owner) {
      const n = owner.pendingTentacles || 0;
      owner.pendingTentacles = 0;
      for (let k = 0; k < n; k++) spawnIdeon(g, owner, "tentacle");
    }
    return true;
  }
  if (j.kind === "hiveTick") {
    if (owner) {
      owner.hp = Math.max(0, owner.hp - 1);
      g.log(`Mind Hive: ${owner.hp} rounds remain.`);
      settleIdeons(g);
      g.checkBattle();
    }
    return true;
  }
  return false;
}
