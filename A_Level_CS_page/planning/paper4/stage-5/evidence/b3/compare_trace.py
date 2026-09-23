import json,hashlib
from pathlib import Path
p=Path('traces/TRACE_BUNDLE.json'); t=json.loads(p.read_text())['traces'][0]
d1=json.dumps({k:v for k,v in t.items() if k!='trace_sha256'},sort_keys=True,ensure_ascii=False,separators=(',',':'))
print('before',len(d1),hashlib.sha256(d1.encode()).hexdigest())
t['trace_sha256']='x'; b=json.loads(p.read_text()); b['traces'][0]=t; p.write_text(json.dumps(b,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')
t2=json.loads(p.read_text())['traces'][0]; d2=json.dumps({k:v for k,v in t2.items() if k!='trace_sha256'},sort_keys=True,ensure_ascii=False,separators=(',',':'))
print('after',len(d2),hashlib.sha256(d2.encode()).hexdigest(), 'same',d1==d2)
for i,(a,c) in enumerate(zip(d1,d2)):
 if a!=c: print('diff',i,repr(d1[i:i+100]),repr(d2[i:i+100])); break
