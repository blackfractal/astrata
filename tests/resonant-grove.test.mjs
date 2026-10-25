import test from 'node:test';
import assert from 'node:assert/strict';
import {Game, squareFormation, cardPower} from '../src/engine.mjs';
import {cards} from '../src/content.mjs';
import {boardConnections,cardInteraction} from '../src/board-interactions.mjs';
function fixture(){const g=new Game(17);g.s.equipment={};g.beginBattle([{uid:g.uid(),enemy:'beetle'}]);const b=g.s.battle;b.grid=b.grid.map(()=>[]);b.shields=[];b.phase='activate';b.channel=10;b.enemies[0].element='Arcane';b.enemies[0].hp=b.enemies[0].maxHp=1000;return g;}
function put(g,i,element='Arcane',id='blast'){const c=g.instance(g.newCard(id));c.element=element;g.s.battle.grid[i]=[c];return c;}
function fill(g,x,y,size,element='Arcane'){for(let r=y;r<y+size;r++)for(let c=x;c<x+size;c++)put(g,r*7+c,element);}
test('all square sizes count only other exposed cards; actual hit and legal preview match',()=>{
  for(const [size,neutral,earth] of [[2,12,18],[3,22,38],[4,36,66],[5,54,102],[6,76,146]])for(const el of ['Arcane','Earth']){
    const g=fixture(),b=g.s.battle;fill(g,0,0,size,el);const c=put(g,0,'Earth','square');
    const expected=el==='Earth'?earth:neutral;
    assert.equal(cardPower(b,c,0),expected);assert.equal(squareFormation(b,c,0).size,size);
    const a=g.legal().find(a=>a.type==='activate'&&a.slot===0);assert.equal(a.effects.damage,expected);g.act(a);assert.equal(b.enemies[0].hp,1000-expected);
  }
});
test('strongest overlapping square wins rather than largest; stable ties and nested expansion',()=>{
  const g=fixture(),b=g.s.battle;
  fill(g,2,2,4);fill(g,0,0,3,'Earth');const c=put(g,16,'Earth','square');
  assert.equal(squareFormation(b,c,16).size,3);assert.equal(cardPower(b,c,16),38);
  b.grid[17][0].element='Earth'; // 4x4 now ties 3x3 at +32; prefer larger.
  assert.equal(squareFormation(b,c,16).size,4);assert.equal(cardPower(b,c,16),38);
  fill(g,0,0,4);fill(g,0,0,3,'Earth');b.grid[16]=[c];
  assert.equal(squareFormation(b,c,16).size,4);assert.equal(cardPower(b,c,16),52);
});
test('a hole, Freeze, Sever, Insanity or Ideon cover breaks the large square and falls back',()=>{
  for(const disruption of ['empty','freeze','sever','insanity','ideon']){
    const g=fixture(),b=g.s.battle;fill(g,0,0,3);const c=put(g,0,'Earth','square');
    if(disruption==='empty')b.grid[16]=[];
    if(disruption==='freeze')b.grid[16][0].freeze=b.turn;
    if(disruption==='sever')b.grid[16][0].sever=true;
    if(disruption==='insanity')b.corruptions[16]={kind:'insanity',value:1};
    if(disruption==='ideon')b.ideons=[{uid:900,slot:16,hp:10,covers:true}];
    assert.equal(squareFormation(b,c,0).size,2,disruption);assert.equal(cardPower(b,c,0),12,disruption);
  }
});
test('spent cards count; attachments do not; committed Earth relays and Transmute update live bonus',()=>{
  const g=fixture(),b=g.s.battle;fill(g,0,0,2);const c=put(g,0,'Earth','square'),shield=put(g,1,'Arcane','shield');
  shield.used=999;shield.lastActivatedTurn=b.turn;shield.lastActivationElement='Earth';
  assert.equal(cardPower(b,c,0),14);
  shield.lastActivatedTurn=b.turn-1;assert.equal(cardPower(b,c,0),12);
  shield.element='Earth';shield.transmuted=true;assert.equal(cardPower(b,c,0),14);
  const attachment=g.instance(g.newCard('heat'));attachment.attachedTo=c.uid;b.grid[0].unshift(attachment);assert.equal(cardPower(b,c,0),14);
  b.corruptions[1]={kind:'nausea'};assert.equal(cardPower(b,c,0),14); // Covered nausea does not sever.
  b.corruptions[0]={kind:'nausea'};assert.equal(cardPower(b,c,0),7);
  c.freeze=b.turn;assert.equal(squareFormation(b,c,0).size,0);
});
test('name and public card details update, save identity persists, no old pairwise pattern links',()=>{
  const g=fixture(),b=g.s.battle;fill(g,0,0,3);const c=put(g,8,'Earth','square');
  assert.equal(cards.square.name,'Resonant Grove');assert.match(cards.square.text,/strongest complete square/);
  const before=structuredClone(g.s);assert.equal(cardInteraction(b,c,8).formation.bonus,16);
  assert.ok(!boardConnections(b).some(l=>l.type==='pattern'));assert.deepEqual(g.s,before);
  const h=new Game(0,structuredClone(g.s));assert.equal(cardPower(h.s.battle,h.s.battle.grid[8].at(-1),8),22);
});
