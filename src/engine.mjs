import { describeDeath } from "./death.mjs";
import {
  cards,
  items,
  enemies,
  events,
  starter,
  ELEMENTS,
  ENEMY_STATUS_IMMUNITY,
  cycle,
  VERSION,
  MIND_COLUMNS,
  MIND_ROWS,
  MIND_SIZE,
} from "./content.mjs";
export const clone = (x) => structuredClone(x);
export const enemyStatusImmunity = (e) =>
  ENEMY_STATUS_IMMUNITY[e.element] || null;
function clearImmuneStatus(e) {
  const status = enemyStatusImmunity(e);
  if (status && e.status?.[status]) {
    e.status[status] = 0;
    return status;
  }
  return null;
}
function normalizeEnemyImmunities(state) {
  for (const e of state.battle?.enemies || []) clearImmuneStatus(e);
  if (state.checkpoint) normalizeEnemyImmunities(state.checkpoint);
}
const statusName = (k) => k[0].toUpperCase() + k.slice(1);
export function offense(n, from, to) {
  return Math.ceil(
    n *
      (from === "Arcane" || to === "Arcane"
        ? 1
        : cycle[from] === to
          ? 1.5
          : cycle[to] === from
            ? 0.5
            : 1),
  );
}
export function gridNeighbors(b, i) {
  if (top(b.grid[i])?.sever) return [];
  return adjacent(i).filter((j) => top(b.grid[j]) && !top(b.grid[j]).sever);
}
export function attunementElements(b, c, i) {
  const d = cards[c.id];
  const elements =
    d.attune && !c.transmuted && c.element === d.element
      ? [
          ...new Set(
            gridNeighbors(b, i)
              .map((j) => top(b.grid[j]).element)
              .filter((element) => element !== "Arcane"),
          ),
        ]
      : [c.element];
  return elements.length ? elements : ["Arcane"];
}
export function matchingNeighbors(b, c, i) {
  if (c.sever || top(b.grid[i])?.uid !== c.uid) return 0;
  return gridNeighbors(b, i).filter((j) => top(b.grid[j]).id === c.id).length;
}
export function enemyDamage(n, element, enemy) {
  let damage = offense(n, element, enemy.element);
  if (enemy.resist === element) damage = Math.ceil(damage / 2);
  if (enemy.wisp) damage = Math.ceil(damage * (element === "Arcane" ? 0.5 : 2));
  return damage;
}
// Shared by damage and its visual indicator; first valid block wins (no stacking).
export function squarePattern(b, c, i) {
  if (c.sever) return [];
  for (const origin of [i, i - 1, i - MIND_COLUMNS, i - MIND_COLUMNS - 1]) {
    if (
      origin < 0 ||
      origin % MIND_COLUMNS >= MIND_COLUMNS - 1 ||
      origin >= MIND_SIZE - MIND_COLUMNS
    )
      continue;
    const cells = [
      origin,
      origin + 1,
      origin + MIND_COLUMNS,
      origin + MIND_COLUMNS + 1,
    ];
    if (cells.every((j) => top(b.grid[j]) && !top(b.grid[j]).sever))
      return cells;
  }
  return [];
}
export function cardPower(b, c, i) {
  const d = cards[c.id],
    f = d.effects;
  let n = f.hpDamage
    ? c.hp
    : f.damage
      ? f.damage + (c.upgrade ? d.upgrade?.bonus || 0 : 0)
      : 0;
  if (f.row)
    n += b.grid.reduce(
      (sum, slot, j) =>
        sum +
        (j !== i &&
        Math.floor(j / MIND_COLUMNS) === Math.floor(i / MIND_COLUMNS) &&
        top(slot)?.element === c.element &&
        !top(slot).sever &&
        !c.sever
          ? f.row
          : 0),
      0,
    );
  if (f.adj) n += gridNeighbors(b, i).length * f.adj;
  if (f.matchingDamage) n += matchingNeighbors(b, c, i) * f.matchingDamage;
  if (f.square && squarePattern(b, c, i).length) n *= 2;
  const level = b.grid[i].findIndex((x) => x.uid === c.uid) + 1;
  for (let j = 0; j < b.grid.length; j++)
    if (j !== i) {
      const tower = top(b.grid[j]);
      if (tower?.magnified && b.grid[j].length === level) n *= 2;
    }
  return n;
}

// Resolve elemental damage locally; only unmodified base damage travels onward.
// A surviving weakness bonus may travel only to a defender with the same weakness.
export function allyHit(hit, element, hp, swallow = false) {
  const base = hit.damage;
  const weak = hit.element !== "Arcane" && cycle[hit.element] === element;
  const resistant =
    !weak && element !== "Arcane" && cycle[element] === hit.element;
  const bonus = weak
    ? hit.weaknessElement === element
      ? (hit.weaknessBonus ?? 0)
      : Math.ceil(base / 2)
    : 0;
  const damage = weak ? base + bonus : resistant ? Math.ceil(base / 2) : base;
  const absorbed = Math.min(hp, damage);
  const remaining = swallow
    ? 0
    : weak
      ? Math.max(0, base - Math.max(0, hp - bonus))
      : resistant
        ? Math.min(base, Math.max(0, damage - hp) * 2)
        : Math.max(0, base - hp);
  return {
    damage,
    absorbed,
    remaining,
    weaknessBonus: weak && !swallow ? Math.max(0, bonus - hp) : 0,
    weaknessElement: weak && !swallow ? element : null,
  };
}
export function incomingDamageText(hit) {
  return `${hit.damage} ${hit.element} base damage remaining${hit.stage === "ally" && hit.weaknessBonus ? ` + ${hit.weaknessBonus} weakness bonus against ${hit.weaknessElement}` : ""}`;
}
export function defenseRate(def, attack) {
  return def === "Arcane" || attack === "Arcane"
    ? 1
    : def === attack
      ? 2
      : cycle[attack] === def
        ? 0.5
        : 1;
}
export function blockHit(block, element, damage, attack) {
  const rate = defenseRate(element, attack),
    effective = Math.ceil(block * rate),
    stopped = Math.min(effective, damage);
  return {
    remaining: damage - stopped,
    block: Math.floor((effective - stopped) / rate),
  };
}
export function adjacent(i) {
  return [
    i % MIND_COLUMNS ? i - 1 : -1,
    i % MIND_COLUMNS < MIND_COLUMNS - 1 ? i + 1 : -1,
    i >= MIND_COLUMNS ? i - MIND_COLUMNS : -1,
    i < MIND_SIZE - MIND_COLUMNS ? i + MIND_COLUMNS : -1,
  ].filter((x) => x >= 0);
}
export const corner = (i) =>
  [0, MIND_COLUMNS - 1, MIND_SIZE - MIND_COLUMNS, MIND_SIZE - 1].includes(i);
const top = (slot) => slot?.at(-1),
  blankStatus = () => ({ burn: 0, poison: 0, corrode: 0 }),
  clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function cardAllowance(b, c, i) {
  const d = cards[c.id];
  if (d.singleUse) return Math.max(0, 1 - c.used);
  if (d.limit < 0) return Infinity;
  const plus = b.grid.some(
    (x, j) =>
      cards[top(x)?.id]?.keystone &&
      corner(j) &&
      (j % MIND_COLUMNS === i % MIND_COLUMNS ||
        Math.floor(j / MIND_COLUMNS) === Math.floor(i / MIND_COLUMNS)),
  )
    ? 1
    : 0;
  return Math.max(0, d.limit + plus - c.used);
}
export function stackValue(b, i) {
  return {
    focus: b.grid[i].reduce(
      (n, c) => n + (cards[c.id].focus === 99 ? 0 : cards[c.id].focus),
      0,
    ),
    activations: b.grid[i].reduce((n, c) => n + cardAllowance(b, c, i), 0),
  };
}
// Owned instances, including equipped gear, keep their identity through exchanges.
export function tradeAssets(s, trade) {
  const isItem = trade.kind === "item",
    defs = isItem ? items : cards;
  return (isItem ? s.inventory : s.deck)
    .filter((x) => {
      const d = defs[x.id];
      return (
        (!trade.id || trade.id === x.id) &&
        (!trade.slot || trade.slot === d.slot) &&
        (!trade.type || trade.type === d.type) &&
        (!trade.rarity || trade.rarity === d.rarity)
      );
    })
    .map((x) => {
      const d = defs[x.id],
        socketed = isItem && s.inventory.some((y) => y.gem === x.uid);
      const reason =
        d.cursed || (!isItem && d.type === "Hex")
          ? "Cannot trade a Curse or Hex"
          : socketed
            ? "Remove this Gem at a Tavern before trading it"
            : null;
      return {
        ...x,
        eligible: !reason,
        reason,
        equippedSlot: isItem
          ? Object.keys(s.equipment).find((k) => s.equipment[k] === x.uid) ||
            null
          : null,
      };
    });
}
export function gridTargets(b, t) {
  const occupied = b.grid
    .map((slot, i) => ({ slot, i, c: top(slot) }))
    .filter((x) => x.c);
  let targets = [];
  if (t.grid === "row" || t.grid === "column") {
    const col = t.grid === "column",
      count = col ? MIND_COLUMNS : MIND_ROWS;
    let best = 0,
      max = -1;
    for (let k = 0; k < count; k++) {
      const n = occupied
        .filter((x) =>
          col ? x.i % MIND_COLUMNS === k : Math.floor(x.i / MIND_COLUMNS) === k,
        )
        .reduce((n, x) => n + x.slot.length, 0);
      if (n > max) {
        max = n;
        best = k;
      }
    }
    targets = occupied.filter((x) =>
      col
        ? x.i % MIND_COLUMNS === best
        : Math.floor(x.i / MIND_COLUMNS) === best,
    );
  } else if (t.target === "valuable") {
    const valued = occupied.map((x) => ({ ...x, value: stackValue(b, x.i) }));
    targets = valued
      .sort(
        (a, z) =>
          z.value.focus - a.value.focus ||
          (z.value.activations === a.value.activations
            ? 0
            : z.value.activations > a.value.activations
              ? 1
              : -1) ||
          a.i - z.i,
      )
      .slice(0, t.count || 1);
  } else {
    const score = (x) =>
      t.target === "newest"
        ? -x.c.placed
        : t.target === "oldest"
          ? x.c.placed
          : t.target === "tallest"
            ? -x.slot.length
            : t.target === "connected"
              ? -gridNeighbors(b, x.i).length
              : x.i;
    targets = occupied
      .sort((a, z) => score(a) - score(z) || a.i - z.i)
      .slice(0, t.count || 1);
  }
  return targets.map((x) => x.i);
}

// Expand older 5×4 saves by coordinates, preserving complete stacks and block owners.
export function normalizeMindGrid(state) {
  const b = state.battle;
  if (b) {
    if (b.grid.length === 20 && (!b.columns || b.columns === 5)) {
      const remap = (i) => Math.floor(i / 5) * MIND_COLUMNS + (i % 5);
      const expanded = Array.from({ length: MIND_SIZE }, () => []);
      b.grid.forEach((stack, i) => {
        expanded[remap(i)] = stack;
      });
      b.grid = expanded;
      for (const portion of b.shields || []) portion.slot = remap(portion.slot);
    } else if (b.grid.length !== MIND_SIZE) {
      throw Error("Unsupported Mind Grid dimensions in save");
    }
    b.columns = MIND_COLUMNS;
    b.rows = MIND_ROWS;
  }
  if (state.checkpoint) normalizeMindGrid(state.checkpoint);
}

