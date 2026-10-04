from pathlib import Path
import zipfile
root=Path('release/Astrata').resolve()
assert root.parent == Path('release').resolve()
target=Path('release/Astrata-v2.zip').resolve()
temporary=Path('release/Astrata-v2.new.zip').resolve()
assert target.parent == root.parent and temporary.parent == root.parent
with zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED,compresslevel=6,strict_timestamps=False) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file():z.write(p,Path('Astrata')/p.relative_to(root))
with zipfile.ZipFile(temporary) as z:
 assert z.testzip() is None
 assert 'Astrata/resources/app/src/polish-ui.mjs' in z.namelist()
 assert 'Astrata/reports/healer-verification.json' in z.namelist()
temporary.replace(target)
print('Refreshed ZIP:',round(target.stat().st_size/1024/1024,1),'MiB')
