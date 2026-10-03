import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  chargeGain,
  chargeActivations,
  stackValue,
} from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
import { attackPreview } from "../src/combat-preview.mjs";
import { boardConnections } from "../src/board-interactions.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function setup(id = "kiln") {
  const g = new Game(80);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 100;
  b.hand = [];
  const e = b.enemies[0];
  e.hp = e.maxHp = 10000;
  e.element = "Arcane";
  const c = g.instance(g.newCard(id));
  b.grid[10] = [c];
  return { g, b, c, e };
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i].push(c);
  return c;
}
const actions = (g) =>
  g.legal().filter((a) => a.type === "activate" && a.slot === 10);
function activate(g) {
  const a = actions(g)[0];
  assert.ok(a);
  g.act(a);
  return a;
}
test("Kiln placement caps at two charges and all seven-use schedules match the agreed releases", () => {
  for (const n of [0, 1, 2, 3, 4]) {
    const { g, b, e } = setup();
    b.grid[10] = [];
    b.phase = "place";
    b.focus = 2;
    b.hand = [g.newCard("kiln")];
    for (const i of [3, 9, 11, 17].slice(0, n)) put(g, "ignis", i);
    g.act(g.legal().find((a) => a.type === "place" && a.slot === 10));
    const c = b.grid[10][0];
    assert.equal(c.charge, Math.min(n, 2));
    b.phase = "activate";
    const releases = [];
    for (let k = 1; k <= 7; k++) {
      const hp = e.hp,
        a = activate(g);
      assert.equal(g.allowance(c, 10), 7 - k);
      if (e.hp < hp) {
        releases.push(k);
        assert.equal(hp - e.hp, 20);
        assert.equal(c.charge, 0);
        assert.ok(a.target);
      } else {
        assert.equal(a.target, null);
        assert.ok(a.effects.charging);
      }
      assert.equal(actions(g).length, 0, "once per turn");
      b.turn++;
    }
    assert.deepEqual(releases, n === 0 ? [3, 6] : n === 1 ? [2, 5] : [1, 4, 7]);
    assert.equal(c.charge, n === 0 ? 1 : n === 1 ? 2 : 0);
    assert.equal(actions(g).length, 0);
  }
});
test("Patient Seed gives one unwatered or two watered releases with no damage on filling", () => {
  for (const wet of [false, true]) {
    const { g, b, c, e } = setup("seed");
    if (wet) put(g, "water", 9);
    const releases = [];
    for (let k = 1; k <= 7; k++) {
      const hp = e.hp,
        before = c.charge,
        a = actions(g)[0];
      assert.equal(a.effects.charge, chargeActivations(b, c, 10));
      if (before < 3) {
        assert.equal(attackPreview(b, c, 10, e), null);
        assert.equal(a.target, null);
      } else assert.equal(attackPreview(b, c, 10, e).damage, 16);
      activate(g);
      if (e.hp < hp) {
        releases.push(k);
        assert.equal(hp - e.hp, 16);
        assert.equal(c.charge, 0);
      } else assert.equal(c.charge, Math.min(3, before + (wet ? 2 : 1)));
      b.turn++;
    }
    assert.deepEqual(releases, wet ? [3, 6] : [4]);
  }
});
test("watering checks each activation, caps excess, and multiple Water neighbors never stack", () => {
  const { g, b, c, e } = setup("seed");
  activate(g);
  assert.equal(c.charge, 1);
  b.turn++;
  put(g, "water", 9);
  put(g, "water", 11);
  assert.equal(chargeGain(b, c, 10), 2);
  assert.equal(chargeActivations(b, c, 10), 2);
  const hp = e.hp;
  activate(g);
  assert.equal(c.charge, 3);
  assert.equal(e.hp, hp);
  b.turn++;
  b.grid[9] = [];
  b.grid[11] = [];
  activate(g);
  assert.equal(hp - e.hp, 16);
  assert.equal(c.charge, 0);
  b.turn++;
  put(g, "water", 9);
  activate(g);
  assert.equal(c.charge, 2);
  b.turn++;
  assert.equal(chargeGain(b, c, 10), 1, "only one charge fits");
  activate(g);
  assert.equal(c.charge, 3);
});
test("watering uses exposed orthogonal innate/Transmuted/committed Water, respecting Sever and relay expiry", () => {
  const { g, b, c } = setup("seed");
  const water = put(g, "water", 9);
  water.used = 2;
  assert.equal(chargeGain(b, c, 10), 2, "spent source works");
  assert.ok(
    boardConnections(b).some(
      (x) => x.from === 9 && x.to === 10 && x.reason.startsWith("Watering"),
    ),
  );
  water.sever = true;
  assert.equal(chargeGain(b, c, 10), 1);
  water.sever = false;
  c.sever = true;
  assert.equal(chargeGain(b, c, 10), 1);
  c.sever = false;
  put(g, "clear", 9);
  assert.equal(chargeGain(b, c, 10), 1, "covered Water does not count");
  b.grid[9] = [];
  put(g, "water", 2);
  assert.equal(chargeGain(b, c, 10), 1, "diagonal does not count");
  const shield = put(g, "shield", 11);
  shield.lastActivationElement = "Water";
  assert.equal(chargeGain(b, c, 10), 1, "uncommitted choice cannot water");
  shield.lastActivatedTurn = b.turn;
  shield.used = 2;
  assert.equal(chargeGain(b, c, 10), 2);
  b.turn++;
  assert.equal(chargeGain(b, c, 10), 1, "relay expires");
  shield.element = "Water";
  shield.transmuted = true;
  assert.equal(chargeGain(b, c, 10), 2);
  b.grid[11] = [];
  const familiar = put(g, "familiar", 17);
  familiar.lastActivationElement = "Water";
  familiar.lastActivatedTurn = b.turn;
  assert.equal(chargeGain(b, c, 10), 2);
  c.charge = 3;
  assert.ok(
    !boardConnections(b).some(
      (x) => x.to === 10 && x.reason.startsWith("Watering"),
    ),
  );
});
test("every Charge card has a separate release, costs Channel and preserves historical Surge/Eclipse first-shot timing", () => {
  for (const [id, uses] of [
    ["surge", 2],
    ["eclipse", 3],
    ["kiln", 3],
    ["seed", 4],
  ]) {
    const { g, b, c, e } = setup(id),
      hp = e.hp;
    for (let k = 1; k < uses; k++) {
      activate(g);
      assert.equal(e.hp, hp);
      b.turn++;
    }
    assert.equal(c.charge, cards[id].charge);
    activate(g);
    assert.equal(hp - e.hp, cards[id].effects.damage);
    assert.equal(c.used, uses);
    assert.equal(b.channel, 100 - uses);
    assert.equal(c.charge, 0);
  }
});
test("pending charge and spent allowance survive saves; legacy overcharge clamps and Recall resets", () => {
  const { g, b, c } = setup();
  c.charge = 4;
  c.used = 6;
  g.s.version = { ...g.s.version, rules: "1.3.42" };
  const h = new Game(0, g.s),
    hc = h.s.battle.grid[10][0];
  assert.equal(hc.charge, 2);
  assert.equal(hc.used, 6);
  activate(h);
  assert.equal(hc.used, 7);
  assert.equal(hc.charge, 0);
  const again = new Game(0, h.s);
  assert.equal(actions(again).length, 0);
  b.phase = "place";
  b.focus = 2;
  g.act(g.legal().find((a) => a.type === "recall" && a.slot === 10));
  const recalled = b.discard.find((x) => x.uid === c.uid);
  assert.equal(g.instance(recalled).charge, 0);
  assert.equal(g.instance(recalled).used, 0);
});
test("Hymn and policy count the release activation, including current watering and a fully charged spent card", () => {
  const { g, b, c } = setup("seed");
  c.used = 4;
  c.charge = 0;
  assert.equal(
    stackValue(b, 10).power,
    0,
    "three uses cannot charge three and release",
  );
  put(g, "water", 9);
  assert.equal(
    stackValue(b, 10).power,
    16,
    "watering makes release attainable",
  );
  b.grid[9] = [];
  const action = actions(g)[0];
  assert.equal(action.effects.canRelease, false);
  const policy = new WeightedPolicy(),
    o = g.observe();
  assert.ok(
    policy.score(o, action)[0] <
      policy.score(
        o,
        g.legal().find((a) => a.type === "endTurn"),
      )[0],
  );
  c.used = 6;
  c.charge = 3;
  assert.equal(stackValue(b, 10).power, 16);
  c.used = 7;
  assert.equal(stackValue(b, 10).power, 0);
  assert.equal(actions(g).length, 0);
});
