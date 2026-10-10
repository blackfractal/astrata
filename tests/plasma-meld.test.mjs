import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  cardPower,
  activationCost,
  plasmaContributions,
} from "../src/engine.mjs";
import { statHelp } from "../src/card-upgrade-ui.mjs";
function setup() {
  const g = new Game(71);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  Object.assign(b, { focus: 10, channel: 20, phase: "place", turn: 2 });
  Object.assign(b.enemies[0], { hp: 1000, maxHp: 1000, element: "Arcane" });
  return { g, b };
}
function act(g, type, p = () => true) {
  const a = g.legal().find((a) => a.type === type && p(a));
  assert.ok(a, `legal ${type}`);
  g.act(a);
  return a;
}
function place(g, id = "plasma", slot = 8) {
  const c = g.newCard(id);
  g.s.battle.hand.push(c);
  act(g, "place", (a) => a.uid === c.uid && a.slot === slot);
  return g.s.battle.grid[slot].find((x) => x.uid === c.uid);
}
test("Plasma meld keeps original host, diminishing damage 16/24/28/30, and allowance 2/3/4/5", () => {
  const { g, b } = setup();
  const host = place(g);
  for (let n = 1; n <= 4; n++) {
    if (n > 1) place(g);
    assert.equal(b.grid[8].at(-1), host);
    assert.equal(cardPower(b, host, 8), [16, 24, 28, 30][n - 1]);
    assert.equal(g.allowance(host, 8), n + 1);
    assert.equal(g.recallCost(b.grid[8]), n);
    assert.equal(activationCost(b, host, 8), 1);
    assert.equal(b.grid[8].length, n);
  }
  assert.deepEqual(plasmaContributions(b, host, 8), [16, 8, 4, 2]);
  assert.match(statHelp(b, host, 8), /16 \+ 8 \+ 4 \+ 2/);
  b.hand = [g.newCard("plasma")];
  assert.equal(
    g.legal().some((a) => a.type === "place" && a.slot === 8),
    false,
  );
  assert.ok(g.legal().some((a) => a.type === "place" && a.slot === 20));
});
test("Four fresh melded balls deal150 for5Channel; four separate balls deal128 for8Channel", () => {
  for (const stacked of [true, false]) {
    const { g, b } = setup();
    for (let n = 0; n < 4; n++) place(g, "plasma", stacked ? 8 : 8 + n);
    b.phase = "activate";
    const start = b.channel;
    for (let turn = 0; turn < (stacked ? 5 : 2); turn++) {
      for (let n = 0; n < (stacked ? 1 : 4); n++)
        act(g, "activate", (a) => a.slot === 8 + n);
      b.turn++;
    }
    assert.equal(1000 - b.enemies[0].hp, stacked ? 150 : 128);
    assert.equal(start - b.channel, stacked ? 5 : 8);
    assert.equal(
      g.legal().some((a) => a.type === "activate"),
      false,
    );
  }
});
test("A new ball grants one use without erasing spent activations; save/resume preserves the shared host", () => {
  const { g, b } = setup();
  const host = place(g);
  b.phase = "activate";
  act(g, "activate");
  b.turn++;
  act(g, "activate");
  assert.equal(g.allowance(host, 8), 0);
  b.phase = "place";
  place(g);
  assert.equal(host.used, 2);
  assert.equal(g.allowance(host, 8), 1);
  b.phase = "activate";
  assert.equal(
    g.legal().some((a) => a.type === "activate"),
    false,
  );
  b.turn++;
  act(g, "activate");
  assert.equal(host.used, 3);
  const copy = new Game(0, structuredClone(g.s));
  assert.equal(copy.s.battle.grid[8].at(-1).uid, host.uid);
  assert.equal(copy.allowance(copy.s.battle.grid[8].at(-1), 8), 0);
  assert.equal(copy.recallCost(copy.s.battle.grid[8]), 2);
});
test("Recall separates every attachment and resets uses; destroying the host removes all attachments", () => {
  const { g, b } = setup();
  const host = place(g);
  place(g);
  place(g);
  const focus = b.focus;
  act(g, "recall", (a) => a.slot === 8);
  assert.equal(b.focus, focus - 3);
  assert.equal(b.discard.length, 3);
  assert.ok(b.discard.every((c) => !c.attachedTo));
  assert.ok(b.discard.every((c) => g.instance(c).used === 0));
  b.hand = b.discard.splice(0);
  const uid = b.hand[0].uid;
  act(g, "place", (a) => a.uid === uid && a.slot === 8);
  assert.equal(g.allowance(b.grid[8][0], 8), 2);
  place(g);
  const ids = b.grid[8].map((c) => c.uid);
  g.destroyCard(8, b.grid[8].at(-1).uid);
  assert.deepEqual(new Set(b.destroyed.map((c) => c.uid)), new Set(ids));
});
test("Host element controls the combined hit; Heat triggers once and Nausea halves the total", () => {
  const { g, b } = setup();
  const host = place(g);
  place(g);
  host.element = "Wind";
  host.transmuted = true;
  place(g, "heat");
  b.enemies[0].element = "Water";
  b.phase = "activate";
  act(g, "activate");
  assert.equal(b.enemies[0].hp, 964);
  assert.equal(b.enemies[0].status.burn, 0);
  assert.equal(b.grid[8].find((c) => c.id === "heat").used, 1);
  b.turn++;
  b.enemies[0].element = "Arcane";
  b.corruptions[7] = { kind: "nausea" };
  act(g, "activate");
  assert.equal(b.enemies[0].hp, 952);
  assert.equal(b.enemies[0].status.burn, 2);
});
test("Legacy piles migrate once, preserve total spent uses and attachments, and keep excess owned cards without extra power", () => {
  const { g, b } = setup();
  const balls = Array.from({ length: 5 }, () =>
    g.instance(g.newCard("plasma")),
  );
  balls[0].used = 2;
  balls[1].used = 1;
  balls[1].lastActivatedTurn = b.turn;
  b.grid[8] = balls;
  g.s.version = { ...g.s.version, rules: "2.1.13" };
  const copy = new Game(0, g.s),
    slot = copy.s.battle.grid[8],
    host = slot.at(-1);
  assert.equal(slot.length, 5);
  assert.equal(host.uid, balls[0].uid);
  assert.equal(host.used, 3);
  assert.equal(copy.allowance(host, 8), 2);
  assert.equal(cardPower(copy.s.battle, host, 8), 30);
  assert.equal(copy.recallCost(slot), 5);
  assert.equal(host.lastActivatedTurn, b.turn);
  assert.deepEqual(new Game(0, copy.s).s.battle.grid[8], slot);
});
test("Loading the previous meld build never revives an already depleted Magnifier Ward", () => {
  const { g, b } = setup();
  const c = g.instance(g.newCard("magnify"));
  Object.assign(c, { ward: 0, zeroWard: true, used: 1 });
  b.grid[8] = [c];
  g.s.version = { ...g.s.version, rules: "2.1.13" };
  const copy = new Game(0, g.s);
  assert.equal(copy.s.battle.grid[8][0].ward, 0);
  assert.equal(copy.s.battle.grid[8][0].zeroWard, true);
});
