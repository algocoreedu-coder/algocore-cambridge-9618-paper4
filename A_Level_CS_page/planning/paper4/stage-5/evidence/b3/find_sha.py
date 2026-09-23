import json
from pathlib import Path
t=json.loads(Path('traces/TRACE_BUNDLE.json').read_text())['traces'][0]
def walk(x,path=''):
 if isinstance(x,dict):
  for k,v in x.items():
   if 'sha256' in k: print(path+'/'+k,repr(v))
   walk(v,path+'/'+k)
 elif isinstance(x,list):
  for i,v in enumerate(x): walk(v,path+f'/{i}')
walk(t)
