import test from "node:test";
import assert from "node:assert/strict";
import { cards } from "../src/content.mjs";
import { Game, cardPower } from "../src/engine.mjs";
import { synergyBonus, enhancementBonus, printedElementCounts, currentElementCounts } from "../src/synergy-rules.mjs";
import { SYNERGY_ELEMENTS } from "../src/synergy-content.mjs";
import { attackPreview } from "../src/combat-preview.mjs";
import { statHelp } from "../src/card-upgrade-ui.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { compelCard, triggerAnger } from "../src/corruptions.mjs";
import { spawnIdeon } from "../src/ideons.mjs";

function setup(ids) {
  const g = new Game(891);
  g.s.deck = ids.map(id=>g.newCard(id));
  g.s.equipment = {};
  g.beginBattle([{uid:900, enemy:"beetle", restless:0}]);
  const b = g.s.battle;
  b.phase = "activate"; b.focus = 20; b.channel = 20;
  b.enemies[0].hp = b.enemies[0].maxHp = 10000;
  b.enemies[0].element = "Arcane";
  return {g,b,e:b.enemies[0]};
}
function put(g, id, slot) {
  const b=g.s.battle;
  let c;
  for (const pile of [b.hand,b.deck,b.discard,b.destroyed]) {
    const index=pile.findIndex(c=>c.id===id);
    if(index>=0) { c=pile.splice(index,1)[0]; break; }
  }
  assert.ok(c, "fixture owns "+id);
  b.grid[slot]=[g.instance(c)];
  return b.grid[slot][0];
}
function use(g, slot) {
  const a=g.legal().find(a=>a.type==="activate" && a.slot===slot);
  assert.ok(a, "legal activation at "+slot);
  g.act(a); return a;
}

test("Thirteen explicit-cost cards join cumulative reward/shop pools from Stratum 1",()=>{
  const all=Object.values(cards).filter(c=>c.expansion==="synergy"), g=new Game(15);
  assert.equal(all.length,13);
  assert.equal(Object.values(cards).filter(c=>c.type!=="Hex").length,94);
  for(const d of all) {
    assert.deepEqual([d.focus,d.channel,d.limit,d.recall,d.stratum],[1,1,2,1,1]);
    assert.ok(g.pool(d.rarity,true).some(c=>c.id===d.id));
    assert.ok(g.pool(d.rarity,false).some(c=>c.id===d.id));
  }
  assert.equal(cards.prismaticSynergy.rarity,"rare");
  assert.equal(cards.prismaticSynergy.element,"Arcane");
  assert.ok(!cards.arcaneSynergy && !cards.arcaneEnhance);
});

test("Synergy counts committed current elements once across all piles",()=>{
  const {g,b,e}=setup(["fireSynergy","fireSynergy","cinder","blast","water"]);
  const c=put(g,"fireSynergy",10), other=put(g,"fireSynergy",12);
  const cinder=put(g,"cinder",14), blast=put(g,"blast",16);
  assert.equal(synergyBonus(b,c),2);
  blast.lastActivatedTurn=b.turn; blast.lastActivationElement="Fire";
  assert.equal(synergyBonus(b,c),3);
  other.element="Wind"; other.transmuted=true;
  assert.equal(synergyBonus(b,c),2);
  b.turn++;
  assert.equal(synergyBonus(b,c),1);
  b.destroyed.push(...b.grid[14]); b.grid[14]=[];
  b.discard.push(...b.grid[12]); b.grid[12]=[];
  assert.equal(synergyBonus(b,c),2); // Off-board cards return to printed element.
  assert.equal(printedElementCounts(b).Fire,3);
  c.element="Water"; c.transmuted=true;
  assert.equal(cardPower(b,c,10),8); // Count Water now, excluding self.
  e.element="Fire";
  assert.equal(attackPreview(b,c,10,e,"Water").damage,12);
  const hp=e.hp; use(g,10); assert.equal(hp-e.hp,12);
  assert.match(statHelp(b,c,10),/1 other current Water cards/);
});

test("Prismatic uses the minimum of all six elements, with zero for a missing one",()=>{
  const ids=SYNERGY_ELEMENTS.flatMap(el=>Array(el==="Light"?3:4).fill(el.toLowerCase()+"Synergy"));
  const {g,b}=setup(["prismaticSynergy",...ids,"blast","clear"]);
  const c=put(g,"prismaticSynergy",10);
  assert.equal(synergyBonus(b,c),9);
  assert.equal(cardPower(b,c,10),16);
  assert.match(statHelp(b,c,10),/lowest 3 × 3/);
  b.grimoire=b.grimoire.filter(c=>cards[c.id].element!=="Chaos");
  assert.equal(cardPower(b,c,10),7);
});

