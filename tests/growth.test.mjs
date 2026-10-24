import test from "node:test";
import assert from "node:assert/strict";
import { Game, cardPower, attunementElements } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
import {
  projectedInsight,
  forkedRoute,
  forkedShares,
} from "../src/growth-rules.mjs";
import { spawnIdeon } from "../src/ideons.mjs";
import { compelCard } from "../src/corruptions.mjs";
import { attackPreview } from "../src/combat-preview.mjs";
const put = (g, id, i) => {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i] = [c];
  return c;
};
function setup(id, i = 10) {
  const g = new Game(84);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 20;
  b.focus = 10;
  b.hand = [];
  b.enemies[0].hp = 10000;
  b.enemies[0].element = "Arcane";
  return { g, b, c: put(g, id, i), e: b.enemies[0] };
}
const opts = (g, i = 10) =>
  g.legal().filter((a) => a.type === "activate" && a.slot === i);
const use = (g, filter = () => true) => {
  const a = opts(g).find(filter);
  assert.ok(a);
  g.act(a);
  return a;
};

test("Prismatic Sap deals 8 damage, retains 4 Guard, and relays its chosen element", () => {
  for (const [element, expected] of [["Arcane", 8], ["Light", 12]]) {
    const { g, b, e } = setup("prismaticSap");
    e.element = "Chaos";
    put(g, "solitude", 11);
    put(g, "blast", 9);
    const hp = e.hp;
    use(g, a => a.element === element);
    assert.equal(hp - e.hp, expected);
    assert.equal(b.shields.at(-1).block, 4);
    assert.equal(b.shields.at(-1).element, element);
    if (element === "Light") assert.ok(attunementElements(b, b.grid[9][0], 9).includes("Light"));
  }
});
test("Growth registry adds twenty-one distinct cards with explicit costs and gated pools", () => {
  const all = Object.values(cards).filter((c) => c.expansion === "growth");
  assert.equal(all.length, 21);
  for (const d of all) {
    assert.ok(Number.isInteger(d.channel));
    assert.ok(d.recall === null || Number.isInteger(d.recall));
  }
  const g = new Game(3);
  for (const rarity of ["common", "rare"])
    assert.ok(g.pool(rarity).every((c) => (c.stratum || 1) <= 1));
});
test("Borrowed Dawn debt uses actual next-turn projection and cannot borrow twice below floor", () => {
  const { g, b } = setup("borrowedDawn");
  assert.equal(projectedInsight(g), 4);
  use(g);
  assert.equal(b.channel, 22);
  assert.equal(projectedInsight(g), 1);
  put(g, "borrowedDawn", 11);
  assert.equal(opts(g, 11).length, 0);
  b.next.insight += 3;
  assert.ok(opts(g, 11).length);
  g.refillResources();
  assert.equal(b.insight, 4);
});
test("Focus conversions pay their separate costs and leave a recurring Focus floor", () => {
  const { g, b } = setup("rootFlame");
  b.focus = 1;
  assert.equal(opts(g).length, 0);
  b.focus = 2;
  use(g);
  assert.equal(b.focus, 0);
  assert.equal(b.channel, 21);
  put(g, "scorchedResolve", 10);
  assert.equal(opts(g).length, 0);
  b.permanent.focus = 2;
  use(g);
  assert.equal(b.permanent.focus, 1);
});
test("Rooted Concentration leaves selectable temporary player Guard after destruction", () => {
  const { g, b, c } = setup("rootedConcentration");
  use(g);
  assert.equal(b.bodyGuard, 10);
  assert.ok(b.destroyed.some((x) => x.uid === c.uid));
  assert.equal(b.permanent.focus, 1);
  b.reaction = { damage: 14, element: "Fire", stage: "defend", column: 6 };
  let a = g.legal().find((a) => a.type === "playerGuard");
  assert.ok(a);
  const hp = g.s.hp;
  g.act(a);
  assert.equal(g.s.hp, hp - 4);
  assert.equal(b.bodyGuard, 0);
  b.bodyGuard = 10;
  b.reaction = { damage: 9, element: "Fire", stage: "defend", pierce: true };
  assert.ok(!g.legal().some((a) => a.type === "playerGuard"));
});
test("Mindfire exposes affordable Focus choices and pays only chosen amount", () => {
  const { g, b, e } = setup("mindfire");
  b.focus = 2;
  assert.deepEqual([...new Set(opts(g).map((a) => a.focusSpend))], [0, 1, 2]);
  use(g, (a) => a.focusSpend === 2);
  assert.equal(e.hp, 9978);
  assert.equal(b.focus, 0);
  assert.equal(b.channel, 20);
});
test("Acorn pile bonuses do not stack and Reveal snapshots Draw before drawing", () => {
  const { g, b } = setup("memoryAcorn");
  b.deck = [g.newCard("memoryAcorn"), g.newCard("memoryAcorn")];
  b.destroyed = [g.newCard("memoryAcorn"), g.newCard("memoryAcorn")];
  g.refillResources();
  assert.equal(b.insight, 5);
  assert.equal(b.focus, 2);
  g.reveal();
  assert.equal(b.revealInsight, 5);
  assert.equal(b.revealedCount, b.hand.length);
});
test("Destroyed and revealed card bonuses cap and respect Nausea", () => {
  const { g, b, c } = setup("compostWard");
  b.destroyed = Array.from({ length: 12 }, () => g.newCard("blast"));
  assert.equal(opts(g)[0].effects.ward, 26);
  use(g);
  assert.equal(c.ward, 27);
  const shield = put(g, "thoughtBulwark", 10);
  b.revealedCount = 12;
  assert.equal(g.shieldPower(shield, 10), 28);
  b.corruptions = { 10: { kind: "nausea" } };
  assert.equal(g.shieldPower(shield, 10), 14);
});
test("Formation cards require complete in-bounds arrangements; diagonals provide Starleaf attunement", () => {
  const { g, b, c } = setup("crosswindReed");
  put(g, "blast", 9);
  put(g, "shield", 11);
  assert.ok(opts(g).length);
  put(g, "blast", 3);
  assert.equal(opts(g).length, 0);
  b.grid = Array.from({ length: 42 }, () => []);
  const star = put(g, "starleaf", 10);
  put(g, "water", 2);
  put(g, "ignis", 4);
  assert.equal(cardPower(b, star, 10), 20);
  assert.ok(attunementElements(b, star, 10).includes("Water"));
  assert.ok(attunementElements(b, star, 10).includes("Fire"));
});
test("Ashen Roots bonuses snapshot destroyed count, do not stack, and expire next turn", () => {
  const { g, b, c } = setup("ashenRoots");
  b.destroyed = Array.from({ length: 9 }, () => g.newCard("blast"));
  const blast = put(g, "blast", 11);
  use(g);
  assert.equal(cardPower(b, blast, 11), 10);
  b.destroyed = [];
  assert.equal(cardPower(b, blast, 11), 10);
  b.turn++;
  assert.equal(cardPower(b, blast, 11), 4);
});
test("Thornfall is a placement strike that pays Focus, leaves grid empty and returns to Discard", () => {
  const { g, b, e } = setup("thornfall");
  b.grid[10] = [];
  b.phase = "place";
  const c = g.newCard("thornfall");
  b.hand = [c];
  const a = g.legal().find((a) => a.type === "placeStrike");
  assert.ok(a);
  g.act(a);
  assert.equal(e.hp, 9990);
  assert.equal(b.focus, 8);
  assert.ok(b.discard.some((x) => x.uid === c.uid));
  assert.ok(b.grid.every((s) => !s.length));
});
test("Season’s Turn rewards changed elements only after a previous activation", () => {
  const { g, b, c } = setup("seasonsTurn");
  put(g, "water", 9);
  use(g, (a) => a.element === "Water");
  assert.equal(b.shields.length, 0);
  b.turn++;
  use(g, (a) => a.element === "Arcane");
  assert.equal(b.shields[0].block, 8);
  assert.equal(b.shields[0].element, "Arcane");
});
test("Braided Seasons permits one or two distinct source elements and relays the last", () => {
  const { g, b, c, e } = setup("braidedSeasons");
  put(g, "water", 9);
  put(g, "ignis", 11);
  assert.ok(!opts(g).some((a) => a.element === "Arcane"));
  use(g, (a) => a.element === "Water" && a.secondaryElement === "Fire");
  assert.equal(e.hp, 9976);
  assert.equal(c.lastActivationElement, "Fire");
});
test("Chaos Fracture excludes Archons, does not compound weakness and rings do not consume it", () => {
  const { g, b, e } = setup("chaosFracture");
  use(g);
  assert.equal(e.chaosFracture, true);
  g.damageEnemy(e, 2, "Earth", {}, 123);
  assert.equal(e.chaosFracture, true);
  e.element = "Light";
  const hp = e.hp;
  g.damageEnemy(e, 10, "Chaos", { card: 42 });
  assert.equal(e.hp, hp - 15);
  assert.ok(!e.chaosFracture);
  e.chaosFracture = true;
  g.damageEnemy(e, 1, "Water", { card: 43 });
  assert.ok(!e.chaosFracture);
  e.id = "colossus";
  b.turn++;
  assert.equal(opts(g).length, 0);
});
test("Forked Current route favors reaching the right edge and shares the exact capped pool", () => {
  const { g, b, e } = setup("forkedCurrent");
  b.ideons = [
    { uid: 701, slot: 11, hp: 30, ideon: true },
    { uid: 702, slot: 12, hp: 30, ideon: true },
    { uid: 703, slot: 13, hp: 30, ideon: true },
  ];
  const route = forkedRoute(b, 10, 701, e.uid);
  assert.deepEqual(route, [701, 702, 703, e.uid]);
  assert.equal(
    forkedShares(b, route).reduce((s, x) => s + x.damage, 0),
    64,
  );
  assert.ok(opts(g).some((a) => a.effects.route.length === 4));
});
test("Predatory Ivy follows at most two kill-triggered adjacent jumps and stops on survival", () => {
  const { g, b, e } = setup("predatoryIvy");
  const insects = [11, 12, 13].map((slot) =>
    spawnIdeon(g, e, "runner", { slot, element: "Arcane" }),
  );
  use(g);
  assert.equal(b.ideons.length, 0);
  assert.equal(e.hp, 10000);
  const h = setup("predatoryIvy");
  const insect = spawnIdeon(h.g, h.e, "runner", {
    slot: 11,
    element: "Arcane",
  });
  insect.hp = 50;
  spawnIdeon(h.g, h.e, "runner", { slot: 12 });
  use(h.g);
  assert.equal(h.b.ideons.length, 2);
  assert.equal(insect.hp, 38);
});

