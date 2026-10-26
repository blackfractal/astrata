// Exact longest simple path through a required vertex on the 7x6 grid.
// Frontier connectivity DP scans columns (frontier width six), avoiding a
// factorial DFS over winding paths. It never closes a cycle or separate path.
const cache=new Map();
export function longestWaterPath(slots, root) {
  const allowed=new Set(slots);
  if(!allowed.has(root))return [];
  const neighbors=i=>[i%7?i-1:-1,i%7<6?i+1:-1,i>=7?i-7:-1,i<35?i+7:-1].filter(j=>j>=0&&allowed.has(j));
  const component=new Set([root]),todo=[root];
  for(let n=0;n<todo.length;n++)for(const j of neighbors(todo[n]))if(!component.has(j)){component.add(j);todo.push(j);}
  const signature=[...component].sort((a,b)=>a-b).join(',');

  const key=signature+'|'+root;
  if(cache.has(key))return [...cache.get(key)];
  const xs=todo.map(i=>i%7),ys=todo.map(i=>Math.floor(i/7));
  const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
  if(component.size===(xmax-xmin+1)*(ymax-ymin+1)) {
    const path=[];for(let y=ymin;y<=ymax;y++)for(let k=0;k<=xmax-xmin;k++)
      path.push(y*7+((y-ymin)%2?xmax-k:xmin+k));
    return path;
  }
  let states=new Map([['000000000',{front:Array(7).fill(0),ends:0,root:false,count:0,edges:0n}]]);
  let best={count:1,edges:0n};
  for(let x=0;x<7;x++)for(let y=0;y<6;y++){
    const slot=y*7+x,next=new Map();
    const save=s=>{
      const ids=new Map();let n=0;
      s.front=s.front.map(v=>v?(ids.has(v)?ids.get(v):(ids.set(v,++n),n)):0);
      const k=s.front.join('')+s.ends+(s.root?'1':'0');
      if(!next.has(k)||next.get(k).count<s.count)next.set(k,s);
    };
    for(const state of states.values()){
      const a=state.front[y],b=state.front[6],incoming=!!a+!!b;
      if(!incoming)save({...state,front:[...state.front]});
      if(!component.has(slot))continue;
      for(let out=0;out<4;out++){
        const right=out&1,down=out&2;
        if((right&&(x===6||!component.has(slot+1)))||(down&&(y===5||!component.has(slot+7))))continue;
        const degree=incoming+!!right+!!down;
        if(degree<1||degree>2||(a&&a===b))continue;
        const ends=state.ends+(degree===1?1:0);if(ends>2)continue;
        let front=[...state.front];
        const label=a||b||8;
        if(a&&b)front=front.map(v=>v===b?a:v);
        front[y]=right?label:0;front[6]=down?label:0;
        const s={front,ends,root:state.root||slot===root,count:state.count+1,
          edges:state.edges|(right?1n<<BigInt(slot*2):0n)|(down?1n<<BigInt(slot*2+1):0n)};
        if(!front.includes(label)){
          // A component has finished: it must be the only one and contain root.
          if(!front.some(Boolean)&&ends===2&&s.root&&s.count>best.count)best=s;
        }else save(s);
      }
    }
    states=next;
  }
  const graph=new Map();
  for(const i of component)for(const [bit,j] of [[i*2,i+1],[i*2+1,i+7]])if(best.edges&(1n<<BigInt(bit))){
    if(!graph.has(i))graph.set(i,[]);if(!graph.has(j))graph.set(j,[]);
    graph.get(i).push(j);graph.get(j).push(i);
  }
  const start=[...graph].filter(([,v])=>v.length===1).map(([i])=>i).sort((a,b)=>a-b)[0];
  const path=start==null?[root]:[start];let prior=-1;
  while(start!=null){const at=path.at(-1),j=graph.get(at).find(j=>j!==prior);if(j==null)break;path.push(j);prior=at;}
  if(cache.size>=128)cache.delete(cache.keys().next().value);
  cache.set(key,path);return [...path];
}
