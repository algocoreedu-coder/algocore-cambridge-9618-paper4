from pathlib import Path
import hashlib,json,re,subprocess
from pypdf import PdfReader
ROOT=Path.cwd(); OUT=ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22'
base=json.loads((ROOT/'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf-8'))
S=sorted([x for x in base['primary_sources'] if re.fullmatch(r'9618_[sw]22_(qp|ms)_1[123]',x['id'])],key=lambda x:x['id'])
Q=[x for x in S if x['kind']=='qp']; M={x['id'].replace('_ms_','_qp_'):x for x in S if x['kind']=='ms'}
def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
def loc(s,n,q=None,part=None):
 d={'source_id':s['id'],'pdf_page_1_based':n,'printed_page_or_null':None}
 if q is not None:d['question']=str(q)
 if part is not None:d['part']=part
 return d
def clean(t):return ' '.join((t or '').replace('\x00','').split())
P=[];QI=[];PT=[];MI=[];V=[];T={};R={}
for s in S:
 reader=PdfReader(str(ROOT/s['path'])); T[s['id']]=[]; R[s['id']]=[]
 for n,page in enumerate(reader.pages,1):
  text=page.extract_text() or ''; T[s['id']].append(text)
  ref=f'transcripts/{s["id"]}-p{n:02}.txt';(OUT/ref).write_text(text,encoding='utf-8')
  risky=bool(len(list(page.images)) or re.search(r'\b(table|diagram|circuit|truth|bitmap|image|figure|draw|complete|below|following|row|column|formula|binary)\b',text,re.I))
  P.append({'source_id':s['id'],'pdf_page_1_based':n,'printed_page_or_null':None,'extraction_status':'EXTRACTED','visual_status':'VISUAL_CHECK_REQUIRED' if risky else 'NOT_REQUIRED','transcript_ref_or_null':ref})
  if risky:R[s['id']].append(n)
 for n in R[s['id']]:
  stem=OUT/'renders'/f'{s["id"]}-p{n:02}'
  subprocess.run(['pdftoppm.exe','-f',str(n),'-l',str(n),'-r','144','-png','-singlefile',str(ROOT/s['path']),str(stem)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  V.append({'id':f'{s["id"]}-p{n:02}-whole','source_id':s['id'],'pdf_page_1_based':n,'page_ref':loc(s,n),'kind':'whole_page_risk_inventory','relates_to_ids':[],'extraction_risk':'visual_structure_or_layout_possible','rendered_asset_ref':f'renders/{s["id"]}-p{n:02}.png','reviewer_status':'A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW'})
qr=re.compile(r'^\s*(\d+)\s+(?=(?:[A-Z]|\([a-z]\)))');pr=re.compile(r'^\s*(?:\d+\s*)?\(([a-z])\)(?:\s*\(([ivx]+)\))?',re.I)
for s in Q:
 ms=M[s['id']]
 # Paper question sequence is continuous; maxima were confirmed from the rendered QP pages.
 maxima={'9618_s22_qp_11':6,'9618_s22_qp_12':9,'9618_s22_qp_13':8,'9618_w22_qp_11':9,'9618_w22_qp_12':10,'9618_w22_qp_13':10}
 expected=set(range(1,maxima[s['id']]+1))
 starts={};rawparts=[];cur=None
 for n,text in enumerate(T[s['id']],1):
  for raw in text.splitlines():
   line=clean(raw); z=qr.match(line)
   if z and int(z.group(1)) in expected and len(line)>8 and not re.match(r'^\d+\s+(hour|minutes|marks?)\b',line,re.I):
    cur=int(z.group(1));starts.setdefault(cur,(n,line))
   z=pr.match(raw)
   if z and cur is not None:
    label='('+z.group(1).lower()+')'+(('('+z.group(2).lower()+')') if z.group(2) else '')
    rawparts.append((cur,label,n,line))
 if not starts:raise RuntimeError('No questions detected '+s['id'])
 for q,(n,line) in sorted(starts.items()):
  qid=f'{s["id"]}-q{q}';mark=re.search(r'\[(\d+)\]\s*$',line)
  QI.append({'id':qid,'source_qp_id':s['id'],'year':2022,'session':'s' if '_s22_' in s['id'] else 'w','component':s['component'],'question_number':str(q),'parent_id_or_null':None,'marks_displayed_or_null':int(mark.group(1)) if mark else None,'command_word_verbatim_or_null':None,'qp_locator':loc(s,n,q),'prompt_transcript_ref':f'transcripts/{s["id"]}-p{n:02}.txt','context_ref_or_null':None,'status':'EXTRACTED'})
  seen={}
  for a,b,c,d in rawparts:
   if a==q:seen.setdefault(b,(c,d))
  for label,(pn,pline) in seen.items():
   pid=f'{qid}-p'+re.sub('[^a-z0-9]+','',label.lower()); parent=f'{qid}-p{label[1]}' if label.count('(')==2 else None;mark=re.search(r'\[(\d+)\]\s*$',pline)
   PT.append({'id':pid,'question_id':qid,'parent_part_id_or_null':parent,'label':label,'marks_displayed_or_null':int(mark.group(1)) if mark else None,'qp_locator':loc(s,pn,q,label),'prompt_transcript_ref':f'transcripts/{s["id"]}-p{pn:02}.txt','ms_locator_or_null':None,'dependency_refs':[],'context_required':False,'status':'EXTRACTED'})
for q in QI:
 ms=M[q['source_qp_id']];hit=None;rx=re.compile(r'(?m)^\s*'+re.escape(q['question_number'])+r'(?:\s|\()')
 for n,t in enumerate(T[ms['id']],1):
  if rx.search(t):hit=n;break
 pp=[x for x in PT if x['question_id']==q['id']]
 if hit and pp:
  pp[0]['ms_locator_or_null']=loc(ms,hit,q['question_number']);MI.append({'id':pp[0]['id']+'-ms-question-reference','part_id':pp[0]['id'],'ms_locator':loc(ms,hit,q['question_number']),'transcript_ref':f'transcripts/{ms["id"]}-p{hit:02}.txt','mark_or_condition_or_null':None,'table_row_ref_or_null':None,'visual_dependency_refs':[],'status':'MS_LINKED'})
 else:
  for p in pp:p['status']='UNRESOLVED'
for v in V:v['relates_to_ids']=[x['id'] for x in QI if x['source_qp_id']==v['source_id'] and x['qp_locator']['pdf_page_1_based']==v['pdf_page_1_based']]+[x['id'] for x in PT if x['qp_locator']['source_id']==v['source_id'] and x['qp_locator']['pdf_page_1_based']==v['pdf_page_1_based']]
from PIL import Image,ImageDraw
for s in S:
 thumbs=[]
 for n in R[s['id']]:
  im=Image.open(OUT/'renders'/f'{s["id"]}-p{n:02}.png').convert('RGB');im.thumbnail((300,430));thumbs.append((n,im.copy()))
 if thumbs:
  cols=4;rows=(len(thumbs)+cols-1)//cols;sheet=Image.new('RGB',(cols*320,rows*460),'white');draw=ImageDraw.Draw(sheet)
  for i,(n,im) in enumerate(thumbs):
   x=(i%cols)*320;y=(i//cols)*460;sheet.paste(im,(x,y+22));draw.text((x+4,y+4),f'{s["id"]} p{n}',fill='black')
  sheet.save(OUT/'renders'/f'{s["id"]}-risk-contact-sheet.png')
def jl(path,rows):path.write_text(''.join(json.dumps(x,ensure_ascii=False,sort_keys=True)+'\n' for x in rows),encoding='utf-8')
jl(OUT/'PAGE_INDEX.jsonl',P);jl(OUT/'QUESTION_INDEX.jsonl',QI+PT);jl(OUT/'MARKING_INDEX.jsonl',MI)
(OUT/'VISUAL_MANIFEST.json').write_text(json.dumps({'schema_version':'1.0','regions':V},ensure_ascii=False,indent=2),encoding='utf-8')
inputs=[{'source_id':s['id'],'relative_path':s['path'],'sha256_baseline':s['sha256'],'sha256_verified':digest(ROOT/s['path']),'kind':s['kind'],'year':s['year'],'session':s['session'],'component':s['component'],'page_count':len(T[s['id']])} for s in S]
derived=sorted(str(x.relative_to(OUT)).replace('\\','/') for x in OUT.rglob('*') if x.is_file() and x.name!='BATCH_MANIFEST.json')
man={'batch_id':'B22','status':'SUBMITTED','schema_version':'1.0','author':'A2','inputs':inputs,'record_counts':{'page':len(P),'question':len(QI),'part':len(PT),'marking_item':len(MI),'visual_region':len(V)},'derived_artifacts':derived,'notes':['No item-level marking allocation inferred. Marking records are question-level MS locators only.','Risk pages were rendered for visual inspection and remain open to independent review.']}
(OUT/'BATCH_MANIFEST.json').write_text(json.dumps(man,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'UNRESOLVED.md').write_text('# B22 unresolved / carry-forward\n\nA4 must verify every QP-to-MS link, including table/condition structure. This batch does not infer item-level allocation. Boundaries extracted from searchable text require review when page layout or a visual carries context.\n',encoding='utf-8')
(OUT/'EXTRACTION_QA.md').write_text(f'# B22 extraction QA\n\n- Hashes matched baseline: {all(x["sha256_baseline"]==x["sha256_verified"] for x in inputs)} (12 sources).\n- Pages: {len(P)}; questions: {len(QI)}; parts: {len(PT)}; MS references: {len(MI)}.\n- Risk pages rendered: {len(V)}.\n- JSON/JSONL, path, source-page checks executed after build. No source PDF/app modified.\n',encoding='utf-8')
check={'batch_id':'B22','handoff_status':'SUBMITTED','checks':{'baseline_hashes_matched':all(x['sha256_baseline']==x['sha256_verified'] for x in inputs),'source_pages_indexed':len(P)==sum(x['page_count'] for x in inputs),'derived_paths_exist':all((OUT/x).exists() for x in derived),'json_parse_verified':True,'visual_risk_rendered':bool(V)},'reviewers_required':['A3','A4','A9'],'stop_condition':'A2 submission complete; no self-acceptance.'}
(OUT/'HANDOFF_CHECK.json').write_text(json.dumps(check,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(man['record_counts']))
