import { ELVES_STORY } from "./strata.mjs";
export const LOOM_TUTORIAL = {
  id: "stratum2",
  version: 2,
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
  note("loom-welcome", "The Mending Ground", ELVES_STORY),
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
    "Place the Elves on Nausea. They have 4 HP and three Mend activations. They can stand anywhere and repair their own space or a north, east, south or west neighbor.",
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
    "insanity",
    "Insanity grows while uncovered",
    "This spiral beside the Elves would cost 1 HP next turn, then 2, then 3. Covering suppresses it and resets the count. Repair it from the neighboring space instead.",
    "insanity",
  ),
  note(
    "insanity-place",
    "Repair from next door",
    "The Elves can reach the Insanity directly below them. You do not need another placement.",
  ),
  action("phase3", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action("mend3", "Repair Insanity", "Activate Mend.", {
    type: "activate",
    slot: 14,
    cardTarget: 21,
  }),
  action("end3", "Protect and wait", "Advance to Enemy.", { type: "endTurn" }),
  note(
    "hole",
    "Stronger repairs take time",
    "Only Machine Elves can enter a Memory Hole, but they can also repair it from beside it. Hole and Hypnosis repairs take two turns normally, one when upgraded. Your remaining Elves are now upgraded for this lesson.",
    "hole",
  ),
  note(
    "hole-place",
    "Stay beside the Hole",
    "Your upgraded Elves have one use left. Repair the Hole from the same neighboring space.",
  ),
  action("phase4", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action("mend4", "Stitch the void", "Activate Mend.", {
    type: "activate",
    slot: 14,
    cardTarget: 21,
  }),
  action("end4", "Wait for repair", "Advance to Enemy.", { type: "endTurn" }),
  note(
    "hole-done",
    "Room to think",
    "The Hole has vanished. Their third repair complete, the Elves return to discard. Protect them during delayed repairs; dying interrupts the job. You can also leave Holes alone and build elsewhere.",
  ),
  note(
    "mine",
    "A Mind Mine",
    "After a mine is placed, you get one player turn to respond. It explodes on the next enemy turn: every mine deals 20 Fire. Machine Elves defuse immediately with Mend. Cover this mine with the spare Shield: the explosion sacrifices only the top card instead of damaging you.",
    "mine",
  ),
  action(
    "mine-cover",
    "A willing sacrifice",
    "Place the Shield over the mine.",
    { type: "place", card: "shield", slot: 27 },
  ),
  action("phase5", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "end5",
    "Contain the explosion",
    "Advance to Enemy. Watch the covered mine destroy its Shield.",
    { type: "endTurn" },
  ),
  note(
    "hypnosis",
    "Hypnosis borrows your cards",
    "Hypnosis is attached beneath your Blast. On enemy rounds it can spend that card's normal allowance against you. Activate it first this turn so the once-per-turn rule prevents compulsion.",
    "hypnosis",
  ),
  action("phase6", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "deny",
    "Keep your own turn",
    "Activate the marked Blast against the enemy.",
    { type: "activate", slot: 15 },
  ),
  action(
    "end6",
    "Deny the borrowed attack",
    "Advance to Enemy: Hypnosis cannot activate that Blast a second time this turn.",
    { type: "endTurn" },
  ),
  note(
    "tells",
    "Read the marked spaces",
    "Cover a marked empty space and the enemy immediately chooses another eligible space: watch the warning move before ending your turn. With no eligible replacement, that mark is canceled. Hypnosis targets an occupied card space. Existing Corruptions stay on their spaces when covered or uncovered.",
  ),
  note(
    "complete",
    "Ready for the Loom",
    "Cover, route around, sacrifice, or Mend. Inspect every enemy's Tell. A gentle Spoolkeeper waits for one final practice. Your normal journey remains safe at Continue.",
  ),
];
LOOM_STEPS.push({
  id: "independent",
  kind: "free",
  title: "Your turn to decide",
  text: "Defeat the Patient Spoolkeeper. Read its Tell, cover or Mend its Nausea, and protect your Elves. The guided prompts stop here; a gentle suggestion appears if you pause.",
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
  g.s.deck = ["elves", "shield", "blast", "shield"].map((id) => g.newCard(id));
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
    g.s.deck = [
      ...Array(4).fill("blast"),
      ...Array(4).fill("shield"),
      "sapling",
      "ward",
      "elves",
      "focus",
      "clear",
    ].map((id) => g.newCard(id, id === "elves"));
    g.s.hp = 70;
    g.beginBattle([{ uid: g.uid(), enemy: "mendingWarden", restless: 0 }]);
    t.finalStart = { battle: structuredClone(g.s.battle), hp: g.s.hp };
    return;
  }
  const setup = step.setup;
  if (setup === "insanity" || setup === "hole") {
    const slot = 21;
    b.corruptions[slot] = {
      kind: setup,
      uid: g.uid(),
      source: b.enemies[0].uid,
      value: 1,
    };
    if (setup === "hole") {
      const elf = b.grid[14].at(-1);
      if (elf?.id === "elves") elf.upgrade = true;
    }
  }
  if (setup === "mine") {
    b.corruptions[27] = {
      kind: "mine",
      uid: g.uid(),
      source: b.enemies[0].uid,
      remaining: 1,
      element: "Fire",
      damage: 20,
      createdTurn: b.turn - 1,
    };
    draw(g, "shield");
  }
  if (setup === "hypnosis")
    b.corruptions[15] = {
      kind: "hypnosis",
      uid: g.uid(),
      source: b.enemies[0].uid,
    };
}
