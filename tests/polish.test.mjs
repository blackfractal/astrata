import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
test("presentation capture does not alter choices, random stream, or outcomes", () => {
  const a = new Game(825183),
    b = new Game(825183),
    bot = new WeightedPolicy();
  b.capturePresentation = true;
  let moves = 0,
    hits = 0;
  for (let i = 0; i < 3000 && a.s.mode !== "result"; i++) {
    assert.deepEqual(a.legal(), b.legal());
    const action = bot.choose(a.observe(), a.legal()).action;
    a.act(action);
    b.act(action);
    for (const e of b.presentation) {
      if (e.kind === "move") {
        moves++;
        assert.ok(
          Math.abs(e.to.x - e.from.x) <= 1 && Math.abs(e.to.y - e.from.y) <= 1,
        );
      }
      if (e.kind === "hit") hits++;
    }
    assert.deepEqual(a.s, b.s);
  }
  assert.equal(a.s.mode, "result");
  assert.ok(moves > 0 && hits > 0);
});
test("item spawn yields one fixed collectible; repeated observation never rerolls", () => {
  const g = new Game(23);
  g.s.mode = "field";
  g.s.field.entities = [{ uid: g.uid(), type: "Item", x: 5, y: 5 }];
  g.resolveTile();
  assert.equal(g.s.itemOffer.length, 1);
  const rng = g.s.rng,
    legal = g.legal();
  assert.equal(legal.length, 2);
  assert.deepEqual(
    legal.map((a) => a.type),
    ["takeItem", "leaveItem"],
  );
  assert.deepEqual(g.legal(), legal);
  assert.equal(g.s.rng, rng);
});
test("victory rolls one Gem and one Setting while retaining choose-one card rewards", () => {
  const g = new Game(17);
  g.s.field.round = 1;
  g.beginBattle([{ uid: g.uid(), enemy: "hart", restless: 0 }]);
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.reward.cards.length, 3);
  assert.equal(typeof g.s.reward.gem, "string");
  assert.equal(typeof g.s.reward.setting, "string");
  g.act(g.legal().find((a) => a.type === "skipReward"));
  assert.equal(g.legal().length, 1);
  assert.equal(g.legal()[0].type, "rewardGem");
  g.act(g.legal()[0]);
  assert.equal(g.legal().length, 1);
  assert.equal(g.legal()[0].type, "rewardSetting");
});
test("v1 saves migrate fixed rewards deterministically and retain current version", () => {
  const old = new Game(44).s;
  old.version = { ...VERSION, rules: "1.0.0" };
  old.mode = "reward";
  old.reward = { cards: null, gem: true, setting: true };
  const a = new Game(0, old),
    b = new Game(0, old);
  assert.deepEqual(a.s, b.s);
  assert.equal(a.s.version.rules, VERSION.rules);
  assert.equal(a.legal().length, 1);
  const loaded = new Game(0, a.save());
  assert.deepEqual(loaded.legal(), a.legal());
  assert.equal(loaded.s.rng, a.s.rng);
});
test("Hunter presentation traverses cells but only triggers arrival at destination", () => {
  const g = new Game(12);
  g.s.mode = "field";
  g.s.field.round = 3;
  g.s.field.entities = [
    { uid: g.uid(), enemy: "imp", x: 0, y: 0, born: 1, restless: 0 },
  ];
  g.capturePresentation = true;
  g.endMovement();
  assert.equal(g.presentation.filter((e) => e.kind === "move").length, 5);
  assert.equal(g.s.mode, "battle");
  for (const e of g.presentation || [])
    if (e.kind === "move")
      assert.ok(
        Math.max(Math.abs(e.to.x - e.from.x), Math.abs(e.to.y - e.from.y)) <= 1,
      );
});
test("ordinary card removal is once per Tavern and resets at the next Tavern", () => {
  const g = new Game(77);
  g.s.gold = 500;
  g.openTavern();
  let a = g.legal().find((a) => a.type === "remove");
  assert.ok(a);
  g.act(a);
  assert.equal(g.s.shop.removeUsed, true);
  assert.equal(
    g.legal().some((a) => a.type === "remove"),
    false,
  );
  const restored = new Game(0, g.save());
  assert.equal(
    restored.legal().some((a) => a.type === "remove"),
    false,
  );
  g.openTavern();
  assert.equal(g.s.shop.removeUsed, false);
  assert.ok(g.legal().some((a) => a.type === "remove"));
});
test("each Stratum previews four stable pairs, with one Tavern in pair 8 and Archon in pair 16", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const g = new Game(seed),
      sequence = [];
    for (let spawned = 0; spawned < 32; spawned += 2) {
      g.s.field.spawned = spawned;
      const before = [...g.s.field.queue];
      g.batch();
      assert.deepEqual(g.s.field.queue.slice(0, before.length), before);
      assert.equal(g.s.field.queue.length, Math.min(8, 32 - spawned));
      sequence.push(...g.s.field.queue.splice(0, 2));
    }
    assert.equal(sequence[15], "Tavern");
    assert.equal(sequence[31], "Archon");
    assert.equal(sequence.filter((x) => x === "Tavern").length, 1);
    assert.equal(sequence.filter((x) => x === "Archon").length, 1);
    assert.ok(!sequence.slice(0, 8).includes("Eidolon"));
  }
});
test("two-stage physical dice exactly realize 40:10:15:10:20 relative weights", () => {
  const tally = {};
  for (let category = 1; category <= 19; category++)
    for (let sub = 1; sub <= 10; sub++) {
      const g = new Game(1),
        values = [(category - 0.5) / 20, (sub - 0.5) / 10];
      g.rand = () => values.shift();
      const x = g.rollSpawn();
      tally[x] = (tally[x] || 0) + 1;
    }
  assert.deepEqual(tally, {
    Mote: 80,
    Eidolon: 20,
    Gold: 30,
    Item: 20,
    Event: 40,
  });
  const g = new Game(1),
    values = [0.999, 0.01, 0.99];
  g.rand = () => values.shift();
  assert.equal(g.rollSpawn(), "Eidolon");
});
test("all five Hex payments spend the disclosed resources and remain separate from pruning", () => {
  for (const kind of ["gold", "hp", "hpGold", "allyGold", "item"]) {
    const g = new Game(77);
    g.s.gold = 500;
    g.openTavern();
    g.s.shop.healer = true;
    g.s.shop.hexPrice = {
      kind,
      gold: ["gold", "hpGold", "allyGold"].includes(kind) ? 20 : 0,
      hp: ["hp", "hpGold"].includes(kind) ? 6 : 0,
    };
    g.addCard("bone");
    g.addCard("fog");
    g.act(g.legal().find((a) => a.type === "remove"));
    assert.equal(g.s.shop.removeUsed, true);
    const a = g.legal().find((a) => a.type === "removeHex");
    assert.ok(a, kind);
    const hp = g.s.hp,
      gold = g.s.gold;
    g.act(a);
    assert.equal(g.s.hp, hp - a.costs.hp);
    assert.equal(g.s.gold, gold - a.costs.gold);
    assert.ok(!g.s.deck.some((c) => c.uid === a.uid));
    if (a.sacrificeCard)
      assert.ok(!g.s.deck.some((c) => c.uid === a.sacrificeCard));
    if (a.sacrificeItem)
      assert.ok(!g.s.inventory.some((c) => c.uid === a.sacrificeItem));
    assert.ok(g.legal().some((a) => a.type === "removeHex"));
    assert.equal(
      g.legal().some((a) => a.type === "remove"),
      false,
    );
  }
});
test("Hex treatments cannot kill the player or offer unaffordable payments", () => {
  const g = new Game(6);
  g.openTavern();
  g.s.shop.healer = true;
  g.addCard("bone");
  g.s.shop.hexPrice = { kind: "hpGold", gold: 20, hp: 12 };
  g.s.hp = 12;
  g.s.gold = 100;
  assert.ok(!g.legal().some((a) => a.type === "removeHex"));
  g.s.hp = 13;
  g.s.gold = 19;
  assert.ok(!g.legal().some((a) => a.type === "removeHex"));
  g.s.gold = 20;
  assert.ok(g.legal().some((a) => a.type === "removeHex"));
});
test("equipment changes work before and between map steps; Gem changes stay Tavern-only", () => {
  const g = new Game(9);
  g.s.mode = "field";
  g.s.field.entities = [];
  g.s.field.moves = 2;
  assert.ok(g.legal().some((a) => a.type === "equip"));
  assert.ok(!g.legal().some((a) => ["socket", "unsocket"].includes(a.type)));
  g.act(g.legal().find((a) => a.type === "move" && a.x === 4 && a.y === 5));
  assert.equal(g.s.field.moves, 1);
  assert.ok(g.legal().some((a) => a.type === "equip"));
  g.openTavern();
  assert.ok(g.legal().some((a) => a.type === "socket"));
  g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
  assert.ok(
    !g.legal().some((a) => ["equip", "socket", "unsocket"].includes(a.type)),
  );
});
