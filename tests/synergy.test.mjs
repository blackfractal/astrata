import test from "node:test";
import assert from "node:assert/strict";
import { cards } from "../src/content.mjs";
import { Game, cardPower } from "../src/engine.mjs";
import { synergyBonus, enhancementBonus, printedElementCounts, currentElementCounts } from "../src/synergy-rules.mjs";
import { SYNERGY_ELEMENTS, LEGACY_ELEMENT_CARDS } from "../src/synergy-content.mjs";
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
function use(g, slot, element) {
  const a=g.legal().find(a=>a.type==="activate" && a.slot===slot && (!element || a.element===element));
  assert.ok(a, "legal activation at "+slot);
  g.act(a); return a;
}


test("Two common attunable cards replace twelve variants; Prismatic stays rare",()=>{
 const g=new Game(15), all=Object.values(cards).filter(c=>c.expansion==="synergy");
 assert.equal(all.length,3);assert.equal(Object.values(cards).filter(c=>c.type!=="Hex").length,84);
 for(const d of all){assert.deepEqual([d.focus,d.channel,d.limit,d.recall,d.stratum],[1,1,2,1,1]);assert.ok(g.pool(d.rarity,true).some(c=>c.id===d.id));}
 for(const old of Object.keys(LEGACY_ELEMENT_CARDS))assert.ok(!Object.keys(cards).includes(old));
 assert.equal(cards.prismaticSynergy.rarity,"rare");
 for(const id of ["elementSynergy","elementEnhance"]){assert.equal(cards[id].element,"Arcane");assert.ok(cards[id].attune&&cards[id].requiresElement);}
});

test("Ordinary activation requires a non-Arcane source and never offers Arcane",()=>{
 const {g,b}=setup(["elementSynergy","elementEnhance","cinder"]);
 const c=put(g,"elementSynergy",10);put(g,"elementEnhance",12);
 assert.ok(!g.legal().some(a=>a.type==="activate"));assert.equal(cardPower(b,c,10),0);
 const source=put(g,"cinder",11);
 const actions=g.legal().filter(a=>a.type==="activate"&&[10,12].includes(a.slot));
 assert.equal(actions.length,2);assert.ok(actions.every(a=>a.element==="Fire"));
 source.sever=true;assert.ok(!g.legal().some(a=>a.type==="activate"&&[10,12].includes(a.slot)));
});

test("Synergy excludes itself and counts committed elements across all piles",()=>{
 const {g,b,e}=setup(["elementSynergy","elementSynergy","cinder","blast","water"]);
 const c=put(g,"elementSynergy",10),other=put(g,"elementSynergy",12),blast=put(g,"blast",14);put(g,"cinder",11);
 assert.equal(cardPower(b,c,10,null,"Fire"),8);
 blast.lastActivatedTurn=b.turn;blast.lastActivationElement="Fire";
 other.lastActivatedTurn=b.turn;other.lastActivationElement="Fire";
 assert.equal(synergyBonus(b,c,"Fire"),3);
 const before=structuredClone(b);assert.equal(attackPreview(b,c,10,e,"Fire").damage,10);assert.deepEqual(b,before);
 const hp=e.hp;use(g,10,"Fire");assert.equal(hp-e.hp,10);
 b.turn++;assert.equal(synergyBonus(b,c,"Fire"),1);assert.equal(cardPower(b,c,10),0);
 c.element="Water";c.transmuted=true;assert.equal(cardPower(b,c,10),8);
 b.discard.push(...b.grid[12]);b.grid[12]=[];assert.equal(currentElementCounts(b).Fire,1);
});

