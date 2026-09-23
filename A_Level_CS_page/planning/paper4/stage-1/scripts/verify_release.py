from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,sys
stage=Path(__file__).resolve().parents[1]
release=json.loads((stage/'RELEASE_MANIFEST.json').read_text(encoding='utf-8'))
errors=[]
for item in release['files']+release['original_sources']:
 path=Path(item['path'])
 if not path.is_absolute():path=stage/path
 if not path.is_file():errors.append({'path':str(path),'error':'missing'});continue
 if path.stat().st_size!=item['size_bytes'] or hashlib.sha256(path.read_bytes()).hexdigest()!=item['sha256']:
  errors.append({'path':str(path),'error':'size/hash changed'})
result={'checked_utc':datetime.now(timezone.utc).isoformat(),'corpus_version':release['corpus_version'],'status':'PASS' if not errors else 'FAIL','artifact_files_checked':len(release['files']),'original_sources_checked':len(release['original_sources']),'errors':errors}
(stage/'evidence/RELEASE_VERIFICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
sys.exit(1 if errors else 0)
