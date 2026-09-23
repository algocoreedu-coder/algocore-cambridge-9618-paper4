import json,hashlib
from pathlib import Path
b=json.loads(Path('traces/TRACE_BUNDLE.json').read_text()); t=b['traces'][0]; d={k:v for k,v in t.items() if k!='trace_sha256'}
print(hashlib.sha256(json.dumps(d,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest())
# print types and repr selected
for k,v in t.items(): print(k,type(v).__name__)
