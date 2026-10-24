import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync('reports/'+p+'/summary.json'));
const campaigns=read('supplies-campaigns-4.0.14');
const before=read('supplies-encounters-4.0.14');
const after=read('supplies-final-encounters-4.0.15');
const compact=x=>({enemy:x.enemy,item:x.item,stratum:x.stratum,outcome:x.outcome,hp:x.hp,turns:x.turns,replayVerified:x.replayVerified});
const result={version:'4.0.15',date:'2026-10-24',method:'Automated campaigns with six-candidate one-turn combat rollouts; separate fixed-build WeightedPolicy boss comparisons. Not manual or optimal play.',campaigns:campaigns.map(x=>({seed:x.seed,version:x.version,outcome:x.outcome,stratum:x.stratum,hp:x.hp,steps:x.steps,lastEncounter:x.encounters.at(-1),replayHash:x.replayHash})),campaignDecisions:campaigns.reduce((n,x)=>n+x.steps,0),campaignEncounters:campaigns.reduce((n,x)=>n+x.encounters.length,0),controlledBefore:before.map(compact),controlledAfter:after.map(compact),tuning:{trickster:{single:[20,22],split:[[7,7],[8,8]]}},limitations:['Nine campaign deaths in S1, one in S2; no full S1–S4 wins.','Controlled encounters use supplied potions and fixed archived builds, no ambush/Restless.','Repeated deterministic encounters do not estimate a population win rate.','Policy choices are not optimal.']};
fs.writeFileSync('reports/supplies-evaluation-summary.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({decisions:result.campaignDecisions,encounters:result.campaignEncounters,campaigns:result.campaigns.map(x=>[x.seed,x.steps,x.lastEncounter.enemies]),before:before.length,after:after.length},null,2));
