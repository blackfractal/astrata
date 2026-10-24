import { enemies } from "./content.mjs";
import { spawnIdeon } from "./ideons.mjs";

export const DEPTHS_TUTORIAL = {
  id: "stratum3", version: 2, name: "The Listening Hollow", seed: 33003,
};
export const depthsTutorialUnlocked = data => !!(
  data.save?.stratum >= 3 || data.history?.some(r => r.stratum >= 3) ||
  data.tutorialStats?.stratum3 || data.tutorialSave?.tutorial?.id === "stratum3"
);
const note = (id, title, text, focus = ".mind", setup) =>
  ({ id, title, text, focus, setup, kind: "note" });
const action = (id, title, text, match) =>
  ({ id, title, text, match, kind: "action" });
export const DEPTHS_STEPS = [
  note("whispers", "A thought that is not yours",
    "In the Weald, they struck at your cards. In the Loom, they scarred the spaces of your mind. Here in the Lucent Grotto, the enemies have learned something more intimate: how to place their own thoughts among yours. Little voices whisper from inside your defenses. The Lucid Guide turns toward a voice you did not invite."),
  note("intruder", "An Ideon", "The Clinging Thought is an Ideon: a card controlled by the enemy. Unlike a Corruption, it has HP and can be attacked. Its small owner portrait identifies the enemy commanding it. The owner's Tell says when its Ideons will act. Hover or click the intruder to read its traits.", ".ideon"),
  note("formations", "Find the shape of the attack", "Cards that specialize in attacking Ideons usually depend on a formation: a row, a column, or nearby spaces. Read each card to see which Ideons it can reach. Your Lucid Guide strikes an orthogonally adjacent Ideon after moving up to one space. Let's use that movement to bring a whisper within reach."),
  action("guide-place", "Make room for the Guide", "Place the Lucid Guide on the highlighted space. This lesson provides 2 Focus and 3 Channel each round so you can practice the new choices.", { type: "place", card: "lucidGuide", slot: 16 }),
  action("guide-phase", "Advance to Activation", "Use the phase arrow. The Guide spends Channel and one of its card uses, like other activated cards.", { type: "activatePhase" }),
  action("guide-strike", "Step toward the whisper", "Activate the Guide, choose the highlighted space one step to the right, then the adjacent Clinging Thought. The Guide can move one orthogonal space and strike an adjacent Ideon for 18 Arcane damage. It can also move without attacking.", { type: "activate", slot: 16, destination: 17, targetKind: "binder" }),
  note("silenced", "One voice falls silent", "The Ideon is defeated. Ordinary targeted attacks can also damage Ideons; Lucid Guide is a specialist. Its mark helps a different card's next attack if the target survives. Defeating the owner removes all of its remaining Ideons.", '[data-slot="17"]'),
  action("first-end", "A moment to listen", "Advance to Enemy. The Oracle waits while the Guide listens for another voice.", { type: "endTurn" }),
  note("inside", "Behind your defenses", "Another Clinging Thought has appeared in column 3, closer to you than the Ward in column 6 and Shield in column 7. Ideons can invade or move behind a defensive line. This one will attack from its own space for 6 Chaos when the Oracle commands it.", '[data-slot="23"], [data-slot="26"], [data-slot="6"]', "inside"),
  action("left-shield", "Guard the route to you", "Place a Shield in column 2, between the intruder and your Druid. A defense must be in the attack's current column or farther LEFT. Row does not matter.", { type: "place", card: "shield", slot: 22 }),
  action("defense-phase", "Prepare both sides", "Advance to Activation. We will charge the right-side Ward and Shield as well, so you can see that having Guard is not enough if it is behind the attack.", { type: "activatePhase" }),
  action("right-ward", "Charge the right-side Ward", "Activate this isolated Ward. It will hold 11 Ward, but the intruder is already to its left.", { type: "activate", slot: 26, element: "Arcane" }),
  action("right-shield", "Raise the right-side Shield", "Activate the Shield in column 7. It has 4 Guard, but it is also to the right of the intruder.", { type: "activate", slot: 6, element: "Arcane" }),
  action("near-shield", "Raise the Shield in front", "Activate the Shield in column 2. Its 4 Guard lies on the attack's route toward you.", { type: "activate", slot: 22, element: "Arcane" }),
  action("incoming", "Let the voice strike", "Advance to Enemy. Watch the attack begin at the Ideon's space inside your mind grid, rather than at the Oracle on the right.", { type: "endTurn" }),
  note("route", "The attack cannot go backward", "The right-side Ward and Shield are not eligible, even though both are charged. The attack starts in column 3 and can only travel LEFT toward you. Use the Shield in column 2. Equipment remains available after your grid defenses.", '[data-slot="23"], [data-slot="22"], [data-slot="26"], [data-slot="6"]'),
  action("intercept", "Choose the nearer Shield", "Click the highlighted Shield on the board to absorb 4 of the incoming 6 damage.", { type: "block", slot: 22 }),
  action("bracelet", "Catch the remainder", "Click your Bronze Bracelet to absorb the remaining 2. The attack travels from the Shield to the bracelet, then stops.", { type: "bracelet" }),
  note("safe", "Position is part of defense", "No HP was lost. The unused Ward still holds 11, while last round's Shield Guard has expired. Against an Ideon, check where the attack starts before spending Channel on defenses. Once you intercept farther left, defenses to the right become unavailable as usual.", '[data-slot="26"], .battle-player'),
  action("guide-return-phase", "Bring the Guide back", "Advance to Activation. The remaining whisper is out of reach from here, but one step down will put it beside the Guide.", { type: "activatePhase" }),
  action("guide-return-strike", "Move into formation", "Activate the Guide, move one space down to the highlighted space, then select the adjacent Clinging Thought. Moving into the right formation lets the Guide silence this intruder too.", { type: "activate", slot: 17, destination: 24, targetKind: "binder" }),
  note("own-voice", "Your thoughts, your choices", "Ideons do not provide your cards with adjacency bonuses or Attunement sources. Machine Elves repair Corruptions; attacks deal with Ideons. Read each invading card: some move, some protect their owner, and some interfere with your cards. Area attacks have their own target rules, so read their descriptions."),
  { id: "independent", kind: "free", title: "Keep your own voice", focus: "",
    text: "Defeat the Borrowed Oracle. It will alternate a 5 Arcane attack and a new Glass Skitter with a 5 Arcane attack that commands its Ideons. Use the Guide or ordinary attacks to control intruders; check their positions before defending. You choose the rest. Gentle suggestions appear only if you pause." },
];

