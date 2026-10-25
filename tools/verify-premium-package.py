from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
runtime = root / 'release/Astrata/resources/app'
archive = root / 'release/Astrata-v4.zip'
paths = ['src/premium-gear.mjs', 'src/engine.mjs', 'src/content.mjs',
         'src/choice-feedback.mjs', 'src/ui.mjs', 'src/policy.mjs']
with zipfile.ZipFile(archive) as z:
    assert json.loads(z.read('Astrata/resources/app/package.json'))['version'] == '4.0.23'
    hashes = {}
    for rel in paths:
        expected = (root / rel).read_bytes()
        assert expected == (runtime / rel).read_bytes()
        assert expected == z.read('Astrata/resources/app/' + rel)
        hashes[rel] = hashlib.sha256(expected).hexdigest()
    assert z.read('Astrata/reports/premium-equipment-report.md') == (root / 'reports/premium-equipment-report.md').read_bytes()
result = {'version': '4.0.23', 'runtimeAndZipMatch': True, 'sha256': hashes,
          'zipBytes': archive.stat().st_size}
(root / 'reports/premium-package-verification.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
