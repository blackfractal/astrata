import fs from 'node:fs';const p='src/engine.mjs';let s=fs.readFileSync(p,'utf8');const a=s.indexOf('    const move = (e, n, dx, dy) => {'),z=s.indexOf('    for (const e of f.entities.filter((e) => e.enemy)) {',a);if(a<0||z<0)throw Error('movement markers missing');s=s.slice(0,a)+`    const arrive = (e) => {
      if(e.x!==f.x || e.y!==f.y || reaching.has(e.uid)) return;
      reaching.add(e.uid);
      for(const mate of f.entities.filter(x=>x.enemy&&x.uid!==e.uid)){
        const d=enemies[mate.enemy];
        if(d.pack&&enemies[e.enemy].name.includes(d.pack)&&!(mate.x===f.x&&mate.y===f.y))
          move(mate,2,x=>Math.sign(f.x-x.x),x=>Math.sign(f.y-x.y));
      }
    };
    const move = (e,n,dx,dy,stopAtPlayer=true) => {
      arrive(e);
      for(let k=0;k<n;k++){
        if(stopAtPlayer&&e.x===f.x&&e.y===f.y)break;
        e.x=clamp(e.x+dx(e),0,10);e.y=clamp(e.y+dy(e),0,10);
        arrive(e);
      }
    };
`+s.slice(z);s=s.replace('          () => dy,\n        );','          () => dy,\n          false,\n        );');fs.writeFileSync(p,s);
