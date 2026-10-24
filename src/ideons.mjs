import {destructionGuard} from './supplies.mjs';
import { cards, cycle, enemies, ELEMENTS } from "./content.mjs";
import { pressureFactor, pressureDamage } from "./difficulty.mjs";
import { compelCard, resetCoveredInsanity, prepareCorruption, applyCorruptions } from "./corruptions.mjs";
import { ideonDefs } from "./depths-content.mjs";
import { adjacent, offense, stackValue } from "./engine.mjs";
import { forcedDiscardOutcome, forcedDiscardLabel } from "./card-removal.mjs";
const top = (s) => s?.at(-1);
export const REFRACTION_RADIUS = 2;
export const livingIdeons = (b) => (b?.ideons || []).filter((e) => e.hp > 0);
export const ideonDamage = (e, damage) => Math.round(damage * (e.pressure || 1));
export function ideonText(e) {
  const text = e.text || "", n = value => ideonDamage(e, value);
  if ((e.pressure || 1) === 1) return text;
  if (e.kind === "drone") return text
    .replace("5 damage", `${n(5)} damage`)
    .replace("10, 15, 20", `${n(10)}, ${n(15)}, ${n(20)}`)
    .replace("increasing by 5", `increasing by approximately ${n(5)}`);
  if (e.kind === "tentacle") return text
    .replace("4 Water, gaining 2 damage each successive command", `${n(4)} Water, growing each successive command`)
    .replace("1 Water, gains 0.5 each successive command, rounded up", `${n(1)} Water and grows more slowly each successive command`);
  return text.replace(/\b(\d+) (damage|Pierce|Arcane|Chaos)\b/g,
    (_, value, unit) => `${n(Number(value))} ${unit}`);
}
// Age counts completed commands in previews; resolution has already incremented it.
// New/replacement tendrils start at age zero and never inherit a dead tendril's growth.
export const tendrilDamage = (e, completed = e.age || 0) => ({
  strike: ideonDamage(e, e.damage + 2 * Math.max(0, completed)),
  splash: ideonDamage(e, Math.ceil(1 + 0.5 * Math.max(0, completed))),
});
// Share the exact current target with the intent preview. Diagonals do not count.
export const tendrilTargets = (b, e, distant = false) => (distant ? b.grid.map((_, i) => i) : adjacent(e.slot))
  .flatMap(i => cards[top(b.grid[i])?.id]?.type === "Ally" && top(b.grid[i]).hp > 0
    ? [{ c: top(b.grid[i]), i }] : [])
  .sort((a, z) => a.c.hp - z.c.hp || a.i - z.i);
