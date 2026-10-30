import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import {
  discover,
  emptyCollection,
  achievements,
} from "../src/archive-profile.mjs";
import { createCollectionStore } from "../collection-store.cjs";
import {
  archiveEntries,
  archiveMatches,
  archiveFacets,
  archiveCardStats,
} from "../src/archive-catalog.mjs";
import { cards, items } from "../src/content.mjs";

test("Archives consolidate tutorial stages without revealing the unseen encounter variant", () => {
  const entries = archiveEntries("enemies", {
    mendingTutor: {},
    mendingWarden: {},
    whisperTutor: {},
    whisperWarden: {},
  });
  assert.equal(
    entries.filter((e) => e.definition.name === "Patient Spoolkeeper").length,
    1,
  );
  assert.equal(
    entries.filter((e) => e.definition.name === "Borrowed Oracle").length,
    1,
  );
  const oracle = entries.find((e) => e.id === "borrowedOracle");
  assert.deepEqual(
    oracle.variants.map((v) => v.id),
    ["whisperWarden"],
  );
  assert.equal(archiveMatches(oracle, "enemies", { element: "Light" }), false);
  const both = archiveEntries("enemies", {
    borrowedOracle: {},
    whisperTutor: {},
  }).find((e) => e.id === "borrowedOracle");
  assert.equal(both.variants.length, 2);
  assert.equal(archiveMatches(both, "enemies", { element: "Light" }), true);
});
test("Unknown cards cannot be identified by filters, while hybrid roles remain searchable", () => {
  const unknown = archiveEntries("cards").find((e) => e.id === "blast");
  assert.equal(archiveMatches(unknown, "cards"), true);
  for (const filter of [
    { element: "Arcane" },
    { query: "Blast" },
    { role: "Attack" },
    { visibility: "seen" },
  ])
    assert.equal(archiveMatches(unknown, "cards", filter), false);
  const sapling = archiveEntries("cards", { sapling: {} }).find(
    (e) => e.id === "sapling",
  );
  assert.ok(
    archiveMatches(sapling, "cards", { role: "Attack", element: "Earth" }),
  );
  assert.ok(archiveMatches(sapling, "cards", { role: "Defense" }));
  assert.deepEqual(archiveFacets("equipment", items.gold).category, [
    "Bracelet",
  ]);
  assert.equal(archiveCardStats(cards.undertow)[0].value, "1+");
  assert.equal(archiveCardStats(cards.undertow)[1].value, "—");
});
test("Legacy enemy names respect tutorial context and retired achievements retain earned data", () => {
  const normal = emptyCollection(),
    tutorial = emptyCollection();
  const stats = {
    encounters: [{ enemies: ["Borrowed Oracle"], outcome: "victory" }],
  };
  discover(normal, { stats });
  discover(tutorial, { stats, tutorial: { id: "stratum3" } });
  assert.ok(normal.enemies.borrowedOracle);
  assert.equal(normal.enemies.whisperTutor, undefined);
  assert.ok(tutorial.enemies.whisperTutor);
  assert.equal(tutorial.enemies.borrowedOracle, undefined);
  const old = { earnedAt: "before-demotion" };
  normal.achievements["defeat-censer"] = old;
  discover(normal, {
    stats: {
      encounters: [
        {
          enemies: ["The Censer Engine", "The Seamstress of Absence"],
          outcome: "victory",
        },
      ],
    },
  });
  assert.equal(normal.achievements["defeat-censer"], old);
  assert.equal(normal.achievements["defeat-seamstress"], undefined);
  assert.equal(achievements.filter((a) => a.retired).length, 3);
});
test("Discovery retains all visible offers but never reads future queues, deck pools or hidden boss", () => {
  const c = emptyCollection();
  discover(
    c,
    {
      mode: "reward",
      deck: [{ id: "blast" }],
      inventory: [{ id: "bronze" }],
      reward: { cards: ["ward", "rain", "clear"] },
      field: {
        entities: [{ enemy: "bat" }],
        archon: "choir",
        queue: [{ enemy: "hart" }],
      },
      shop: { stock: ["gold"] },
    },
    "first",
  );
  assert.deepEqual(Object.keys(c.cards), ["blast", "ward", "rain", "clear"]);
  assert.deepEqual(Object.keys(c.enemies), ["bat"]);
  assert.deepEqual(Object.keys(c.equipment), ["bronze"]);
  discover(c, { mode: "reward", reward: { cards: ["rain"] } }, "second");
  assert.equal(c.cards.rain.firstSeenAt, "first");
  discover(c, { mode: "tavern", shop: { stock: ["card:seed", "sapphire"] } });
  discover(c, { mode: "item", itemOffer: ["card:solitude", "ruby"] });
  assert.ok(
    c.cards.seed &&
      c.cards.solitude &&
      c.equipment.sapphire &&
      c.equipment.ruby,
  );
});
test("Visible event offers count, and legacy summaries establish acquisitions and encounters", () => {
  const c = emptyCollection();
  discover(c, { mode: "event", event: "graft" });
  assert.ok(c.cards.conduit && c.cards.thorn);
  discover(c, {
    stats: {
      cardsGained: ["Ward"],
      itemsGained: ["Gold Bracelet"],
      encounters: [{ enemies: ["Bat 2"], outcome: "loss" }],
    },
  });
  assert.ok(c.cards.ward && c.equipment.gold && c.enemies.bat);
});
test("Boss achievements require confirmed non-tutorial victories, including earlier victories in a lost run", () => {
  const c = emptyCollection();
  const state = {
    stats: { encounters: [{ enemies: ["The Glass Choir"], outcome: "loss" }] },
  };
  discover(c, state);
  assert.deepEqual(c.achievements, {});
  state.stats.encounters[0].outcome = "victory";
  state.tutorial = { id: "stratum1" };
  discover(c, state);
  assert.deepEqual(c.achievements, {});
  delete state.tutorial;
  state.outcome = "loss";
  discover(c, state, "earned");
  assert.equal(c.achievements["defeat-choir"].earnedAt, "earned");
  discover(c, state, "later");
  assert.equal(c.achievements["defeat-choir"].earnedAt, "earned");
  assert.equal(achievements.length, 25);
  state.stats.encounters.push(
    ...["The Black Bile", "King Bombadier", "The Trickster"].map((name) => ({
      enemies: [name],
      outcome: "victory",
    })),
  );
  discover(c, state, "new-bosses");
  for (const id of ["blackBile", "bombadier", "trickster"])
    assert.equal(c.achievements["defeat-" + id].earnedAt, "new-bosses");
  assert.ok(!c.achievements["calm-astrata"] && !c.achievements["calm-apex"]);
});
test("Collection store imports compressed and active traces once and survives restart without changing archives", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "astrata-collections-"));
  try {
    const dir = path.join(root, "runs", "old-run");
    fs.mkdirSync(dir, { recursive: true });
    const records = [
      {
        state: { mode: "reward", reward: { cards: ["ward", "seed", "rain"] } },
        recordedAt: "past",
      },
    ];
    const compressed = zlib.gzipSync(
      records.map((e) => JSON.stringify(e)).join("\n"),
    );
    fs.writeFileSync(path.join(dir, "events.jsonl.gz"), compressed);
    fs.writeFileSync(
      path.join(dir, "events.jsonl"),
      JSON.stringify({ state: { mode: "item", itemOffer: ["sapphire"] } }) +
        "\n",
    );
    const api = { discover, emptyCollection };
    let store = createCollectionStore(root, api),
      c = store.load();
    assert.ok(
      c.cards.ward && c.cards.seed && c.cards.rain && c.equipment.sapphire,
    );
    assert.equal(c.cards.ward.firstSeenAt, "past");
    store.record({
      state: { mode: "tavern", shop: { stock: ["card:conduit", "ruby"] } },
    });
    store = createCollectionStore(root, api);
    c = store.load();
    assert.ok(c.cards.conduit && c.equipment.ruby);
    assert.deepEqual(
      fs.readFileSync(path.join(dir, "events.jsonl.gz")),
      compressed,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("Unreadable legacy traces are retained and flagged without inventing discoveries", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "astrata-bad-collection-"),
  );
  try {
    const dir = path.join(root, "runs", "broken");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "events.jsonl"), "not json\n");
    const c = createCollectionStore(root, { discover, emptyCollection }).load();
    assert.equal(c.importWarnings.length, 1);
    assert.deepEqual(c.cards, {});
    assert.equal(
      fs.readFileSync(path.join(dir, "events.jsonl"), "utf8"),
      "not json\n",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
