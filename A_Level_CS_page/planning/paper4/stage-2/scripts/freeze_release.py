"""Run after Lead signs GATE_REVIEW and final independent QA matches core outputs."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib
root=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def record(p,path=None):return {'path':path or p.relative_to(root).as_posix(),'size_bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
qa=read(root/'evidence/A8_AGGREGATE_CHECKS.json')
assert qa['status']=='PASS' and not qa['errors']
for name,digest in qa['input_sha256'].items():assert record(root/name)['sha256']==digest,('QA input changed',name)
gate=read(root/'GATE_REVIEW.json');assert gate['decision']=='PASS' and gate['next_stage_status']=='NOT_STARTED'
excluded={'RELEASE_MANIFEST.json','evidence/RELEASE_VERIFICATION.json'}
files=[record(p) for p in sorted(root.rglob('*')) if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc' and p.relative_to(root).as_posix() not in excluded]
inputs=[]
for name in ['QUESTION_INDEX.json','SOURCE_MANIFEST.json','RELEASE_MANIFEST.json','EXTRACTION_POLICY.md','SOURCE_ISSUES.json']:
    p=root.parent/'stage-1'/name;inputs.append(record(p,'../stage-1/'+name))
manifest={'release_id':'paper4-2026-s2-v1','created_utc':datetime.now(timezone.utc).isoformat(),'gate':'GATE_REVIEW.json','files':files,'locked_stage1_inputs':inputs,
    'exclusions':['manifest itself','evidence/RELEASE_VERIFICATION.json (rerunnable verification log)','Python __pycache__ and .pyc'],
    'source_immutability':'Verify complete Stage1 release using stage-1/scripts/verify_release.py; Stage2 pins its release manifest and principal input digests.'}
(root/'RELEASE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Frozen',len(files),'Stage2 files and',len(inputs),'Stage1 input digests')