test("Enhance follows current attack elements and survives source Recall/save",()=>{
  const {g,b}=setup(["fireEnhance","cinder","blast","shield","water"]);
  const source=put(g,"fireEnhance",10), cinder=put(g,"cinder",12), blast=put(g,"blast",14), shield=put(g,"shield",16);
  const before=cardPower(b,cinder,12);
  use(g,10);
  assert.equal(b.channel,19); assert.equal(source.used,1);
  assert.equal(b.elementEnhancements.Fire,1);
  assert.equal(cardPower(b,cinder,12),before+1);
  assert.equal(enhancementBonus(b,blast),0);
  blast.lastActivatedTurn=b.turn; blast.lastActivationElement="Fire";
  assert.equal(enhancementBonus(b,blast),1);
  assert.equal(cardPower(b,shield,16),0);
  cinder.element="Water"; cinder.transmuted=true;
  assert.equal(enhancementBonus(b,cinder),0);
  b.turn++; use(g,10);
  assert.equal(b.elementEnhancements.Fire,2);
  assert.equal(enhancementBonus(b,blast),0); // Temporary Attunement expired.
  cinder.element="Fire";
  assert.equal(cardPower(b,cinder,12),before+2);
  b.turn++; b.phase="place";
  g.act(g.legal().find(a=>a.type==="recall"&&a.slot===10));
  const restored=new Game(0,structuredClone(g.s));
  assert.equal(restored.s.battle.elementEnhancements.Fire,2);
  assert.equal(cardPower(restored.s.battle,restored.s.battle.grid[12][0],12),before+2);
  restored.beginBattle([{uid:990,enemy:"beetle",restless:0}]);
  assert.deepEqual(restored.s.battle.elementEnhancements,{});
});

test("Transmuted Enhance empowers its current element, with no retroactive retagging",()=>{
  const {g,b}=setup(["fireEnhance"]);
  const c=put(g,"fireEnhance",10);
  use(g,10); b.turn++;
  c.element="Water";c.transmuted=true;use(g,10);
  assert.deepEqual(b.elementEnhancements,{Fire:1,Water:1});
});

test("Attuned damage previews agree with resolution without mutating counts",()=>{
  const {g,b,e}=setup(["blast","cinder","fireSynergy"]);
  const blast=put(g,"blast",10);put(g,"cinder",11);const synergy=put(g,"fireSynergy",14);
  b.elementEnhancements={Fire:2};
  const state=structuredClone(b), counts=currentElementCounts(b);
  const a=g.legal().find(a=>a.type==="activate"&&a.slot===10&&a.element==="Fire");
  assert.equal(a.effects.damage,6);
  assert.equal(attackPreview(b,blast,10,e,"Fire",a).damage,6);
  assert.deepEqual(b,state);assert.deepEqual(currentElementCounts(b),counts);
  assert.equal(synergyBonus(b,synergy),1);
  const hp=e.hp;g.act(a);assert.equal(hp-e.hp,6);
  assert.equal(synergyBonus(b,synergy),2);
  b.turn++;assert.equal(synergyBonus(b,synergy),1);
});

test("Allies gain damage without HP; later placements and recalled attacks retain Enhance",()=>{
  const {g,b}=setup(["earthEnhance","sapling","root"]);
  put(g,"earthEnhance",10); use(g,10);
  const ally=put(g,"sapling",12), root=put(g,"root",14);
  const hp=ally.hp;
  assert.equal(cardPower(b,ally,12),hp+1); assert.equal(ally.hp,hp);
  const power=cardPower(b,root,14);
  b.phase="place";
  g.act(g.legal().find(a=>a.type==="recall"&&a.slot===14));
  const replaced=put(g,"root",14);
  assert.equal(cardPower(b,replaced,14),power);
  b.corruptions[14]={kind:"nausea"};
  assert.equal(cardPower(b,replaced,14),Math.floor(power/2));
});

test("Enhance applies once to a Plasma Construct and to each random-damage hit",()=>{
  const {g,b,e}=setup(["chaosEnhance","plasma","plasma","discord"]);
  put(g,"chaosEnhance",10); use(g,10);
  const plasma=put(g,"plasma",12), attached=put(g,"plasma",14);
  b.grid[14]=[]; attached.attachedTo=plasma.uid; b.grid[12].unshift(attached);
  assert.equal(cardPower(b,plasma,12),25);
  assert.match(statHelp(b,plasma,12),/1 Enhance/);
  put(g,"discord",16);
  const control=new Game(0,structuredClone(g.s));
  control.s.battle.elementEnhancements={};
  const hp=e.hp, hp2=control.s.battle.enemies[0].hp;
  use(g,16); use(control,16);
  assert.equal(hp-e.hp,hp2-control.s.battle.enemies[0].hp+1);
});

