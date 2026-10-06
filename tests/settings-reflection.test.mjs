import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";

test("Jeweler charges each gem service, refuses unaffordable work and occupied socket replacement", () => {
  for (const [id, price] of [
    ["sapphire", 20],
    ["ruby", 20],
    ["focusGem", 35],
    ["channelGem", 35],
    ["insightGem", 35],
  ]) {
    const g = new Game(12);
    g.openTavern();
    const setting = g.addItem("bronze"),
      gem = g.addItem(id),
      other = g.addItem("ruby");
    const action = (type) =>
      g
        .legal()
        .find(
          (a) =>
            a.type === type &&
            a.uid === setting.uid &&
            (type !== "socket" || a.gem === gem.uid),
        );
    g.s.gold = price - 1;
    assert.equal(action("socket"), undefined);
    g.s.gold = price;
    const socket = action("socket");
    assert.equal(socket.costs.gold, price);
    g.act(socket);
    assert.equal(g.s.gold, 0);
    assert.equal(setting.gem, gem.uid);
    assert.equal(action("unsocket"), undefined);
    g.s.gold = 100;
    assert.ok(
      !g
        .legal()
        .some(
          (a) =>
            a.type === "socket" && a.uid === setting.uid && a.gem === other.uid,
        ),
    );
    g.act(action("unsocket"));
    assert.equal(g.s.gold, 100 - price);
    assert.equal(setting.gem, null);
    assert.ok(g.getItem(gem.uid));
    g.s.mode = "field";
    assert.ok(!g.legal().some((a) => ["socket", "unsocket"].includes(a.type)));
  }
});

test("Mirror returns original attack element through matchup and enemy Guard, once per battle", () => {
  for (const [element, expected] of [
    ["Water", 15],
    ["Earth", 5],
    ["Fire", 10],
    ["Arcane", 10],
  ]) {
    const g = new Game(12);
    g.s.stratum = 2;
    g.s.equipment.torso = g.addItem("mirrorArmor").uid;
    g.beginBattle([{ uid: 990, enemy: "bombadier", restless: 0 }]);
    const b = g.s.battle,
      enemy = b.enemies[0];
    enemy.corruptionPlan = [];
    enemy.guard = 2;
    b.phase = "enemy";
    b.jobs = [
      {
        kind: "hit",
        name: "Reflected test",
        damage: 10,
        element,
        source: enemy.uid,
      },
    ];
    g.capturePresentation = true;
    g.presentation = [];
    g.pump();
    const hp = enemy.hp,
      playerHP = g.s.hp;
    g.act(g.legal().find((a) => a.type === "armor"));
    assert.equal(enemy.hp, hp - expected + 2);
    assert.equal(enemy.guard, 0);
    assert.equal(g.s.hp, playerHP);
    assert.equal(b.mirror, true);
    const fx = g.presentation.find(
      (f) => f.kind === "hit" && f.target === "enemy",
    );
    assert.equal(fx.element, element);
    assert.equal(fx.sourceItem, g.s.equipment.torso);
    assert.equal(fx.amount, expected - 2);
  }
});
