import json,re,sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
out=Path(__file__).parent
data=json.loads((out/'prepared.json').read_text(encoding='utf-8'))
for p in data:
 if p['paper_id'].endswith('43') or (len(sys.argv)>1 and sys.argv[1] not in p['paper_id']):continue
 print('\n###',p['paper_id'])
 for n,t in enumerate(p['ms_pages_text'],1):
  t=re.sub(r'\s+',' ',t)
  parts=re.split(r'(?<!\w)([123]\([a-z]\)(?:\([ivx]+\))?|3\(b\(iii\)) ',t)
  for i in range(1,len(parts)-1,2):
   label,body=parts[i:i+2]
   if re.match(r'(One|1|2|3|4|5|6|7|8|9|10) (mark|marks)',body,re.I):
    body=re.split(r'Example program code|Java |VB.NET |Python ',body)[0]
    print(n,label,body)
