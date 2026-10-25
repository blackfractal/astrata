import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {satchelContents} from '../src/consumables.mjs';

function shop() {
  const g = new Game(381);
  g.s.inventory = [];
  for (const slot in g.s.equipment) g.s.equipment[slot] = null;
  g.s.mode = 'tavern';
  g.s.gold = 1000;
  g.s.shop = {stock:['insightGem'], soldIndices:[], healer:true};
  return g;
}
function act(g, type, fields) {
  const a = g.legal().find(a => a.type === type && Object.entries(fields).every(([k,v]) => a[k] === v));
  assert.ok(a, `${type} ${JSON.stringify(fields)}`);
  g.act(a);
}
const count = g => satchelContents(g.s).length;
function fill(g, n) { while (count(g) < n) g.addItem('healingSap'); }

test('Fitted spare counts once; replacing equipped gear leaves a full Satchel unchanged', () => {
  const g = shop(), worn = g.addItem('ring'), spare = g.addItem('focusRing');
  const amber = g.addItem('focusGem'), opal = g.addItem('channelGem');
  worn.gem = amber.uid; spare.gem = opal.uid;
  g.s.equipment.finger1 = worn.uid;
  assert.equal(count(g), 1);
  fill(g,12);
  act(g,'equip',{item:spare.uid,slot:'finger1'});
  assert.equal(count(g),12);
  assert.equal(worn.gem,amber.uid);
  assert.equal(spare.gem,opal.uid);
  assert.ok(g.legal().some(a => a.type === 'leave'));
});

test('Worn rings and bracelets swap atomically, preserving gems and capacity through reload', () => {
  for (const [prefix,id1,id2] of [['finger','ring','focusRing'],['wrist','bronze','silver']]) {
    const g = shop(), one = g.addItem(id1), two = g.addItem(id2), gem = g.addItem('ruby');
    one.gem = gem.uid;
    g.s.equipment[prefix+'1'] = one.uid;
    g.s.equipment[prefix+'2'] = two.uid;
    fill(g,12);
    act(g,'equip',{item:one.uid,slot:prefix+'2'});
    assert.equal(g.s.equipment[prefix+'1'],two.uid);
    assert.equal(g.s.equipment[prefix+'2'],one.uid);
    assert.equal(count(g),12);
    const h = new Game(0,JSON.parse(JSON.stringify(g.s)));
    assert.equal(count(h),12);
    assert.equal(h.getItem(one.uid).gem,gem.uid);
  }
});

test('Legacy Tavern overflow allows paid socketing instead of forced discards', () => {
  const g = shop(), ring = g.addItem('channelRing');
  g.s.equipment.finger1 = ring.uid;
  fill(g,12);
  g.addItem('insightGem'); // Pre-fix saves may already exceed capacity.
  assert.equal(count(g),13);
  assert.ok(!g.legal().some(a => ['buy','unsocket','unequip'].includes(a.type)));
  assert.ok(g.legal().some(a => a.type === 'leave'));
  const gem = g.s.inventory.find(x => x.id === 'insightGem');
  const gold = g.s.gold;
  act(g,'socket',{uid:ring.uid,gem:gem.uid});
  assert.equal(g.s.gold,gold-70);
  assert.equal(count(g),12);
  assert.ok(g.legal().some(a => a.type === 'leave'));
});

test('Overflow permits selling a fitted pair together and combining potions', () => {
  const g = shop(), ring = g.addItem('ring'), gem = g.addItem('ruby');
  ring.gem = gem.uid;
  fill(g,13);
  assert.ok(!g.legal().some(a => a.type === 'sell' && a.uid === gem.uid));
  const sale = g.legal().find(a => a.type === 'sell' && a.uid === ring.uid);
  const gold = g.s.gold;
  g.act(sale);
  assert.equal(g.s.gold,gold+sale.value);
  assert.ok(!g.getItem(ring.uid));
  assert.ok(!g.getItem(gem.uid));
  assert.equal(count(g),12);
  const crystal = g.addItem('liquidCrystal');
  const potion = g.s.inventory.find(x => x.id === 'healingSap');
  act(g,'enhancePotion',{uid:crystal.uid,potion:potion.uid});
  assert.equal(count(g),12);
});

test('Full capacity blocks a purchase before payment; sales and card purchases remain available', () => {
  const g=shop();fill(g,12);g.s.shop.stock.push('card:plasma');
  const before=JSON.stringify(g.s);
  assert.ok(!g.legal().some(a=>a.type==='buy' && a.index===0));
  const blocked=g.capacityBlockedActions.find(a=>a.type==='buy');
  assert.match(blocked.unavailable,/Unable to pick up, your satchel is full/);
  assert.throws(()=>g.act(blocked),/Illegal action/);
  assert.equal(JSON.stringify(g.s),before);
  assert.ok(g.legal().some(a=>a.type==='buy' && a.index===1));
  assert.ok(g.legal().some(a=>a.type==='leave'));
  act(g,'sell',{uid:g.s.inventory[0].uid});
  act(g,'buy',{index:0});
  assert.equal(count(g),12);
  assert.ok(g.s.inventory.some(x=>x.id==='insightGem'));
});

test('Pickup remains pending while the player drinks or drops an owned item', () => {
  for(const type of ['consume','discardItem']) {
    const g=shop();fill(g,12);g.s.mode='item';g.s.itemOffer=['ruby'];g.s.hp=60;
    const rng=g.s.rng,round=g.s.field.round,uid=g.s.inventory[0].uid;
    assert.ok(!g.legal().some(a=>a.type==='takeItem'));
    assert.ok(g.legal().some(a=>a.type==='leaveItem'));
    act(g,type,{uid});
    assert.equal(g.s.mode,'item');assert.deepEqual(g.s.itemOffer,['ruby']);
    assert.equal(g.s.rng,rng);assert.equal(g.s.field.round,round);
    assert.ok(g.legal().some(a=>a.type==='takeItem'));
  }
});

test('Full Satchel keeps boss reward visible and blocks unsocketing without charging Gold', () => {
  const g=shop(),ring=g.addItem('ring'),gem=g.addItem('ruby');ring.gem=gem.uid;g.s.equipment.finger1=ring.uid;
  fill(g,12);
  assert.ok(!g.legal().some(a=>a.type==='unsocket'));
  assert.match(g.capacityBlockedActions.find(a=>a.type==='unsocket').unavailable,/satchel is full/);
  assert.equal(g.s.gold,1000);assert.equal(ring.gem,gem.uid);
  g.s.mode='reward';g.s.reward={cards:null,gem:'insightGem',setting:false};
  assert.ok(!g.legal().some(a=>a.type==='rewardGem'));
  assert.equal(g.capacityBlockedActions.find(a=>a.type==='rewardGem').id,'insightGem');
  assert.ok(g.legal().some(a=>a.type==='leaveRewardItem'));
});

test('Dropping a fitted spare drops the pair and frees exactly one Satchel slot', () => {
  const g=shop(),ring=g.addItem('ring'),gem=g.addItem('ruby');ring.gem=gem.uid;fill(g,12);
  act(g,'discardItem',{uid:ring.uid});
  assert.equal(count(g),11);assert.ok(!g.getItem(ring.uid));assert.ok(!g.getItem(gem.uid));
});
