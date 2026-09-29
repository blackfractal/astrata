const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
function createArchive(
  root,
  { packageVersion = null, sources = {}, source = "desktop" } = {},
) {
  const buildId = hash(JSON.stringify({ packageVersion, sources }));
  const build = { package: packageVersion, id: buildId };
  const read = (file) =>
    fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const fd = fs.openSync(file + ".tmp", "w");
    try {
      fs.writeFileSync(fd, JSON.stringify(value));
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(file + ".tmp", file);
  };
  const folder = (id) => {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id))
      throw Error("Invalid archive run ID");
    return path.join(root, "runs", id);
  };
  function compress(dir) {
    const file = path.join(dir, "events.jsonl");
    if (!fs.existsSync(file)) return;
    const bytes = fs.readFileSync(file),
      compressed = zlib.gzipSync(bytes);
    if (!zlib.gunzipSync(compressed).equals(bytes))
      throw Error("Archive compression verification failed");
    const fd = fs.openSync(file + ".gz.tmp", "w");
    try {
      fs.writeFileSync(fd, compressed);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(file + ".gz.tmp", file + ".gz");
    fs.unlinkSync(file);
  }
  function record(event) {
    const dir = folder(event.runId),
      now = new Date().toISOString();
    const metaFile = path.join(dir, "metadata.json");
    const old = read(metaFile);
    const version = {
      ...build,
      ...(event.state?.version || event.result?.version || {}),
    };
    const legacy = event.kind === "legacy-result";
    const meta = old || {
      schema: 1,
      runId: event.runId,
      source,
      seed: event.state?.seed ?? event.result?.seed,
      startedAt: event.kind === "start" ? now : null,
      archivedAt: now,
      status: "in_progress",
      events: 0,
      traceComplete: event.kind === "start",
      versions: [],
    };
    // Legacy records have no trustworthy executable version or start timestamp.
    if (legacy) {
      version.package = event.result.packageVersion || null;
      delete version.id;
    }
    if (
      !meta.versions.some((v) => JSON.stringify(v) === JSON.stringify(version))
    )
      meta.versions.push(version);
    const saved = { ...event, schema: 1, recordedAt: now, version };
    fs.mkdirSync(dir, { recursive: true });
    const fd = fs.openSync(path.join(dir, "events.jsonl"), "a");
    try {
      fs.writeSync(fd, JSON.stringify(saved) + "\n");
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    if (!legacy && !fs.existsSync(path.join(root, "builds", buildId + ".json")))
      write(path.join(root, "builds", buildId + ".json"), {
        schema: 1,
        ...build,
        sources,
      });
    meta.events++;
    meta.updatedAt = now;
    if (event.kind === "result" || legacy) {
      meta.status = event.result.outcome;
      meta.endedAt = event.result.endedAt || (legacy ? null : now);
    }
    if (event.kind === "forfeit") {
      meta.status = "forfeited";
      meta.endedAt = now;
    }
    if (event.result) write(path.join(dir, "result.json"), event.result);
    if (event.state) write(path.join(dir, "latest.json"), event.state);
    write(metaFile, meta);
    if (meta.status !== "in_progress") compress(dir);
    return meta;
  }
  function result(value) {
    const dir = folder(value.runId);
    if (fs.existsSync(path.join(dir, "result.json")))
      return read(path.join(dir, "result.json"));
    const enriched = {
      ...value,
      packageVersion,
      endedAt: new Date().toISOString(),
      archiveSchema: 1,
    };
    record({ runId: value.runId, kind: "result", result: enriched });
    return enriched;
  }
  function importHistory(history) {
    for (const value of history) {
      const id =
        value.runId && /^[a-zA-Z0-9_-]{1,100}$/.test(value.runId)
          ? value.runId
          : "legacy-" + hash(JSON.stringify(value)).slice(0, 32);
      if (!fs.existsSync(path.join(folder(id), "metadata.json")))
        record({ runId: id, kind: "legacy-result", result: value });
    }
  }
  function forfeit(save, reason) {
    if (!save) return;
    const id =
      save.uiMeta?.runId ||
      "legacy-save-" + hash(JSON.stringify(save)).slice(0, 32);
    const dir = folder(id),
      meta = read(path.join(dir, "metadata.json"));
    if (meta && meta.status !== "in_progress") return;
    const { checkpoint, history, log, uiMeta, ...state } = save;
    record({
      runId: id,
      kind: "forfeit",
      reason,
      state: read(path.join(dir, "latest.json")) || state,
    });
  }
  return { record, result, importHistory, forfeit, build };
}
module.exports = { createArchive };
