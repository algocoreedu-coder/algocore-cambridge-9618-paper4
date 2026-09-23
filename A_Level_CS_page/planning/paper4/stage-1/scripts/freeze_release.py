from pathlib import Path
from datetime import datetime,timezone
import json,hashlib
stage=Path(__file__).resolve().parents[1]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
excluded={'RELEASE_MANIFEST.json','evidence/RELEASE_VERIFICATION.json','evidence/LEAD_CORPUS_VALIDATION.json'}
files=[]
for path in sorted(stage.rglob('*')):
 if not path.is_file():continue
 rel=path.relative_to(stage).as_posix()
 if rel in excluded or '__pycache__' in path.parts or path.suffix in ['.tmp','.pyc']:continue
 files.append({'path':rel,'size_bytes':path.stat().st_size,'sha256':sha(path)})
manifest=json.loads((stage/'SOURCE_MANIFEST.json').read_text(encoding='utf-8'))
release={'schema_version':'1.0','corpus_version':'paper4-2026-s1-v1','stage':1,'gate':'PASS_AFTER_REWORK','lead':'A0','frozen_utc':datetime.now(timezone.utc).isoformat(),'gate_document':'GATE_REVIEW.md','counts':{'papers':29,'questions':87,'scored_parts':672,'marks':2175,'source_pdfs':65,'source_zip_bundles':29,'facsimile_pages':1396},'next_stage':{'stage':2,'input_readiness':'READY','execution_status':'NOT_STARTED'},'verification_boundary':'Checksums freeze the Stage1 work product, including historical drafts and evidence. Only files designated in README/GATE are accepted corpus outputs; inclusion of a draft does not approve its contents. Re-running validation logs is permitted; regenerating a source/index requires review and a new release.','excluded_regenerable_logs':sorted(excluded-{'RELEASE_MANIFEST.json'}),'files':files,'original_sources':[{'source_id':s['source_id'],'path':s['source_path'],'sha256':s['sha256'],'size_bytes':s['size_bytes']} for s in manifest['sources']]}
(stage/'RELEASE_MANIFEST.json').write_text(json.dumps(release,ensure_ascii=False,indent=2),encoding='utf-8')
print('Frozen',len(files),'artifact files and',len(release['original_sources']),'original sources')