test("Enhance can split its uses between elements and follows each attack's element",()=>{
 const {g,b}=setup(["elementEnhance","cinder","water","blast"]);
 const c=put(g,"elementEnhance",10),fire=put(g,"cinder",9);put(g,"water",11);const blast=put(g,"blast",16);
 use(g,10,"Fire");assert.equal(b.elementEnhancements.Fire,1);assert.equal(enhancementBonus(b,fire),1);
 blast.lastActivatedTurn=b.turn;blast.lastActivationElement="Fire";assert.equal(enhancementBonus(b,blast),1);
 b.turn++;assert.equal(enhancementBonus(b,blast),0);use(g,10,"Water");
 assert.deepEqual(b.elementEnhancements,{Fire:1,Water:1});assert.equal(c.used,2);
 fire.element="Water";fire.transmuted=true;assert.equal(enhancementBonus(b,fire),1);
 b.phase="place";g.act(g.legal().find(a=>a.type==="recall"&&a.slot===10));
 const h=new Game(0,structuredClone(g.s));assert.deepEqual(h.s.battle.elementEnhancements,{Fire:1,Water:1});
 h.beginBattle([{uid:990,enemy:"beetle",restless:0}]);assert.deepEqual(h.s.battle.elementEnhancements,{});
});

test("Transmute provides an element without a neighbor; Arcane provides no effect",()=>{
 for(const id of ["elementSynergy","elementEnhance"]){
  const {g,b,e}=setup([id]);const c=put(g,id,10);c.element="Water";c.transmuted=true;
  assert.ok(g.legal().some(a=>a.type==="activate"&&a.element==="Water"));
  use(g,10,"Water");
  if(id==="elementSynergy")assert.equal(e.hp,9993);else assert.equal(b.elementEnhancements.Water,1);
  b.turn++;c.element="Arcane";assert.ok(!g.legal().some(a=>a.type==="activate"));
 }
});

test("Anger consumes Channel/use without attuning either new card or granting damage/bonuses",()=>{
 for(const id of ["elementSynergy","elementEnhance"]){
  const {g,b,e}=setup([id,"cinder"]);const c=put(g,id,10);put(g,"cinder",11);
  b.corruptions[10]={kind:"anger"};const hp=e.hp;triggerAnger(g,10);
  assert.equal(c.used,1);assert.equal(b.channel,19);assert.equal(e.hp,hp);assert.deepEqual(b.elementEnhancements,{});
  b.turn++;b.corruptions[10]={kind:"hypnosis",source:e.uid};compelCard(g,10,b.corruptions[10]);
  assert.equal(c.used,2);assert.equal(e.hp,hp);assert.deepEqual(b.elementEnhancements,{});
 }
});

test("Prismatic keeps its six-element minimum and temporary-element counting",()=>{
 const {g,b}=setup(["prismaticSynergy","cinder","root","water","gust","plasma","blast","plasma"]);
 const c=put(g,"prismaticSynergy",10),blast=put(g,"blast",12),host=put(g,"plasma",14),under=put(g,"plasma",16);
 b.grid[16]=[];under.attachedTo=host.uid;b.grid[14].unshift(under);
 assert.equal(currentElementCounts(b).Chaos,2);assert.equal(cardPower(b,c,10),7);
 blast.lastActivatedTurn=b.turn;blast.lastActivationElement="Light";assert.equal(cardPower(b,c,10),10);
 b.turn++;assert.equal(cardPower(b,c,10),7);
});

test("Enhance boosts Allies, recalled attacks, Plasma and random hits without changing HP",()=>{
 const {g,b,e}=setup(["elementEnhance","sapling","root","plasma","plasma","discord"]);
 const enhancer=put(g,"elementEnhance",10);put(g,"root",11);use(g,10,"Earth");
 const ally=put(g,"sapling",12),hp=ally.hp;assert.equal(cardPower(b,ally,12),hp+1);assert.equal(ally.hp,hp);
 b.turn++;enhancer.element="Chaos";enhancer.transmuted=true;use(g,10,"Chaos");
 const host=put(g,"plasma",14),under=put(g,"plasma",16);b.grid[16]=[];under.attachedTo=host.uid;b.grid[14].unshift(under);
 assert.equal(cardPower(b,host,14),25);put(g,"discord",18);
 const control=new Game(0,structuredClone(g.s));control.s.battle.elementEnhancements={};
 const before=e.hp,before2=control.s.battle.enemies[0].hp;use(g,18);use(control,18);
 assert.equal(before-e.hp,before2-control.s.battle.enemies[0].hp+1);
});