export class Game {
  constructor(seed = Date.now(), saved = null) {
    if (saved) {
      if (
        ![
          VERSION.rules,
          "1.3.25",
          "1.3.24",
          "1.3.23",
          "1.3.22",
          "1.3.21",
          "1.3.20",
          "1.3.19",
          "1.3.18",
          "1.3.17",
          "1.3.16",
          "1.3.15",
          "1.3.14",
          "1.3.13",
          "1.3.12",
          "1.3.11",
          "1.3.10",
          "1.3.9",
          "1.3.8",
          "1.3.7",
          "1.3.6",
          "1.3.5",
          "1.3.4",
          "1.3.3",
          "1.3.2",
          "1.3.1",
          "1.3.0",
          "1.2.1",
          "1.2.0",
          "1.1.0",
          "1.0.0",
        ].includes(saved.version?.rules)
      )
        throw Error("This save uses an incompatible rules version.");
      this.s = clone(saved);
      normalizeMindGrid(this.s);
      normalizeEnemyImmunities(this.s);
      this.s.version = VERSION;
      for (const c of this.s.battle?.grid?.flat() || [])
        if (cards[c.id].type === "Ally" && c.maxHp == null)
          c.maxHp = Math.max(
            c.hp,
            cards[c.id].hp + (c.upgrade ? cards[c.id].upgrade?.bonus || 0 : 0),
          );
      if (
        this.s.battle &&
        ["place", "activate"].includes(this.s.battle.phase)
      ) {
        this.s.battle.revealInsight ??= this.s.battle.insight;
        this.s.battle.insight = 0;
      }
      this.normalizeRewards();
      this.normalizeSpawns();
      if (this.s.mode === "battle") this.s.checkpoint = clone(this.s);
      return;
    }
    this.s = {
      version: VERSION,
      seed: Number(seed) >>> 0,
      rng: Number(seed) >>> 0 || 1,
      uid: 0,
      mode: "class",
      classId: "druid",
      hp: 70,
      maxHp: 70,
      gold: 0,
      deck: [],
      inventory: [],
      equipment: {
        head: null,
        neck: null,
        torso: null,
        wrist1: null,
        wrist2: null,
        finger1: null,
        finger2: null,
      },
      field: {
        round: 0,
        spawned: 0,
        spawnWidth: 2,
        queue: [],
        entities: [],
        x: 5,
        y: 5,
        moves: 2,
        stage: "player",
      },
      status: blankStatus(),
      log: [],
      history: [],
      stats: {
        damageDealt: 0,
        damageTaken: 0,
        goldEarned: 0,
        goldSpent: 0,
        cardsGained: [],
        itemsGained: [],
        purchases: [],
        sales: [],
        encounters: [],
      },
      steps: 0,
    };
    for (let warmup = 0; warmup < 8; warmup++) this.rand();
    this.s.archon = this.pick(
      Object.values(enemies)
        .filter((e) => e.tier === "Archon")
        .map((e) => e.id),
    );
    this.s.enemyDecks = {
      Mote: this.shuffle(
        Object.values(enemies)
          .filter((e) => e.tier === "Mote" && !e.summonOnly)
          .flatMap((e) => (e.movement === "Skittish" ? [e.id] : [e.id, e.id])),
      ),
      Eidolon: this.shuffle(
        Object.values(enemies)
          .filter((e) => e.tier === "Eidolon")
          .map((e) => e.id),
      ),
    };
    this.s.eventDeck = this.shuffle(
      events.filter((e) => e.id !== "shrine").map((e) => e.id),
    );
    this.s.itemDeck = this.shuffle([
      ...Object.keys(items),
      ...Object.keys(cards)
        .filter((id) => !starter.includes(id))
        .filter((id) => !cards[id].destroyAfterActivation || this.rand() < 0.25)
        .map((id) => "card:" + id),
    ]);
    for (const id of starter) this.s.deck.push(this.newCard(id));
    this.addItem("bronze");
    this.addItem("ring");
    this.s.startGem = this.pick(["ruby", "emerald", "topaz", "sapphire"]);
    this.addItem(this.s.startGem);
    this.s.equipment.wrist2 = this.s.inventory[0].uid;
    this.s.equipment.finger2 = this.s.inventory[1].uid;
  }
  normalizeRewards() {
    const s = this.s;
    if (s.reward?.cards) {
      s.reward.cards = [...s.reward.cards];
      for (let i = 0; i < s.reward.cards.length; i++) {
        const id = s.reward.cards[i];
        if (["blast", "shield"].includes(id))
          s.reward.cards[i] = this.pool(cards[id].rarity, true).find(
            (c) => !s.reward.cards.includes(c.id),
          ).id;
      }
    }
    if (s.mode === "item" && s.itemOffer?.length > 1)
      s.itemOffer = [s.itemOffer[0]];
    if (s.reward?.gem === true)
      s.reward.gem = this.pick([
        "ruby",
        "emerald",
        "topaz",
        "sapphire",
        "focusGem",
        "channelGem",
        "insightGem",
      ]);
    if (s.reward?.setting === true)
      s.reward.setting = this.pick([
        "silver",
        "channelRing",
        "focusRing",
        "necklace",
      ]);
  }
  present(kind, detail = {}) {
    if (this.capturePresentation)
      (this.presentation ??= []).push({
        kind,
        ...detail,
        state: this.observe(),
      });
  }
  rand() {
    let x = this.s.rng;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.s.rng = x >>> 0;
    return this.s.rng / 4294967296;
  }
  pick(xs) {
    return xs[Math.floor(this.rand() * xs.length)];
  }
  shuffle(xs) {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  uid() {
    return ++this.s.uid;
  }
  newCard(id, upgrade = false) {
    return { uid: this.uid(), id, upgrade };
  }
  addCard(id) {
    const c = this.newCard(id);
    this.s.deck.push(c);
    this.s.stats.cardsGained.push(cards[id].name);
    this.log("Gained " + cards[id].name);
    return c;
  }
  addItem(id) {
    if (
      items[id].slot === "torso" &&
      this.s.inventory.filter((x) => items[x.id].slot === "torso").length >= 3
    ) {
      this.s.pendingArmor = id;
      return null;
    }
    const c = { uid: this.uid(), id, gem: null };
    this.s.inventory.push(c);
    this.s.stats.itemsGained.push(items[id].name);
    if (items[id].cursed && items[id].slot !== "gem") {
      const slots = Object.keys(this.s.equipment).filter((k) =>
        k.startsWith(items[id].slot),
      );
      const free =
        slots.find((k) => !this.s.equipment[k]) ||
        slots.find((k) => !items[this.getItem(this.s.equipment[k]).id].cursed);
      if (free) this.s.equipment[free] = c.uid;
      else c.unequippedCurse = true;
    }
    return c;
  }
  getItem(uid) {
    return this.s.inventory.find((x) => x.uid === uid);
  }
  log(msg) {
    this.decisionLog?.push(msg);
    this.s.log.push(msg);
    if (this.s.log.length > 120) this.s.log.shift();
  }
  gainGold(n) {
    this.s.gold += n;
    this.s.stats.goldEarned += n;
  }
  spend(n) {
    this.s.gold -= n;
    this.s.stats.goldSpent += n;
  }
  bonuses() {
    const sum = {
      insight: 4,
      focus: 1,
      channel: 2,
      movement: 2,
      damage: 0,
      shield: 0,
      heal: 0,
      armor: 0,
      recall: 0,
    };
    for (const uid of Object.values(this.s.equipment)) {
      const inst = this.getItem(uid);
      if (!inst) continue;
      const d = items[inst.id];
      for (const [k, v] of Object.entries(d.effect))
        if (typeof v === "number") sum[k] = (sum[k] || 0) + v;
      if (inst.gem) {
        const g = items[this.getItem(inst.gem)?.id];
        if (g)
          for (const [k, v] of Object.entries(g.effect))
            if (typeof v === "number") sum[k] = (sum[k] || 0) + v;
        if (d.synergy === g?.id) sum.heal++;
      }
    }
    for (const inst of this.s.inventory)
      if (items[inst.id].cursed && inst.unequippedCurse) sum.movement--;
    for (const k of ["insight", "focus", "channel", "movement"])
      sum[k] = Math.max(1, Math.floor(sum[k]));
    return sum;
  }
  equipped() {
    return Object.entries(this.s.equipment).flatMap(([slot, uid]) => {
      const x = this.getItem(uid);
      return x
        ? [
            {
              ...x,
              slot,
              definition: items[x.id],
              element: items[this.getItem(x.gem)?.id]?.element || "Arcane",
            },
          ]
        : [];
    });
  }
  pool(rarity = "common", reward = false) {
    return Object.values(cards).filter(
      (c) =>
        c.type !== "Hex" &&
        c.rarity === rarity &&
        !["surge"].includes(c.id) &&
        (!reward || !["blast", "shield"].includes(c.id)),
    );
  }
  rareOffer(count = 1, reward = true) {
    const pool = this.pool("rare", reward),
      result = [];
    while (result.length < count && pool.length) {
      const tickets = pool.flatMap((c) => Array(c.offerWeight ?? 4).fill(c.id));
      const id = this.pick(tickets);
      result.push(id);
      pool.splice(
        pool.findIndex((c) => c.id === id),
        1,
      );
    }
    return result;
  }
  offer(rare = false, reward = true) {
    const common = this.shuffle(
      this.pool("common", reward).map((c) => c.id),
    ).slice(0, rare ? 2 : 3);
    return rare ? [...common, ...this.rareOffer(1, reward)] : common;
  }
  drawDeck(key, source) {
    let a = this.s[key];
    if (!a.length) this.s[key] = a = this.shuffle(source);
    return a.pop();
  }
  rollSpawn(opening = false) {
    // d20: 1–10 enemy, 11–15 loot, 16–19 Event, 20 reroll.
    // Taverns are scheduled, not random. Subtypes use a separate d10.
    let category;
    do {
      category = 1 + Math.floor(this.rand() * 20);
    } while (category === 20);
    if (category <= 10) {
      const subtype = 1 + Math.floor(this.rand() * 10);
      return opening || subtype <= 8 ? "Mote" : "Eidolon";
    }
    if (category <= 15)
      return 1 + Math.floor(this.rand() * 10) <= 6 ? "Gold" : "Item";
    return "Event";
  }
  normalizeSpawns() {
    const f = this.s.field;
    if (f.spawnWidth === 2) return;
    // Retain each already revealed legacy entry as the second member of its pair.
    f.spawned *= 2;
    f.queue = f.queue.flatMap((type, i) => [
      this.rollSpawn(f.spawned / 2 + i < 4),
      type,
    ]);
    f.spawnWidth = 2;
    if (this.s.mode === "battle") this.s.battle.channel++;
    this.batch();
  }
  batch() {
    const f = this.s.field;
    while (f.queue.length < Math.min(8, 32 - f.spawned)) {
      const number = f.spawned + f.queue.length + 1;
      f.queue.push(
        number === 16
          ? "Tavern"
          : number === 32
            ? "Archon"
            : this.rollSpawn(number <= 8),
      );
    }
  }
  groupSize(id, round) {
    if (!enemies[id].grouped || round <= 4) return 1;
    return (round <= 10 ? 1 : 2) + Math.floor(this.rand() * 2);
  }
  beginRound() {
    if (this.s.mode === "result") return;
    const f = this.s.field;
    f.round++;
    f.stage = "player";
    f.moves = this.bonuses().movement;
    for (const e of f.entities) if (e.type === "Gold") e.value -= 5;
    f.entities = f.entities.filter((e) => e.type !== "Gold" || e.value > 0);
    this.s.mode = "field";
    if (f.spawned < 32) {
      this.batch();
      // Place the complete pair before resolving collisions with the player.
      for (const type of f.queue.splice(0, 2)) {
        f.spawned++;
        const die = () => Math.floor(this.rand() * 6);
        const e = {
          uid: this.uid(),
          type,
          x: type === "Archon" ? 5 : die() + die(),
          y: type === "Archon" ? 5 : die() + die(),
          restless: 0,
          born: f.round,
        };
        if (["Mote", "Eidolon", "Archon"].includes(type)) {
          if (type === "Archon") e.enemy = this.s.archon;
          else {
            let d = this.s.enemyDecks[type];
            if (!d.length)
              this.s.enemyDecks[type] = d = this.shuffle(
                Object.values(enemies)
                  .filter((x) => x.tier === type && !x.summonOnly)
                  .map((x) => x.id),
              );
            e.enemy = d.pop();
          }
          e.count = this.groupSize(e.enemy, f.round);
        }
        if (type === "Gold") e.value = Math.max(10, (die() + die()) * 10);
        f.entities.push(e);
        this.log(
          `${e.enemy ? enemies[e.enemy].name + (e.count > 1 ? " ×" + e.count : "") : type} appears at ${e.x + 1}, ${e.y + 1}.`,
        );
      }
      // Four-pair blocks retain the old four-round Restlessness cadence.
      if (f.spawned < 32 && f.spawned % 8 === 0)
        for (const e of f.entities) if (e.enemy) e.restless++;
      this.batch();
    }
    this.resolveTile();
  }
  resolveTile() {
    if (this.s.pendingArmor) {
      this.s.pendingTile = true;
      return;
    }
    const s = this.s,
      f = s.field,
      here = f.entities.filter((e) => e.x === f.x && e.y === f.y),
      foes = here.filter((e) => e.enemy);
    if (foes.length) {
      this.beginBattle(foes);
      return;
    }
    const e = here[0];
    if (e) {
      f.entities = f.entities.filter((x) => x.uid !== e.uid);
      if (e.type === "Gold") {
        this.gainGold(e.value);
        this.log(`Collected ${e.value} Gold.`);
        return this.resolveTile();
      }
      if (e.type === "Item") {
        const options = [this.drawDeck("itemDeck", Object.keys(items))];
        s.mode = "item";
        s.itemOffer = options;
        return;
      }
      if (e.type === "Event") {
        s.event = s.quest
          ? "shrine"
          : this.drawDeck(
              "eventDeck",
              events.filter((x) => x.id !== "shrine").map((x) => x.id),
            );
        s.quest = false;
        s.mode = "event";
        return;
      }
      if (e.type === "Tavern") {
        this.openTavern();
        return;
      }
    }
    s.mode = "field";
    if (f.stage === "enemyDone") this.beginRound();
    else if (f.moves <= 0) this.endMovement();
  }
  endMovement() {
    const f = this.s.field;
    f.moves = 0;
    f.stage = "enemyDone";
    const reaching = new Set();
    const arrive = (e) => {
      if (e.x !== f.x || e.y !== f.y || reaching.has(e.uid)) return;
      reaching.add(e.uid);
      for (const mate of f.entities.filter((x) => x.enemy && x.uid !== e.uid)) {
        const d = enemies[mate.enemy];
        if (
          d.pack &&
          enemies[e.enemy].name.includes(d.pack) &&
          !(mate.x === f.x && mate.y === f.y)
        )
          move(
            mate,
            2,
            (x) => Math.sign(f.x - x.x),
            (x) => Math.sign(f.y - x.y),
          );
      }
    };
    const move = (e, n, dx, dy) => {
      arrive(e);
      for (let k = 0; k < n; k++) {
        if (e.x === f.x && e.y === f.y) break;
        const from = { x: e.x, y: e.y };
        e.x = clamp(e.x + dx(e), 0, 10);
        e.y = clamp(e.y + dy(e), 0, 10);
        if (e.x !== from.x || e.y !== from.y)
          this.present("move", {
            uid: e.uid,
            enemy: e.enemy,
            from,
            to: { x: e.x, y: e.y },
          });
        arrive(e);
      }
    };
    for (const e of f.entities.filter((e) => e.enemy)) {
      const d = enemies[e.enemy];
      let n = (d.speed || 2) + e.restless,
        type = d.movement;
      if (type === "Archon") {
        const age = f.round - e.born + 1;
        if (age >= 6 || (d.bossMode === "hunter" && age >= 5)) type = "Hunter";
        else if (
          d.bossMode === "hunter" ||
          (d.bossMode === "sentinel" && age <= 3)
        )
          n = 0;
        else n = age - 1;
        type = type === "Hunter" ? type : "Stalker";
      }
      if (type === "Hunter") {
        // Hunter traversal is visual only; arrival effects occur at its destination.
        while (e.x !== f.x || e.y !== f.y) {
          const from = { x: e.x, y: e.y };
          e.x += Math.sign(f.x - e.x);
          e.y += Math.sign(f.y - e.y);
          this.present("move", {
            uid: e.uid,
            enemy: e.enemy,
            from,
            to: { x: e.x, y: e.y },
          });
        }
        move(
          e,
          0,
          () => 0,
          () => 0,
        );
      } else if (type === "Sentinel") {
      } else if (type === "Wanderer") {
        const dx = Math.floor(this.rand() * 3) - 1,
          dy = Math.floor(this.rand() * 3) - 1;
        move(
          e,
          n,
          () => dx,
          () => dy,
        );
      } else
        move(
          e,
          n,
          (x) => Math.sign(f.x - x.x) * (type === "Skittish" ? -1 : 1),
          (x) => Math.sign(f.y - x.y) * (type === "Skittish" ? -1 : 1),
        );
    }
    this.resolveTile();
  }
  instance(c) {
    const d = cards[c.id];
    return {
      ...c,
      used: 0,
      lastActivatedTurn: 0,
      lastActivationElement: null,
      charge: 0,
      hp: d.hp ? d.hp + (c.upgrade ? d.upgrade?.bonus || 0 : 0) : 0,
      maxHp: d.hp ? d.hp + (c.upgrade ? d.upgrade?.bonus || 0 : 0) : 0,
      ward: d.ward || 0,
      element: d.element,
      transmuted: false,
      placed: ++this.s.battle.order,
      lock: false,
      sever: false,
      freeze: 0,
      zeroWard: false,
      status: blankStatus(),
    };
  }
  beginBattle(entities) {
    const s = this.s;
    delete s.checkpoint;
    s.mode = "battle";
    s.battle = {
      turn: 0,
      phase: "place",
      columns: MIND_COLUMNS,
      rows: MIND_ROWS,
      grid: Array.from({ length: MIND_SIZE }, () => []),
      deck: clone(s.deck),
      hand: [],
      discard: [],
      destroyed: [],
      enemies: entities.flatMap((e) =>
        Array.from({ length: e.count || 1 }, (_, member) => ({
          ...e,
          ...enemies[e.enemy],
          entityUid: e.uid,
          uid: member === 0 ? e.uid : this.uid(),
          name:
            enemies[e.enemy].name +
            ((e.count || 1) > 1 ? " " + (member + 1) : ""),
          hp: enemies[e.enemy].hp,
          maxHp: enemies[e.enemy].hp,
          cycle: 0,
          buff: 0,
          guard: 0,
          status: blankStatus(),
        })),
      ),
      order: 0,
      firstAttackTurn: 0,
      permanent: { focus: 0 },
      next: { focus: 0, insight: 0 },
      shields: [],
      bracelets: [],
      jobs: [],
      reaction: null,
      relief: 0,
      mirror: false,
    };
    s.status = blankStatus();
    const b = s.battle;
    for (const e of this.equipped())
      for (const k of ["burn", "poison", "corrode"])
        s.status[k] += e.definition.effect[k] || 0;
    for (const x of s.inventory)
      if (x.id === "curseGem" && !s.inventory.some((a) => a.gem === x.uid))
        s.status.poison++;
    if (s.deck.some((x) => x.id === "rust")) s.status.corrode++;
    for (const c of [...b.deck])
      if (cards[c.id].opening) {
        b.deck = b.deck.filter((x) => x.uid !== c.uid);
        b.grid[b.grid.findIndex((x) => !x.length)].push(this.instance(c));
        b.next.focus++;
      }
    this.log("Battle: " + b.enemies.map((e) => e.name).join(", "));
    s.stats.encounters.push({
      round: s.field.round,
      enemies: b.enemies.map((e) => e.name),
      outcome: "in progress",
      hpStart: s.hp,
    });
    this.beginTurn();
    s.checkpoint = clone({ ...s, checkpoint: undefined });
  }
  neighbors(i) {
    return gridNeighbors(this.s.battle, i);
  }
  allowance(c, i) {
    return cardAllowance(this.s.battle, c, i);
  }
  activationAvailable(c, i) {
    return (
      !!c &&
      this.allowance(c, i) > 0 &&
      !c.zeroWard &&
      c.freeze < this.s.battle.turn &&
      (cards[c.id].blink === true || c.lastActivatedTurn !== this.s.battle.turn)
    );
  }
  recallCost(slot) {
    const d = cards[top(slot)?.id];
    if (
      !d ||
      slot.some(
        (c) => c.lock || cards[c.id].singleUse || cards[c.id].unrecallable,
      )
    )
      return null;
    if (d.recallWhole != null) return d.recallWhole;
    if (slot.some((c) => cards[c.id].recall == null)) return null;
    return Math.max(
      0,
      slot.reduce((n, c) => n + cards[c.id].recall, 0) - this.bonuses().recall,
    );
  }
  condition(c, i) {
    const d = cards[c.id],
      ns = this.neighbors(i);
    return (
      !d.condition ||
      (d.condition === "isolated"
        ? ns.length === 0
        : d.condition === "corner"
          ? corner(i)
          : ns.some((j) => top(this.s.battle.grid[j]).element === d.condition))
    );
  }
  canStack(c, slot) {
    if (!slot.length) return true;
    const d = cards[c.id],
      t = cards[top(slot).id];
    return (
      d.stack === "supersede" ||
      d.stack === "recall" ||
      (d.stack === "pile" && c.id === top(slot).id) ||
      (d.stack === "tower" && t.tower) ||
      (d.stack === "fusion" &&
        t.type === "Spell" &&
        ["Water", "Earth"].includes(top(slot).element))
    );
  }
  beginTurn() {
    const s = this.s,
      b = s.battle;
    b.turn++;
    b.phase = "start";
    this.refillResources();
    s.hp = Math.min(s.maxHp, s.hp + this.bonuses().heal);
    for (const slot of b.grid)
      for (const c of slot) {
        if (c.freeze && c.freeze < b.turn) c.freeze = 0;
        if (c.taunt && c.tauntUntil != null && c.tauntUntil < b.turn) {
          c.taunt = false;
          delete c.tauntUntil;
        }
      }
    for (let i = 0; i < b.grid.length; i++) {
      const c = top(b.grid[i]);
      if (!c) continue;
      if (cards[c.id].growth) {
        c.hp += this.neighbors(i).length;
        c.maxHp = Math.max(c.maxHp || 0, c.hp);
      }
      for (const k of ["burn", "poison", "corrode"]) {
        c.hp -= c.status[k] || 0;
        if (c.status[k])
          c.status[k] =
            k === "burn"
              ? c.status[k] - 1
              : k === "corrode"
                ? c.status[k] + 1
                : c.status[k];
      }
      if (cards[c.id].type === "Ally" && c.hp <= 0) this.destroyCard(i, c.uid);
    }
    if (s.deck.some((c) => c.id === "itch") && b.turn > b.relief) {
      s.hp--;
      s.stats.damageTaken++;
      this.log("Burning Itch: lose 1 HP.");
    }
    if (s.hp <= 0) return this.finish(false, "Burning Itch");
    b.jobs = [];
    for (const k of ["burn", "poison", "corrode"])
      if (s.status[k]) {
        b.jobs.push({
          kind: "hit",
          damage: s.status[k],
          element: "Arcane",
          statusHit: true,
          name: k,
        });
        s.status[k] =
          k === "burn"
            ? s.status[k] - 1
            : k === "corrode"
              ? s.status[k] + 1
              : s.status[k];
      }
    b.jobs.push({ kind: "reveal" });
    this.pump();
  }
  refillResources() {
    const b = this.s.battle,
      bonus = this.bonuses();
    b.focus = bonus.focus + b.permanent.focus + b.next.focus;
    b.channel = bonus.channel;
    b.insight = Math.max(
      1,
      bonus.insight +
        b.next.insight -
        (b.discard.some((x) => x.id === "fog") ? 1 : 0),
    );
    if (b.discard.some((c) => c.id === "bone"))
      b.focus = Math.max(1, Math.floor(b.focus / 2));
    b.focus = Math.max(1, b.focus);
  }
  reveal() {
    const b = this.s.battle;
    this.refillResources();
    b.phase = "place";
    b.revealInsight = b.insight;
    b.next = { focus: 0, insight: 0 };
    b.hand = [];
    for (let n = 0; n < b.insight; n++) {
      if (!b.deck.length) {
        b.deck = b.discard;
        b.discard = [];
      }
      if (!b.deck.length) break;
      const at = Math.floor(this.rand() * b.deck.length);
      b.hand.push(b.deck.splice(at, 1)[0]);
    }
    b.milky = b.hand.some((c) => c.id === "milky");
    this.log(
      `Turn ${b.turn}: ${b.insight} Insight · ${b.focus} Focus · ${b.channel} Channel.`,
    );
    b.insight = 0;
    this.present("reveal", {
      name: "Reveal",
      insight: b.revealInsight,
      cards: b.hand.map((c) => c.uid),
    });
  }
  tell(e) {
    const d = enemies[e.id],
      t = clone(d.rotation[e.cycle % d.rotation.length]);
    if (t.currentElement) t.element = e.element;
    t.damage =
      (t.damage || 0) +
      (t.damage
        ? Math.floor(e.cycle / d.rotation.length) +
          (e.restless || 0) +
          e.buff +
          (e.tier === "Archon" && e.hp <= e.maxHp / 2 ? 3 : 0)
        : 0);
    return t;
  }
  endTurn() {
    const b = this.s.battle;
    b.discard.push(...b.hand);
    b.hand = [];
    for (const [i, slot] of b.grid.entries())
      for (const c of [...slot])
        if (cards[c.id].expiresAtTurnEnd) {
          this.present("activate", {
            slot: i,
            name: cards[c.id].name + " fades",
          });
          this.destroyCard(i, c.uid);
          this.log(cards[c.id].name + " is Destroyed at turn end.");
        }
    b.phase = "enemy";
    this.refillResources();
    this.present("resources", { name: "Resources refreshed" });
    b.bracelets = this.equipped()
      .filter((x) => x.definition.effect.block)
      .map((x) => ({
        uid: x.uid,
        block: x.definition.effect.block,
        element: x.element,
        name: x.definition.name,
      }));
    b.jobs = [];
    for (const e of b.enemies) {
      clearImmuneStatus(e);
      for (const k of ["burn", "poison", "corrode"])
        if (e.status[k]) {
          b.jobs.push({
            kind: "enemyStatus",
            uid: e.uid,
            status: k,
            damage: e.status[k],
          });
          e.status[k] =
            k === "burn"
              ? e.status[k] - 1
              : k === "corrode"
                ? e.status[k] + 1
                : e.status[k];
        }
      b.jobs.push({ kind: "enemyAction", uid: e.uid });
    }
    b.jobs.push({ kind: "nextTurn" });
    this.pump();
  }
  pump() {
    const s = this.s,
      b = s.battle;
    while (s.mode === "battle" && !b.reaction && b.jobs.length) {
      const j = b.jobs.shift();
      if (j.kind === "reveal") {
        this.reveal();
        continue;
      }
      if (j.kind === "nextTurn") {
        b.shields = [];
        this.beginTurn();
        return;
      }
      if (j.kind === "enemyStatus") {
        const e = b.enemies.find((x) => x.uid === j.uid);
        if (e && j.status && enemyStatusImmunity(e) === j.status) {
          clearImmuneStatus(e);
          continue;
        }
        if (e) {
          e.hp -= j.damage;
          this.present("hit", {
            target: "enemy",
            uid: e.uid,
            amount: j.damage,
            element: "Arcane",
            statusTick: j.status || null,
            dead: e.hp <= 0 && !enemies[e.id].onDeath,
          });
          s.stats.damageDealt += j.damage;
        }
        this.checkBattle();
        continue;
      }
      if (j.kind === "enemyAction") {
        const e = b.enemies.find((x) => x.uid === j.uid && x.hp > 0);
        if (!e) continue;
        const t = this.tell(e);
        e.cycle++;
        this.log(
          e.name +
            ": " +
            t.name +
            (t.damage
              ? ` · ${t.damage} ${t.element}${t.hits ? " ×" + t.hits : ""}`
              : ""),
        );
        if (e.id === "hart" && e.hp <= e.maxHp / 2) s.status.burn++;
        if (e.id === "choir" && e.hp <= e.maxHp / 2 && e.cycle % 4 === 1)
          e.guard += 8;
        if (t.randomElement) {
          e.element = this.pick(ELEMENTS);
          const cleared = clearImmuneStatus(e);
          if (cleared)
            this.log(
              e.name +
                " clears " +
                statusName(cleared) +
                " through " +
                e.element +
                " immunity.",
            );
          this.log(e.name + " attunes to " + e.element + ".");
          this.present("status", {
            target: "enemy",
            uid: e.uid,
            name: t.name + " · " + e.element,
          });
        }
        if (t.grid) this.gridAttack(t);
        if (t.insight) b.next.insight += t.insight;
        if (t.howl)
          for (const wolf of b.enemies)
            if (wolf.name.includes("Wolf")) wolf.buff += t.howl;
        if (t.guard) e.guard += t.guard;
        if (t.flicker) e.flicker = true;
        if (!t.damage)
          for (const k of ["burn", "poison", "corrode"])
            if (t[k]) {
              const allies = b.grid
                .map((x, i) => ({ c: top(x), i }))
                .filter((x) => cards[x.c?.id]?.type === "Ally")
                .sort((a, z) => a.c.placed - z.c.placed);
              if (t.allyStatus && allies.length) allies[0].c.status[k] += t[k];
              else s.status[k] += t[k];
            }
        if (t.damage)
          b.jobs.unshift(
            ...Array.from({ length: t.hits || 1 }, () => ({
              kind: "hit",
              ...t,
              source: e.uid,
            })),
          );
        continue;
      }
      if (j.kind === "hit") {
        b.reaction = {
          ...j,
          stage: j.statusHit ? "player" : "defend",
          column: j.pierce ? -1 : MIND_COLUMNS - 1,
          intercepted: [],
        };
        this.present("incoming", {
          source: j.source,
          amount: j.damage,
          element: j.element,
          name: j.name,
        });
        this.advanceHit();
      }
    }
  }
  activeWards() {
    return this.s.battle.grid
      .flatMap((slot, i) =>
        slot
          .filter(
            (c, k) =>
              cards[c.id].type === "Ward" &&
              c.ward > 0 &&
              (k === slot.length - 1 || cards[top(slot)?.id]?.coveredWards),
          )
          .map((c) => ({ c, i })),
      )
      .sort((a, z) => a.c.placed - z.c.placed);
  }
  allies() {
    return this.s.battle.grid
      .map((x, i) => ({ c: top(x), i }))
      .filter((x) => cards[x.c?.id]?.type === "Ally" && x.c.hp > 0);
  }
  defenseChoices() {
    const b = this.s.battle,
      h = b?.reaction;
    const empty = { wards: [], shields: [], allies: [], bracelets: [] };
    if (!h || h.statusHit || h.stage === "player") return empty;
    // Older saved reactions infer position from their last actual impact.
    const column =
      h.column ??
      (h.lastNode?.kind === "card"
        ? h.lastNode.slot % MIND_COLUMNS
        : h.lastNode?.kind === "item" || h.stage === "bracelet"
          ? -1
          : MIND_COLUMNS - 1);
    const reachable = (i) => !h.pierce && i % MIND_COLUMNS <= column;
    return {
      wards: h.cull ? [] : this.activeWards().filter((x) => reachable(x.i)),
      shields: h.cull
        ? []
        : b.shields.filter(
            (p) =>
              p.block > 0 &&
              reachable(p.slot) &&
              top(b.grid[p.slot])?.uid === p.owner,
          ),
      allies: this.allies().filter(
        (x) => reachable(x.i) && !(h.intercepted || []).includes(x.c.uid),
      ),
      bracelets: b.bracelets.filter((p) => p.block > 0),
    };
  }
  presentIncomingNode(kind, detail, node) {
    const h = this.s.battle.reaction;
    const pathFrom = h.statusHit
      ? null
      : h.lastNode ||
        (h.source != null ? { kind: "enemy", uid: h.source } : null);
    h.lastNode = node;
    if (node.kind === "card") h.column = node.slot % MIND_COLUMNS;
    else if (node.kind === "item") {
      h.column = -1;
      h.stage = "bracelet";
    }
    this.present(kind, {
      ...detail,
      element: h.element,
      attackPath: true,
      pathFrom,
      pathTo: node,
      remaining: node.kind === "player" ? 0 : h.damage,
    });
  }
  advanceHit() {
    const s = this.s,
      b = s.battle,
      h = b.reaction;
    if (!h) return;
    if (h.damage <= 0) {
      this.finishHit();
      return;
    }
    if (h.stage !== "player") {
      const choices = this.defenseChoices();
      const forced = h.weakest
        ? [...choices.allies].sort((a, z) => a.c.hp - z.c.hp || a.i - z.i)[0]
        : choices.allies.find((x) => x.c.taunt);
      if (forced) {
        this.intercept(forced.i);
        return;
      }
      if (Object.values(choices).some((list) => list.length)) {
        const hasGrid =
          choices.wards.length ||
          choices.shields.length ||
          choices.allies.length;
        h.stage = hasGrid ? "defend" : "bracelet";
        if (!hasGrid) {
          h.column = -1;
          h.weaknessBonus = 0;
          h.weaknessElement = null;
        }
        return;
      }
      h.stage = "player";
    }
    if (h.stage === "player") {
      let damage = h.damage;
      const armor = h.statusHit
        ? null
        : this.equipped().find((x) => x.slot === "torso");
      if (armor?.definition.effect.reflect && !b.mirror && !h.statusHit) {
        b.mirror = true;
        const e = b.enemies.find((x) => x.uid === h.source);
        if (e) {
          e.hp -= damage;
          s.stats.damageDealt += damage;
        }
        damage = 0;
      }
      if (armor?.definition.effect.resist === h.element)
        damage = Math.ceil(damage / 2);
      if (!h.statusHit) damage = Math.max(0, damage - this.bonuses().armor);
      const loss = Math.min(s.hp, damage);
      s.hp = Math.max(0, s.hp - damage);
      this.presentIncomingNode(
        "hit",
        {
          target: "player",
          amount: damage,
          loss,
          element: h.element,
          name: h.name,
          armor: armor?.uid,
        },
        { kind: "player" },
      );
      s.stats.damageTaken += damage;
      if (damage) this.log(`${h.name}: you take ${damage} damage.`);
      this.finishHit();
      if (s.hp <= 0) this.finish(false, h.name);
    }
  }
  finishHit() {
    const b = this.s.battle,
      h = b.reaction;
    if (!h) return;
    if (!h.statusHit)
      for (const k of ["burn", "poison", "corrode"])
        if (h[k]) this.s.status[k] += h[k];
    if (h.deathSource != null) {
      const source = b.enemies.find((e) => e.uid === h.deathSource);
      if (source) source.deathResolved = true;
      this.present("death", { uid: h.deathSource, name: h.name + " fades" });
    }
    b.reaction = null;
    if (this.s.hp <= 0) this.finish(false, h.name, h);
    else this.checkBattle();
  }
  intercept(i) {
    const b = this.s.battle,
      h = b.reaction,
      c = top(b.grid[i]);
    const result = allyHit(h, c.element, c.hp, cards[c.id].swallow);
    const damage = result.damage;
    c.hp = Math.max(0, c.hp - damage);
    h.damage = result.remaining;
    h.weaknessBonus = result.weaknessBonus;
    h.weaknessElement = result.weaknessElement;
    h.intercepted.push(c.uid);
    this.presentIncomingNode(
      "hit",
      {
        target: "card",
        slot: i,
        amount: damage,
        loss: result.absorbed,
        dead: c.hp <= 0,
        element: h.element,
      },
      { kind: "card", slot: i },
    );
    if (c.hp <= 0) this.destroyCard(i, c.uid);
    this.advanceHit();
  }
  destroyCard(i, uid) {
    const b = this.s.battle,
      j = b.grid[i].findIndex((c) => c.uid === uid);
    if (j >= 0) b.destroyed.push(...b.grid[i].splice(j, 1));
  }
  gridTelegraphs() {
    const b = this.s.battle;
    if (!b || b.reaction || !["start", "place", "activate"].includes(b.phase))
      return [];
    return b.enemies
      .filter((e) => e.hp > 0 && ["hart", "colossus", "choir"].includes(e.id))
      .flatMap((e) => {
        const tell = this.tell(e);
        if (!["row", "column", "destroy"].includes(tell.grid)) return [];
        const targets = gridTargets(b, tell);
        const line = targets.length
          ? tell.grid === "row"
            ? Math.floor(targets[0] / MIND_COLUMNS)
            : targets[0] % MIND_COLUMNS
          : null;
        const spaces =
          targets.length && ["row", "column"].includes(tell.grid)
            ? b.grid
                .map((_, i) => i)
                .filter((i) =>
                  tell.grid === "row"
                    ? Math.floor(i / MIND_COLUMNS) === line
                    : i % MIND_COLUMNS === line,
                )
            : targets;
        return [
          {
            source: e.uid,
            enemy: e.name,
            name: tell.name,
            kind: tell.grid,
            target: tell.target,
            targets,
            spaces,
            cards: targets.reduce((n, i) => n + b.grid[i].length, 0),
          },
        ];
      });
  }
  gridAttack(t) {
    const b = this.s.battle;
    const targets = gridTargets(b, t).map((i) => ({
      i,
      slot: b.grid[i],
      c: top(b.grid[i]),
    }));
    for (const x of targets) {
      if (["destroy", "row", "column"].includes(t.grid)) {
        b.destroyed.push(...x.slot);
        b.grid[x.i] = [];
      } else if (t.grid === "siphon") x.c.used++;
      else if (t.grid === "freeze") x.c.freeze = b.turn + 1;
      else x.c[t.grid] = true;
      this.present("hit", {
        target: "card",
        slot: x.i,
        name: t.name,
        dead: ["destroy", "row", "column"].includes(t.grid),
      });
      this.log(`${t.name} targets slot ${x.i + 1}.`);
    }
  }
  applyEnemyStatus(e, status, value, sourceSlot = null) {
    if (enemyStatusImmunity(e) === status) {
      clearImmuneStatus(e);
      this.log(`${e.name} is immune to ${statusName(status)} (${e.element}).`);
      this.present("status", {
        target: "enemy",
        uid: e.uid,
        name: `Immune to ${statusName(status)}`,
        statusEffect: status,
        sourceSlot,
        immune: true,
      });
      return false;
    }
    e.status[status] += value;
    this.present("status", {
      target: "enemy",
      uid: e.uid,
      name: `${statusName(status)} +${value}`,
      statusEffect: status,
      sourceSlot,
      value,
    });
    return true;
  }
  damageEnemy(e, n, element, activation, sourceItem = null) {
    if (!e || e.hp <= 0 || activation.blocked?.has(e.uid)) return;
    const s = this.s,
      b = s.battle;
    let d = enemyDamage(n, element, e);
    const guard = Math.min(d, e.guard);
    e.guard -= guard;
    d -= guard;
    e.hp -= d;
    this.present("hit", {
      target: "enemy",
      uid: e.uid,
      amount: d,
      element,
      ...(sourceItem != null ? { sourceItem } : {}),
      dead: e.hp <= 0 && !enemies[e.id].onDeath,
    });
    s.stats.damageDealt += Math.min(d, Math.max(0, e.hp + d));
    if (e.id === "colossus" && element === e.element && !activation.summoned) {
      activation.summoned = true;
      const def = enemies.mini;
      b.enemies.push({
        ...def,
        element: e.element,
        uid: this.uid(),
        entityUid: null,
        maxHp: def.hp,
        hp: def.hp,
        cycle: 0,
        buff: 0,
        restless: 0,
        guard: 0,
        status: blankStatus(),
      });
      this.log(`A ${e.element} Mini-Void tears free.`);
    }
  }
  matchingNeighbors(c, i) {
    return matchingNeighbors(this.s.battle, c, i);
  }
  shieldPower(c, i) {
    const d = cards[c.id];
    return (
      (d.effects.shield || 0) +
      (c.upgrade ? d.upgrade?.bonus || 0 : 0) +
      (d.effects.matchingShield || 0) * this.matchingNeighbors(c, i) +
      (d.name.includes("Shield") ? this.bonuses().shield : 0)
    );
  }
  cardPower(c, i) {
    return cardPower(this.s.battle, c, i);
  }
  applyCard(c, i, target, element, a = {}, context = {}) {
    const s = this.s,
      b = s.battle,
      d = cards[c.id],
      f = d.effects,
      bonus = c.upgrade ? d.upgrade?.bonus || 0 : 0;
    if (!this.activationAvailable(c, i)) return;
    c.lastActivatedTurn = b.turn;
    c.lastActivationElement = element || c.element;
    c.used++;
    if (d.charge) {
      c.charge++;
      if (c.charge < d.charge) return;
      c.charge -= d.charge;
    }
    if (f.transmute) {
      const victim = top(b.grid[a.cardTarget]);
      if (victim) {
        victim.element = a.newElement;
        victim.transmuted = true;
      }
    }
    if (f.shift) {
      const moved = b.grid[a.cardTarget];
      b.grid[a.destination] = moved;
      b.grid[a.cardTarget] = [];
      if (
        this.neighbors(a.destination).some(
          (j) => top(b.grid[j]).element === top(moved).element,
        )
      )
        b.next.focus++;
    }
    if (f.unbind)
      for (const slot of b.grid)
        for (const x of slot) {
          x.lock = false;
          x.sever = false;
          x.freeze = 0;
        }
    if (f.selfGrowth) {
      c.maxHp = Math.max(c.maxHp || 0, c.hp) + f.selfGrowth;
      c.hp += f.selfGrowth;
    }
    if (f.taunt) {
      for (const x of this.allies()) {
        x.c.taunt = false;
        delete x.c.tauntUntil;
      }
      c.taunt = true;
      c.tauntUntil = f.tauntRound ? b.turn : null;
    }
    if (f.magnify && b.grid[i].length >= 2) {
      if (c.lastActivated === b.turn - 1) c.magnified = true;
      c.lastActivated = b.turn;
    }
    if (f.ward) c.ward += f.ward + bonus;
    if (f.shield)
      b.shields.push({
        uid: this.uid(),
        slot: i,
        owner: c.uid,
        block: this.shieldPower(c, i),
        element,
      });
    if (f.heal)
      s.hp = Math.min(
        s.maxHp,
        s.hp + f.heal + bonus + (f.adjHeal || 0) * this.neighbors(i).length,
      );
    if (f.allyHeal) {
      const ally = top(b.grid[a.cardTarget]);
      if (ally) {
        ally.hp += f.allyHeal;
        ally.maxHp = Math.max(ally.maxHp || 0, ally.hp);
      }
    }
    if (f.cleanse) s.status = blankStatus();
    if (f.relief) b.relief = b.turn + f.relief;
    if (f.reliefRust) s.status.corrode = 0;
    if (f.insight) b.next.insight += f.insight;
    if (f.focus) b.next.focus += f.focus;
    if (f.focusPermanent) b.permanent.focus += f.focusPermanent;
    if (f.channel) b.channel += f.channel;
    if (
      f.damage ||
      f.hpDamage ||
      f.randomDamage ||
      f.burn ||
      f.poison ||
      f.corrode
    ) {
      const targets = f.all
        ? b.enemies.filter((x) => x.hp > 0)
        : [
            f.randomDamage || d.stack === "pile"
              ? this.pick(b.enemies.filter((x) => x.hp > 0))
              : b.enemies.find((x) => x.uid === target),
          ];
      const firstTarget = targets.find((e) => e?.hp > 0);
      const damaging = !!(f.damage || f.hpDamage || f.randomDamage);
      const firstAttack =
        damaging && firstTarget && b.firstAttackTurn !== b.turn;
      // Claim before Flicker/guard so a negated opening attack cannot bank the Ring.
      // All targets, Pile members and Fusion effects share this turn marker.
      if (firstAttack) b.firstAttackTurn = b.turn;
      for (const e of targets) {
        if (!e || e.hp <= 0) continue;
        if (e.flicker) {
          e.flicker = false;
          context.blocked ??= new Set();
          context.blocked.add(e.uid);
          this.log(e.name + " wastes the activation.");
          continue;
        }
        if (context.blocked?.has(e.uid)) continue;
        const old = e.hp;
        let n = f.randomDamage
          ? 1 + Math.floor(this.rand() * f.randomDamage)
          : this.cardPower(c, i);
        if (d.stack === "pile") n += a.pileBonus || 0;
        if (n) {
          const prism =
            f.prism &&
            ["Fire", "Earth", "Wind", "Water"].every((el) =>
              this.neighbors(i).some((j) => top(b.grid[j]).element === el),
            );
          for (const el of prism
            ? ["Fire", "Earth", "Wind", "Water"]
            : [element])
            this.damageEnemy(e, n, el, context);
          for (const gear of this.equipped())
            if (
              gear.definition.effect.damage &&
              (!gear.definition.effect.firstAttackOnly ||
                (firstAttack && e === firstTarget))
            )
              this.damageEnemy(
                e,
                gear.definition.effect.damage,
                gear.element,
                context,
                gear.uid,
              );
        }
        for (const k of ["burn", "poison", "corrode"])
          if (f[k]) this.applyEnemyStatus(e, k, f[k] + bonus, i);
        if (old > 0 && e.hp <= 0 && f.killChannel) b.channel += f.killChannel;
      }
    }
    if (f.burnAll) {
      for (const e of b.enemies.filter((e) => e.hp > 0)) {
        if (context.blocked?.has(e.uid)) continue;
        if (e.flicker) {
          e.flicker = false;
          context.blocked ??= new Set();
          context.blocked.add(e.uid);
          this.log(e.name + " wastes the activation.");
          continue;
        }
        this.applyEnemyStatus(e, "burn", f.burnAll + bonus, i);
      }
    }
    if (d.destroyAfterActivation) {
      this.present("activate", { slot: i, name: d.name + " is Destroyed" });
      this.destroyCard(i, c.uid);
      this.log(d.name + " is Destroyed after its single activation.");
    }
  }
  activate(a) {
    const b = this.s.battle,
      slot = b.grid[a.slot],
      c = top(slot),
      d = cards[c.id];
    if (!this.activationAvailable(c, a.slot)) return;
    const charging = d.charge && c.charge + 1 < d.charge;
    this.present("activate", {
      slot: a.slot,
      name: charging
        ? `${d.name} · Charge ${c.charge + 1}/${d.charge}`
        : d.name,
    });
    b.channel -= d.channel;
    const ctx = {};
    if (d.stack === "pile") {
      let order = 0;
      for (const ball of [...slot].reverse())
        if (ball.id === c.id && this.activationAvailable(ball, a.slot)) {
          this.applyCard(
            ball,
            a.slot,
            a.target,
            a.element,
            { ...a, pileBonus: order * 2 },
            ctx,
          );
          order++;
        }
    } else {
      this.applyCard(c, a.slot, a.target, a.element, a, ctx);
      if (d.stack === "fusion" && slot.length > 1) {
        const under = slot.at(-2),
          u = cards[under.id];
        if (
          u.type === "Spell" &&
          ["Water", "Earth"].includes(under.element) &&
          this.activationAvailable(under, a.slot)
        ) {
          this.applyCard(under, a.slot, a.target, under.element, a, ctx);
          const e = b.enemies.find((x) => x.uid === a.target);
          if (e && !ctx.blocked?.has(e.uid))
            this.applyEnemyStatus(e, "burn", 6, a.slot);
        }
      }
    }
    this.log("Activated " + d.name + ".");
    this.checkBattle();
    if (this.s.mode === "battle") this.pump();
  }
  checkBattle() {
    const s = this.s,
      b = s.battle;
    if (s.mode !== "battle") return;
    if (s.hp <= 0) {
      this.finish(false, "Battle damage");
      return;
    }
    const deathJobs = [];
    for (const e of b.enemies) {
      const effect = enemies[e.id].onDeath;
      if (e.hp <= 0 && effect && !e.deathTriggered) {
        e.deathTriggered = true;
        deathJobs.push({
          kind: "hit",
          ...clone(effect),
          source: e.uid,
          deathSource: e.uid,
        });
        this.log(
          e.name +
            " dies: " +
            effect.name +
            " · " +
            effect.damage +
            " " +
            effect.element +
            ".",
        );
      }
    }
    // Death attacks precede victory and pending turn jobs, using existing defenses.
    b.jobs.unshift(...deathJobs);
    if (b.reaction || b.jobs.some((j) => j.deathSource != null)) return;
    if (b.enemies.every((e) => e.hp <= 0)) {
      const encounter = s.stats.encounters.at(-1);
      encounter.outcome = "victory";
      encounter.turns = b.turn;
      encounter.hpEnd = s.hp;
      const original = b.enemies.filter((e) => e.entityUid);
      if (original.some((e) => e.herald)) s.revealedArchon = s.archon;
      const boss = original.some((e) => e.tier === "Archon"),
        elite = original.some((e) => e.tier === "Eidolon"),
        skittish = original.some((e) => e.movement === "Skittish");
      this.gainGold(boss ? 120 : elite || skittish ? 45 : 18 * original.length);
      s.field.entities = s.field.entities.filter(
        (e) => !original.some((x) => x.entityUid === e.uid),
      );
      s.status = blankStatus();
      s.mode = "reward";
      s.reward = {
        cards: boss ? this.rareOffer(3, true) : this.offer(elite || skittish),
        boss,
        gem: boss || elite || this.rand() < (skittish ? 0.65 : 0.12),
        setting: boss,
      };
      this.normalizeRewards();
      delete s.checkpoint;
      this.log("Victory. Choose a card or skip.");
    }
  }
  finish(win, cause = "", hit = null) {
    const s = this.s;
    if (s.mode === "result") return;
    if (!win) s.death = describeDeath(s, cause, hit);
    s.mode = "result";
    s.outcome = win ? "win" : "loss";
    s.cause = cause;
    s.hp = Math.max(0, s.hp);
    s.status = blankStatus();
    delete s.checkpoint;
    const encounter = s.stats.encounters.at(-1);
    if (encounter?.outcome === "in progress") {
      encounter.outcome = "loss";
      encounter.hpEnd = s.hp;
      encounter.turns = s.battle?.turn;
    }
    this.log(win ? "Stratum 1 Complete." : "You Died: " + cause);
  }
  openTavern() {
    this.s.mode = "tavern";
    this.s.shop = {
      stock: [
        ...this.offer(true, false).map((id) => "card:" + id),
        ...this.shuffle(
          Object.keys(items).filter((id) => !items[id].cursed),
        ).slice(0, 6),
      ],
      healer: this.s.nextTavernHealer ?? this.rand() < 0.75,
      healerPrice: this.pick([35, 50, 80]),
      healUsed: false,
      removeUsed: false,
    };
    const kind = this.pick(["gold", "hp", "hpGold", "allyGold", "item"]);
    this.s.shop.hexPrice = {
      kind,
      gold:
        kind === "gold"
          ? this.s.shop.healerPrice
          : ["hpGold", "allyGold"].includes(kind)
            ? Math.ceil(this.s.shop.healerPrice / 2)
            : 0,
      hp: kind === "hp" ? 12 : kind === "hpGold" ? 6 : 0,
    };
    delete this.s.nextTavernHealer;
    delete this.s.nextHealerHint;
  }
  equipChoices(add) {
    const s = this.s;
    for (const [slot, uid] of Object.entries(s.equipment)) {
      const item = this.getItem(uid);
      if (item && !items[item.id].cursed)
        add(
          "unequip",
          `Unequip ${items[item.id].name}`,
          { item: uid, slot },
          { unequip: true },
        );
    }
    for (const item of s.inventory) {
      const d = items[item.id];
      if (d.slot === "gem") continue;
      for (const slot of Object.keys(s.equipment).filter((k) =>
        k.startsWith(d.slot),
      )) {
        const worn = this.getItem(s.equipment[slot]);
        if (s.equipment[slot] === item.uid || (worn && items[worn.id].cursed))
          continue;
        add(
          "equip",
          `Equip ${d.name} · ${slot}`,
          { item: item.uid, slot },
          { gear: d.effect },
        );
      }
    }
  }
  legal() {
    const s = this.s,
      b = s.battle,
      actions = [];
    const add = (type, label, p = {}, effects = {}, costs = {}) => {
      const a = { type, ...p, label, effects, costs };
      a.key = JSON.stringify([type, p]);
      actions.push(a);
    };
    if (s.mode === "result") return [];
    if (s.pendingArmor) {
      for (const old of s.inventory.filter(
        (x) => items[x.id].slot === "torso" && !items[x.id].cursed,
      ))
        add(
          "replaceArmor",
          "Replace " + items[old.id].name,
          { old: old.uid },
          { gear: items[s.pendingArmor].effect },
        );
      add("declineArmor", "Leave " + items[s.pendingArmor].name);
      return actions;
    }
    if (s.mode === "class") {
      add("chooseClass", "Druid · Growth and pattern", {}, { progress: 1 });
      return actions;
    }
    if (s.mode === "gem") {
      for (const slot of Object.keys(s.equipment).filter(
        (slot) => /^(wrist|finger)/.test(slot) && s.equipment[slot] != null,
      ))
        add(
          "startGem",
          `Socket ${items[s.startGem].name} into ${slot.startsWith("wrist") ? "Bracelet" : "Ring"}`,
          { slot },
          {
            defense: slot.startsWith("wrist") ? items.bronze.effect.block : 0,
            damage: slot.startsWith("finger") ? items.ring.effect.damage : 0,
          },
        );
      return actions;
    }
    if (s.mode === "intro") {
      add("begin", "Enter the Whispering Weald", {}, { progress: 1 });
      return actions;
    }
    if (s.mode === "field") {
      if (s.field.moves > 0)
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (
              (dx || dy) &&
              s.field.x + dx >= 0 &&
              s.field.x + dx <= 10 &&
              s.field.y + dy >= 0 &&
              s.field.y + dy <= 10
            ) {
              const x = s.field.x + dx,
                y = s.field.y + dy,
                there = s.field.entities.filter((e) => e.x === x && e.y === y);
              add(
                "move",
                `Move to ${x + 1}, ${y + 1}`,
                { x, y },
                {
                  movement: 1,
                  occupants: there.map((e) =>
                    e.enemy ? enemies[e.enemy].tier : e.type,
                  ),
                },
              );
            }
      add("wait", "End movement", {}, { progress: 1 });
      this.equipChoices(add);
      return actions;
    }
    if (s.mode === "item") {
      s.itemOffer.forEach((id, index) =>
        add(
          "takeItem",
          id.startsWith("card:")
            ? "Take " + cards[id.slice(5)].name
            : "Take " + items[id].name,
          { index },
          { item: id },
        ),
      );
      add("leaveItem", "Leave item", {}, { skip: true });
      return actions;
    }
    if (s.mode === "event") {
      const event = events.find((x) => x.id === s.event);
      event.choices.forEach((c, index) => {
        if ((c.cost || 0) > s.gold) return;
        if (c.trade) {
          for (const asset of tradeAssets(s, c.trade).filter(
            (x) => x.eligible,
          )) {
            const isItem = c.trade.kind === "item",
              d = (isItem ? items : cards)[asset.id];
            const key = isItem ? "tradeItem" : "tradeCard";
            add(
              "eventChoice",
              `${c.label} · offer ${d.name}${asset.upgrade ? " +" : ""}`,
              { index, [key]: asset.uid },
              { ...c },
              { gold: c.cost || 0, [key]: asset.uid },
            );
          }
        } else
          add(
            "eventChoice",
            c.label,
            { index },
            { ...c },
            { gold: c.cost || 0 },
          );
      });
      return actions;
    }
    if (s.mode === "reward") {
      if (s.reward.cards) {
        for (const id of s.reward.cards)
          add("rewardCard", "Take " + cards[id].name, { id }, { card: id });
        add("skipReward", "Skip card");
      } else if (s.reward.gem) {
        for (const id of [s.reward.gem])
          add(
            "rewardGem",
            "Take " + items[id].name,
            { id },
            { gear: items[id].effect },
          );
      } else if (s.reward.setting) {
        for (const id of [s.reward.setting])
          add(
            "rewardSetting",
            "Take " + items[id].name,
            { id },
            { gear: items[id].effect },
          );
      } else
        add(
          "continueReward",
          s.reward.boss ? "Complete Stratum 1" : "Return to the Field",
          {},
          { progress: 1 },
        );
      return actions;
    }
    if (s.mode === "tavern") {
      const shop = s.shop;
      add("leave", "Leave the Lantern Rest", {}, { progress: 1 });
      if (s.gold >= 20 && !shop.healUsed && s.hp < s.maxHp)
        add(
          "heal",
          "Rest · heal 20 HP · 20 Gold",
          {},
          { heal: Math.min(20, s.maxHp - s.hp) },
          { gold: 20 },
        );
      if (s.gold >= 15 && !shop.gossipUsed)
        add(
          "gossip",
          "Gossip · Archon and next healer · 15 Gold",
          {},
          { information: 1 },
          { gold: 15 },
        );
      for (let index = 0; index < shop.stock.length; index++) {
        const id = shop.stock[index],
          d = id.startsWith("card:") ? cards[id.slice(5)] : items[id],
          price = d.worth || { common: 30, rare: 65, legendary: 120 }[d.rarity];
        if (s.gold >= price)
          add(
            "buy",
            `Buy ${d.name} · ${price} Gold`,
            { index, price },
            { item: id },
            { gold: price },
          );
      }
      this.equipChoices(add);
      for (const inst of s.inventory) {
        const d = items[inst.id];
        if (!s.inventory.some((x) => x.gem === inst.uid)) {
          const value = Math.floor(d.worth / 2);
          if (!d.cursed || s.gold >= value)
            add(
              "sell",
              `${d.cursed ? "Remove" : "Sell"} ${d.name} · ${d.cursed ? "-" : "+"}${value} Gold`,
              { uid: inst.uid, value },
              { sale: value, cursed: !!d.cursed },
            );
        }
        if (d.socket) {
          if (inst.gem)
            add("unsocket", "Unsocket " + d.name, { uid: inst.uid });
          for (const gem of s.inventory.filter(
            (x) =>
              items[x.id].slot === "gem" &&
              !s.inventory.some((i) => i.gem === x.uid),
          ))
            if (!d.forbid?.includes(gem.id))
              add(
                "socket",
                `Socket ${items[gem.id].name} into ${d.name}`,
                { uid: inst.uid, gem: gem.uid },
                { gear: items[gem.id].effect },
              );
        }
      }
      for (const c of s.deck) {
        const d = cards[c.id],
          up = d.upgrade;
        if (!shop.removeUsed && s.gold >= 40 && d.type !== "Hex")
          add(
            "remove",
            `Remove ${d.name} · 40 Gold`,
            { uid: c.uid },
            { thin: 1 },
            { gold: 40 },
          );
        if (d.type === "Hex" && shop.healer) {
          const price = shop.hexPrice || {
            kind: "gold",
            gold: shop.healerPrice,
            hp: 0,
          };
          const extras =
            price.kind === "allyGold"
              ? s.deck
                  .filter((x) => cards[x.id].type === "Ally")
                  .map((x) => ({
                    sacrificeCard: x.uid,
                    name: cards[x.id].name,
                  }))
              : price.kind === "item"
                ? s.inventory
                    .filter(
                      (x) =>
                        !items[x.id].cursed &&
                        !x.gem &&
                        !s.inventory.some((i) => i.gem === x.uid),
                    )
                    .map((x) => ({
                      sacrificeItem: x.uid,
                      name: items[x.id].name,
                    }))
                : [{ name: null }];
          if (s.gold >= price.gold && s.hp > price.hp)
            for (const extra of extras) {
              const { name, ...payment } = extra;
              const cost = [
                price.gold ? price.gold + " Gold" : null,
                price.hp ? price.hp + " HP" : null,
                name ? "sacrifice " + name : null,
              ]
                .filter(Boolean)
                .join(" + ");
              add(
                "removeHex",
                `Healer: remove ${d.name} · ${cost}`,
                { uid: c.uid, ...payment },
                { cleanse: true },
                { gold: price.gold, hp: price.hp, ...payment },
              );
            }
        }
        if (
          up &&
          !c.upgrade &&
          s.gold >= (up.gold || 0) &&
          s.hp > (up.hp || 0) &&
          (!up.element || this.equipped().some((e) => e.element === up.element))
        ) {
          if (up.sacrifice) {
            for (const other of s.deck.filter(
              (x) => x.uid !== c.uid && cards[x.id].rarity === d.rarity,
            ))
              add(
                "upgrade",
                `Upgrade ${d.name} · sacrifice ${cards[other.id].name}`,
                { uid: c.uid, sacrifice: other.uid },
                { upgrade: 1 },
              );
          } else
            add(
              "upgrade",
              `Upgrade ${d.name} · ${up.gold ? up.gold + " Gold" : up.hp + " HP"}`,
              { uid: c.uid },
              { upgrade: 1 },
              { gold: up.gold || 0, hp: up.hp || 0 },
            );
        }
      }
      return actions;
    }
    if (s.mode === "battle") {
      const h = b.reaction;
      if (h) {
        const choices = this.defenseChoices();
        for (const { c, i } of choices.wards)
          add(
            "ward",
            `${cards[c.id].name} · ${c.ward} ward`,
            { uid: c.uid, slot: i },
            { ward: c.ward, column: i % MIND_COLUMNS },
          );
        for (const p of choices.shields)
          add(
            "block",
            `${p.element} Shield · ${p.block} block`,
            { uid: p.uid, slot: p.slot },
            {
              block: p.block,
              element: p.element,
              column: p.slot % MIND_COLUMNS,
            },
          );
        for (const x of choices.allies)
          add(
            "intercept",
            `${cards[x.c.id].name} intercepts · ${x.c.hp} HP`,
            { slot: x.i },
            {
              allyHp: x.c.hp,
              element: x.c.element,
              swallow: !!cards[x.c.id].swallow,
              column: x.i % MIND_COLUMNS,
            },
          );
        for (const p of choices.bracelets)
          add(
            "bracelet",
            `${p.name} · ${p.element} · ${p.block} block`,
            { uid: p.uid },
            { block: p.block, element: p.element, column: -1 },
          );
        if (!h.statusHit && h.stage !== "player")
          add(
            "skipEquipment",
            "Take hit — save defenses",
            {},
            { takeDamage: h.damage, preserveEquipmentBlock: true },
          );
        return actions;
      }
      if (b.phase === "place") {
        for (const c of b.hand) {
          const d = cards[c.id],
            cost = d.focus + (b.milky ? 1 : 0);
          if (d.unplaceable || cost > b.focus) continue;
          for (let i = 0; i < b.grid.length; i++)
            if (
              this.canStack(c, b.grid[i]) &&
              (d.type !== "Hex" ||
                d.condition !== "isolated" ||
                this.neighbors(i).length === 0)
            )
              add(
                "place",
                `Place ${d.name} · slot ${i + 1}`,
                { uid: c.uid, slot: i },
                {
                  card: c.id,
                  neighbors: this.neighbors(i).length,
                  level: b.grid[i].length + 1,
                },
                { focus: cost },
              );
        }
        for (let i = 0; i < b.grid.length; i++) {
          const cost = this.recallCost(b.grid[i]);
          if (cost != null && cost <= b.focus)
            add(
              "recall",
              `Recall slot ${i + 1} · ${cost} Focus`,
              { slot: i },
              { spent: this.allowance(top(b.grid[i]), i) === 0 },
              { focus: cost },
            );
        }
        add("activatePhase", "Begin activation", {}, { progress: 1 });
      }
      if (b.phase === "activate") {
        for (let i = 0; i < b.grid.length; i++) {
          const c = top(b.grid[i]);
          if (!c) continue;
          const d = cards[c.id],
            f = d.effects;
          if (
            d.channel > b.channel ||
            !this.activationAvailable(c, i) ||
            !this.condition(c, i)
          )
            continue;
          const els = attunementElements(b, c, i);
          const charging = !!(d.charge && c.charge + 1 < d.charge);
          const targets =
            charging ||
            f.all ||
            f.randomDamage ||
            d.stack === "pile" ||
            !(f.damage || f.hpDamage || f.burn || f.poison || f.corrode)
              ? [null]
              : b.enemies.filter((e) => e.hp > 0).map((e) => e.uid);
          let extras = [{}];
          if (f.transmute)
            extras = b.grid.flatMap((slot, j) =>
              top(slot)
                ? ELEMENTS.filter((el) => el !== top(slot).element).map(
                    (newElement) => ({ cardTarget: j, newElement }),
                  )
                : [],
            );
          if (f.shift)
            extras = b.grid.flatMap((slot, j) =>
              slot.length && !slot.some((x) => x.lock)
                ? b.grid.flatMap((dest, k) =>
                    !dest.length ? [{ cardTarget: j, destination: k }] : [],
                  )
                : [],
            );
          if (f.allyHeal)
            extras = this.neighbors(i)
              .filter((j) => cards[top(b.grid[j])?.id]?.type === "Ally")
              .map((cardTarget) => ({ cardTarget }));
          for (const element of els)
            for (const target of targets)
              for (const ex of extras)
                add(
                  "activate",
                  `${d.name}${charging ? " · Charge" : ""} · ${element}${target ? " → " + b.enemies.find((e) => e.uid === target).name : ""}${ex.cardTarget != null ? " · slot " + (ex.cardTarget + 1) : ""}${ex.newElement ? " → " + ex.newElement : ""}${ex.destination != null ? " → slot " + (ex.destination + 1) : ""}`,
                  { slot: i, target, element, ...ex },
                  {
                    ...(charging
                      ? {
                          charging: true,
                          chargeGain: 1,
                          chargedDamage: this.cardPower(c, i),
                          chargedBurnAll: f.burnAll || 0,
                        }
                      : f),
                    damage: charging ? 0 : this.cardPower(c, i),
                    ...(f.shield ? { shield: this.shieldPower(c, i) } : {}),
                    card: c.id,
                    charge: d.charge ? d.charge - c.charge : 0,
                  },
                  { channel: d.channel },
                );
        }
        add("endTurn", "End turn", {}, { progress: 1 });
      }
      return actions;
    }
    throw Error("No decision defined for " + s.mode);
  }
  act(action) {
    const a =
      typeof action === "string"
        ? this.legal().find((x) => x.key === action)
        : this.legal().find((x) => x.key === action.key);
    if (!a) throw Error("Illegal action");
    const s = this.s,
      b = s.battle;
    this.presentation = [];
    this.decisionLog = [];
    s.steps++;
    s.history.push(a.key);
    switch (a.type) {
      case "chooseClass":
        s.mode = "gem";
        break;
      case "startGem":
        this.getItem(s.equipment[a.slot]).gem = s.inventory.find(
          (x) => x.id === s.startGem,
        ).uid;
        s.mode = "intro";
        break;
      case "begin":
        this.beginRound();
        break;
      case "move": {
        const from = { x: s.field.x, y: s.field.y };
        s.field.x = a.x;
        s.field.y = a.y;
        s.field.moves--;
        if (s.field.entities.some((e) => e.x === a.x && e.y === a.y))
          s.field.moves = 0;
        this.present("move", { player: true, from, to: { x: a.x, y: a.y } });
        this.resolveTile();
        break;
      }
      case "wait":
        this.endMovement();
        break;
      case "unequip":
        s.equipment[a.slot] = null;
        break;
      case "equip":
        for (const k of Object.keys(s.equipment))
          if (s.equipment[k] === a.item) s.equipment[k] = null;
        s.equipment[a.slot] = a.item;
        break;
      case "takeItem": {
        const id = s.itemOffer[a.index];
        if (id.startsWith("card:")) this.addCard(id.slice(5));
        else this.addItem(id);
        delete s.itemOffer;
        this.resolveTile();
        break;
      }
      case "leaveItem": {
        const id = s.itemOffer[0];
        const name = id.startsWith("card:")
          ? cards[id.slice(5)].name
          : items[id].name;
        this.log(`Left ${name} behind.`);
        delete s.itemOffer;
        this.resolveTile();
        break;
      }
      case "replaceArmor": {
        const id = s.pendingArmor;
        delete s.pendingArmor;
        this.removeItem(a.old);
        this.addItem(id);
        if (s.pendingTile) {
          delete s.pendingTile;
          this.resolveTile();
        }
        break;
      }
      case "declineArmor":
        delete s.pendingArmor;
        if (s.pendingTile) {
          delete s.pendingTile;
          this.resolveTile();
        }
        break;
      case "eventChoice": {
        const c = events.find((e) => e.id === s.event).choices[a.index];
        if (a.tradeItem != null) {
          const offered = this.getItem(a.tradeItem);
          this.log(
            `Traded ${items[offered.id].name} (item ${offered.uid})${offered.gem ? "; socketed Gem returned to Satchel" : ""}.`,
          );
          this.removeItem(a.tradeItem);
        }
        if (a.tradeCard != null) {
          const offered = s.deck.find((x) => x.uid === a.tradeCard);
          this.log(
            `Traded ${cards[offered.id].name}${offered.upgrade ? " +" : ""} (card ${offered.uid}).`,
          );
          s.deck = s.deck.filter((x) => x.uid !== a.tradeCard);
        }
        if (c.cost) this.spend(c.cost);
        if (c.hp) {
          s.hp += c.hp;
          s.stats.damageTaken += Math.max(0, -c.hp);
        }
        if (c.heal) s.hp = Math.min(s.maxHp, s.hp + c.heal);
        if (c.gold) this.gainGold(c.gold);
        if (c.card) this.addCard(c.card);
        if (c.hex) this.addCard(c.hex);
        if (c.item) this.addItem(c.item);
        if (c.quest) s.quest = true;
        if (c.clean || c.cleanHex)
          s.deck = s.deck.filter((x) => cards[x.id].type !== "Hex");
        if (c.clean)
          for (const x of [...s.inventory])
            if (items[x.id].cursed) this.removeItem(x.uid);
        if (s.hp <= 0)
          this.finish(false, events.find((e) => e.id === s.event).name);
        else if (c.fight)
          this.beginBattle([{ uid: this.uid(), enemy: c.fight, restless: 0 }]);
        else this.resolveTile();
        break;
      }
      case "rewardCard":
        this.addCard(a.id);
        s.reward.cards = null;
        break;
      case "skipReward":
        s.reward.cards = null;
        break;
      case "rewardGem":
        this.addItem(a.id);
        s.reward.gem = false;
        break;
      case "rewardSetting":
        this.addItem(a.id);
        s.reward.setting = false;
        break;
      case "continueReward":
        if (s.reward.boss) this.finish(true);
        else this.resolveTile();
        break;
      case "leave":
        this.resolveTile();
        break;
      case "heal":
        this.spend(20);
        s.hp = Math.min(s.maxHp, s.hp + 20);
        s.shop.healUsed = true;
        break;
      case "gossip":
        this.spend(15);
        s.revealedArchon = s.archon;
        s.shop.gossipUsed = true;
        s.nextTavernHealer = this.rand() < 0.75;
        s.nextHealerHint = s.nextTavernHealer;
        this.log(
          s.nextHealerHint
            ? "A healer will visit the next Tavern."
            : "No healer will visit the next Tavern.",
        );
        this.log("The traveler names " + enemies[s.archon].name + ".");
        break;
      case "buy": {
        const id = s.shop.stock.splice(a.index, 1)[0];
        this.spend(a.price);
        s.stats.purchases.push(id);
        if (id.startsWith("card:")) this.addCard(id.slice(5));
        else this.addItem(id);
        break;
      }
      case "sell": {
        const item = this.getItem(a.uid);
        if (items[item.id].cursed) this.spend(a.value);
        else this.gainGold(a.value);
        s.stats.sales.push(item.id);
        this.removeItem(a.uid);
        break;
      }
      case "socket":
        this.getItem(a.uid).gem = a.gem;
        break;
      case "unsocket":
        this.getItem(a.uid).gem = null;
        break;
      case "remove":
        this.spend(40);
        s.shop.removeUsed = true;
        s.deck = s.deck.filter((x) => x.uid !== a.uid);
        break;
      case "removeHex":
        if (a.costs.gold) this.spend(a.costs.gold);
        if (a.costs.hp) {
          s.hp -= a.costs.hp;
          s.stats.damageTaken += a.costs.hp;
        }
        s.deck = s.deck.filter(
          (x) => x.uid !== a.uid && x.uid !== a.sacrificeCard,
        );
        if (a.sacrificeItem) this.removeItem(a.sacrificeItem);
        this.log(a.label);
        break;
      case "upgrade": {
        const c = s.deck.find((x) => x.uid === a.uid),
          u = cards[c.id].upgrade;
        if (u.gold) this.spend(u.gold);
        if (u.hp) {
          s.hp -= u.hp;
          s.stats.damageTaken += u.hp;
        }
        if (a.sacrifice) s.deck = s.deck.filter((x) => x.uid !== a.sacrifice);
        c.upgrade = true;
        break;
      }
      case "place": {
        const c = b.hand.find((x) => x.uid === a.uid),
          d = cards[c.id];
        b.hand = b.hand.filter((x) => x.uid !== a.uid);
        b.focus -= a.costs.focus;
        b.milky = false;
        const slot = b.grid[a.slot];
        if (d.stack === "recall" && slot.length) {
          for (let i = slot.length - 1; i >= 0; i--)
            if (cards[slot[i].id].recall != null && !slot[i].lock)
              b.discard.push(
                ...slot
                  .splice(i, 1)
                  .map((x) => ({ uid: x.uid, id: x.id, upgrade: x.upgrade })),
              );
        }
        const inst = this.instance(c);
        slot.push(inst);
        if (
          d.bondHP &&
          this.neighbors(a.slot).some((j) => top(b.grid[j]).element === "Earth")
        )
          inst.hp += d.bondHP;
        inst.maxHp = Math.max(inst.maxHp, inst.hp);
        if (d.onPlaceCharge)
          inst.charge += this.neighbors(a.slot).filter(
            (j) => top(b.grid[j]).element === "Fire",
          ).length;
        if (d.onPlaceFocus) b.focus += d.onPlaceFocus;
        break;
      }
      case "recall":
        b.focus -= a.costs.focus;
        b.discard.push(
          ...b.grid[a.slot].map((c) => ({
            uid: c.uid,
            id: c.id,
            upgrade: c.upgrade,
          })),
        );
        b.grid[a.slot] = [];
        break;
      case "activatePhase":
        b.discard.push(...b.hand);
        b.hand = [];
        b.phase = "activate";
        break;
      case "activate":
        this.activate(a);
        break;
      case "endTurn":
        this.endTurn();
        break;
      case "ward": {
        const c = b.grid[a.slot].find((c) => c.uid === a.uid),
          h = b.reaction;
        const loss = Math.min(c.ward, h.damage);
        c.ward -= loss;
        h.damage -= loss;
        h.weaknessBonus = 0;
        h.weaknessElement = null;
        if (!c.ward) c.zeroWard = true;
        this.presentIncomingNode(
          "defend",
          { slot: a.slot, amount: loss, loss, name: "Ward absorbs" },
          { kind: "card", slot: a.slot },
        );
        this.advanceHit();
        this.pump();
        break;
      }
      case "block":
      case "bracelet": {
        const p = (a.type === "block" ? b.shields : b.bracelets).find(
          (x) => x.uid === a.uid,
        );
        b.reaction.weaknessBonus = 0;
        b.reaction.weaknessElement = null;
        const r = blockHit(
          p.block,
          p.element,
          b.reaction.damage,
          b.reaction.element,
        );
        const stopped = b.reaction.damage - r.remaining;
        const loss = p.block - r.block;
        p.block = r.block;
        b.reaction.damage = r.remaining;
        this.presentIncomingNode(
          "defend",
          {
            slot: a.type === "block" ? p.slot : null,
            item: a.type === "bracelet" ? a.uid : null,
            amount: stopped,
            loss,
            name: "Blocked",
          },
          a.type === "block"
            ? { kind: "card", slot: p.slot }
            : { kind: "item", uid: a.uid },
        );
        this.advanceHit();
        this.pump();
        break;
      }
      case "intercept":
        this.intercept(a.slot);
        this.pump();
        break;
      case "skipEquipment":
        this.log("You let the hit through without using remaining defenses.");
        b.reaction.stage = "player";
        this.advanceHit();
        this.pump();
        break;
      case "takeHit":
        b.reaction.column = -1;
        b.reaction.stage = "bracelet";
        this.advanceHit();
        this.pump();
        break;
    }
    return this.observe();
  }
  removeItem(uid) {
    const s = this.s;
    for (const k of Object.keys(s.equipment))
      if (s.equipment[k] === uid) s.equipment[k] = null;
    for (const x of s.inventory) if (x.gem === uid) x.gem = null;
    s.inventory = s.inventory.filter((x) => x.uid !== uid);
  }
  observe() {
    const s = this.s;
    const o = {
      version: VERSION,
      mode: s.mode,
      classId: s.classId,
      hp: Math.max(0, s.hp),
      maxHp: s.maxHp,
      gold: s.gold,
      deck: clone(s.deck),
      inventory: clone(s.inventory),
      equipment: clone(s.equipment),
      bonuses: this.bonuses(),
      status: clone(s.status),
      field: clone(s.field),
      log: s.log.slice(-30),
      steps: s.steps,
      stats: clone(s.stats),
      startGem: s.startGem,
      archon: s.revealedArchon ? enemies[s.revealedArchon].name : null,
      pendingArmor: s.pendingArmor,
      nextHealerHint: s.nextHealerHint,
    };
    if (s.mode === "battle") {
      o.battle = clone(s.battle);
      delete o.battle.jobs;
      o.battle.telegraphs = this.gridTelegraphs();
      o.battle.deck.sort((a, b) => a.id.localeCompare(b.id) || a.uid - b.uid);
      o.battle.enemies = o.battle.enemies
        .filter((e) => e.hp > 0 || (enemies[e.id].onDeath && !e.deathResolved))
        .map((e) => ({
          ...e,
          hp: Math.max(0, e.hp),
          statusImmunity: enemyStatusImmunity(e),
          signature:
            enemies[e.id].signature +
            (enemyStatusImmunity(e)
              ? ` Immune to ${statusName(enemyStatusImmunity(e))} while ${e.element}.`
              : ""),
          counter: enemies[e.id].counter,
          rotation: enemies[e.id].rotation.map((t) => ({
            ...clone(t),
            ...(t.currentElement ? { element: e.element } : {}),
          })),
          onDeath: clone(enemies[e.id].onDeath),
          tell: e.hp <= 0 ? clone(enemies[e.id].onDeath) : this.tell(e),
        }));
    }
    if (s.mode === "event") o.event = events.find((e) => e.id === s.event);
    if (s.mode === "tavern") o.shop = clone(s.shop);
    if (s.mode === "item") o.itemOffer = clone(s.itemOffer);
    if (s.mode === "reward") o.reward = clone(s.reward);
    if (s.mode === "result") {
      o.outcome = s.outcome;
      o.cause = s.cause;
      o.death = clone(s.death);
      o.seed = s.seed;
      o.history = clone(s.history);
    }
    return o;
  }
  save() {
    return clone(
      this.s.mode === "battle" && this.s.checkpoint
        ? this.s.checkpoint
        : this.s,
    );
  }
}
