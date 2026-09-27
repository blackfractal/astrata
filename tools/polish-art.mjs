import fs from "node:fs/promises";
const host = "http://spark-86e6.local:8188";
const manifest = JSON.parse(
  await fs.readFile("reports/art-manifest.json", "utf8"),
);
const prev = manifest.find((x) => x.id === "location-field");
const workflow = structuredClone(prev.workflow);
const prompt =
  "Traditional hand painted dark fantasy game terrain, strictly overhead top down aerial view looking straight down at a flat grassy meadow floor, moss green grass, small clover patches and tiny scattered stones, subtle worn footpaths, even readable daylight, no horizon, no sky, no buildings, no trees, no creatures, flat terrain texture filling the entire square image, painterly gouache brushwork, muted natural greens and warm ochre, high detail";
workflow["1"].inputs.ckpt_name = "dreamshaperXL_alpha2Xl10.safetensors";
workflow["2"].inputs.text = prompt;
workflow["3"].inputs.text =
  "horizon, sky, landscape vista, perspective, side view, mountains, trees, forest, buildings, people, text, grid, letters, watermark, dark black background";
workflow["4"].inputs.width = 1024;
workflow["4"].inputs.height = 1024;
Object.assign(workflow["5"].inputs, {
  steps: 24,
  cfg: 6,
  seed: 9261701,
  sampler_name: "dpmpp_2m",
});
workflow["7"].inputs.filename_prefix = "astrata_01/location-field-topdown";
const job = await (
  await fetch(host + "/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
  })
).json();
if (!job.prompt_id) throw Error(JSON.stringify(job));
console.log("Generating top-down Field", job.prompt_id);
for (let n = 0; n < 180; n++) {
  await new Promise((r) => setTimeout(r, 2000));
  const h = (await (await fetch(host + "/history/" + job.prompt_id)).json())[
    job.prompt_id
  ];
  if (h?.status?.status_str === "error") throw Error(JSON.stringify(h.status));
  const result = h?.outputs?.["7"]?.images?.[0];
  if (!result) continue;
  const file = "assets/location-field-topdown.png";
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
    id: "location-field-topdown",
    name: "Top-down grassy Field",
    file,
    prompt,
    seed: 9261701,
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