test("Forked Current direct fallback is 24, with matching elemental preview and committed damage", () => {
  for (const [element, expected] of [["Arcane", 24], ["Water", 36], ["Earth", 12]]) {
    const {g,b,c,e}=setup("forkedCurrent",13);
    e.element=element;
    const a=opts(g,13).find(a=>a.target===e.uid);
    assert.ok(a);
    assert.equal(a.effects.route[0].damage,24);
    assert.equal(attackPreview(b,c,13,e,a.element,a).damage,expected);
    const hp=e.hp;
    g.act(a);
    assert.equal(hp-e.hp,expected);
    assert.equal(b.channel,18);
  }
  const {b,e}=setup("forkedCurrent");
  b.ideons=[{uid:701,slot:11,hp:30,ideon:true}];
  assert.deepEqual(forkedShares(b,[701]),[{uid:701,damage:48}]);
  assert.deepEqual(forkedShares(b,[701,e.uid]),[{uid:701,damage:24},{uid:e.uid,damage:24}]);
});
test("Full row/column formations accept spent player cards but not a missing or Ideon-covered space", () => {
  for (const [id, slots] of [
    ["canopyBreak", [7, 8, 9, 11, 12, 13]],
    ["verdantRampart", [3, 17, 24, 31, 38]],
  ]) {
    const { g, b } = setup(id);
    for (const i of slots) put(g, "blast", i).used = 2;
    assert.ok(opts(g).length);
    b.grid[slots[0]] = [];
    assert.equal(opts(g).length, 0);
  }
});
test("Main-only fire sweep excludes Ideons; area effect keeps correct target ownership", () => {
  const { g, b, e } = setup("scorchedResolve");
  b.permanent.focus = 2;
  const insect = spawnIdeon(g, e, "runner", { slot: 20, element: "Arcane" });
  use(g);
  assert.equal(e.hp, 9986);
  assert.equal(insect.hp, insect.maxHp);
});
test("Body Guard can be declined, is weakened by Nausea, expires next turn and follows the one-way frontier", () => {
  const { g, b } = setup("rootedConcentration");
  b.corruptions = { 10: { kind: "nausea" } };
  use(g);
  assert.equal(b.bodyGuard, 5);
  const ward = put(g, "magnify", 13);
  ward.ward = 20;
  b.reaction = { damage: 3, element: "Arcane", stage: "defend", column: 6 };
  g.act(g.legal().find((a) => a.type === "playerGuard"));
  assert.equal(b.bodyGuard, 2);
  b.reaction = { damage: 1, element: "Arcane", stage: "defend", column: 6 };
  const hp = g.s.hp;
  g.act(g.legal().find((a) => a.type === "skipEquipment"));
  assert.equal(g.s.hp, hp - 1);
  assert.equal(b.bodyGuard, 2);
  b.jobs = [{ kind: "nextTurn" }];
  g.pump();
  assert.equal(b.bodyGuard, 0);
});
test("Hypnosis redirects actual Guard but suppresses resource gains", () => {
  const { g, b, e } = setup("rootedConcentration");
  compelCard(g, 10, { source: e.uid });
  assert.equal(e.guard, 10);
  assert.equal(b.permanent.focus, 0);
  assert.equal(b.bodyGuard || 0, 0);
  assert.equal(b.grid[10].length, 0);
});
test("Mindfire Focus-spending preview agrees with damage under Nausea", () => {
  const { g, b, c, e } = setup("mindfire");
  b.corruptions = { 10: { kind: "nausea" } };
  const a = opts(g).find((a) => a.focusSpend === 3);
  const v = attackPreview(b, c, 10, e, a.element, a);
  const hp = e.hp;
  g.act(a);
  assert.equal(hp - e.hp, v.damage);
  assert.equal(v.damage, 15);
});
test("New state fields survive exact-state serialization without changing legal choices", () => {
  const { g, b, c, e } = setup("seasonsTurn");
  put(g, "water", 9);
  use(g, (a) => a.element === "Water");
  b.bodyGuard = 6;
  e.chaosFracture = true;
  b.next.insight = -3;
  b.turn++;
  delete g.s.checkpoint;
  const h = new Game(0, structuredClone(g.s));
  assert.deepEqual(h.legal(), g.legal());
  assert.equal(h.s.battle.bodyGuard, 6);
  assert.equal(h.s.battle.grid[10][0].previousActivationElement, "Water");
  const a = opts(g).find((a) => a.element === "Arcane");
  g.act(a);
  h.act(a.key);
  assert.deepEqual(h.observe(), g.observe());
});
