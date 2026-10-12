export const barrierAt = (f, x, y) =>
  (f.barriers || []).some((p) => p.x === x && p.y === y);
export function fieldStep(f, x, y, nx, ny, flying = false) {
  if (nx < 0 || nx > 10 || ny < 0 || ny > 10) return false;
  if (flying) return true;
  if (barrierAt(f, nx, ny)) return false;
  return !(
    nx !== x &&
    ny !== y &&
    (barrierAt(f, nx, y) || barrierAt(f, x, ny))
  );
}
// Short staggered walls leave the center, opening ring, edges and all regions connected.
export function makeBarriers() {
  return [
    [2, 1],
    [2, 2],
    [2, 3],
    [8, 7],
    [8, 8],
    [8, 9],
    [5, 1],
    [6, 1],
    [4, 9],
    [5, 9],
  ].map(([x, y]) => ({ x, y }));
}
export function enemyStep(f, e, x, y, d, hunter = false) {
  if (!f.barriers?.length || d.flying)
    return fieldStep(f, e.x, e.y, x, y, !!d.flying) ? { x, y } : null;
  if (d.movement === "Wanderer" || d.movement === "Skittish")
    return fieldStep(f, e.x, e.y, x, y) ? { x, y } : null;
  // Deterministic breadth-first path, so hunters cannot tunnel through a wall or loop.
  const queue = [{ x: e.x, y: e.y, first: null }],
    seen = new Set([e.x + "," + e.y]);
  while (queue.length) {
    const p = queue.shift();
    if (p.x === f.x && p.y === f.y) return p.first;
    const ns = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if ((dx || dy) && fieldStep(f, p.x, p.y, p.x + dx, p.y + dy))
          ns.push({ x: p.x + dx, y: p.y + dy });
    ns.sort(
      (a, b) =>
        Math.max(Math.abs(a.x - f.x), Math.abs(a.y - f.y)) -
          Math.max(Math.abs(b.x - f.x), Math.abs(b.y - f.y)) ||
        a.y - b.y ||
        a.x - b.x,
    );
    for (const n of ns) {
      const key = n.x + "," + n.y;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ ...n, first: p.first || n });
    }
  }
  return null;
}
