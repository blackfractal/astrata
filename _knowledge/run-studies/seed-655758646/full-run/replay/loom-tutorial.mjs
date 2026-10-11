import { ELVES_STORY } from "./strata.mjs";
import { enemies } from "./content.mjs";
export const LOOM_TUTORIAL = {
  id: "stratum2",
  version: 3,
  name: "The Mending Ground",
  seed: 22002,
};
const note = (id, title, text, setup) => ({
  id,
  title,
  text,
  setup,
  kind: "note",
  focus: ".mind",
});
const action = (id, title, text, match) => ({
  id,
  title,
  text,
  match,
  kind: "action",
});
export const LOOM_STEPS = [
  note(
    "loom-welcome",
    "They have learned to fight back",
    "Did you think the Apex Predator's minions would not start fighting back? You got a taste of it with the Archon from the Whispering Weald. Here in the Unfinished Loom, they attack the spaces in your mind itself: your emotions, your sensations, your very consciousness.",
  ),
  note("companions", "A thread through the damage", ELVES_STORY),
  note(
    "space",
    "Corruptions belong to spaces",
    "The rippling Nausea space halves the adjacent Blast from 4 to 2 damage. Hover its symbol for details. Moving or destroying a card does not remove what lies beneath.",
  ),
  action(
    "cover",
    "Cover Nausea",
    "Place the Shield on the rippling space. Covering Nausea suppresses it immediately.",
    { type: "place", card: "shield", slot: 14 },
  ),
  note(
    "covered",
    "The Blast recovers",
    "Its damage is 4 again. The Nausea symbol remains under the Shield: the Corruption is covered, not removed.",
  ),
  action(
    "phase1",
    "Advance to Activation",
    "Use the phase arrow. This training enemy waits while you learn.",
    { type: "activatePhase" },
  ),
  action(
    "end1",
    "Let the round pass",
    "Advance to Enemy, then watch Focus refill. This lesson grants 2 Focus so you can Recall and place the Elves together.",
    { type: "endTurn" },
  ),
  action(
    "recall",
    "Uncover the space",
    "Recall the Shield. Nausea remains behind and the neighboring Blast weakens again.",
    { type: "recall", slot: 14 },
  ),
  action(
    "menders",
    "Send the Machine Elves",
    "Place the Elves on Nausea. They have 8 HP and three Mend activations. They can stand anywhere and repair their own space or a north, east, south or west neighbor.",
    { type: "place", card: "elves", slot: 14 },
  ),
  action("phase2", "Prepare to Mend", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "mend",
    "Mend",
    "Activate the Elves, then select their Nausea space. This ordinary repair completes immediately and spends one of their three uses.",
    { type: "activate", slot: 14 },
  ),
  note(
    "delay",
    "Two repairs remain",
    "Nausea is already gone. The Elves stay on the grid with two uses left. Like other cards, they normally activate only once per turn.",
  ),
  action(
    "end2",
    "Wait one enemy round",
    "Advance to Enemy so the Elves can activate again next turn.",
    { type: "endTurn" },
  ),
  note(
    "repaired",
    "A space restored",
    "Nausea is gone and the Elves remain ready to repair a neighboring space. After their final successful repair, they return to discard to be drawn again.",
  ),
  note(
    "anger",
    "Anger steals a choice",
    "The red knot is Anger. At the start of your turn, it forces the eligible adjacent card with the lowest printed damage or Guard to activate, spending a card use and 1 Channel. Utility cards count as zero. Covering the space suppresses it.",
    "anger",
  ),
  note(
    "anger-choice",
    "The weaker Blast",
    "Anger borders a Blast and an upgraded Blast. It will choose the weaker one. Water is beside that Blast, but Anger will not choose an Attunement: the Blast fires as Arcane. Watch its allowance and your Channel.",
    "anger-focus",
  ),
  action("anger-phase", "Watch the next turn", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "anger-end",
    "Let Anger act",
    "Advance to Enemy. As your next turn begins, watch Anger force the weaker Blast to activate.",
    { type: "endTurn" },
  ),
  note(
    "anger-fired",
    "One Channel already spent",
    "You begin Placement with only 1 of your 2 Channel remaining. The weaker Blast has spent a use and already activated this turn. You did not choose that attack or its Attunement.",
    "anger-fired",
  ),
  action(
    "anger-cover",
    "Quiet the Anger",
    "Place the Shield over Anger. As with Nausea, covering suppresses the Corruption but does not remove it.",
    { type: "place", card: "shield", slot: 16 },
  ),
  action("anger-phase2", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "anger-end2",
    "A calmer turn",
    "Advance to Enemy. Covered Anger will leave your next turn's Channel alone.",
    { type: "endTurn" },
  ),
  note(
    "anger-covered",
    "Your choices return",
    "Both Channel are available again. The red knot remains beneath its cover. Machine Elves can also Mend Anger immediately.",
  ),
  note(
    "hole",
    "A hole in your memory",
    "This Memory Hole cannot accept ordinary cards. Machine Elves can enter it or repair it from a neighboring space. Memory Hole and other more powerful Corruptions take time: an ordinary Mend needs two player-turn starts.",
    "hole",
  ),
  note(
    "hole-place",
    "Repair from next door",
    "Your Elves can reach the Hole directly below them. Keep them alive and beside it while they work.",
  ),
  action("phase4", "Prepare to Mend", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "mend4",
    "Stitch the void",
    "Activate Mend, then select the Memory Hole.",
    { type: "activate", slot: 14, cardTarget: 21 },
  ),
  note(
    "hole-working",
    "The repair has begun",
    "One use is spent, but the Hole remains. The repair ribbon shows the remaining wait. The Elves cannot begin another repair while this one is unfinished.",
  ),
  action(
    "end4",
    "Give them time",
    "Advance to Enemy, then watch the first player-turn start pass.",
    { type: "endTurn" },
  ),
  note(
    "hole-wait",
    "One more turn",
    "The Hole is still there. Protect the Elves for one more turn. Perhaps a Scribe could make their work more efficient with the right Tools...",
  ),
  action("phase4b", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "end4b",
    "Finish the repair",
    "Advance to Enemy. The repair finishes at the next player-turn start.",
    { type: "endTurn" },
  ),
  note(
    "hole-done",
    "Room to think",
    "The Hole has vanished. After their last successful repair, the Elves Recall to Discard for no Focus. You can Recall them early for 1 Focus during Placement; unfinished repairs are canceled.",
  ),
  note(
    "tells",
    "Read the marked spaces",
    "Cover a marked empty space and the enemy immediately chooses another eligible space: watch the warning move before ending your turn. With no eligible replacement, that mark is canceled. Some Corruptions target occupied spaces. Existing Corruptions stay on their spaces when covered or uncovered.",
  ),
  note(
    "complete",
    "Ready for the Loom",
    "The same Patient Spoolkeeper now fights back. Your cards, repairs and his remaining HP stay as they are. He alternates a 7-damage Arcane attack plus a warning, then the warned Corruption without an attack. He rotates Nausea, Anger and Memory Hole: all three you have practiced.",
  ),
];
LOOM_STEPS.push({
  id: "independent",
  kind: "free",
  title: "Your turn to decide",
  text: "Defeat the Patient Spoolkeeper. Watch for 7 Arcane damage plus a warning, then the Corruption on his following turn. Nausea, Anger and Memory Hole repeat in that order. Cover or Mend dangerous spaces and Recall spent cards to reuse them. You choose your actions; gentle suggestions appear only if you pause.",
  focus: "",
});
export function loomGuide(g) {
  const t = g.s.tutorial;
  return t.completed
    ? null
    : {
        ...LOOM_STEPS[t.step],
        index: t.step,
        total: LOOM_STEPS.length,
        name: LOOM_TUTORIAL.name,
      };
}
export function loomActions(g, raw) {
  if (g.s.mode === "result")
    return g.s.outcome === "loss" && g.s.tutorial.finalStart
      ? [
          {
            type: "tutorialRetry",
            key: JSON.stringify(["tutorialRetry"]),
            label: "Retry the Spoolkeeper",
            effects: { progress: 1 },
            costs: {},
          },
        ]
      : [];
  const step = LOOM_STEPS[g.s.tutorial.step];
  if (step.kind === "free") return raw;
  if (step.kind === "note")
    return [
      {
        type: "tutorialNext",
        label: "Continue lesson",
        key: JSON.stringify(["tutorialNext", { step: step.id }]),
        costs: {},
        effects: { progress: 1 },
      },
    ];
  return raw
    .filter((a) =>
      Object.entries(step.match).every(([k, v]) =>
        k === "card"
          ? g.s.battle.hand.find((c) => c.uid === a.uid)?.id === v
          : a[k] === v,
      ),
    )
    .slice(0, 1);
}
function draw(g, id, upgrade = false) {
  const b = g.s.battle;
  let c;
  for (const pile of [b.hand, b.deck, b.discard]) {
    const at = pile.findIndex((c) => c.id === id);
    if (at >= 0) {
      c = pile.splice(at, 1)[0];
      break;
    }
  }
  c ||= g.newCard(id);
  if (upgrade) c.upgrade = true;
  b.hand.push(c);
}
export function startLoomTutorial(g) {
  g.s.stratum = 2;
  g.s.mode = "field";
  g.s.hp = 70;
  g.s.gold = 0;
  g.s.deck = [
    "elves",
    "shield",
    "blast",
    "shield",
    "blast",
    "blast",
    "blast",
    "shield",
    "shield",
    "sapling",
    "ward",
    "focus",
    "clear",
  ].map((id) => g.newCard(id));
  g.beginBattle([{ uid: g.uid(), enemy: "mendingTutor", restless: 0 }]);
  g.s.tutorial = {
    ...LOOM_TUTORIAL,
    step: 0,
    lesson: LOOM_STEPS[0].id,
    fight: 1,
    completed: false,
  };
  delete g.s.checkpoint;
  const b = g.s.battle;
  b.permanent.focus = 1;
  b.focus = 2;
  b.hand = [];
  b.deck = g.s.deck.map((c) => ({ ...c }));
  b.discard = [];
  const blast = b.deck.splice(
    b.deck.findIndex((c) => c.id === "blast"),
    1,
  )[0];
  b.grid[15] = [g.instance(blast)];
  draw(g, "shield");
  draw(g, "elves");
  b.corruptions = {
    14: { kind: "nausea", uid: g.uid(), source: b.enemies[0].uid, value: 1 },
  };
  return g;
}
export function loomAfter(g, a) {
  const t = g.s.tutorial,
    b = g.s.battle;
  if (a?.type === "tutorialRetry") {
    g.s.battle = structuredClone(t.finalStart.battle);
    g.s.hp = t.finalStart.hp;
    g.s.mode = "battle";
    g.s.status = { burn: 0, poison: 0, corrode: 0 };
    delete g.s.outcome;
    delete g.s.death;
    delete g.s.cause;
    g.s.stats.encounters.push({
      round: 0,
      stratum: 2,
      enemies: ["Patient Spoolkeeper"],
      outcome: "in progress",
      hpStart: g.s.hp,
    });
    t.completed = false;
    t.independentIntroDismissed = false;
    return;
  }
  if (t.completed || LOOM_STEPS[t.step]?.kind === "free") return;
  t.step++;
  if (t.step >= LOOM_STEPS.length) {
    t.completed = true;
    g.finish(true, "The Mending Ground complete");
    return;
  }
  const step = LOOM_STEPS[t.step];
  t.lesson = step.id;
  if (step.kind === "free") {
    // Change the waiting teacher's behavior, preserving the actual encounter.
    const e = b.enemies[0],
      d = enemies.mendingWarden;
    Object.assign(e, {
      id: "mendingWarden",
      enemy: "mendingWarden",
      name: d.name,
      tier: d.tier,
      rotation: structuredClone(d.rotation),
      signature: d.signature,
      counter: d.counter,
      corruptionCap: d.corruptionCap,
      cycle: 0,
    });
    t.finalStart = { battle: structuredClone(g.s.battle), hp: g.s.hp };
    return;
  }
  const setup = step.setup;
  if (step.id === "menders") draw(g, "elves");
  if (setup === "hole") {
    const slot = 21;
    b.corruptions[slot] = {
      kind: setup,
      uid: g.uid(),
      source: b.enemies[0].uid,
      value: 1,
    };
  }
  if (setup === "anger") {
    b.corruptions[16] = {
      kind: "anger",
      uid: g.uid(),
      source: b.enemies[0].uid,
    };
    const strong = g.newCard("blast", true),
      water = g.newCard("water");
    g.s.deck.push(strong, water);
    b.grid[17] = [g.instance(strong)];
    b.grid[8] = [g.instance(water)];
  }
  if (setup === "anger-fired") draw(g, "shield");
}
