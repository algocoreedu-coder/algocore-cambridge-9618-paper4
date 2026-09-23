from pathlib import Path
import json,hashlib
B=Path.cwd()/'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22'
def digest(p):return hashlib.sha256((B/p).read_bytes()).hexdigest()
names=['PAGE_INDEX.jsonl','QUESTION_INDEX.jsonl','MARKING_INDEX.jsonl','VISUAL_MANIFEST.json','EXTRACTION_QA.md','UNRESOLVED.md','HANDOFF_CHECK.json','REVISION_NOTES.md']
m=json.loads((B/'BATCH_MANIFEST.json').read_text(encoding='utf8'));m['active_artifact_sha256']={n:digest(n) for n in names};m['derived_artifacts']=sorted(set(m['derived_artifacts']+['REVISION_NOTES.md','scripts/correct_b22_v2.py','scripts/finalize_b22_v2.py','versions/B22-A2-v1/BATCH_MANIFEST.json','versions/B22-A2-v1/PAGE_INDEX.jsonl','versions/B22-A2-v1/QUESTION_INDEX.jsonl','versions/B22-A2-v1/MARKING_INDEX.jsonl','versions/B22-A2-v1/VISUAL_MANIFEST.json','versions/B22-A2-v1/EXTRACTION_QA.md','versions/B22-A2-v1/UNRESOLVED.md','versions/B22-A2-v1/HANDOFF_CHECK.json']));(B/'BATCH_MANIFEST.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf8')
c=json.loads((B/'HANDOFF_CHECK.json').read_text(encoding='utf8'));c['active_artifact_sha256_excluding_manifest']={n:digest(n) for n in names};(B/'HANDOFF_CHECK.json').write_text(json.dumps(c,ensure_ascii=False,indent=2),encoding='utf8')
