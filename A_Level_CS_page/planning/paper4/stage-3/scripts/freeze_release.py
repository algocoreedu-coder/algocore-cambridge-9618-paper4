"""Freeze only after the Lead gate and independent aggregate QA pass."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib

ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def digest(p):return {'path':p.relative_to(ROOT).as_posix(),'size_bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}

def main():
    gate=load(ROOT/'GATE_REVIEW.json')
    assert gate['decision']=='PASS' and not gate['open_required_findings']
    assert gate['next_stage_status']=='NOT_STARTED'
    excluded={'RELEASE_MANIFEST.json','evidence/RELEASE_VERIFICATION.json'}
    files=[digest(p) for p in sorted(ROOT.rglob('*')) if p.is_file() and '__pycache__' not in p.parts and p.relative_to(ROOT).as_posix() not in excluded]
    rel_inputs=[
        '../stage-0/COURSE_SETTINGS.json','../stage-0/SCOPE.md','../stage-0/LEARNING_PAGE_CONTRACT.md','../stage-0/GATE_REVIEW.md',
        '../stage-1/RELEASE_MANIFEST.json','../stage-1/SOURCE_MANIFEST.json','../stage-1/SOURCE_ISSUES.json','../stage-1/REFERENCE_DOCUMENT_INDEX.json',
        '../stage-2/RELEASE_MANIFEST.json','../stage-2/GATE_REVIEW.json','../stage-2/EXAM_PATTERN_CATALOG.json','../stage-2/QUESTION_PATTERN_MAP.json',
    ]
    inputs=[]
    for rel in rel_inputs:
        p=ROOT/rel
        inputs.append({'path':rel,'size_bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    source=load(ROOT/'evidence/A2_BOOK_SECTION_INDEX.json')['source']
    syllabus=load(ROOT/'evidence/A3_OBJECTIVE_INVENTORY.json')['source']
    manifest={'release_id':'paper4-2026-s3-v1','created_utc':datetime.now(timezone.utc).isoformat(),
              'gate':'GATE_REVIEW.json','files':files,'locked_inputs':inputs,
              'source_records':[source,syllabus],
              'exclusions':sorted(excluded)+['**/__pycache__/**'],
              'scope':'Stage3 planning and provenance; no authored lessons or executed solutions; Stage4 not started.'}
    (ROOT/'RELEASE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'release_id':manifest['release_id'],'artifacts':len(files),'locked_inputs':len(inputs)}))

if __name__=='__main__':main()
