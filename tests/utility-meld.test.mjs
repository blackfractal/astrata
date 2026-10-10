import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { ELEMENTS } from "../src/content.mjs";
function setup() {
  const g = new Game(77);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  Object.assign(b, { phase: "place", focus: 20, channel: 10, turn: 2 });
  b.hand = [];
  return { g, b };
}
function act(g, type, p = () => true) {
  const a = g.legal().find((a) => a.type === type && p(a));
  assert.ok(a, `legal ${type}`);
  g.act(a);
  return a;
}
function place(g, id, slot = 8, element) {
  const c = g.newCard(id);
  g.s.battle.hand.push(c);
  act(
    g,
    "place",
    (a) =>
      a.uid === c.uid &&
      a.slot === slot &&
      (!element || a.placementElement === element),
  );
  return g.s.battle.grid[slot].find((x) => x.uid === c.uid);
}
test("Palimpsest banks Focus, discounts stack Recall to zero, and does not alter host allowance", () => {
  const { g, b } = setup();
  const host = place(g, "plasma");
  place(g, "plasma");
  assert.equal(g.recallCost(b.grid[8]), 2);
  place(g, "palimpsest");
  assert.equal(g.recallCost(b.grid[8]), 1);
  place(g, "palimpsest");
  assert.equal(g.recallCost(b.grid[8]), 0);
  place(g, "palimpsest");
  assert.equal(g.recallCost(b.grid[8]), 0);
  assert.equal(g.allowance(host, 8), 3);
  assert.equal(b.grid[8].at(-1), host);
  const focus = b.focus;
  act(g, "recall", (a) => a.slot === 8);
  assert.equal(b.focus, focus);
  assert.equal(b.discard.length, 5);
  assert.ok(b.discard.every((c) => c.attachedTo == null));
});
test("Palimpsest needs a host and cannot bypass Cannot Recall or Locked", () => {
  const { g, b } = setup();
  b.hand = [g.newCard("palimpsest")];
  assert.equal(
    g.legal().some((a) => a.type === "place"),
    false,
  );
  const host = place(g, "focus");
  place(g, "palimpsest");
  assert.equal(g.recallCost(b.grid[8]), null);
  host.lock = true;
  assert.equal(g.recallCost(b.grid[8]), null);
});
test("Undertow pays actual stack Recall, returns reset separate cards to hand and discards itself", () => {
  const { g, b } = setup();
  const host = place(g, "plasma");
  place(g, "plasma");
  place(g, "palimpsest");
  host.used = 2;
  host.element = "Water";
  host.transmuted = true;
  const uid = g.newCard("undertow");
  b.hand.push(uid);
  b.focus = 1;
  const a = act(g, "place", (a) => a.uid === uid.uid && a.slot === 8);
  assert.equal(a.costs.focus, 1);
  assert.equal(b.focus, 0);
  assert.equal(b.grid[8].length, 0);
  assert.equal(b.hand.length, 3);
  assert.deepEqual(
    b.discard.map((c) => c.uid),
    [uid.uid],
  );
  assert.ok(
    b.hand.every(
      (c) => c.attachedTo == null && c.element == null && c.used == null,
    ),
  );
  assert.equal(
    g.legal().some((a) => a.type === "place"),
    false,
  );
  b.focus = 1;
  act(g, "place", (a) => a.uid === host.uid && a.slot === 8);
  assert.equal(b.grid[8][0].element, "Chaos");
  assert.equal(g.allowance(b.grid[8][0], 8), 2);
});
test("Zero-cost Undertow works at zero Focus; expensive and unrecallable targets remain illegal", () => {
  const { g, b } = setup();
  place(g, "ward");
  place(g, "palimpsest");
  const u = g.newCard("undertow");
  b.hand.push(u);
  b.focus = 0;
  act(g, "place", (a) => a.uid === u.uid && a.slot === 8);
  assert.equal(b.focus, 0);
  assert.equal(b.hand.length, 2);
  const h = setup();
  place(h.g, "plasma");
  place(h.g, "plasma");
  h.b.hand = [h.g.newCard("undertow")];
  h.b.focus = 1;
  assert.equal(
    h.g.legal().some((a) => a.type === "place"),
    false,
  );
  h.b.focus = 2;
  assert.ok(h.g.legal().some((a) => a.type === "place"));
  h.b.grid[8].at(-1).lock = true;
  assert.equal(
    h.g.legal().some((a) => a.type === "place"),
    false,
  );
});
test("Lattice offers every element before placement; standalone stores1 and adds5 twice with persistent choice", () => {
  const { g, b } = setup();
  const c = g.newCard("lattice");
  b.hand = [c];
  assert.deepEqual(
    new Set(
      g
        .legal()
        .filter((a) => a.type === "place" && a.slot === 8)
        .map((a) => a.placementElement),
    ),
    new Set(ELEMENTS),
  );
  assert.equal(b.grid[8].length, 0);
  act(g, "place", (a) => a.slot === 8 && a.placementElement === "Water");
  const host = b.grid[8][0];
  assert.equal(host.ward, 1);
  b.phase = "activate";
  act(g, "activate");
  assert.equal(host.ward, 6);
  b.turn++;
  act(g, "activate");
  assert.equal(host.ward, 11);
  assert.equal(g.allowance(host, 8), 0);
  g.beginTurn();
  assert.equal(host.element, "Water");
  const copy = new Game(0, g.s);
  assert.equal(copy.s.battle.grid[8][0].element, "Water");
});
test("Melded Lattice immediately revives and recolors the whole Ward without adding uses or bypassing isolation", () => {
  const { g, b } = setup();
  const host = place(g, "ward");
  Object.assign(host, {
    ward: 0,
    zeroWard: true,
    used: 1,
    lastActivatedTurn: 2,
  });
  const c = place(g, "lattice", 8, "Fire");
  assert.equal(host.ward, 5);
  assert.equal(host.zeroWard, false);
  assert.equal(host.element, "Fire");
  assert.equal(g.allowance(host, 8), 1);
  assert.equal(c.ward, 0);
  assert.equal(g.allowance(c, 8), 0);
  assert.equal(g.activeWards().length, 1);
  assert.equal(g.recallCost(b.grid[8]), 1);
  b.phase = "activate";
  assert.equal(
    g.legal().some((a) => a.type === "activate"),
    false,
  );
  b.turn++;
  act(g, "activate");
  assert.equal(host.ward, 15);
  b.phase = "place";
  place(g, "lattice", 8, "Water");
  assert.equal(host.ward, 20);
  assert.equal(host.element, "Water");
  assert.equal(g.allowance(host, 8), 0);
  act(g, "recall", (a) => a.slot === 8);
  b.hand = b.discard.splice(0);
  act(g, "place", (a) => a.uid === host.uid && a.slot === 8);
  assert.equal(b.grid[8][0].element, "Arcane");
  assert.equal(b.grid[8][0].ward, 1);
  assert.equal(g.allowance(b.grid[8][0], 8), 2);
});
test("Lattice does not let an isolated Ward activate beside another card; melds are destroyed together", () => {
  const { g, b } = setup();
  const host = place(g, "ward");
  place(g, "lattice", 8, "Wind");
  place(g, "blast", 9);
  b.phase = "activate";
  assert.equal(
    g.legal().some((a) => a.type === "activate" && a.slot === 8),
    false,
  );
  g.destroyCard(8, host.uid);
  assert.equal(b.destroyed.length, 2);
  assert.equal(b.grid[8].length, 0);
});
test("Legacy covering Lattice transfers existing Guard without granting a second placement bonus", () => {
  const { g, b } = setup();
  const host = place(g, "ward");
  host.ward = 2;
  const c = g.instance(g.newCard("lattice"));
  c.ward = 8;
  c.element = "Earth";
  b.grid[8].push(c);
  g.s.version = { ...g.s.version, rules: "2.1.14" };
  const copy = new Game(0, g.s),
    stack = copy.s.battle.grid[8];
  assert.equal(stack.at(-1).uid, host.uid);
  assert.equal(stack.at(-1).ward, 10);
  assert.equal(stack[0].ward, 0);
  assert.equal(stack[0].attachedTo, host.uid);
  assert.deepEqual(new Game(0, copy.s).s.battle.grid[8], stack);
});
