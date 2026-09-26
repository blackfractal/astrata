import fs from "node:fs/promises";
import { cards, items, enemies, events, locations } from "../src/content.mjs";
const out = new URL("../assets/", import.meta.url),
  records = new URL("../reports/art-manifest.json", import.meta.url);
const subjects = [
  ...Object.values(cards).map((c) => ({
    id: "card-" + c.id,
    name: c.name,
    prompt: `${c.name}, ${c.element} magic, ${c.type === "Ally" ? "a fantasy creature companion" : c.type === "Ward" ? "a magical ward tower" : "a tangible magical manifestation"}, ${c.text}`,
  })),
  ...Object.values(items).map((c) => ({
    id: "item-" + c.id,
    name: c.name,
    prompt: `a single ${c.name}, intricate fantasy ${c.slot}, ${c.element || "brass jade and ivory"} materials, artifact still life`,
  })),
  ...Object.values(enemies).map((c) => ({
    id: "enemy-" + c.id,
    name: c.name,
    prompt: `${c.name}, ${c.tier === "Archon" ? "colossal imposing boss monster" : "strange fantasy creature"}, ${c.element} aspect, ${c.signature}, whole creature centered`,
  })),
  ...events.map((c) => ({
    id: "event-" + c.id,
    name: c.name,
    prompt: `${c.name}, ${c.text}`,
  })),
  ...locations.map((c) => ({ ...c, id: "location-" + c.id })),
];
let manifest = [];
try {
  manifest = JSON.parse(await fs.readFile(records, "utf8"));
} catch {}
const endpoints = ["http://spark-86e6.local:8188", "http://127.0.0.1:8188"];
let host;
for (const url of endpoints) {
  try {
    const r = await fetch(url + "/system_stats", {
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) throw Error(r.status);
    console.log("Machine", url, (await r.json()).devices?.[0]?.name);
    host = url;
    break;
  } catch (e) {
    console.log("Generation endpoint unavailable", url, e.message);
  }
}
if (!host)
  throw Error(
    "Both Spark and laptop unavailable. See output; placeholders require documentation.",
  );
const model = "dreamshaperXL_lightningDPMSDE.safetensors";
for (let i = 0; i < subjects.length; i++) {
  const s = subjects[i];
  if (manifest.some((m) => m.id === s.id)) {
    continue;
  }
  const seed = 310001 + i;
  const prompt = `Painterly dark fantasy game illustration, hand painted oil and gouache, expressive brush strokes, atmospheric chiaroscuro, muted jade green and warm amber, bone ivory highlights, exquisite subject silhouette. ${s.prompt}. Ashen ancient forest world, centered composition, richly textured, no text, no letters, no border, no watermark.`;
  const wide =
    s.id === "location-field" ||
    s.id === "location-mind" ||
    s.id === "location-tavern";
  const workflow = {
    1: { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: model } },
    2: {
      class_type: "CLIPTextEncode",
      inputs: { text: prompt, clip: ["1", 1] },
    },
    3: {
      class_type: "CLIPTextEncode",
      inputs: {
        text: "text, letters, watermark, logo, blurry, ugly, extra limbs, photo, 3d render, modern objects, collage, multiple panels",
        clip: ["1", 1],
      },
    },
    4: {
      class_type: "EmptyLatentImage",
      inputs: {
        width: wide ? 1024 : 640,
        height: wide ? 640 : 640,
        batch_size: 1,
      },
    },
    5: {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0],
        positive: ["2", 0],
        negative: ["3", 0],
        latent_image: ["4", 0],
        seed,
        steps: 8,
        cfg: 2,
        sampler_name: "euler",
        scheduler: "karras",
        denoise: 1,
      },
    },
    6: {
      class_type: "VAEDecode",
      inputs: { samples: ["5", 0], vae: ["1", 2] },
    },
    7: {
      class_type: "SaveImage",
      inputs: { images: ["6", 0], filename_prefix: "astrata_01/" + s.id },
    },
  };
  console.log(`[${i + 1}/${subjects.length}] ${s.id}`);
  const submit = await fetch(host + "/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: "astrata-01-build" }),
  });
  const job = await submit.json();
  if (!submit.ok || !job.prompt_id) throw Error(JSON.stringify(job));
  let result;
  for (let t = 0; t < 360; t++) {
    await new Promise((r) => setTimeout(r, 2000));
    const history = await (
      await fetch(host + "/history/" + job.prompt_id)
    ).json();
    const h = history[job.prompt_id];
    if (h?.status?.status_str === "error")
      throw Error(JSON.stringify(h.status));
    if (h?.outputs?.["7"]?.images) {
      result = h.outputs["7"].images[0];
      break;
    }
  }
  if (!result) throw Error("Generation timed out " + s.id);
  const image = await fetch(host + "/view?" + new URLSearchParams(result));
  await fs.writeFile(
    new URL(s.id + ".png", out),
    Buffer.from(await image.arrayBuffer()),
  );
  manifest.push({
    id: s.id,
    name: s.name,
    machine: host,
    model,
    seed,
    prompt,
    workflow,
    file: "assets/" + s.id + ".png",
    generatedAt: new Date().toISOString(),
  });
  await fs.writeFile(records, JSON.stringify(manifest, null, 2));
}
console.log("ART COMPLETE", manifest.length);
