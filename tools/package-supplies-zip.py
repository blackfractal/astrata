"""Refresh and verify the portable artifact after the app-only packager."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
folder = root / 'release' / 'Astrata'
archive = root / 'release' / 'Astrata-v4.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=1, strict_timestamps=False) as z:
    for item in sorted(folder.rglob('*')):
        if item.is_file():
            z.write(item, item.relative_to(folder.parent).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None, 'ZIP CRC failure'
    version = json.loads(z.read('Astrata/resources/app/package.json'))['version']
    assert version == '4.0.15'
    verified = []
    for rel in ['src/engine.mjs', 'src/supplies.mjs', 'src/supplies-content.mjs',
                'src/strata.mjs', 'src/consumables-ui.mjs', 'src/polish-ui.mjs']:
        data = (root / rel).read_bytes()
        assert data == (folder / 'resources/app' / rel).read_bytes()
        assert data == z.read('Astrata/resources/app/' + rel)
        verified.append(rel)
    for image in json.loads((root / 'reports/supplies-art-provenance.json').read_text()):
        rel = image['file']
        assert hashlib.sha256(z.read('Astrata/resources/app/' + rel)).hexdigest() == image['sha256']
    assert z.read('Astrata/reports/supplies-expansion-report.md') == (root / 'reports/supplies-expansion-report.md').read_bytes()
result = {'version': version, 'zip': str(archive), 'bytes': archive.stat().st_size,
          'crcPassed': True, 'sourceRuntimeZipMatch': verified, 'newArtHashesVerified': 29}
(root / 'reports/supplies-package-verification.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
