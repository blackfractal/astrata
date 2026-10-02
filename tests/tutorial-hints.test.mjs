import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { startTutorial, TUTORIAL, TUTORIAL_STEPS } from "../src/tutorial.mjs";
import { tutorialHint } from "../src/tutorial-hints.mjs";
function finalFight() {
  const g = startTutorial(new Game(TUTORIAL.seed));
  g.beginBattle([{ uid: 990, enemy: "tutorialWarden", restless: 0 }]);
  g.s.tutorial.step = TUTORIAL_STEPS.length - 1;
  g.s.tutorial.lesson = "independent";
  return g;
}
test("Idle hints prioritize legal phase arrows when no placement or activation remains", () => {
  const g = finalFight();
  g.s.battle.focus = 0;
  g.s.battle.hand = [];
  assert.equal(tutorialHint(g).action.type, "activatePhase");
  g.s.battle.phase = "activate";
  g.s.battle.channel = 0;
  assert.equal(tutorialHint(g).action.type, "endTurn");
});
test("Defense hints use current positional eligibility and do not mutate or play the game", () => {
  const g = finalFight(),
    b = g.s.battle;
  for (const i of [2, 6]) {
    const c = g.instance(g.newCard("ward"));
    c.ward = 10;
    b.grid[i].push(c);
  }
  b.reaction = {
    damage: 5,
    element: "Arcane",
    name: "Test",
    stage: "ward",
    column: 2,
    intercepted: [],
  };
  const before = JSON.stringify(g.s),
    h = tutorialHint(g);
  assert.equal(h.action.type, "ward");
  assert.equal(h.action.slot, 2);
  assert.match(h.text, /cannot move back/);
  assert.ok(g.legal().some((a) => a.key === h.action.key));
  assert.equal(JSON.stringify(g.s), before);
  b.grid[2][0].ward = 0;
  b.bracelets = [];
  assert.equal(tutorialHint(g).action.type, "skipEquipment");
});
test("Hints remain confined to the independent tutorial battle", () => {
  const g = finalFight();
  g.s.tutorial.lesson = "ward-place";
  assert.equal(tutorialHint(g), null);
  delete g.s.tutorial;
  assert.equal(tutorialHint(g), null);
});
