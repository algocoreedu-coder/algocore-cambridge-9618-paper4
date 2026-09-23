import json,hashlib
from pathlib import Path
h=Path('.'); r=json.loads((h/'B3_BATCH_REPORT.json').read_text())
paths=['implementation/b3_queue_linked_list.py','implementation/IMPLEMENTATION_REGISTRY.json','fixtures/B3_FIXTURES.json','runs/AUTHOR_RUN.json','qa/A5_INDEPENDENT_RERUN.json','traces/TRACE_BUNDLE.json','COVERAGE_MATRIX.json','A1_LEARNING_HANDOFF.md','B3_GATE_REPORT.md']
r['artifact_hashes']={p:hashlib.sha256((h/p).read_bytes()).hexdigest() for p in paths}
r['status']='PASS_RECOMMENDED'
r['unresolved_findings']=['A8 final QA and Lead gate pending']
(h/'B3_BATCH_REPORT.json').write_text(json.dumps(r,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')
