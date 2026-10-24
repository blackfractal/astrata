// A tapered, curling limb. Viewport coordinates match the other attack overlays.
export async function tendrilLash(from, target, kind, api) {
  if (!from || !target || api.skip()) return null;
  const a=from.getBoundingClientRect(), b=target.getBoundingClientRect();
  const x=a.left+a.width/2, y=a.top+a.height/2;
  const dx=b.left+b.width/2-x, dy=b.top+b.height/2-y;
  const distance=Math.hypot(dx,dy);
  if (!distance) return null;
  const reach=kind==='splash'?Math.min(distance*.35,85):distance;
  const node=document.createElement('div');
  node.className='tendril-effect';node.dataset.attack=kind;
  node.setAttribute('aria-hidden','true');
  node.style.cssText=`left:${x}px;top:${y-60}px;width:${reach+12}px;height:120px;transform:rotate(${Math.atan2(dy,dx)}rad)`;
  const spine=`M 0 60 C ${reach*.24} 19 ${reach*.56} 95 ${reach} 60`;
  const body=`${spine} C ${reach*.58} 106 ${reach*.23} 40 0 74 Z`;
  node.innerHTML=`<svg viewBox="0 0 ${reach+12} 120" aria-hidden="true"><g class="tendril-limb"><path class="tendril-flesh" d="${body}"/><path class="tendril-nerve" d="${spine}"/><path class="tendril-glimmer" d="${spine}"/></g></svg>`;
  document.body.append(node);
  const limb=node.querySelector('g');
  const extension=limb.animate(api.reduced
    ? [{opacity:0},{opacity:1}]
    : [{transform:'scaleX(.08)',opacity:.3},{transform:'scaleX(1.04)',opacity:1,offset:.8},{transform:'scaleX(1)',opacity:1}],
    {duration:api.ms(300),fill:'forwards',easing:'ease-out'});
  await Promise.race([extension.finished,api.pause(300)]);
  // Retain contact through the impact; the caller retracts alongside the burst.
  return {
    node,
    tip: { getBoundingClientRect:()=>({left:x+dx/distance*reach,top:y+dy/distance*reach,width:0,height:0}) },
    retract: async()=>{
      const motion=limb.animate(api.reduced?[{opacity:1},{opacity:0}]:[{transform:'scaleX(1)',opacity:1},{transform:'scaleX(.08)',opacity:0}],
        {duration:api.ms(240),fill:'forwards',easing:'ease-in'});
      await Promise.race([motion.finished,api.pause(240)]);
      motion.cancel();extension.cancel();node.remove();
    },
  };
}
