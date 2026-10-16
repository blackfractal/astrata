import { enemies } from "./content.mjs";
import { artPaths } from "./art-paths.mjs";
export function apexFieldSummary(o) {
  const f=o.field, remaining=f.archons.filter(a=>!f.defeatedArchons.includes(a.id));
  return `<div class="apex-deadline ${f.round >= 7 ? "urgent" : ""}"><strong>${f.round === 8 ? "Last movement · the Archons hunt next" : `Hunt after round 8 · ${8-f.round} rounds after this one`}</strong><span>${f.defeatedArchons.length ? "Ascend is open at the center. The second victory forces ascent." : "Defeat either Archon, then reach Ascend. Defeating both forces ascent."}</span></div><div class="apex-roster">${f.archons.map(a=>`<span class="${remaining.includes(a)?"":"defeated"}" title="${enemies[a.id].name} · ${a.x+1}, ${a.y+1} · ${f.defeatedArchons.includes(a.id)?"Defeated":"Stationary until the hunt"}"><img src="${artPaths['enemy-'+a.id]}" alt="">${enemies[a.id].name}${f.defeatedArchons.includes(a.id)?" ✓":""}</span>`).join("")}</div>`;
}
export function apexMarks(f,x,y) {
  const a=f.archons?.find(a=>a.x===x && a.y===y);
  return a ? `<span class="apex-seal ${f.defeatedArchons.includes(a.id)?"fallen":""}" title="${enemies[a.id].name} appears here on round 4"><img src="${artPaths['enemy-'+a.id]}" alt="${enemies[a.id].name}"><span>◇</span></span>` : "";
}
export function apexIntroMarkup(actions,button) {
  return `<section class="scene apex-intro"><div class="scene-art"></div><div class="scene-copy"><div class="eyebrow">Stratum four</div><h2>The Apex</h2><div class="rule"></div><p>Above the crystal ridges, rivers of fire carve a path toward something that has been waiting for you.</p><p>Three floors. Two familiar Archons on each. Defeat one and take the central stairs, or defeat both to ascend immediately.</p><p>The Archons arrive on round 4. After round 8’s movement, every survivor hunts you together.</p><div class="choices">${actions.map(a=>button(a,"primary")).join("")}</div></div></section>`;
}
export function apexSummitMarkup(o,actions,button) {
  return `<section class="scene apex-summit"><div class="scene-art"><img class="apex-beast" src="assets/enemy-apex.png" alt="The Apex Predator"></div><div class="scene-copy"><div class="eyebrow">The Apex · Floor 4</div><h2>The Apex Predator</h2><div class="rule"></div><p>Rock fractures beneath its weight. At the edges of its hide, darkness refuses to hold a shape.</p><p>No pursuit. No further provisions. The beast waits.</p><div class="apex-summit-room" aria-label="Five by five summit room; you enter at the center">${Array.from({length:25},(_,i)=>`<span class="${i===12?"summit-center":""}">${i===12?"✧":""}</span>`).join("")}</div><div class="choices">${actions.filter(a=>a.type==="fightApex").map(a=>button(a,"primary")).join("")}</div></div></section>`;
}
