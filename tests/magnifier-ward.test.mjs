import test from "node:test";
import assert from "node:assert/strict";
import { Game, cardAllowance } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
import { corruptionRound } from "../src/corruptions.mjs";

function setup() {
  const g = new Game(79);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  Object.assign(b, { phase: "place", focus: 10, channel: 10, turn: 2 });
  return g;
}
function put(g, id, slot = 8, props = {}) {
  const c = Object.assign(g.instance(g.newCard(id)), props);
  g.s.battle.grid[slot].push(c);
  return c;
}
function act(g, type, predicate = () => true) {
  const a = g.legal().find((a) => a.type === type && predicate(a));
  assert.ok(a, `Expected legal ${type}`);
  g.act(a);
  return a;
}
function meld(g, slot = 8) {
  const c = g.newCard("magnify");
  g.s.battle.hand.push(c);
  const a = act(g, "place", (a) => a.uid === c.uid && a.slot === slot);
  return { c: g.s.battle.grid[slot].find((x) => x.uid === c.uid), a };
}

test("Magnifier Ward alone costs one Focus, stores 1+10 Ward, has one use and recalls for one", () => {
  const g = setup(),
    b = g.s.battle;
  const { c } = meld(g);
  assert.equal(cards.magnify.name, "Magnifier Ward");
  assert.equal(c.ward, 1);
  assert.equal(b.focus, 9);
  assert.equal(g.recallCost(b.grid[8]), 1);
  act(g, "activatePhase");
  act(g, "activate", (a) => a.slot === 8);
  assert.equal(c.ward, 11);
  assert.equal(b.channel, 9);
  assert.equal(g.allowance(c, 8), 0);
  assert.equal(g.activeWards().find((x) => x.c.uid === c.uid).c.ward, 11);
});

test("Meld revives depleted Ward and preserves its unused activation, without a separate pool", () => {
  const g = setup(),
    b = g.s.battle;
  const host = put(g, "ward", 8, { ward: 0, zeroWard: true, used: 1 });
  const { c, a } = meld(g);
  assert.equal(a.effects.revive, true);
  assert.equal(b.grid[8].at(-1), host);
  assert.equal(c.attachedTo, host.uid);
  assert.equal(c.ward, 0);
  assert.equal(host.ward, 1);
  assert.equal(host.zeroWard, false);
  assert.equal(g.allowance(host, 8), 2);
  assert.equal(cardAllowance(b, c, 8), 0);
  assert.equal(g.recallCost(b.grid[8]), 1);
  act(g, "activatePhase");
  assert.equal(g.legal().filter((a) => a.type === "activate").length, 1);
  act(g, "activate", (a) => a.slot === 8);
  assert.equal(host.ward, 11);
  assert.equal(g.allowance(host, 8), 1);
  assert.equal(g.legal().filter((a) => a.type === "activate").length, 0);
  assert.deepEqual(
    g.activeWards().map((x) => x.c.uid),
    [host.uid],
  );
});

test("Meld grants allowance but does not refresh turn usage, bypass isolation, or add Ward to a healthy host", () => {
  const g = setup(),
    b = g.s.battle;
  const host = put(g, "ward", 8, { ward: 6, used: 2, lastActivatedTurn: 2 });
  meld(g);
  assert.equal(host.ward, 6);
  assert.equal(g.allowance(host, 8), 1);
  act(g, "activatePhase");
  assert.equal(g.legal().filter((a) => a.type === "activate").length, 0);
  b.turn++;
  put(g, "blast", 9);
  assert.equal(
    g.legal().some((a) => a.type === "activate" && a.slot === 8),
    false,
  );
  b.grid[9] = [];
  assert.equal(
    g.legal().some((a) => a.type === "activate" && a.slot === 8),
    true,
  );
});

