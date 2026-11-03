import fs from "node:fs/promises";
import crypto from "node:crypto";

const host = "http://spark-86e6.local:8188";
const model = "dreamshaperXL_alpha2Xl10.safetensors";
const palettes = {
  Fire: "orange and scarlet flames, floating embers, molten gold",
  Water: "deep blue and turquoise water, curling waves, silver droplets",
  Earth: "rich ochre stone shards, roots and emerald green crystalline earth",
  Wind: "pale mint and silver air currents, spiraling leaves, luminous white wisps",
  Light: "brilliant ivory and warm golden rays, luminous sunbursts, radiant white sparks",
  Chaos: "violet and magenta energy, black-purple fractured space, jagged spectral sparks",
};
const subjects = Object.entries(palettes).flatMap(([element, palette]) => [
  { id: element.toLowerCase() + "Synergy", name: element + " Synergy", subject: `An elemental spell of ${palette}. Many separate threads of this same elemental power converge into one intensely luminous central burst, an outward-pointing force ready to strike. The separate currents feed the central attack.` },
  { id: element.toLowerCase() + "Enhance", name: element + " Enhance", subject: `An empowering spell made of ${palette}. A luminous central halo pours branching streams of its power outward into three smaller floating magical flames of the same color, making each glow brighter. Visually a spell distributing energy, not a creature or character.` },
]);
subjects.push({ id: "prismaticSynergy", name: "Prismatic Synergy", subject: "Six distinct ribbons of elemental energy, orange fire, blue water, ochre earth, pale mint wind, gold-white light, violet chaos, intertwine evenly into a single luminous prism-shaped burst of white magical power. All six colors are clearly present and harmoniously balanced, dark emerald forest background." });
const file = "reports/synergy-art-provenance.json";
const revision = process.argv.includes("--revise") ? 2 : 1;
let records = [];
try { records = JSON.parse(await fs.readFile(file, "utf8")); } catch (e) { if(e.code !== "ENOENT") throw e; }
for (const [index, s] of subjects.entries()) {
  if (records.some(r => r.id === "card-" + s.id && (r.revision || 1) === revision)) continue;
  const seed = 1031001 + index;
  const element = s.name.split(" ")[0];
  const prompt = revision === 1
    ? `Traditional painterly high fantasy spell illustration for Astrata, expressive oil and gouache brushwork, atmospheric chiaroscuro, rich natural textures, mystical forest setting in soft focus. ${s.subject} Strong bold magical silhouette centered in the frame, clear focal point readable on a small card, full square painting, luminous energy contrasted against deep forest shadows. No text, no border, no letters.`
    : element === "Prismatic"
      ? "(abstract magical spell:1.4), six ribbons of orange blue ochre mint gold purple energy converging into one brilliant white crystal starburst, rainbow prismatic explosion filling frame, dark green background, hand painted oil illustration, expressive brushstrokes, fantasy card art, no people"
      : `(${s.id.endsWith("Enhance") ? "magical halo branching outward into three smaller glowing orbs" : "many magical streams converging inward into one explosive energy sphere"}:1.5), (${palettes[element]}:1.4), closeup of pure elemental magic filling frame, dark green background, hand painted oil illustration, textured brushstrokes, fantasy spell card art, no people`;
  const workflow = {
    1: {class_type:"CheckpointLoaderSimple",inputs:{ckpt_name:model}},
    2: {class_type:"CLIPTextEncode",inputs:{text:prompt,clip:["1",1]}},
    3: {class_type:"CLIPTextEncode",inputs:{text:"(person, woman, man, face, human, body, humanoid, creature:1.5), text, signature, letters, watermark, logo, frame, border, animal, landscape, trees, distant subject, collage, photograph, 3d render, blurry",clip:["1",1]}},
    4: {class_type:"EmptyLatentImage",inputs:{width:768,height:768,batch_size:1}},
    5: {class_type:"KSampler",inputs:{model:["1",0],positive:["2",0],negative:["3",0],latent_image:["4",0],seed,steps:24,cfg:6,sampler_name:"dpmpp_2m",scheduler:"karras",denoise:1}},
    6: {class_type:"VAEDecode",inputs:{samples:["5",0],vae:["1",2]}},
    7: {class_type:"SaveImage",inputs:{images:["6",0],filename_prefix:"astrata/card-"+s.id}},
  };
  console.log(`Generating ${index+1}/${subjects.length}: ${s.name}`);
  const response = await fetch(host+"/prompt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:workflow,client_id:"astrata-synergy-20261031"}),signal:AbortSignal.timeout(30000)});
  const job = await response.json();
  if(!response.ok || !job.prompt_id) throw Error(JSON.stringify(job));
  let result;
  for(let n=0;n<300;n++) {
    await new Promise(r=>setTimeout(r,2000));
    const h=(await (await fetch(host+"/history/"+job.prompt_id,{signal:AbortSignal.timeout(15000)})).json())[job.prompt_id];
    if(h?.status?.status_str==="error") throw Error(JSON.stringify(h.status));
    if(h?.outputs?.["7"]?.images) { result=h.outputs["7"].images[0]; break; }
  }
  if(!result) throw Error("Timed out: "+s.id);
  const image=await fetch(host+"/view?"+new URLSearchParams(result),{signal:AbortSignal.timeout(30000)});
  if(!image.ok) throw Error("Image download: "+image.status);
  const bytes=Buffer.from(await image.arrayBuffer()), output="assets/card-"+s.id+(revision > 1 ? "-v"+revision : "")+".png";
  await fs.writeFile(output,bytes);
  records.push({id:"card-"+s.id,name:s.name,revision,machine:host,model,seed,prompt,workflow,file:output,sha256:crypto.createHash("sha256").update(bytes).digest("hex"),generatedAt:new Date().toISOString(),promptId:job.prompt_id});
  await fs.writeFile(file,JSON.stringify(records,null,2)+"\n");
  console.log("Saved "+output);
}
console.log("All 13 Spark images saved.");
