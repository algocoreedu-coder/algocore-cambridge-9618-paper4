"""Verify frozen Stage3 artifacts and upstream release contents, read-only upstream."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, sys

ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))

def main():
    manifest=load(ROOT/'RELEASE_MANIFEST.json'); errors=[]; counts={}
    def verify(base,rows,label):
        counts[label]=len(rows)
        for row in rows:
            p=base/row['path']
            if not p.is_file():errors.append({'path':str(p),'error':'missing'})
            elif p.stat().st_size!=row['size_bytes'] or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:
                errors.append({'path':str(p),'error':'changed'})
    verify(ROOT,manifest['files'],'stage3_artifacts')
    verify(ROOT,manifest['locked_inputs'],'locked_inputs')
    for stage in [1,2]:
        base=ROOT.parent/f'stage-{stage}'; upstream=load(base/'RELEASE_MANIFEST.json')
        verify(base,upstream['files'],f'stage{stage}_artifacts')
        if stage==2:verify(base,upstream['locked_stage1_inputs'],'stage2_locked_stage1_inputs')
    # All original source files are verified by the Stage1 manifest where available.
    upstream=load(ROOT.parent/'stage-1/RELEASE_MANIFEST.json')
    for key in ['original_sources','source_files','sources','locked_sources']:
        if key in upstream:
            rows=upstream[key]
            normalized=[]
            for row in rows:
                r=dict(row)
                if 'path' not in r and 'source_path' in r:r['path']=r['source_path']
                normalized.append(r)
            verify(ROOT.parent/'stage-1',normalized,'stage1_original_sources')
            break
    expected={r['path'] for r in manifest['files']}
    actual={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.relative_to(ROOT).as_posix() not in {'RELEASE_MANIFEST.json','evidence/RELEASE_VERIFICATION.json'}}
    for path in sorted(actual-expected):errors.append({'path':path,'error':'untracked release artifact'})
    report={'release_id':manifest['release_id'],'checked_utc':datetime.now(timezone.utc).isoformat(),
            'status':'PASS' if not errors else 'FAIL','counts':counts,'errors':errors}
    (ROOT/'evidence/RELEASE_VERIFICATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2));return bool(errors)

if __name__=='__main__':sys.exit(main())
