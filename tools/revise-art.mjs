import fs from "node:fs/promises";
const host = "http://spark-86e6.local:8188";
const revisions = JSON.parse(
  await fs.readFile("tools/art-revisions.json", "utf8"),
);
const manifest = JSON.parse(
  await fs.readFile("reports/art-manifest.json", "utf8"),
);
let i = 0;
for (const [id, subject] of Object.entries(revisions)) {
  i++;
  if (manifest.some((x) => x.id === id && x.revision === 2)) continue;
  const prev = manifest.find((x) => x.id === id);
  const seed = 610001 + i;
  const prompt = `(${subject}:1.5). Painterly dark fantasy game illustration, hand painted oil and gouache, bold readable silhouette, dramatic chiaroscuro, intricate details, jade and amber accent light, muted dark background, subject fills the image, no text.`;
  const workflow = structuredClone(prev.workflow);
  workflow["2"].inputs.text = prompt;
  workflow["3"].inputs.text =
    "text, letters, watermark, landscape, distant subject, tiny subject, empty forest, 3d render, photograph";
  workflow["5"].inputs.seed = seed;
  workflow["5"].inputs.sampler_name = "dpmpp_sde";
  workflow["7"].inputs.filename_prefix = "astrata_01/" + id + "-v2";
  console.log(`[${i}/${Object.keys(revisions).length}]`, id);
  const job = await (
    await fetch(host + "/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    })
  ).json();
  if (!job.prompt_id) throw Error(JSON.stringify(job));
  let result;
  for (let t = 0; t < 240; t++) {
    await new Promise((r) => setTimeout(r, 2000));
    const h = (await (await fetch(host + "/history/" + job.prompt_id)).json())[
      job.prompt_id
    ];
    if (h?.status?.status_str === "error")
      throw Error(JSON.stringify(h.status));
    if (h?.outputs?.["7"]?.images) {
      result = h.outputs["7"].images[0];
      break;
    }
  }
  if (!result) throw Error("Timed out");
  const image = await fetch(host + "/view?" + new URLSearchParams(result));
  const file = "assets/" + id + "-v2.png";
  await fs.writeFile(file, Buffer.from(await image.arrayBuffer()));
  manifest.push({
    ...prev,
    revision: 2,
    seed,
    prompt,
    workflow,
    file,
    generatedAt: new Date().toISOString(),
  });
  await fs.writeFile(
    "reports/art-manifest.json",
    JSON.stringify(manifest, null, 2),
  );
}
const paths = {};
for (const m of manifest) paths[m.id] = m.file;
await fs.writeFile(
  "src/art-paths.mjs",
  "export const artPaths = " + JSON.stringify(paths, null, 2) + ";\n",
);
console.log("REVISION COMPLETE");