export function normalizeInsectMovement(state) {
  const b = state.battle;
  if (b?.enemies.some(o => o.id === "mindHive") && !b.hiveLarvaOpening) {
    for (const e of b.ideons || []) {
      if (e.born === 1 && ["runner", "burrower"].includes(e.kind) &&
          b.enemies.some(o => o.uid === e.owner && o.id === "mindHive")) {
        const d = ideonDefs.larva;
        // Preserve surviving HP, status, age, element and position; never add insects.
        Object.assign(e, { kind: "larva", id: "ideon_larva", name: d.name,
          damage: d.damage, turnDamage: 0, speed: 1, behavior: "crawl", swap: true, text: d.text });
      }
    }
    b.hiveLarvaOpening = true;
  }
  for (const e of state.battle?.enemies || [])
    if (["mindHive", "cnidarian", "refractionCannon"].includes(e.id)) {
      e.signature = enemies[e.id].signature;
      e.counter = enemies[e.id].counter;
      if (e.id === "refractionCannon") e.cannonTurns ??= e.cycle || 0;
    }
  for (const e of state.battle?.ideons || [])
    if (["runner", "burrower", "larva", "tentacle"].includes(e.kind)) {
      e.swap = true;
      e.text = ideonDefs[e.kind].text;
      e.turnDamage = ideonDefs[e.kind].turnDamage;
      if (e.kind === "tentacle") e.damage = ideonDefs.tentacle.damage;
    }
  for (const e of b?.ideons || [])
    if (e.behavior === "bullet") e.text = ideonDefs.bullet.text;
  for (const e of b?.ideons || []) {
    const owner = b.enemies.find(o => o.uid === e.owner);
    if (owner) e.pressure = pressureFactor(owner);
  }
  if (state.checkpoint) normalizeInsectMovement(state.checkpoint);
}
export function hiveBrood(e) {
  const round = 16 - e.hp;
  return {
    round,
    count: e.hp <= 1 ? 0 : round <= 4 ? 1 : round <= 8 ? 2 : round <= 11 ? 4 : round <= 13 ? 6 : 8,
    columns: round <= 4 ? 1 : round <= 8 ? 2 : round <= 11 ? 3 : 4,
  };
}
const broodElements = ["Fire", "Water", "Earth", "Wind", "Light", "Chaos", "Arcane"];
const broodKinds = ["burrower", "runner", "burrower", "drone", "runner", "burrower", "runner", "drone"];
export function layMindEggs(g, owner) {
  const b = g.s.battle, wave = hiveBrood(owner);
  const occupied = new Set(livingIdeons(b).map(e => e.slot));
  const spaces = b.grid.flatMap((_, i) => i % 7 >= 7 - wave.columns && !occupied.has(i) && !b.corruptions?.[i] && !b.biles?.[i] ? [i] : []);
  const slots = [];
  b.corruptions ||= {};
  for (let n = 0; n < wave.count; n++) {
    if (!spaces.length) { g.log("Mind Hive: no legal space for another Mind Egg."); break; }
    // Seeded placement includes occupied player spaces. Laying never removes a card.
    const slot = spaces.splice(Math.floor(g.rand() * spaces.length), 1)[0];
    if (!owner.broodOrder?.length) {
      owner.broodOrder = [...broodElements];
      for (let i = owner.broodOrder.length - 1; i > 0; i--) {
        const j = Math.floor(g.rand() * (i + 1));
        [owner.broodOrder[i], owner.broodOrder[j]] = [owner.broodOrder[j], owner.broodOrder[i]];
      }
    }
    const element = owner.broodOrder[(owner.eggsLaid || 0) % broodElements.length];
    const insect = broodKinds[(owner.eggsLaid || 0) % broodKinds.length];
    owner.eggsLaid = (owner.eggsLaid || 0) + 1;
    b.corruptions[slot] = { kind: "egg", uid: g.uid(), source: owner.uid, createdTurn: b.turn, remaining: 1, damage: pressureDamage(8, owner), element, insect };
    slots.push(slot);
    g.log(`Mind Hive lays a ${element} Mind Egg in column ${slot % 7 + 1}, row ${Math.floor(slot / 7) + 1}; hatches next Hive turn.`);
  }
  if (slots.length) g.present("corruption", { slots, name: "Mind Eggs · hatch next Hive turn" });
}
export function hatchMindEgg(g, owner, slot, uid) {
  const b = g.s.battle, egg = b.corruptions?.[slot];
  if (!egg || egg.uid !== uid || egg.createdTurn >= b.turn) return;
  // Another Ideon can move onto the egg. Wait, rather than overlap or lose the insect.
  if (ideonsAt(b, slot).length) {
    g.log("Mind Egg waits to hatch: an Ideon occupies its space.");
    return;
  }
  const cover = b.grid[slot];
  const covered = cover.length > 0;
  const { discarded, destroyed } = forcedDiscardOutcome(cover);
  const destination = forcedDiscardLabel(cover);
  delete b.corruptions[slot];
  if (cover.length) {
    b.discard.push(...discarded.map(c => ({ uid: c.uid, id: c.id, upgrade: c.upgrade })));
    destructionGuard(g,destroyed.length);
    b.destroyed.push(...destroyed);
    b.grid[slot] = [];
    b.shields = b.shields.filter(s => s.slot !== slot);
    const sent = [];
    if (discarded.length) sent.push(`${discarded.map(c => cards[c.id].name).join(" + ")} to Discard`);
    if (destroyed.length) sent.push(`${destroyed.map(c => cards[c.id].name).join(" + ")} to Destroyed`);
    g.log(`Mind Egg sends ${sent.join("; ")}; no damage.`);
  } else g.log(`Uncovered Mind Egg hatches: ${egg.damage} ${egg.element} damage.`);
  g.present("eggHatch", { slot, covered, destination, destroyed: destroyed.map(c => c.uid), element: egg.element, name: "Mind Egg hatches · " + (covered ? "cover to " + destination : egg.damage + " " + egg.element) });
  spawnIdeon(g, owner, egg.insect, { slot, element: egg.element });
  (g.s.stats.mindEggs ||= []).push({ turn: b.turn, slot, element: egg.element, insect: egg.insect, covered, discarded: discarded.map(c => c.uid), destroyed: destroyed.map(c => c.uid), damage: covered ? 0 : egg.damage });
  if (!covered) b.jobs.unshift({ kind: "hit", name: "Mind Egg", damage: egg.damage, element: egg.element, source: owner.uid, gridSourceSlot: slot });
}
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
    (e) => e.field && Math.abs(e.slot % 7 - slot % 7) +
      Math.abs(Math.floor(e.slot / 7) - Math.floor(slot / 7)) <= REFRACTION_RADIUS,
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
function warnTendrilReturn(g, owner, origin, count) {
  const b = g.s.battle;
  b.tendrilReturns ||= [];
  const reserved = new Set(b.tendrilReturns.map(q => q.slot));
  const distance = i => Math.abs(i % 7 - origin % 7) +
    Math.abs(Math.floor(i / 7) - Math.floor(origin / 7));
  const spaces = b.grid.map((_, i) => i)
    .filter(i => !reserved.has(i) && !ideonsAt(b, i).length && b.corruptions?.[i]?.kind !== "hole")
    .sort((a, z) => distance(a) - distance(z) || a - z);
  for (const slot of spaces.slice(0, count)) {
    b.tendrilReturns.push({ owner: owner.uid, slot, due: b.turn + 1 });
    g.log(`Tendril return warned at column ${slot % 7 + 1}, row ${Math.floor(slot / 7) + 1}: one full player turn to clear the space.`);
    g.present("activate", { slot, name: "Tendril return · one turn to clear" });
  }
}
export function settleIdeons(g, { animate = true } = {}) {
  const b = g.s.battle;
  b.ideons ||= [];
  const fallen = b.enemies.filter(e => e.hp <= 0 && e.tier === "Archon" &&
    e.stratum === 3 && !e.ideonDeathPresented);
  const departures = fallen.map(owner => ({
    uid: owner.uid, name: owner.name,
    children: livingIdeons(b).filter(e => e.owner === owner.uid).map(e => ({ ...e })),
  }));
  for (const owner of fallen) owner.ideonDeathPresented = true;
  for (const e of b.ideons) {
    const owner = b.enemies.find((o) => o.uid === e.owner);
    if (!owner || owner.hp <= 0) {
      if (e.hp > 0 && animate && !fallen.some(o => o.uid === e.owner))
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
        warnTendrilReturn(g, owner, e.killedFromSlot ?? e.slot,
          1 + Math.floor((owner.tentacleKills - 1) / 3));
      }
      g.log(`${e.name} is defeated.`);
    }
  }
  b.ideons = b.ideons.filter((e) => e.hp > 0);
  if (b.tendrilReturns)
    b.tendrilReturns = b.tendrilReturns.filter(q => b.enemies.some(e => e.uid === q.owner && e.hp > 0));
  for (const [slot, q] of Object.entries(b.corruptions || {}))
    if (q.kind === "egg" && !b.enemies.some(e => e.uid === q.source && e.hp > 0)) delete b.corruptions[slot];
  if (animate)
    for (const departure of departures) g.present("ownerDeath", departure);
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
    pressure: pressureFactor(owner),
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
export function hiveOpeningCount(field, owner) {
  return 8 + (owner.born == null ? 0 : Math.max(0, Math.floor(field.round - owner.born)));
}
export function initializeIdeons(g) {
  const b = g.s.battle;
  b.ideons ||= [];
  for (const e of b.enemies) {
    // Ordinary encounter setups exist before either side acts. Keep intruders
    // in the enemy half, with seeded positions and without overwriting Opening Rite.
    const opening = enemies[e.id]?.openingIdeons;
    if (opening) {
      for (let n = 0; n < opening.count; n++) {
        const occupied = new Set(livingIdeons(b).map(i => i.slot));
        const spaces = b.grid.flatMap((s, slot) =>
          !s.length && !occupied.has(slot) && slot % 7 >= 3 && slot % 7 <= 4 &&
          b.corruptions?.[slot]?.kind !== "hole" ? [slot] : []);
        if (!spaces.length) break;
        spawnIdeon(g, e, opening.kind, { slot: g.pick(spaces), opening: true });
      }
    }
    if (e.id === "refractionCannon") e.cannonTurns = 0;
    if (e.id === "cnidarian")
      for (let n = 0; n < 3; n++) spawnIdeon(g, e, "tentacle");
    if (e.id === "mindHive") {
      b.hiveLarvaOpening = true;
      const shuffle = (values) => {
        for (let i = values.length - 1; i > 0; i--) {
          const j = Math.floor(g.rand() * (i + 1));
          [values[i], values[j]] = [values[j], values[i]];
        }
        return values;
      };
      const rows = shuffle([0, 1, 2, 3, 4, 5]);
      const elements = shuffle([...broodElements]);
      // One per lane first; each elapsed Field round adds one to the base eight.
      // No opening card is overwritten and no insect spills outside these columns.
      for (let n = 0; n < Math.min(18, hiveOpeningCount(g.s.field, e)); n++) {
        const row = rows[n % 6];
        const available = slot => !b.grid[slot].length && !ideonsAt(b, slot).length && b.corruptions?.[slot]?.kind !== "hole";
        let slots = [4, 5, 6].map(col => row * 7 + col).filter(available);
        if (!slots.length) slots = rows.flatMap(r => [4, 5, 6].map(col => r * 7 + col)).filter(available);
        if (!slots.length) break;
        if (slots.length) spawnIdeon(g, e, "larva", {
          slot: slots[Math.floor(g.rand() * slots.length)], element: elements[n % elements.length],
        });
      }
    }
  }
}
function cannonPlans(g, owner, t, allowOverlap = false) {
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
  const safe = (c) => {
    const start = Math.floor(c.slot / 7) * 7 + ((c.slot % 7) % 2 === 0 ? 6 : 5);
    if (b.corruptions?.[start]?.kind === "hole" ||
        livingIdeons(b).some(e => e.behavior !== "bullet" && e.slot === start)) return false;
    if (allowOverlap) return true;
    return bullets.every((e) => {
      for (let k = 0; k < 4; k++) {
        const x = (start % 7) - k * 2,
          other = (e.slot % 7) - (k + 1) * 2;
        if (
          x >= 0 &&
          other >= 0 &&
          Math.abs(x - other) +
            Math.abs(Math.floor(start / 7) - Math.floor(e.slot / 7)) <=
            REFRACTION_RADIUS * 2
        )
          return false;
      }
      return true;
    });
  };
  return all.filter(safe).map(chosen => {
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
  });
}
export function cannonPlan(g, owner, t) {
  return cannonPlans(g, owner, t)[0] || {
    targetSlot: null, slot: null, field: t.destructionShot ? "destroy" : "shared",
    element: "Arcane", skipped: true,
  };
}
export const cannonVolleySize = e => Math.min(5, 1 + Math.floor((e.cannonTurns ?? e.cycle ?? 0) / 15));
export function cannonVolley(g, owner, t) {
  const plans = cannonPlans(g, owner, t);
  const count = cannonVolleySize(owner);
  if (count === 1) return plans.slice(0, 1);
  const distance = (a, z) => Math.abs(a % 7 - z % 7) + Math.abs(Math.floor(a / 7) - Math.floor(z / 7));
  let chosen = plans.slice(0, 1);
  // Both newborn bullets advance together. Prefer a complete, non-overlapping
  // pair, then formation value; never reroll or mutate the state during intent.
  pair: for (let i = 0; i < plans.length; i++)
    for (let j = i + 1; j < plans.length; j++) {
      const a = plans[i].slot, z = plans[j].slot;
      if (distance(a, z) > REFRACTION_RADIUS * 2) {
        chosen = [plans[i], plans[j]];
        break pair;
      }
    }
  // Three or more radius-two diamonds cannot all fit without overlap in six
  // rows. Keep distinct centers, spreading additional shots as far as possible.
  const bySlot = new Map();
  for (const p of [...plans, ...cannonPlans(g, owner, t, true)])
    if (!bySlot.has(p.slot)) bySlot.set(p.slot, p);
  const candidates = [...bySlot.values()];
  while (chosen.length < count) {
    const remaining = candidates.filter(p => !chosen.some(c => c.slot === p.slot));
    if (!remaining.length) break;
    remaining.sort((a, z) => {
      const clearance = p => chosen.length ? Math.min(...chosen.map(c => distance(p.slot, c.slot))) : 0;
      return clearance(z) - clearance(a);
    });
    chosen.push(remaining[0]);
  }
  return chosen;
}
// The saved action counter preserves escalation across Continue and older saves.
export const cannonBlastDamage = (e) =>
  40 + 10 * Math.floor((e.cannonTurns ?? e.cycle ?? 0) / 5);
