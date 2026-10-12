from pathlib import Path
import json, hashlib, shutil, datetime
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'reports/s3-art-provenance.json').read_text(encoding='utf-8'))
manifest_path=root/'reports/art-manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
mapping={}
for r in records:
 source=Path(r['original']);dest=root/r['destination']
 if not dest.exists():shutil.copy2(source,dest)
 mapping[r['id']]=r['destination']
 ids=[r['id']]
 if r['id'].startswith('ideon-'):ids.append('enemy-ideon_'+r['id'][6:])
 for id in ids:
  if any(m['id']==id and m.get('file')==r['destination'] for m in manifest):continue
  manifest.append(dict(id=id,file=r['destination'],source=str(source),prompt=r['prompt'],provider='built-in image_gen',machine='OpenAI built-in image generation service',model='image_gen (underlying model identifier not exposed)',workflow={'tool':'image_gen.imagegen','transparent_background':False},selected=True,generatedAt=datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc).isoformat(),sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
mapping_path=root/'src/depths-art.mjs'
mapping_path.write_text('export const depthsArt = '+json.dumps(mapping,indent=2)+';\n',encoding='utf-8')
print('Installed',len(records),'S3 illustrations and saved exact prompts/provenance.')
