import { gunzipSync } from "node:zlib";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { Game } from "../src/engine.mjs";
import { runRecord } from "../src/run-record.mjs";
const { createArchive } = createRequire(import.meta.url)("../run-archive.cjs");
function fixture(t, version = "test-build") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "astrata-archive-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return {
    root,
    archive: createArchive(root, {
      packageVersion: version,
      sources: { "content.mjs": "exact definitions" },
    }),
    read: (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8")),
    events: (id) =>
      (fs.existsSync(path.join(root, "runs", id, "events.jsonl"))
        ? fs.readFileSync(path.join(root, "runs", id, "events.jsonl"), "utf8")
        : gunzipSync(
            fs.readFileSync(path.join(root, "runs", id, "events.jsonl.gz")),
          ).toString()
      )
        .trim()
        .split("\n")
        .map(JSON.parse),
  };
}
test("more than ten runs and repeated seeds retain independent results, with idempotent finalization", (t) => {
  const f = fixture(t);
  for (let i = 0; i < 14; i++) {
    const runId = "run-" + i,
      g = new Game(8);
    f.archive.record(runRecord(g, runId, "start"));
    f.archive.result({
      runId,
      seed: 8,
      outcome: i % 2 ? "win" : "loss",
      version: g.s.version,
    });
    f.archive.result({ runId, seed: 8, outcome: "changed" });
  }
  assert.equal(fs.readdirSync(path.join(f.root, "runs")).length, 14);
  assert.equal(f.events("run-0").length, 2);
  assert.equal(
    fs.existsSync(path.join(f.root, "runs/run-0/events.jsonl")),
    false,
  );
  assert.ok(fs.existsSync(path.join(f.root, "runs/run-0/events.jsonl.gz")));
  assert.equal(f.read("runs/run-0/result.json").outcome, "loss");
  assert.equal(f.read("runs/run-13/metadata.json").traceComplete, true);
  assert.equal(f.read("runs/run-0/result.json").packageVersion, "test-build");
});
test("resume records retain original build and all previous attempts", (t) => {
  const f = fixture(t),
    g = new Game(8);
  f.archive.record(runRecord(g, "resume", "start"));
  const choice = g.legal()[0];
  g.act(choice);
  f.archive.record(runRecord(g, "resume", "decision", { action: choice }));
  const upgraded = createArchive(f.root, {
    packageVersion: "next-build",
    sources: { "content.mjs": "new definitions" },
  });
  upgraded.record(runRecord(new Game(8), "resume", "resume"));
  const meta = f.read("runs/resume/metadata.json");
  assert.deepEqual(
    meta.versions.map((v) => v.package),
    ["test-build", "next-build"],
  );
  assert.equal(f.events("resume")[1].action.key, choice.key);
  assert.equal(f.events("resume")[2].state.steps, 0);
  assert.equal(fs.readdirSync(path.join(f.root, "builds")).length, 2);
});
test("forfeit preserves latest actual state rather than rewound Continue checkpoint", (t) => {
  const f = fixture(t),
    g = new Game(8),
    initial = g.save();
  f.archive.record(runRecord(g, "forfeit", "start"));
  g.s.hp = 12;
  f.archive.record(runRecord(g, "forfeit", "decision"));
  f.archive.forfeit(
    { ...initial, uiMeta: { runId: "forfeit" } },
    "New journey",
  );
  assert.equal(f.read("runs/forfeit/metadata.json").status, "forfeited");
  assert.equal(f.events("forfeit").at(-1).state.hp, 12);
  f.archive.forfeit({ ...initial, uiMeta: { runId: "forfeit" } }, "Again");
  assert.equal(f.events("forfeit").length, 3);
});
test("legacy history import retains known versions without inventing missing provenance", (t) => {
  const f = fixture(t),
    old = {
      seed: 99,
      outcome: "win",
      version: { rules: "old-rules" },
      history: ["old-action"],
    };
  f.archive.importHistory([old]);
  f.archive.importHistory([old]);
  const ids = fs.readdirSync(path.join(f.root, "runs"));
  assert.equal(ids.length, 1);
  const meta = f.read("runs/" + ids[0] + "/metadata.json");
  assert.equal(meta.versions[0].package, null);
  assert.equal(meta.versions[0].rules, "old-rules");
  assert.equal(meta.traceComplete, false);
  assert.equal(meta.startedAt, null);
  assert.deepEqual(f.read("runs/" + ids[0] + "/result.json"), old);
});
test("decision record keeps all emitted messages beyond short UI log, exact state and effects without affecting observation", () => {
  const g = new Game(8);
  g.act(g.legal()[0]);
  for (let i = 0; i < 150; i++) g.log("message " + i);
  g.presentation = [{ kind: "hit", amount: 7, state: g.observe() }];
  const before = JSON.stringify(g.observe()),
    r = runRecord(g, "logs", "decision");
  assert.equal(r.messages.length, 150);
  assert.equal(g.s.log.length, 120);
  assert.deepEqual(r.effects, [{ kind: "hit", amount: 7 }]);
  assert.equal(r.state.rng, g.s.rng);
  assert.equal(r.state.checkpoint, undefined);
  r.state.hp = 1;
  assert.equal(JSON.stringify(g.observe()), before);
});
test("run IDs cannot escape archive directory", (t) => {
  const f = fixture(t);
  assert.throws(
    () => f.archive.record({ runId: "../escape", kind: "start" }),
    /Invalid archive/,
  );
});

test("legacy import preserves an explicitly recorded executable version", (t) => {
  const f = fixture(t);
  f.archive.importHistory([
    {
      runId: "known-build",
      seed: 8,
      outcome: "win",
      packageVersion: "1.2.3",
      version: { rules: "older" },
    },
  ]);
  const meta = f.read("runs/known-build/metadata.json");
  assert.equal(meta.versions[0].package, "1.2.3");
  assert.equal(meta.versions[0].rules, "older");
  assert.equal(meta.versions[0].id, undefined);
});
