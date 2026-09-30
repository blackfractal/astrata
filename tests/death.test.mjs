import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies, enemyDeathLines } from "../src/content.mjs";
import { describeDeath, deathMessage, deathSummary } from "../src/death.mjs";
import { runRecord } from "../src/run-record.mjs";
function base(ids = ["beetle"]) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle(ids.map((enemy, i) => ({ uid: 900 + i, enemy, restless: 0 })));
  g.s.battle.phase = "activate";
  g.s.battle.hand = [];
  g.s.hp = 1;
  return g;
}
function lethal(g, source = 900, name = "Chime", extra = {}) {
  g.s.battle.jobs = [
    { kind: "hit", source, name, damage: 10, element: "Arcane", ...extra },
  ];
  g.pump();
  assert.equal(g.s.outcome, "loss");
  return g.s.death;
}
test("Enemy attribution uses the actual lethal source in a pack, not the first enemy", () => {
  const g = base(["hart", "beetle"]),
    d = lethal(g, 901);
  assert.equal(d.enemyId, "beetle");
  assert.equal(d.enemyUid, 901);
  assert.equal(d.attack, "Chime");
  assert.equal(
    d.message,
    "Bell Beetle killed you with Chime. Another traveler may find a different way.",
  );
  assert.equal(d.flavor, "");
  assert.equal(g.s.cause, "Chime");
  assert.equal(g.s.hp, 0);
  const original = structuredClone(d);
  g.finish(false, "Other");
  assert.deepEqual(g.s.death, original);
});
for (const [status, label] of [
  ["burn", "burning"],
  ["poison", "poison"],
  ["corrode", "corrosion"],
])
  test(`Actual ${status} tick records status death before counters clear`, () => {
    const g = base(["hart"]);
    g.s.status[status] = 2;
    g.beginTurn();
    assert.equal(g.s.death.kind, "status");
    assert.equal(g.s.death.status, status);
    assert.equal(
      g.s.death.message,
      `You died from ${label}. Another traveler may find a different way.`,
    );
    assert.equal(g.s.death.enemyName, undefined);
    assert.equal(g.s.status[status], 0);
  });
test("All bosses and Eidolons have distinct flavor; unknown future enemies still have clear attribution", () => {
  const elite = Object.values(enemies).filter((e) =>
    ["Archon", "Eidolon"].includes(e.tier),
  );
  assert.equal(
    new Set(elite.map((e) => enemyDeathLines[e.id])).size,
    elite.length,
  );
  for (const e of elite) {
    const g = base([e.id]);
    const d = lethal(g, 900, "Test attack");
    assert.ok(d.flavor);
    assert.ok(d.message.startsWith(d.flavor + " "));
  }
  const d = describeDeath(
    {
      battle: {
        enemies: [
          { uid: 4, id: "future", name: "Future Foe", tier: "Eidolon" },
        ],
      },
    },
    "New Move",
    { source: 4, name: "New Move" },
  );
  assert.equal(
    d.message,
    "Future Foe killed you with New Move. Another traveler may find a different way.",
  );
});
test("Final Note attributes the already-dead Choir and retains attribution through observation, archive and save", () => {
  const g = base(["choir"]),
    b = g.s.battle;
  g.s.hp = 20;
  b.enemies[0].hp = 1;
  b.grid[0] = [g.instance(g.newCard("blast"))];
  g.act(g.legal().find((a) => a.type === "activate"));
  assert.equal(
    g.s.death.message,
    "They sang of destruction, then delivered it. The Glass Choir killed you with Final Note. Another traveler may find a different way.",
  );
  assert.equal(g.s.death.attack, "Final Note");
  assert.deepEqual(g.observe().death, g.s.death);
  assert.deepEqual(runRecord(g, "test", "result").state.death, g.s.death);
  const loaded = new Game(0, g.save());
  assert.deepEqual(loaded.s.death, g.s.death);
  assert.equal(
    deathSummary(loaded.observe()),
    "The Glass Choir killed you with Final Note.",
  );
});
test("Hex/event/legacy death text is useful without inventing an enemy; victory has no death", () => {
  const g = base();
  g.s.deck.push(g.newCard("itch"));
  g.beginTurn();
  assert.equal(g.s.death.kind, "hex");
  assert.match(g.s.death.message, /You died from Burning Itch/);
  const h = base();
  h.s.mode = "event";
  h.finish(false, "The Black Well");
  assert.equal(h.s.death.summary, "You died during The Black Well.");
  assert.equal(
    deathMessage({ cause: "corrode" }),
    "You died from corrosion. Another traveler may find a different way.",
  );
  assert.equal(
    deathMessage({ cause: "Final Note" }),
    "You died from Final Note. Another traveler may find a different way.",
  );
  const win = base();
  win.finish(true);
  assert.equal(win.s.death, undefined);
});