export function normalizeDepthsTutorial(s) {
  const t=s.tutorial;
  if(t?.id!=="stratum3" || t.version>=DEPTHS_TUTORIAL.version) return;
  // Preserve completed actions and independent practice. Retired Needle steps
  // advance to the next explanation; never replay an already-spent activation.
  if(t.lesson?.startsWith("needle-")) t.lesson="own-voice";
  const index=DEPTHS_STEPS.findIndex(step=>step.id===t.lesson);
  if(index>=0) t.step=index;
  if(t.lesson!=="independent" && !t.completed) {
    s.deck=s.deck.filter(c=>c.id!=="lucidNeedle");
    const b=s.battle;
    if(b) {
      for(const pile of ["hand","deck","discard","destroyed"]) b[pile]=b[pile].filter(c=>c.id!=="lucidNeedle");
      b.grid=b.grid.map(stack=>stack.filter(c=>c.id!=="lucidNeedle"));
      const firstStrikePending=["whispers","intruder","guide-place","guide-phase","guide-strike"].includes(t.lesson);
      if(firstStrikePending) {
        for(const e of b.ideons) if(e.slot===19 && e.kind==="binder") e.slot=18;
      }
      const guideSlot=b.grid.findIndex(stack=>stack.some(c=>c.id==="lucidGuide"));
      const newSlot=firstStrikePending?16:17;
      if(guideSlot>=0 && guideSlot!==newSlot && !b.grid[newSlot].length) {
        b.grid[newSlot]=b.grid[guideSlot]; b.grid[guideSlot]=[];
      }
    }
  }
  t.version=DEPTHS_TUTORIAL.version;
}

