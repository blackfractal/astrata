import { depthsFixture } from "./depths-fixture.mjs";
import { enterApexFloor } from "../src/apex.mjs";
export function apexFixture(seed = 84001, floor = 1, boss = null) {
  const g = depthsFixture(seed);
  g.s.mode = "depthsIntro";
  g.act(g.legal().find((a) => a.type === "enterDepths"));
  g.s.gold = 240;
  g.enterStratum2(4);
  g.s.evaluationFixture = "apex-developed-foundation-v1";
  // Declared sample build, not a claimed naturally obtained run.
  for (const c of g.s.deck)
    if (
      ["ward", "grove", "solitude", "lucidGuide", "elves", "water"].includes(
        c.id,
      )
    )
      c.upgrade = true;
  if (floor) {
    delete g.s.apexIntro;
    enterApexFloor(g, floor);
  }
  if (boss) g.beginBattle([{ uid: g.uid(), enemy: boss, restless: 0 }]);
  delete g.s.checkpoint;
  return g;
}