function cannonAttack(e, t) {
  const total = 14 + 2 * Math.floor((e.cycle || 0) / 2);
  t.damage = total;
  if ((e.cycle || 0) % 2) {
    // Counter the first element; Arcane has no counter, so rotate a non-Arcane partner.
    const elements = ELEMENTS.filter(el => el !== "Arcane");
    const second = Object.keys(cycle).find(el => cycle[el] === t.element) ||
      elements[Math.floor((e.cycle || 0) / 2) % elements.length];
    t.damage = 0;
    t.sequence = [{ damage: total / 2, element: t.element }, { damage: total / 2, element: second }];
  }
}
export function depthsTell(g, e, t) {
  if (e.id === "refractionCannon" && !t.finalBlast && g.s.mode === "battle" &&
      ((e.cannonTurns ?? e.cycle ?? 0) + 1) % 5 === 4)
    t.name += ` · Charging Final Blast... (${pressureDamage(cannonBlastDamage(e), e)} damage) + 2 Mind Mines`;
  if (t.cannon && (!g.s.battle || g.s.mode !== "battle")) {
    t.name += " · field chosen from your battle formation";
    cannonAttack(e, t);
    return t;
  }
  if (t.cannon) {
    t.cannonPlans = cannonVolley(g, e, t);
    t.cannonPlan = t.cannonPlans[0] || cannonPlan(g, e, t);
    t.element = t.cannonPlan.element;
    cannonAttack(e, t);
    t.name += ` · ${t.cannonPlan.skipped ? "lane occupied; launch withheld" : t.cannonPlans.map(p => p.element + " field, row " + (Math.floor(p.slot / 7) + 1)).join(" + ")}`;
    if (cannonVolleySize(e) > 1)
      t.name += ` · ${t.cannonPlans.length}/${cannonVolleySize(e)} bullets`;
  }
  if (t.hiveWave) {
    const wave = hiveBrood(e);
    t.waveCount = wave.count;
    t.waveColumns = wave.columns;
    t.name =
      e.hp === 1
        ? "Final command + hatch · Hive dies afterward"
        : `Hatch + lay ${wave.count} Eggs · rightmost ${wave.columns} column${wave.columns === 1 ? "" : "s"} · ${e.hp} rounds remain`;
  }
  return t;
}
function canMoveIdeon(b, e, to) {
  const from = e.slot;
  const rowChange = Math.abs(Math.floor(to / 7) - Math.floor(from / 7));
  const validLane = e.kind === "runner"
    ? rowChange <= 1 && to % 7 === from % 7 - 1
    : e.behavior === "tentacle"
      ? adjacent(from).includes(to)
      : rowChange === 0;
  if (
    to < 0 || to >= b.grid.length || !validLane ||
    ideonsAt(b, to).length ||
    b.corruptions?.[to]?.kind === "hole"
  )
    return false;
  return !b.grid[to].length || e.covers || (e.swap && !b.grid[from].length);
}
export function tendrilPlan(b, e) {
  const nearby = tendrilTargets(b, e)[0];
  const target = nearby || tendrilTargets(b, e, true)[0];
  let destination = e.slot;
  if (target && !nearby) {
    const distance = i => Math.abs(i % 7 - target.i % 7) +
      Math.abs(Math.floor(i / 7) - Math.floor(target.i / 7));
    destination = adjacent(e.slot)
      .filter(i => distance(i) < distance(e.slot) && canMoveIdeon(b, e, i))
      .sort((a, z) => distance(a) - distance(z) ||
        Number(Math.floor(a / 7) !== Math.floor(e.slot / 7)) -
        Number(Math.floor(z / 7) !== Math.floor(e.slot / 7)) || a - z)[0] ?? e.slot;
  } else if (!target && e.slot % 7 && canMoveIdeon(b, e, e.slot - 1)) {
    destination = e.slot - 1;
  }
  return { target, destination, adjacent: !!target && adjacent(destination).includes(target.i) };
}
function moveIdeon(g, e, to) {
  const b = g.s.battle, from = e.slot;
  if (!canMoveIdeon(b, e, to)) return false;
  if (b.grid[to].length && !e.covers) {
    b.grid[from] = b.grid[to];
    b.grid[to] = [];
    for (const shield of b.shields) if (shield.slot === to) shield.slot = from;
    resetCoveredInsanity(b);
    if (b.corruptions?.[from]?.kind === "hypnosis")
      compelCard(g, from, b.corruptions[from], true);
  }
  e.slot = to;
  g.present(e.behavior === "bullet" ? "ideonTravel" : "ideonMove", {
    uid: e.uid,
    fromSlot: from,
    slot: to,
    ...(e.behavior === "bullet" ? {
      path: Array.from({ length: from - to }, (_, n) => from - n - 1),
      projectile: { ...e },
    } : {}),
    element: e.element,
    name: e.name,
  });
  return true;
}
export function commandIdeon(g, uid) {
  const b = g.s.battle,
    e = livingIdeons(b).find((e) => e.uid === uid);
  if (!e) return;
  // Opening defenders/parasites are present immediately, but an ambush cannot
  // command them before the player has had their first turn.
  if (e.opening && b.turn === 0) return;
  const owner = b.enemies.find((o) => o.uid === e.owner && o.hp > 0);
  if (!owner) return;
  e.age++;
  const hit = (damage, more = {}, scaled = false) =>
    b.jobs.unshift({
      kind: "hit",
      name: e.name,
      damage: scaled ? damage : ideonDamage(e, damage),
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
    hit(e.damage + (e.damageGrowth || 0) * (e.age - 1));
    return;
  }
  if (e.behavior === "tentacle") {
    const plan = tendrilPlan(b, e);
    const damage = tendrilDamage(e, e.age - 1);
    const strike = ({ c, i }, base, name) => {
      const damage = offense(base, e.element, c.attuned || c.element),
        loss = Math.min(c.hp, damage);
      c.hp -= loss;
      g.present("hit", {
        name,
        attackVisual: name === "Splash" ? "splash" : "tendril",
        target: "card",
        slot: i,
        amount: loss,
        element: e.element,
        gridSourceSlot: e.slot,
        dead: c.hp <= 0,
      });
      g.log(`${e.name} uses ${name} on ${cards[c.id].name} for ${loss}.`);
      if (c.hp <= 0) g.destroyCard(i, c.uid);
    };
    const atEdge = e.slot % 7 === 0;
    if (plan.destination !== e.slot) moveIdeon(g, e, plan.destination);
    if (plan.target) {
      const close = adjacent(e.slot).includes(plan.target.i);
      strike(plan.target, close ? damage.strike : damage.splash,
        close ? "Tendril strike" : "Splash");
    }
    else if (atEdge) {
      g.applyFriendlyStatus("poison", 2, {
        source: owner.uid,
        gridSourceSlot: e.slot,
      });
    } else {
      hit(damage.splash, { name: "Splash", attackVisual: "splash" }, true);
    }
    return;
  }
  if (e.behavior === "bullet" || e.behavior === "crawl") {
    if (e.slot % 7 < e.speed) {
      const edge = e.slot - e.slot % 7, projectile = { ...e };
      hit(e.damage, { pierce: e.behavior === "bullet",
        ...(e.behavior === "bullet" ? { gridSourceSlot: edge } : {}) });
      e.hp = 0;
      e.removed = true;
      if (e.behavior === "bullet")
        g.present("ideonTravel", {
          uid: e.uid, fromSlot: e.slot, slot: edge,
          path: Array.from({ length: e.slot - edge }, (_, n) => e.slot - n - 1),
          projectile, exiting: true, element: e.element, name: e.name,
        });
      return;
    }
    if (e.kind === "runner") {
      const choices = [e.slot - 1, e.slot - 8, e.slot + 6]
        .filter(to => canMoveIdeon(b, e, to));
      if (choices.length) moveIdeon(g, e, g.pick(choices));
    } else moveIdeon(g, e, e.slot - e.speed);
    if (e.turnDamage) hit(e.turnDamage);
  }
}
export function scheduleDepths(g, owner, t) {
  const b = g.s.battle,
    jobs = [];
  if (owner.id === "refractionCannon") {
    owner.cannonTurns = (owner.cannonTurns ?? Math.max(0, owner.cycle - 1)) + 1;
    if (t.finalBlast) delete owner.finalBlastElement;
    else if (owner.cannonTurns % 5 === 4) {
      owner.finalBlastElement = g.pick(ELEMENTS);
      const name = `Charging Final Blast... Next move: ${pressureDamage(cannonBlastDamage(owner), owner)} ${owner.finalBlastElement} damage`;
      g.log(`${owner.name}: ${name}.`);
      g.present("status", { target: "enemy", uid: owner.uid, name });
      // Commit mine spaces after this enemy round's movements and launches.
      // Wait for other owners too, but stay before end-of-round/next-turn jobs.
      // Otherwise a bullet can land/spawn on a newly laid mine before Placement.
      const end = b.jobs.findIndex(j => ["corruptionRound", "nextTurn"].includes(j.kind));
      b.jobs.splice(end < 0 ? b.jobs.length : end, 0, { kind: "cannonLayMines", owner: owner.uid });
    }
  }
  if (t.commandIdeons)
    for (const e of livingIdeons(b)
      .filter((e) => e.owner === owner.uid)
      .sort((a, z) => a.slot % 7 - z.slot % 7 || a.slot - z.slot || a.uid - z.uid))
      jobs.push({ kind: "ideonCommand", uid: e.uid });
  if (t.summonIdeon)
    jobs.push({
      kind: "ideonSpawn",
      owner: owner.uid,
      ideon: t.summonIdeon,
      count: t.summonCount || 1,
    });
  if (t.tentacles) jobs.push({ kind: "tentacleReplace", owner: owner.uid });
  if (t.hiveWave) {
    for (const [slot, egg] of Object.entries(b.corruptions || {}))
      if (egg.kind === "egg" && egg.source === owner.uid && egg.createdTurn < b.turn)
        jobs.push({ kind: "hiveHatch", owner: owner.uid, slot: Number(slot), uid: egg.uid });
    if (hiveBrood(owner).count) jobs.push({ kind: "hiveLay", owner: owner.uid });
  }
  if (t.cannon && !t.cannonPlan.skipped)
    jobs.push({
      kind: "cannonVolley",
      owner: owner.uid,
      plans: t.cannonPlans || [t.cannonPlan],
    });
  if (t.hiveWave) jobs.push({ kind: "hiveTick", owner: owner.uid });
  b.jobs.unshift(...jobs);
}
export function depthsJob(g, j) {
  const b = g.s.battle,
    owner = b.enemies.find((e) => e.uid === j.owner && e.hp > 0);
  if (j.kind === "cannonLayMines") {
    if (owner) {
      prepareCorruption(g, owner, {markCorruption:"mine", count:2, emptyOnly:true, immediate:true});
      applyCorruptions(g, owner);
    }
    return true;
  }
  if (j.kind === "cannonVolley") {
    if (owner) {
      const start = g.presentation?.length || 0;
      const spawned = j.plans.map(p => spawnIdeon(g, owner, "bullet", p)).filter(Boolean);
      if (g.capturePresentation && spawned.length > 1) {
        g.presentation.splice(start);
        g.present("ideonVolley", { bullets: spawned.map(e => ({ uid: e.uid, name: e.name, element: e.element })) });
      }
    }
    return true;
  }
  if (j.kind === "hiveHatch") {
    if (owner) hatchMindEgg(g, owner, j.slot, j.uid);
    return true;
  }
  if (j.kind === "hiveLay") {
    if (owner) layMindEggs(g, owner);
    return true;
  }
  if (j.kind === "ideonCommand") {
    commandIdeon(g, j.uid);
    settleIdeons(g);
    g.checkBattle();
    return true;
  }
  if (j.kind === "ideonSpawn") {
    if (owner)
      for (let k = 0; k < j.count; k++) {
        if (owner.ideonCap && livingIdeons(b).filter(e => e.owner === owner.uid).length >= owner.ideonCap) break;
        spawnIdeon(g, owner, j.ideon, j.options);
      }
    return true;
  }
  if (j.kind === "tentacleReplace") {
    if (owner) {
      // Legacy saves may contain an unlocated replacement count: warn it first.
      const n = owner.pendingTentacles || 0;
      owner.pendingTentacles = 0;
      if (n) warnTendrilReturn(g, owner, 6, n);
      const due = (b.tendrilReturns || []).filter(q => q.owner === owner.uid && q.due <= b.turn);
      b.tendrilReturns = (b.tendrilReturns || []).filter(q => !due.includes(q));
      for (const q of due) {
        // Fixed warnings never chase a recalled or moved card. A blocked spawn fails.
        if (ideonsAt(b, q.slot).length || b.corruptions?.[q.slot]?.kind === "hole") continue;
        g.present("activate", { slot: q.slot, name: "Tendril erupts" });
        if (b.grid[q.slot].length)
          g.present("hit", { target: "card", slot: q.slot, amount: 0,
            dead: true, element: "Water", name: "Tendril eruption" });
        for (const c of [...b.grid[q.slot]]) g.destroyCard(q.slot, c.uid);
        b.shields = b.shields.filter(s => s.slot !== q.slot);
        spawnIdeon(g, owner, "tentacle", { slot: q.slot });
      }
    }
    return true;
  }
  if (j.kind === "hiveTick") {
    if (owner) {
      owner.hp = Math.max(0, owner.hp - 1);
      g.log(`Mind Hive: ${owner.hp} rounds remain.`);
      if (owner.hp === 0) {
        const insects = livingIdeons(b).filter(e => e.owner === owner.uid).map(e => e.uid);
        settleIdeons(g, { animate: false });
        g.present("hiveDeath", { uid: owner.uid, insects, name: "The Mind Hive falls silent" });
      } else settleIdeons(g);
      g.checkBattle();
    }
    return true;
  }
  return false;
}