test("Legacy saves recover printed Grimoire counts and expose finite policy scores",()=>{
  const {g,b}=setup(["waterSynergy","waterEnhance","water"]);
  put(g,"waterSynergy",10); put(g,"waterEnhance",12);
  delete b.grimoire; delete b.elementEnhancements;
  const h=new Game(0,structuredClone(g.s)), policy=new WeightedPolicy();
  assert.equal(printedElementCounts(h.s.battle).Water,3);
  assert.equal(cardPower(h.s.battle,h.s.battle.grid[10][0],10),9);
  const actions=h.legal();
  assert.ok(actions.some(a=>a.type==="activate"&&a.slot===12));
  assert.ok(policy.choose(h.observe(),actions));
});

test("Anger activates Enhance normally; Hypnosis wastes its use without granting a buff",()=>{
  const {g,b,e}=setup(["fireEnhance","fireSynergy"]);
  const source=put(g,"fireEnhance",10);
  b.corruptions[10]={kind:"anger"};
  triggerAnger(g,10);
  assert.equal(source.used,1); assert.equal(b.channel,19);
  assert.equal(b.elementEnhancements.Fire,1);
  b.turn++; b.corruptions[10]={kind:"hypnosis",source:e.uid};
  compelCard(g,10,b.corruptions[10]);
  assert.equal(source.used,2);
  assert.equal(b.elementEnhancements.Fire,1);
});

test("Enhance boosts focus-scaled, beam and placement attacks without boosting statuses",()=>{
  const {g,b,e}=setup(["fireEnhance","mindfire","heat","windEnhance","scouringGale","earthEnhance","thornfall"]);
  put(g,"fireEnhance",0); use(g,0);
  const mindfire=put(g,"mindfire",10);
  b.focus=2;
  const action=g.legal().find(a=>a.type==="activate"&&a.slot===10);
  const preview=attackPreview(b,mindfire,10,e,action.element,action), hp=e.hp;
  g.act(action); assert.equal(hp-e.hp,preview.damage);
  put(g,"heat",12); const burn=g.legal().find(a=>a.type==="activate"&&a.slot===12);
  assert.equal(burn.effects.burn,2);
  put(g,"windEnhance",14); use(g,14);
  put(g,"scouringGale",21);
  const ideon=spawnIdeon(g,e,"runner",{slot:25,element:"Arcane"});
  ideon.hp=ideon.maxHp=1000;
  const enemyHp=e.hp; use(g,21);
  assert.equal(enemyHp-e.hp,5); assert.equal(ideon.hp,991);
  put(g,"earthEnhance",28); use(g,28);
  b.phase="place"; b.focus=10;
  const i=b.deck.findIndex(c=>c.id==="thornfall");
  if(i>=0) b.hand.push(b.deck.splice(i,1)[0]);
  const strike=g.legal().find(a=>a.type==="placeStrike"&&a.target===e.uid);
  assert.equal(strike.effects.damage,11);
  const before=e.hp; g.act(strike); assert.equal(before-e.hp,11);
});

test("Prismatic responds to temporary elements, and each Meld card counts once",()=>{
  const {g,b}=setup(["prismaticSynergy","fireSynergy","earthSynergy","waterSynergy","windSynergy","chaosSynergy","blast","plasma","plasma"]);
  const prism=put(g,"prismaticSynergy",10), blast=put(g,"blast",12);
  const host=put(g,"plasma",14), under=put(g,"plasma",16);
  b.grid[16]=[];under.attachedTo=host.uid;b.grid[14].unshift(under);
  assert.equal(currentElementCounts(b).Chaos,3);
  assert.equal(synergyBonus(b,prism),0);
  blast.lastActivatedTurn=b.turn;blast.lastActivationElement="Light";
  assert.equal(synergyBonus(b,prism),3);
  b.turn++;assert.equal(synergyBonus(b,prism),0);
});

test("Multi-element hits use their own Enhance totals before Nausea and matchups",()=>{
  const {g,b,e}=setup(["braidedSeasons","cinder","water"]);
  const c=put(g,"braidedSeasons",10);put(g,"cinder",9);put(g,"water",11);
  b.elementEnhancements={Fire:3,Water:1};b.corruptions[10]={kind:"nausea"};
  const a=g.legal().find(a=>a.type==="activate"&&a.slot===10&&a.element==="Fire"&&a.secondaryElement==="Water");
  assert.ok(a);
  const preview=attackPreview(b,c,10,e,a.element,a);
  assert.equal(preview.damage,13); // floor((12+3)/2) + floor((12+1)/2)
  const hp=e.hp;g.act(a);assert.equal(hp-e.hp,preview.damage);
});
