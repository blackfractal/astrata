import { ELVES_STORY } from "./strata.mjs";
export const LOOM_TUTORIAL = {
  id: "stratum2",
  version: 1,
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
    "Place the Elves directly on Nausea. Their 4 HP makes them vulnerable. They can only enter a Corruption they can repair.",
    { type: "place", card: "elves", slot: 14 },
  ),
  action("phase2", "Prepare to Mend", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action(
    "mend",
    "Mend",
    "Activate the Elves. Their one allowance is spent, but the repair is not finished yet.",
    { type: "activate", slot: 14 },
  ),
  note(
    "delay",
    "Protect the repair",
    "They must survive until your next player turn. If destroyed first, the Corruption remains and the Elves are unavailable until the next battle.",
  ),
  action(
    "end2",
    "Wait one enemy round",
    "Advance to Enemy to finish the repair.",
    { type: "endTurn" },
  ),
  note(
    "repaired",
    "A space restored",
    "Nausea is gone. The Elves automatically returned to discard and can be drawn again. Their one activation renews when they return to the field.",
  ),
  note(
    "insanity",
    "Insanity grows while uncovered",
    "This spiral would cost 1 HP next turn, then 2, then 3. Covering suppresses it and resets the count. The Elves have been drawn again for this lesson.",
    "insanity",
  ),
  action(
    "insanity-place",
    "Cover the spiral",
    "Place Machine Elves on Insanity. Basic Elves can repair Nausea and Insanity.",
    { type: "place", card: "elves", slot: 20 },
  ),
  action("phase3", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action("mend3", "Repair Insanity", "Activate Mend.", {
    type: "activate",
    slot: 20,
  }),
  action("end3", "Protect and wait", "Advance to Enemy.", { type: "endTurn" }),
  note(
    "hole",
    "Memory Holes need upgraded Elves",
    "Ordinary cards cannot enter a Memory Hole. At a Tavern, upgrade the Elves to repair advanced Corruptions. For this lesson your Elves are now upgraded and drawn again.",
    "hole",
  ),
  action(
    "hole-place",
    "The exception",
    "Place the upgraded Elves into the Memory Hole.",
    { type: "place", card: "elves", slot: 21 },
  ),
  action("phase4", "Advance", "Advance to Activation.", {
    type: "activatePhase",
  }),
  action("mend4", "Stitch the void", "Activate Mend.", {
    type: "activate",
    slot: 21,
  }),
  action("end4", "Wait for repair", "Advance to Enemy.", { type: "endTurn" }),
  note(
    "hole-done",
    "Room to think",
    "The Hole has vanished. You can also leave Holes alone and build elsewhere. No fight requires using the Elves.",
  ),
  note(
    "mine",
    "A Mind Mine",
    "This mine has one response turn left in this demonstration. Normally it gives three full player turns. Cover it with the spare Shield: the explosion sacrifices only the top card, rather than dealing 18 Arcane damage.",
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
    "Corruption Tell markers stay on the chosen spaces. They do not follow recalled cards. Filling a marked Memory Hole space before it resolves prevents that Hole; Nausea and Mines can appear beneath cards.",
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
    const slot = setup === "hole" ? 21 : 20;
    b.corruptions[slot] = {
      kind: setup,
      uid: g.uid(),
      source: b.enemies[0].uid,
      value: 1,
    };
    draw(g, "elves", setup === "hole");
  }
  if (setup === "mine") {
    b.corruptions[27] = {
      kind: "mine",
      uid: g.uid(),
      source: b.enemies[0].uid,
      remaining: 1,
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
