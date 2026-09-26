import zipfile
from pathlib import Path
p=Path('release/Astrata-01-v1.zip')
with zipfile.ZipFile(p) as z:
 names=set(z.namelist())
 for expected in ['Astrata/Astrata.exe','Astrata/BUILD_LOG.md','Astrata/AI_REPORT.md','Astrata/resources/app/src/engine.mjs']:
  assert expected in names, expected
 assert z.testzip() is None
 print('ZIP verified:',len(names),'entries,',round(p.stat().st_size/1024/1024,1),'MiB')
