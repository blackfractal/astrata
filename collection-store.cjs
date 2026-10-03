const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
function createCollectionStore(root, { emptyCollection, discover }) {
  const file = path.join(root, "collections.json");
  let collection = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : emptyCollection();
  let last = JSON.stringify(collection);
  const write = () => {
    const next = JSON.stringify(collection);
    if (next === last && fs.existsSync(file)) return;
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(file + ".tmp", next);
    fs.renameSync(file + ".tmp", file);
    last = next;
  };
  function record(event) {
    discover(
      collection,
      event.state || event.result,
      event.recordedAt || event.at,
    );
    write();
  }
  function load({ history = [], save, tutorialSave } = {}) {
    if (!collection.importedTraces) {
      const runs = path.join(root, "runs");
      const skipped = [];
      if (fs.existsSync(runs))
        for (const entry of fs.readdirSync(runs, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const dir = path.join(runs, entry.name);
          for (const name of ["events.jsonl.gz", "events.jsonl"]) {
            const trace = path.join(dir, name);
            if (!fs.existsSync(trace)) continue;
            try {
              const bytes = fs.readFileSync(trace);
              const text = (
                name.endsWith(".gz") ? zlib.gunzipSync(bytes) : bytes
              ).toString("utf8");
              for (const line of text.split("\n").filter(Boolean)) {
                try {
                  const event = JSON.parse(line);
                  discover(
                    collection,
                    event.state || event.result,
                    event.recordedAt,
                  );
                } catch {
                  skipped.push(entry.name + "/" + name + ": unreadable event");
                }
              }
            } catch {
              skipped.push(entry.name + "/" + name + ": unreadable trace");
            }
          }
        }
      collection.importedTraces = true;
      if (skipped.length) collection.importWarnings = [...new Set(skipped)];
    }
    for (const state of [...history, save, tutorialSave])
      discover(collection, state);
    write();
    return collection;
  }
  return { load, record };
}
module.exports = { createCollectionStore };
