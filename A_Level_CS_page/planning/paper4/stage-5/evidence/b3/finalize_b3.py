import hashlib,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
FILES=[p for p in HERE.rglob('*') if p.is_file() and p.name not in {'B3_HASHES.json','A8_FINAL_QA.json'} and '__pycache__' not in p.parts]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
rows=[{'path':p.relative_to(HERE).as_posix(),'sha256':sha(p)} for p in sorted(FILES,key=lambda x:x.relative_to(HERE).as_posix())]
(HERE/'B3_HASHES.json').write_text(json.dumps({'schema_version':'s5-b3-hashes-v1','batch_id':'B3','files':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'files':len(rows),'hashes_match':all(x['sha256']==sha(HERE/x['path']) for x in rows)}))
