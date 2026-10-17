import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards, enemies, VERSION } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { depthsFixture } from "./depths-fixture.mjs";
const dir = "reports/growth-evaluation";
await fs.mkdir(dir, { recursive: true });
const sources = Object.fromEntries(
  await Promise.all(
    (await fs.readdir("src"))
      .filter((n) => n.endsWith(".mjs"))
      .map(async (n) => [n, await fs.readFile("src/" + n, "utf8")]),
  ),
);
await fs.writeFile(dir + "/sources.json", JSON.stringify(sources));
const results = process.argv.includes("--encounters-only")
  ? JSON.parse(await fs.readFile(dir + "/summary.json", "utf8")).filter(
      (r) => r.kind === "campaign",
    )
  : [];
async function run(g, name, kind, limit = 14000) {
  const initial = g.save(),
    policy = new WeightedPolicy(),
    actions = [],
    battles = [], usage = {};
  let current = null;
  while (
    g.s.mode !== "result" &&
    actions.length < limit &&
    (kind === "campaign" || g.s.mode === "battle")
  ) {
    if (g.s.mode === "battle" && current !== g.s.battle) {
      current = g.s.battle;
      battles.push({
        stratum: g.s.stratum,
        floor: g.s.apex?.floor,
        enemies: current.enemies.map((e) => e.id),
        startHp: g.s.hp,
        resources: { ...g.bonuses() },
        startStep: actions.length,
      });
    }
    const choice = policy.choose(g.observe(), g.legal());
    if (!choice) throw Error("No legal decision " + name);
    const a=choice.action;
    const c=a.type==='activate'?g.s.battle?.grid[a.slot]?.at(-1):['place','placeStrike'].includes(a.type)?g.s.battle?.hand.find(c=>c.uid===a.uid):null;
    const entry=c?(usage[c.id]??={placements:0,activations:0,damage:0,channel:0,focus:0}):null;
    const oldDamage=g.s.stats.damageDealt;
    if(entry){entry[a.type==='activate'?'activations':'placements']++;entry.channel+=a.costs.channel||0;entry.focus+=a.costs.focus||0;}
    actions.push(choice.action.key);
    g.act(choice.action);
    if(entry)entry.damage+=g.s.stats.damageDealt-oldDamage;
    if (current && g.s.mode !== "battle") {
      Object.assign(battles.at(-1), {
        endHp: g.s.hp,
        turns: current.turn,
        endStep: actions.length,
      });
      current = null;
    }
  }
  const replay = new Game(0, initial);
  for (const key of actions) replay.act(key);
  assert.deepEqual(replay.observe(), g.observe());
  const result = {
    name,
    kind,
    seed: initial.seed,
    mode: g.s.mode,
    outcome: g.s.outcome,
    stratum: g.s.stratum,
    floor: g.s.apex?.floor,
    hp: g.s.hp,
    turn: g.s.battle?.turn,
    steps: actions.length,
    death: g.s.death,
    battles,
    usage,
    replayVerified: true,
    stalled: actions.length >= limit,
    newCards: g.s.deck
      .filter((c) => cards[c.id].expansion === "growth")
      .map((c) => c.id),
  };
  results.push(result);
  await fs.writeFile(
    `${dir}/${name}.json`,
    JSON.stringify({
      version: VERSION,
      controller: "WeightedPolicy with growth features; not manual Codex play",
      initial,
      actions,
      result,
      final: g.save(),
    }),
  );
  console.log(JSON.stringify(result));
  await fs.writeFile(dir + "/summary.json", JSON.stringify(results, null, 2));
}
if (!process.argv.includes("--encounters-only"))
  for (const seed of [885553835, 17102026])
    await run(new Game(seed), "campaign-" + seed, "campaign");
if (process.argv.includes("--campaigns-only")) process.exit(0);
// Declared encounter fixtures assess later strata even if the campaign policy dies early.
for (const stratum of [1, 2, 3, 4])
  for (const variant of ["foundation", "growth"]) {
    const ids =
      stratum === 1
        ? ["hart", "choir", "colossus"]
        : stratum === 2
          ? ["blackBile", "bombadier", "trickster"]
          : stratum === 3
            ? ["mindHive", "cnidarian", "refractionCannon"]
            : ["riftBoar", "riftChimera", "apex"];
    for (const id of ids) {
      if (!enemies[id]) throw Error(id);
      const g = depthsFixture(74001);
      g.s.stratum = stratum;
      g.s.mode = "field";
      g.s.deck = g.s.deck.filter((c) => (cards[c.id].stratum || 1) <= stratum);
      // Remove Titan/Transmute from both variants to assess alternative engines.
      g.s.deck = g.s.deck.filter((c) => !["grove", "transmute"].includes(c.id));
      if (variant === "growth")
        for (const card of [
          "memoryAcorn",
          "crosswindReed",
          "rootwall",
          "mindfire",
          "borrowedDawn",
          "rootedConcentration",
          "starleaf",
          "prismaticSap",
          "compostWard",
          "ashenRoots",
          "lucidGuide",
          "predatoryIvy",
          "forkedCurrent",
        ])
          if ((cards[card].stratum || 1) <= stratum) g.addCard(card);
      if (stratum === 1) {
        g.s.inventory = [];
        g.s.equipment = {};
        g.addItem("bronze");
        g.s.equipment.wrist2 = g.s.inventory.at(-1).uid;
        g.addItem("ring");
        g.s.equipment.finger2 = g.s.inventory.at(-1).uid;
      }
      if (stratum >= 3) {
        g.addItem("silver");
        const x = g.s.inventory.at(-1);
        g.s.equipment.wrist2 = x.uid;
        g.addItem("focusGem");
        x.gem = g.s.inventory.at(-1).uid;
      }
      if (stratum === 4) {
        for (const slot of ["neck"]) {
          g.addItem("necklace");
          const x = g.s.inventory.at(-1);
          g.s.equipment[slot] = x.uid;
          g.addItem("focusGem");
          x.gem = g.s.inventory.at(-1).uid;
        }
        g.addItem("channelGem");
        g.s.inventory.find((x) => x.uid === g.s.equipment.wrist1).gem =
          g.s.inventory.at(-1).uid;
      }
      g.s.evaluationFixture = `growth-balance-${stratum}-${variant}`;
      g.s.field.entities = [];
      g.beginBattle([{ uid: g.uid(), enemy: id, restless: 0 }]);
      delete g.s.checkpoint;
      await run(g, `s${stratum}-${variant}-${id}`, "encounter", 1800);
    }
  }
