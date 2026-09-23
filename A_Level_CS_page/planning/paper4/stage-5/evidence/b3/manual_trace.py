import json,hashlib
from pathlib import Path
p=Path('traces/TRACE_BUNDLE.json'); b=json.loads(p.read_text()); t=b['traces'][0]
new=hashlib.sha256(json.dumps({k:v for k,v in t.items() if k!='trace_sha256'},sort_keys=True,ensure_ascii=False,separators=(',',':')).encode('utf-8')).hexdigest()
print('old',t['trace_sha256'],'new',new)
t['trace_sha256']=new
p.write_text(json.dumps(b,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')
t2=json.loads(p.read_text())['traces'][0]
new2=hashlib.sha256(json.dumps({k:v for k,v in t2.items() if k!='trace_sha256'},sort_keys=True,ensure_ascii=False,separators=(',',':')).encode('utf-8')).hexdigest()
print('after',t2['trace_sha256'],new2)
