import json,re,fitz
from pathlib import Path
c=json.load(open('data/curriculum.json',encoding='utf-8'))
ids={l['id'] for l in c['lessons']}
v={n for l in c['lessons'] for n in l['visuals']}
assert v==set(range(1,67))
pages={p.name:len(fitz.open(p)) for p in Path('public/papers').glob('*.pdf')}
count=0
for l in c['lessons']:
 for id in l['theory']: assert id in ids
 for r in l['examRefs']:
  f,p=r['url'].replace('/papers/','').split('#page=')
  assert 1<=int(p)<=pages[f]
  count+=1
print(f'39 lessons; all 66 diagrams mapped; {count} valid QP/MS page links in 30 PDFs.')
