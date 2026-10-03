import test from "node:test";
import assert from "node:assert/strict";
import { Game, offense, defenseRate, blockHit } from "../src/engine.mjs";
import { items, ELEMENTS } from "../src/content.mjs";

const beats = {
  Fire: "Earth",
  Earth: "Wind",
  Wind: "Water",
  Water: "Fire",
  Chaos: "Light",
  Light: "Chaos",
};
test("all elemental attack/block matchups share one cycle; same element and Arcane are neutral", () => {
  for (const from of ELEMENTS)
    for (const to of ELEMENTS) {
      const expected =
        from === "Arcane" || to === "Arcane"
          ? 1
          : beats[from] === to
            ? 1.5
            : beats[to] === from
              ? 0.5
              : 1;
      assert.equal(defenseRate(from, to), expected, `${from} defending ${to}`);
      assert.equal(offense(10, from, to), 10 * expected);
      assert.equal(blockHit(10, from, 30, to).remaining, 30 - 10 * expected);
    }
  assert.deepEqual(blockHit(5, "Fire", 4, "Earth"), { remaining: 0, block: 2 });
  assert.deepEqual(blockHit(5, "Fire", 4, "Fire"), { remaining: 0, block: 1 });
  assert.deepEqual(blockHit(5, "Fire", 8, "Water"), { remaining: 5, block: 0 });
});

function game(armor) {
  const g = new Game(77);
  g.s.equipment = {};
  if (armor) g.s.equipment.torso = g.addItem(armor).uid;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.bracelets = [];
  return g;
}
function hit(g, element, damage = 10, statusHit = false) {
  g.s.battle.jobs = [
    { kind: "hit", damage, element, statusHit, source: 900, name: "Test" },
  ];
  g.pump();
}
test("actual Shield activation and Ruby bracelet both use the favorable defensive cycle", () => {
  const g = game(),
    b = g.s.battle;
  const shield = g.instance(g.newCard("shield"));
  b.grid[0] = [shield];
  b.grid[1] = [g.instance(g.newCard("corner"))];
  g.act(
    g
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === 0 && a.element === "Fire",
      ),
  );
  hit(g, "Earth");
  g.act(g.legal().find((a) => a.type === "block"));
  assert.equal(g.s.hp, 66);
  const h = game();
  const bracelet = h.addItem("bronze"),
    gem = h.addItem("ruby");
  bracelet.gem = gem.uid;
  h.s.equipment.wrist2 = bracelet.uid;
  h.s.battle.enemies[0].rotation = [
    { name: "Earth test", damage: 10, element: "Earth" },
  ];
  h.endTurn();
  h.s.battle.reaction.damage = 10;
  h.s.battle.reaction.element = "Earth";
  assert.equal(h.s.battle.bracelets[0].element, "Fire");
  h.act(h.legal().find((a) => a.type === "bracelet"));
  assert.equal(h.s.hp, 63); // Bronze: 2 base -> 3 effective, 7 reaches player.
});
test("each elemental Armor reduces attacks by 3 favorable, 1 weak, 2 neutral and does not amplify damage", () => {
  for (const element of ["Fire", "Earth", "Wind", "Water"])
    for (const incoming of ELEMENTS) {
      const g = game(element.toLowerCase() + "Armor");
      const expected =
        beats[element] === incoming ? 3 : beats[incoming] === element ? 1 : 2;
      hit(g, incoming);
      assert.equal(
        g.s.hp,
        70 - (10 - expected),
        `${element} Armor vs ${incoming}`,
      );
      const h = game(element.toLowerCase() + "Armor");
      hit(h, incoming, 1);
      assert.equal(h.s.hp, 70);
      const s = game(element.toLowerCase() + "Armor");
      hit(s, incoming, 10, true);
      assert.equal(s.s.hp, 60);
    }
});
test("legacy equipment identity and sockets load under new rules without replacing owned items", () => {
  const g = game("earthArmor"),
    bracelet = g.addItem("silver"),
    gem = g.addItem("ruby");
  bracelet.gem = gem.uid;
  g.s.equipment.wrist1 = bracelet.uid;
  const saved = structuredClone(g.s);
  saved.version = { ...saved.version, rules: "1.3.34", content: "1.1.35" };
  const h = new Game(0, saved);
  assert.deepEqual(h.s.inventory, g.s.inventory);
  assert.deepEqual(h.s.equipment, g.s.equipment);
  assert.equal(h.equipped().find((x) => x.slot === "torso").element, "Earth");
  hit(h, "Wind");
  assert.equal(h.s.hp, 63);
  assert.equal(items.fireArmor.effect.resist, undefined);
});
