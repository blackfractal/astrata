import { reportPath } from '../../tools/artifact-paths.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../../snapshots/apex-semi-ideal-4.0.19/revised/rules/engine.mjs';
import {cards,items,VERSION} from '../../snapshots/apex-semi-ideal-4.0.19/revised/rules/content.mjs';
import {enterApexFloor} from '../../snapshots/apex-semi-ideal-4.0.19/revised/rules/apex.mjs';
const root='snapshots/apex-semi-ideal-4.0.19';
const g=new Game(20261024);
const starter=['blast','blast','blast','blast','shield','shield','shield','shield','familiar','clear','focus','sapling'];
const additions=['elves','lucidGuide','focus','rain','tide','conduit','conduit','transmute','transmute','ward','ward','lattice','magnify','plasma','plasma','solitude','cinder','water','corner','prismaticSap','mindfire','rootwall','lucidNeedle','grove','bastion','eclipse','undertow','soothe'];
g.s.deck=[...starter,...additions].map(id=>g.newCard(id));
for(const id of ['shield','shield','elves','water','solitude','lucidGuide']){
  const c=g.s.deck.find(c=>c.id===id&&!c.upgrade);assert.ok(c&&cards[id].upgrade);c.upgrade=true;
}
g.s.inventory=[];
for(const key of Object.keys(g.s.equipment))g.s.equipment[key]=null;
const gear=[['head','sightCrown'],['neck','necklace','channelGem'],['torso','remembranceArmor'],['wrist1','silver','channelGem'],['wrist2','gold','channelGem'],['finger1','focusRing','focusGem'],['finger2','focusRing','focusGem']];
for(const [slot,id,gem] of gear){
 const item=g.addItem(id);g.s.equipment[slot]=item.uid;
 if(gem){assert.ok(items[id].socket);item.gem=g.addItem(gem).uid;}
}
for(const id of ['healingSap','channelDraught','furySap'])g.addItem(id);
g.s.hp=g.s.maxHp=70;g.s.stratum=4;g.s.gold=0;
delete g.s.tutorial;delete g.s.checkpoint;
enterApexFloor(g,4);
assert.equal(g.s.deck.length,40);
assert.deepEqual(Object.fromEntries(['insight','focus','channel'].map(k=>[k,g.bonuses()[k]])),{insight:6,focus:5,channel:5});
const before=structuredClone(g.s);
fs.writeFileSync(root+'/before-battle.json',JSON.stringify(before));
g.beginBattle([{uid:g.uid(),enemy:'apex',restless:0,apexFloor:4}]);
delete g.s.checkpoint;g.s.log=[];g.s.history=[];
assert.equal(g.s.battle.enemies[0].hp,500);
fs.writeFileSync(root+'/initial.json',JSON.stringify(g.s));
const manifest={version:VERSION,seed:20261024,hp:70,maxHp:70,bonuses:g.bonuses(),
 deck:g.s.deck.map(c=>({id:c.id,name:cards[c.id].name,upgrade:c.upgrade})),
 equipment:gear.map(([slot,id,gem])=>({slot,id,name:items[id].name,gem:gem&&items[gem].name})),
 consumables:['healingSap','channelDraught','furySap'],
 initialHand:g.s.battle.hand.map(c=>c.id),
 caveat:'Manufactured favorable endgame fixture; no claim this inventory was acquired in a completed seed. No draw rearrangement, no hidden stat bonuses, all starter cards retained. Six legal upgrade definitions; Elves upgrade assumes Tools consumed at a Tavern. No live profile modified.',
 search:'Cloned bounded-search helper, activation depth increased from7 to10 for5Channel and supplies. Consumables considered before Channel is exhausted; otherwise identical helpers. Not manual play or a population win-rate test.'};
fs.writeFileSync(reportPath(root+'/manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({hp:70,deck:g.s.deck.length,upgrades:g.s.deck.filter(c=>c.upgrade).length,bonuses:g.bonuses(),hand:manifest.initialHand}));
