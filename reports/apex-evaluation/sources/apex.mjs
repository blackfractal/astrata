import { enemies, items } from "./content.mjs";

export const APEX_SIZES = [11, 9, 7, 5];
export const apexActive = s => s.stratum === 4 && !!s.apex;
export const fieldSize = f => f.size || 11;
export function apexMovement(d, e) {
  if (!e.apexMap || d.tier !== "Mote") return d;
  return { ...d, movement: ["Hunter", "Stalker"].includes(d.movement) ? d.movement : "Wanderer", speed: ["Hunter", "Stalker"].includes(d.movement) ? d.speed || 2 : 1 };
}
export function apexStats(d, e) {
  if (!e.apexMap || d.id === "apex") return { hp: d.hp, damageBonus: 0 };
  const floor = e.apexFloor;
  if (d.tier === "Archon") return { hp: floor === 3 ? d.hp : Math.ceil(d.hp * (floor === 1 ? 1.35 : 1.2)), damageBonus: floor === 3 ? 0 : floor === 1 ? 3 : 2 };
  return { hp: Math.ceil(d.hp * [0, 1.6, 1.35, 1.15][floor]), damageBonus: [0, 4, 3, 2][floor] };
}
export function enterApexFloor(g, floor = 1) {
  const s = g.s;
  s.apex ||= { floor: 0, required: [], defeated: [], visits: [] };
  if (s.apex.floor) s.apex.visits.push({ floor: s.apex.floor, round: s.field.round, abandoned: s.field.entities.filter(e => e.apexMap && e.enemy).map(e => e.uid), hp: s.hp });
  s.apex.floor = floor;
  const size = APEX_SIZES[floor - 1], c = Math.floor(size / 2);
  s.field = { size, apexFloor: floor, round: 0, spawned: 0, spawnWidth: 2, queue: [], entities: [], x: c, y: c, moves: 0, stage: "player", archons: [], defeatedArchons: [] };
  if (floor < 4) s.field.archons = g.shuffle(Object.values(enemies).filter(e => e.tier === "Archon" && (e.stratum || 1) === floor).map(e => e.id)).slice(0, 2).map((id, i) => ({ id, x: c + (i ? 2 : -2), y: c - 2 }));
  s.archon = floor === 4 ? "apex" : s.field.archons[0].id;
  s.enemyDecks = {};
  s.mode = "field";
  delete s.battle; delete s.reward; delete s.checkpoint; delete s.itemSource;
  g.log(`The Apex · Floor ${floor}. ${floor === 4 ? "The Apex Predator waits." : "The Archons hunt after round 8. Defeating both forces ascent."}`);
  g.present("ascent", { floor, name: "The Apex · Floor " + floor });
  if (floor < 4) g.beginRound();
}
export function apexBatch(g) {
  const f = g.s.field;
  if (f.apexFloor === 4) return;
  while (f.queue.length < Math.min(8, 16 - f.spawned)) {
    const number = f.spawned + f.queue.length + 1;
    // 60% encounters (4:1 Mote:Eidolon), 25% Gold, 15% Item.
    const roll = () => { const n = g.rand(); return n < .48 ? "Mote" : n < .6 ? "Eidolon" : n < .85 ? "Gold" : "Item"; };
    f.queue.push(number === 7 || number === 8 ? "Archon" : f.apexFloor === 3 && number === 1 ? "Tavern" : roll());
  }
}
export function apexRound(g) {
  const s = g.s, f = s.field;
  if (f.apexFloor === 4) return;
  f.round++; f.moves = g.bonuses().movement; f.stage = "player"; s.mode = "field";
  for (const e of f.entities) if (e.type === "Gold") e.value -= 5;
  f.entities = f.entities.filter(e => e.type !== "Gold" || e.value > 0);
  if (f.round > 8) throw Error("Apex cannot generate a ninth round");
  apexBatch(g);
  const c = Math.floor(f.size / 2);
  // Keep the stairs, two diagonal approaches and marked Archon spaces free of random spawns.
  const reserved = (x,y) => (x === c && y === c) || (y === c-1 && Math.abs(x-c) === 1) || f.archons.some(a => a.x === x && a.y === y);
  const spaces = [];
  for (let y=0;y<f.size;y++) for(let x=0;x<f.size;x++)
    if (!reserved(x,y) && !(x === f.x && y === f.y)) spaces.push({x,y});
  for (const type of f.queue.splice(0,2)) {
    f.spawned++;
    const mark = type === "Archon" ? f.archons[f.spawned - 7] : null;
    const pos = mark || g.pick(spaces);
    const e = { uid:g.uid(), type, x:pos.x, y:pos.y, restless:0, born:f.round, apexMap:true, apexFloor:f.apexFloor };
    if (mark) e.enemy = mark.id;
    else if (["Mote","Eidolon"].includes(type)) {
      const pool = Object.values(enemies).filter(d => d.tier === type && (d.stratum || 1) === f.apexFloor && !d.tutorialOnly && !d.summonOnly).map(d=>d.id);
      if (!s.enemyDecks[type]?.length) s.enemyDecks[type] = g.shuffle(pool);
      e.enemy = s.enemyDecks[type].pop();
    }
    if(e.enemy) {
      e.count = type === "Archon" ? 1 : g.groupSize(e.enemy, f.round + 4);
      s.apex.required.push({uid:e.uid, enemy:e.enemy, count:e.count, floor:f.apexFloor});
    }
    if(type === "Gold") e.value = 30 + Math.floor(g.rand()*8)*10;
    f.entities.push(e);
    g.log(`${e.enemy ? enemies[e.enemy].name : type} appears at ${e.x+1}, ${e.y+1}.`);
  }
  if (f.round % 4 === 0) for(const e of f.entities) if(e.enemy && e.type !== "Archon") e.restless++;
  apexBatch(g);
  g.resolveTile();
}
export function apexVictory(g, original) {
  const s=g.s,f=s.field;
  for (const e of original) if (e.apexMap && !s.apex.defeated.includes(e.entityUid)) s.apex.defeated.push(e.entityUid);
  const bosses=original.filter(e=>e.tier === "Archon");
  for (const e of bosses) if(e.id !== "apex" && !f.defeatedArchons.includes(e.id)) f.defeatedArchons.push(e.id);
  if(bosses.length && f.apexFloor < 4 && !f.entities.some(e=>e.type === "Ascend")) {
    const c=Math.floor(f.size/2); f.entities.push({uid:g.uid(),type:"Ascend",x:c,y:c});
    g.log("Ascend appears at the center. Defeat the second Archon to ascend automatically.");
  }
  const offer = () => g.rand()<.35 ? g.bossOffer() : g.rareOffer(3,true);
  const offers=bosses.map(offer);
  const goodItems=["gold","mirrorArmor","focusGem","channelGem","holyArmor","sapphire","insightGem"];
  return { cards: offers.shift() || g.offer(original.some(e=>e.tier === "Eidolon")), boss:!!bosses.length,
    apexReward:true, extraOffers:offers, gem:false, setting:bosses.length && g.rand()<.5 ? g.pick(goodItems.filter(id=>items[id])) : false,
    apexAscend:f.defeatedArchons.length === 2, apexFinal:bosses.some(e=>e.id === "apex") };
}
export function apexComplete(s) {
  return !!s.apex && [1,2,3].every(floor => s.apex.required.filter(e=>e.floor===floor && enemies[e.enemy]?.tier === "Archon").length===2) && s.apex.required.every(e=>s.apex.defeated.includes(e.uid));
}
