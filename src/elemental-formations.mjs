import {attunementSourceElement} from './engine.mjs';
import {cardFrozen,cardSevered} from './corruptions.mjs';
import {longestWaterPath} from './water-path.mjs';
const top=(b,i)=>b.grid[i]?.at(-1);
export function connects(b,i){
 const c=top(b,i);
 return !!c&&!cardFrozen(b,c,i)&&!cardSevered(b,c,i)&&
  !(b.ideons||[]).some(e=>e.hp>0&&e.slot===i);
}
export function elementalLine(b,i,axis,positive,negative){
 if(!connects(b,i))return {positive:[],negative:[]};
 const result={positive:[],negative:[]};
 for(let j=0;j<42;j++){
  if(j===i||!connects(b,j)||(axis==='row'?Math.floor(i/7)!==Math.floor(j/7):i%7!==j%7))continue;
  const element=attunementSourceElement(b,top(b,j));
  if(element===positive)result.positive.push(j);
  else if(element===negative)result.negative.push(j);
 }
 return result;
}
export function currentPath(b,i){
 const water=b.grid.flatMap((_,j)=>connects(b,j)&&attunementSourceElement(b,top(b,j))==='Water'?[j]:[]);
 return longestWaterPath(water,i);
}
