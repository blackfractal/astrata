// First post-S4 pressure pass. Tutorials and the Apex Predator are unchanged.
export function pressureFactor(enemy) {
  if (enemy.tutorialOnly || enemy.id === "apex") return 1;
  const source = enemy.stratum || 1;
  // Reworked S2 Archon numbers are final S2 values, not pre-pressure values.
  const base = ["trickster", "bombadier", "blackBile"].includes(enemy.id) ? 1 : source === 2 ? 1.15 : source >= 3 ? 1.2 : 1;
  return base * (enemy.apexMap && !enemy.apexNative ? 1.1 : 1);
}
export const pressureDamage = (damage, enemy) =>
  damage > 0 ? Math.max(1, Math.round(damage * pressureFactor(enemy))) : damage;
export function pressureTell(tell, enemy) {
  return {
    ...tell,
    damage: pressureDamage(tell.damage, enemy),
    ...(tell.sequence ? { sequence: tell.sequence.map(hit => ({
      ...hit, damage: pressureDamage(hit.damage, enemy),
    })) } : {}),
  };
}
export function tuneEnemyHealth(definitions) {
  for (const enemy of Object.values(definitions)) {
    if (enemy.tutorialOnly || enemy.tier === "Ideon" || enemy.id === "apex" ||
        enemy.id === "mindHive" || (enemy.stratum || 1) < 2) continue;
    // S2 Motes need room for a second decision against developed engines.
    // Keep their damage, Eidolons, Archons and tutorial thresholds unchanged.
    enemy.hp = Math.ceil(enemy.hp * (enemy.stratum === 2 && enemy.tier === "Mote" ? 1.35 : 1.2));
  }
}

// Prose and numeric move previews share the same tuning, without scaling mine
// damage, status values, HP, spawn counts or the Hive's survival timer.
export function pressureSignature(text, e) {
  if (!text) return text;
  if (pressureFactor(e) === 1) return text;
  const n = value => pressureDamage(value, e);
  if(e.id === 'cnidarian') text = text
    .replace('for 4 Water (+2 each successive command)', 'for ' + n(4) + ' Water, growing each command')
    .replace('for 1 Water (+0.5 each successive command, rounded up)', 'for ' + n(1) + ' Water, growing more slowly each command')
    .replace('4 strike / 1 Splash', n(4) + ' strike / ' + n(1) + ' Splash');
  else if(e.id === 'mindHive') text = text
    .replace('for 18 damage', 'for ' + n(18) + ' damage')
    .replace('eggs deal 8', 'eggs deal ' + n(8))
    .replace('for 5, 10, 15 damage', `for ${n(5)}, ${n(10)}, ${n(15)} damage`)
    .replace('for 12 or 9 respectively', `for ${n(12)} or ${n(9)} respectively`);
  else if(e.id === 'refractionCannon') text = text
    .replace('14, then 7+7, then 16, then 8+8, then 18, then 9+9', `${n(14)}, then ${n(7)}+${n(7)}, then ${n(16)}, then ${n(8)}+${n(8)}, then ${n(18)}, then ${n(9)}+${n(9)}`)
    .replace('12 Pierce', n(12) + ' Pierce')
    .replace('40 damage the first time, then 50, 60 and +10', `${n(40)} damage the first time, then ${n(50)}, ${n(60)} and approximately +${n(10)}`);
  else text = text.replace(/\b(\d+) (Fire|Earth|Water|Wind|Light|Chaos|Arcane)\b/g, (all,v,el) =>
    Number(v) === 20 && el === 'Fire' && ['censer','bombadier'].includes(e.id) ? all : n(Number(v)) + ' ' + el);
  return text.replace("this death attack does not scale", "this death attack does not gain cycle or half-HP bonuses");
}
