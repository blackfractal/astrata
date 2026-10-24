import fs from 'node:fs';
import {createHash} from 'node:crypto';
const entries=JSON.parse(fs.readFileSync('.tmp/supply-art.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('reports/art-manifest.json','utf8'));
const selection=JSON.parse(fs.readFileSync('reports/asset-selections.json','utf8'));
const paths={};
for(const entry of entries){
 const file='assets/'+entry.id+'.png';fs.copyFileSync(entry.source,file);paths[entry.id]=file;selection.selected[entry.id]=file;
 const sha256=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 manifest.push({...entry,file,sha256,provider:'built-in image_gen',model:'Not exposed by tool',machine:'Codex built-in image generation',workflow:{tool:'image_gen.imagegen',mode:'generate'},created:'2026-10-24'});
}
fs.writeFileSync('reports/art-manifest.json',JSON.stringify(manifest,null,2));
fs.writeFileSync('reports/asset-selections.json',JSON.stringify(selection,null,2));
fs.writeFileSync('reports/supplies-art-provenance.json',JSON.stringify(manifest.slice(-entries.length),null,2));
fs.appendFileSync('src/art-paths.mjs','\nObject.assign(artPaths, '+JSON.stringify(paths,null,2)+');\n');
console.log('Installed',entries.length,'original generated assets');