test("Recall returns host and attachments separately with no surcharge or persistent bonus", () => {
  const g = setup(),
    b = g.s.battle,
    host = put(g, "ward");
  const { c } = meld(g);
  const focus = b.focus;
  act(g, "recall", (a) => a.slot === 8);
  assert.equal(b.focus, focus - 1);
  assert.deepEqual(
    b.discard.map((x) => x.uid).sort((a, b) => a - b),
    [host.uid, c.uid].sort((a, b) => a - b),
  );
  assert.ok(b.discard.every((x) => x.attachedTo == null));
  b.hand = b.discard.splice(0);
  act(g, "place", (a) => a.uid === host.uid && a.slot === 8);
  assert.equal(g.allowance(b.grid[8].at(-1), 8), 2);
  act(g, "place", (a) => a.uid === c.uid && a.slot === 20);
  assert.equal(b.grid[20][0].ward, 1);
});

test("Attachments remain inert under a covered-Ward tower and die with their host", () => {
  const g = setup(),
    b = g.s.battle,
    host = put(g, "ward");
  const { c } = meld(g);
  const lattice = "lattice";
  put(g, lattice, 8);
  assert.ok(!g.activeWards().some((x) => x.c.uid === c.uid));
  g.destroyCard(8, host.uid);
  assert.deepEqual(
    b.destroyed.map((x) => x.uid).sort((a, b) => a - b),
    [host.uid, c.uid].sort((a, b) => a - b),
  );
  assert.equal(b.grid[8].length, 1);
});

test("Mind Mine destroys the melded host and reinforcement together", () => {
  const g = setup(),
    b = g.s.battle;
  const host = put(g, "ward");
  const { c } = meld(g);
  b.corruptions[8] = { kind: "mine", createdTurn: 1, remaining: 1 };
  corruptionRound(g);
  assert.equal(b.grid[8].length, 0);
  assert.deepEqual(
    new Set(b.destroyed.map((x) => x.uid)),
    new Set([host.uid, c.uid]),
  );
});

test("Undertow cannot detach a reinforcement from a locked host", () => {
  const g = setup(),
    b = g.s.battle;
  const host = put(g, "ward", 8, { lock: true });
  const { c } = meld(g);
  const undertow = "undertow";
  const card = g.newCard(undertow);
  b.hand.push(card);
  assert.equal(
    g
      .legal()
      .some((a) => a.type === "place" && a.uid === card.uid && a.slot === 8),
    false,
  );
  assert.ok(b.grid[8].includes(host));
  assert.ok(b.grid[8].includes(c));
  assert.equal(b.discard.length, 0);
});

test("Meld is save-stable, rejects non-Wards, and legacy magnification no longer increases damage", () => {
  const g = setup(),
    b = g.s.battle;
  const host = put(g, "ward", 8, { ward: 0, zeroWard: true, used: 1 });
  const { c } = meld(g);
  const copy = new Game(0, structuredClone(g.s));
  assert.equal(copy.s.battle.grid[8][0].ward, 0);
  assert.equal(copy.allowance(copy.s.battle.grid[8].at(-1), 8), 2);
  assert.equal(copy.recallCost(copy.s.battle.grid[8]), 1);
  assert.equal(copy.s.battle.grid[8][0].attachedTo, host.uid);
  put(g, "blast", 10);
  b.hand.push(g.newCard("magnify"));
  assert.equal(
    g.legal().some((a) => a.type === "place" && a.slot === 10),
    false,
  );
  const legacy = setup();
  const mag = put(legacy, "magnify", 8, { ward: 0, used: 2, magnified: true });
  legacy.s.version = { ...legacy.s.version, rules: "2.1.12" };
  const loaded = new Game(0, legacy.s),
    migrated = loaded.s.battle.grid[8][0];
  assert.equal(migrated.ward, 1);
  assert.equal(migrated.used, 2);
  assert.equal(migrated.magnified, undefined);
  assert.equal(loaded.allowance(migrated, 8), 0);
});
