import json,hashlib
from pathlib import Path
t=json.loads(Path('traces/TRACE_BUNDLE.json').read_text())['traces'][0]
for mode in ['exclude','none']:
 d={k:v for k,v in t.items() if k!='trace_sha256'} if mode=='exclude' else dict(t); 
 if mode=='none': d['trace_sha256']=None
 print(mode,hashlib.sha256(json.dumps(d,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),t['trace_sha256'])
print(json.dumps({k:v for k,v in t.items() if k!='trace_sha256'},sort_keys=True,ensure_ascii=False,separators=(',',':'))[:200])
