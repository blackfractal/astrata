import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function relocate(value, from, to) {
  const absolute = path.resolve(value);
  const relative = path.relative(path.join(root, from), absolute);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative))
    return value; // Explicit output paths outside this repo keep their original meaning.
  const target = path.join(root, to, relative);
  return path.isAbsolute(value) ? target : path.relative(process.cwd(), target);
}

// These functions only choose paths; callers create the directories they write into.
export const snapshotPath = value => relocate(value, 'reports', 'snapshots');
export const reportPath = value => relocate(value, 'snapshots', 'reports');