export function depthsGuide(g) {
  const t = g.s.tutorial;
  return t.completed ? null : { ...DEPTHS_STEPS[t.step], index: t.step, total: DEPTHS_STEPS.length, name: DEPTHS_TUTORIAL.name };
}
export function depthsActions(g, raw) {
  const t = g.s.tutorial;
  if (g.s.mode === "result") return g.s.outcome === "loss" && t.finalStart
    ? [{type:"tutorialRetry", key:'["tutorialRetry"]', label:"Retry the Oracle", effects:{progress:1}, costs:{}}] : [];
  const step = DEPTHS_STEPS[t.step];
  if (step.kind === "free") return raw;
  if (step.kind === "note") return [{type:"tutorialNext", label:"Continue lesson", key:JSON.stringify(["tutorialNext",{step:step.id}]), effects:{progress:1}, costs:{}}];
  return raw.filter(a => Object.entries(step.match).every(([k,v]) =>
    k === "card" ? g.s.battle.hand.find(c => c.uid === a.uid)?.id === v :
    k === "targetKind" ? g.s.battle.ideons.find(e => e.uid === a.target)?.kind === v : a[k] === v)).slice(0,1);
}
function take(g, id) {
  const b=g.s.battle;
  for(const pile of [b.hand,b.deck,b.discard]) {
    const i=pile.findIndex(c=>c.id===id);
    if(i>=0) return pile.splice(i,1)[0];
  }
  throw new Error("Missing tutorial card: " + id);
}
export function startDepthsTutorial(g) {
  Object.assign(g.s,{stratum:3, mode:"field", hp:70, gold:0, tutorial:{...DEPTHS_TUTORIAL,step:0,lesson:DEPTHS_STEPS[0].id,fight:1,completed:false}});
  g.s.deck=["lucidGuide","blast","ward","shield","shield","blast","blast","blast","blast","shield","shield","sapling","focus","clear"].map(id=>g.newCard(id));
  g.s.equipment.finger2=g.addItem("channelRing").uid;
  g.beginBattle([{uid:g.uid(),enemy:"whisperTutor",restless:0}]);
  delete g.s.checkpoint;
  const b=g.s.battle;
  b.permanent.focus=1; b.focus=2; b.channel=3;
  b.hand=[]; b.deck=structuredClone(g.s.deck); b.discard=[];
  b.grid[26]=[g.instance(take(g,"ward"))];
  b.grid[6]=[g.instance(take(g,"shield"))];
  b.hand.push(take(g,"lucidGuide"));
  spawnIdeon(g,b.enemies[0],"binder",{slot:18});
  return g;
}
export function depthsAfter(g,a) {
  const t=g.s.tutorial,b=g.s.battle;
  if(a.type==="tutorialRetry") {
    g.s.battle=structuredClone(t.finalStart.battle); g.s.hp=t.finalStart.hp; g.s.rng=t.finalStart.rng;
    g.s.mode="battle"; g.s.status={burn:0,poison:0,corrode:0};
    delete g.s.outcome; delete g.s.death; delete g.s.cause;
    g.s.stats.encounters.push({round:0,stratum:3,enemies:["Borrowed Oracle"],outcome:"in progress",hpStart:g.s.hp});
    t.completed=false; t.independentIntroDismissed=false; return;
  }
  if(t.completed || DEPTHS_STEPS[t.step].kind==="free") return;
  const step=DEPTHS_STEPS[++t.step]; t.lesson=step.id;
  if(step.setup==="inside") {
    spawnIdeon(g,b.enemies[0],"binder",{slot:23});
    b.hand.push(take(g,"shield"));
  }
  if(step.kind==="free") {
    const e=b.enemies[0],d=enemies.whisperWarden;
    Object.assign(e,{id:d.id,enemy:d.id,rotation:structuredClone(d.rotation),signature:d.signature,counter:d.counter,cycle:0});
    t.finalStart={battle:structuredClone(b),hp:g.s.hp,rng:g.s.rng};
  }
}
