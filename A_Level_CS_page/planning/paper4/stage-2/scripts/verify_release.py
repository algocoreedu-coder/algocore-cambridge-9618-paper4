from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,sys
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'RELEASE_MANIFEST.json').read_text(encoding='utf-8'));errors=[]
for r in m['files']+m['locked_stage1_inputs']:
    p=root/r['path']
    if not p.is_file():errors.append({'path':r['path'],'error':'missing'})
    elif p.stat().st_size!=r['size_bytes'] or hashlib.sha256(p.read_bytes()).hexdigest()!=r['sha256']:errors.append({'path':r['path'],'error':'content changed'})
result={'release_id':m['release_id'],'checked_utc':datetime.now(timezone.utc).isoformat(),'status':'PASS' if not errors else 'FAIL',
    'artifact_files_checked':len(m['files']),'stage1_inputs_checked':len(m['locked_stage1_inputs']),'errors':errors}
(root/'evidence/RELEASE_VERIFICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2));sys.exit(bool(errors))