test("Multi-element hits apply Enhance separately before Nausea",()=>{
 const {g,b,e}=setup(["braidedSeasons","cinder","water"]);const c=put(g,"braidedSeasons",10);put(g,"cinder",9);put(g,"water",11);
 b.elementEnhancements={Fire:3,Water:1};b.corruptions[10]={kind:"nausea"};
 const a=g.legal().find(a=>a.type==="activate"&&a.slot===10&&a.element==="Fire"&&a.secondaryElement==="Water");
 assert.equal(attackPreview(b,c,10,e,a.element,a).damage,13);const hp=e.hp;g.act(a);assert.equal(hp-e.hp,13);
});

test("Old variants migrate all piles, offers and checkpoints without resetting uses or Transmute",()=>{
 const {g,b}=setup(["elementSynergy","elementEnhance","water"]);
 const c=put(g,"elementSynergy",10),enhance=put(g,"elementEnhance",12);
 c.id="fireSynergy";c.element="Fire";c.used=1;enhance.id="earthEnhance";enhance.element="Water";enhance.transmuted=true;
 g.s.deck[0].id="fireSynergy";g.s.deck[1].id="earthEnhance";b.grimoire[0].id="fireSynergy";
 b.elementEnhancements={Fire:2};g.s.reward={cards:["fireSynergy","waterEnhance"]};g.s.shop={stock:["card:earthEnhance"]};
 const before=structuredClone(g.s);g.s.checkpoint=before;const rng=g.s.rng;
 const h=new Game(0,structuredClone(g.s));
 assert.equal(h.s.rng,rng);assert.equal(h.s.deck.length,3);assert.equal(h.s.battle.grid[10][0].id,"elementSynergy");
 assert.equal(h.s.battle.grid[10][0].element,"Arcane");assert.equal(h.s.battle.grid[10][0].used,1);
 assert.equal(h.s.battle.grid[12][0].element,"Water");assert.ok(h.s.battle.grid[12][0].transmuted);
 assert.deepEqual(h.s.reward.cards,["elementSynergy","elementEnhance"]);assert.equal(h.s.shop.stock[0],"card:elementEnhance");
 assert.equal(h.s.checkpoint.battle.grid[10][0].id,"elementSynergy");assert.deepEqual(h.s.battle.elementEnhancements,{Fire:2});
 const again=new Game(0,structuredClone(h.s));assert.deepEqual(again.s.deck,h.s.deck);
 assert.ok(new WeightedPolicy().choose(h.observe(),h.legal()));
});

test("Archives discover consolidated cards through old IDs without listing retired variants",async()=>{
 const {archiveEntries}=await import("../src/archive-catalog.mjs");
 const entries=archiveEntries("cards",{fireSynergy:{firstSeenAt:"old"},chaosEnhance:{firstSeenAt:"old"}});
 assert.ok(entries.find(e=>e.id==="elementSynergy").seen);
 assert.ok(entries.find(e=>e.id==="elementEnhance").seen);
 assert.ok(!entries.some(e=>LEGACY_ELEMENT_CARDS[e.id]));
 const {discover,emptyCollection}=await import("../src/archive-profile.mjs");
 const collection=emptyCollection();discover(collection,{deck:[{id:"waterSynergy"}]});
 assert.ok(collection.cards.elementSynergy);
});

test("Synergy previews include selected Enhance without committing an Attunement",()=>{
 const {g,b,e}=setup(["elementSynergy","cinder","elementEnhance"]);
 const c=put(g,"elementSynergy",10);put(g,"cinder",11);const other=put(g,"elementEnhance",12);
 b.elementEnhancements={Fire:2};
 const before=structuredClone(b);const a=g.legal().find(a=>a.type==="activate"&&a.slot===10);
 assert.equal(a.element,"Fire");assert.equal(a.effects.damage,10);
 assert.equal(attackPreview(b,c,10,e,"Fire",a).damage,10);
 assert.equal(cardPower(b,c,10),0);assert.equal(currentElementCounts(b).Fire,1);
 assert.equal(other.lastActivationElement,null);assert.deepEqual(b,before);
 const hp=e.hp;g.act(a);assert.equal(hp-e.hp,10);assert.equal(currentElementCounts(b).Fire,2);
});
