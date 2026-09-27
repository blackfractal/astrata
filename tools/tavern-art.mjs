import fs from "node:fs/promises";
const host = "http://spark-86e6.local:8188";
const manifest = JSON.parse(
  await fs.readFile("reports/art-manifest.json", "utf8"),
);
const prev = manifest.find((x) => x.id === "location-tavern");
const workflow = structuredClone(prev.workflow);
const prompt =
  "Wide interior scene of a warm dark fantasy tavern inside an enormous hollow tree, eye level dollhouse cutaway composition, golden lantern light, shelves of bottles and books, distinct service stations: a hooded scribe at a desk on the far left, innkeeper behind a wooden bar in the center back, robed healer seated on the right, market stall with arranged wares in the lower left foreground, a cloaked traveler seated at a central table in the lower center, jeweler workbench covered in gems in the lower right. Spacious rustic timber room, human figures small but distinct, readable silhouettes, painterly oil and gouache, muted jade shadows and warm amber, cozy shelter, no text, no letters";
workflow["1"].inputs.ckpt_name = "dreamshaperXL_alpha2Xl10.safetensors";
workflow["2"].inputs.text = prompt;
workflow["3"].inputs.text =
  "outdoors, forest clearing, sky, horizon, text, letters, watermark, modern furniture, photograph, blurry, empty room";
workflow["4"].inputs.width = 1024;
workflow["4"].inputs.height = 640;
Object.assign(workflow["5"].inputs, {
  steps: 24,
  cfg: 6,
  seed: 9261702,
  sampler_name: "dpmpp_2m",
});
workflow["7"].inputs.filename_prefix = "astrata_01/location-tavern-interior";
const job = await (
  await fetch(host + "/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
  })
).json();
if (!job.prompt_id) throw Error(JSON.stringify(job));
console.log("Generating Tavern interior", job.prompt_id);
for (let n = 0; n < 180; n++) {
  await new Promise((r) => setTimeout(r, 2000));
  const h = (await (await fetch(host + "/history/" + job.prompt_id)).json())[
    job.prompt_id
  ];
  if (h?.status?.status_str === "error") throw Error(JSON.stringify(h.status));
  const result = h?.outputs?.["7"]?.images?.[0];
  if (!result) continue;
  const file = "assets/location-tavern-interior.png";
  await fs.writeFile(
    file,
    Buffer.from(
      await (
        await fetch(host + "/view?" + new URLSearchParams(result))
      ).arrayBuffer(),
    ),
  );
  manifest.push({
    ...prev,
    id: "location-tavern-interior",
    name: "Lantern Rest interior",
    file,
    prompt,
    seed: 9261702,
    model: workflow["1"].inputs.ckpt_name,
    workflow,
    machine: host,
    generatedAt: new Date().toISOString(),
  });
  await fs.writeFile(
    "reports/art-manifest.json",
    JSON.stringify(manifest, null, 2),
  );
  console.log("Saved", file);
  process.exit(0);
}
throw Error("Generation timeout");
