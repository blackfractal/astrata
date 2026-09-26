from PIL import Image,ImageDraw
from pathlib import Path
import json
records=json.loads(Path('reports/art-manifest.json').read_text(encoding='utf-8'))
selected={r['id']:r['file'] for r in records};entries=sorted(selected.items())
for group in range(3):
 batch=entries[group*45:(group+1)*45]
 sheet=Image.new('RGB',(1200,((len(batch)+7)//8)*120),(18,29,23));d=ImageDraw.Draw(sheet)
 for i,(name,file) in enumerate(batch):
  im=Image.open(file).convert('RGB');im.thumbnail((142,96));x=(i%8)*150;y=(i//8)*120;sheet.paste(im,(x,y));d.text((x,y+98),name[:24],fill=(230,215,175))
 sheet.save(f'reports/art-final-{group+1}.jpg')
