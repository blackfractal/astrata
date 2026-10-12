import { Game } from "../src/engine.mjs";
export function depthsFixture(seed = 73001, boss = null) {
  const g = new Game(seed);
  // A declared carry-in, not a claimed natural run: developed S1/S2 foundation.
  g.s.deck = [];
  for (const id of [
    "blast",
    "blast",
    "shield",
    "shield",
    "focus",
    "focus",
    "clear",
    "rain",
    "ward",
    "ward",
    "magnify",
    "lattice",
    "sapling",
    "familiar",
    "elves",
    "transmute",
    "water",
    "cinder",
    "grove",
    "storm",
    "solitude",
    "plasma",
    "lucidNeedle",
    "scouringGale",
  ])
    g.addCard(id);
  g.s.inventory = [];
  g.s.equipment = {};
  const equip = (id, slot, gem) => {
    g.addItem(id);
    const item = g.s.inventory.at(-1);
    g.s.equipment[slot] = item.uid;
    if (gem) {
      g.addItem(gem);
      item.gem = g.s.inventory.at(-1).uid;
    }
    return item;
  };
  equip("gold", "wrist1", "sapphire");
  equip("silver", "wrist2", "ruby");
  equip("focusRing", "finger1", "focusGem");
  equip("channelRing", "finger2", "channelGem");
  equip("stoneArmor", "torso");
  equip("crown", "head");
  g.s.hp = 70;
  g.s.gold = 160;
  g.enterStratum2(3);
  g.s.evaluationFixture = "stratum3-developed-foundation-v1";
  if (boss) {
    g.s.mode = "depthsIntro";
    g.act(g.legal().find((a) => a.type === "enterDepths"));
    g.s.field.entities = [];
    g.beginBattle([{ uid: g.uid(), enemy: boss, restless: 0 }]);
  }
  delete g.s.checkpoint;
  return g;
}
