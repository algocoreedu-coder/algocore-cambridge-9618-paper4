import hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
manifest_path=ROOT/'RELEASE_MANIFEST.json'
manifest=json.loads(manifest_path.read_text(encoding='utf8'))
missing=[]; mismatched=[]
for entry in manifest.get('files',[]):
    path=ROOT/entry['path']
    if not path.exists(): missing.append(entry['path']); continue
    got=hashlib.sha256(path.read_bytes()).hexdigest()
    if got!=entry['sha256']: mismatched.append({'path':entry['path'],'expected':entry['sha256'],'actual':got})
result='PASS' if not missing and not mismatched and manifest.get('status')=='LOCKED' else 'FAIL'
out={'schema_version':'s6-detached-verifier-v1','release_id':manifest.get('release_id'),'result':result,'file_count':len(manifest.get('files',[])),'missing':missing,'mismatched':mismatched,'manifest_sha256':hashlib.sha256(manifest_path.read_bytes()).hexdigest()}
print(json.dumps(out,ensure_ascii=False,indent=2))
if result!='PASS': sys.exit(1)
