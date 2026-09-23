"""Build B21-A2-v2 from frozen v1 and original QP/MS page evidence.

The script records only printed structure/marks that can be associated with a
leaf prompt segment. It does not convert mark-scheme prose into allocations.
"""
from __future__ import annotations
import hashlib,json,re,sys
from datetime import datetime,timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent; ROOT=BASE.parents[6]
sys.path.insert(0,str(BASE/'vendor'))
from pypdf import PdfReader

def jread(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def jwrite(p,x): Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def jlines(p,xs): Path(p).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in xs),encoding='utf-8')
def h(p):
 q=hashlib.sha256();
 with Path(p).open('rb') as f:
  for c in iter(lambda:f.read(1048576),b''): q.update(c)
 return q.hexdigest()
def loc(s,p,q=None,part=None):
 x={'source_id':s,'pdf_page_1_based':p}
 if q is not None:x['question']=str(q)
 if part is not None:x['part']=part
 return x
manifest=jread(ROOT/'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json')
sources=sorted([x for x in manifest['primary_sources'] if re.fullmatch(r'9618_(?:s21|w21)_(?:qp|ms)_(?:11|12|13)',x.get('id',''))],key=lambda x:x['id'])

# Each mapping has been reconciled against the printed heading pages (not a
# broad text-search); page spans end immediately before the next printed head.
starts={
'9618_s21_qp_11':[2,5,6,11,13,14,15,16], '9618_s21_qp_13':[2,5,6,11,13,14,15,16],
'9618_s21_qp_12':[2,4,5,6,9,12,13,14],
'9618_w21_qp_11':[2,3,4,6,8,11,14,15], '9618_w21_qp_13':[2,3,4,6,8,11,14,15],
'9618_w21_qp_12':[2,3,4,6,8,10,12,13]}
roman={'i','ii','iii','iv','v','vi','vii','viii','ix','x'}
pages=[]; source_entries=[]; qrecs=[]; precs=[]; contexts=[]; transcript={}
for s in sources:
 sid=s['id']; p=ROOT/s['path']; actual=h(p)
 if actual!=s['sha256']:raise RuntimeError('hash mismatch '+sid)
 rd=PdfReader(str(p)); source_entries.append({'source_id':sid,'sha256':actual,'relative_path':s['path'],'kind':s['kind'],'year':2021,'session':'s' if '_s21_' in sid else 'w','component':s['component'],'page_count':len(rd.pages),'hash_matches_stage0':True})
 for n,page in enumerate(rd.pages,1):
  ref=f'transcripts/{sid}-p{n}.txt'; text=(BASE/ref).read_text(encoding='utf-8')
  transcript[(sid,n)]=text
  pages.append({'source_id':sid,'pdf_page_1_based':n,'printed_page_or_null':None,'extraction_status':'EXTRACTED','visual_status':'TEXT_OR_RENDER_PENDING_REVIEW','transcript_ref_or_null':ref})

for sid,heads in starts.items():
 s=next(x for x in sources if x['id']==sid); page_count=s['page_count']
 for qi,first in enumerate(heads,1):
  last=(heads[qi]-1 if qi<len(heads) else page_count)
  span=list(range(first,last+1)); qid=f'{sid}-q{qi}'
  qrecs.append({'id':qid,'source_qp_id':sid,'year':2021,'session':'s' if '_s21_' in sid else 'w','component':s['component'],'question_number':str(qi),'parent_id_or_null':None,'marks_displayed_or_null':None,'command_word_verbatim_or_null':None,'qp_locator':loc(sid,first,qi),'prompt_transcript_ref':f'transcripts/{sid}-p{first}.txt','context_ref_or_null':f'contexts/{qid}.json','status':'EXTRACTED'})
  contexts.append({'question_id':qid,'source_qp_id':sid,'question_number':str(qi),'question_start_page':first,'continuation_pages':span[1:],'all_context_pages':span,'source_evidence':[loc(sid,p,qi) for p in span]})
  # Tokenise only leading printed part-label runs on the question's page span.
  seen=[]; last_alpha=None; global_lines=[]
  for p in span:
   for line in transcript[(sid,p)].splitlines(): global_lines.append((p,line))
  for ix,(p,line) in enumerate(global_lines):
   m=re.match(r'^\s*(?:\d+\s+)?((?:\([a-z]+\)\s*)+)',line)
   if not m: continue
   labels=re.findall(r'\(([a-z]+)\)',m.group(1))
   for label in labels:
    if label in roman:
     parent=last_alpha
     if parent is None: continue
     pid=f'{qid}-p{parent}-p{label}'
     parentid=f'{qid}-p{parent}'
     depth=2
    else:
     last_alpha=label; parent=None; parentid=None; pid=f'{qid}-p{label}'; depth=1
    if any(x['id']==pid for x in seen): continue
    seen.append({'id':pid,'label':label,'page':p,'line_ix':ix,'parent':parentid,'depth':depth})
  for i,item in enumerate(seen):
   # A leaf is the only level at which a following bracket mark can safely be
   # assigned by this automatic evidence pass.
   has_child=any(x['parent']==item['id'] for x in seen)
   end=seen[i+1]['line_ix'] if i+1<len(seen) else len(global_lines)
   seg='\n'.join(x[1] for x in global_lines[item['line_ix']:end])
   marks=None
   if not has_child:
    found=re.findall(r'\[\s*(\d+)\s*\]',seg)
    if found: marks=int(found[-1])
   pstatus='EXTRACTED' if marks is not None else 'UNRESOLVED'
   precs.append({'id':item['id'],'question_id':qid,'parent_part_id_or_null':item['parent'],'label':item['label'],'marks_displayed_or_null':marks,'qp_locator':loc(sid,item['page'],qi,item['label']),'prompt_transcript_ref':f'transcripts/{sid}-p{item["page"]}.txt','ms_locator_or_null':None,'dependency_refs':[qid,f'contexts/{qid}.json'],'context_required':len(span)>1,'status':pstatus,'part_path':item['id'].replace(qid+'-p','').replace('-p','.')})

# Visual inventory: frozen v1 regions plus eight named omissions from A3.
v1=jread(BASE/'versions/B21-A2-v1/VISUAL_MANIFEST.json')['regions']
extra=[('9618_s21_qp_11',3),('9618_s21_qp_11',5),('9618_s21_qp_11',10),('9618_s21_qp_13',3),('9618_s21_qp_13',5),('9618_s21_qp_13',10),('9618_w21_qp_11',2),('9618_w21_qp_13',2)]
visuals=[]
for old in v1:
 sid=old['source_id']; pg=old['pdf_page_1_based']; old['relates_to_ids']=[q['id'] for q in qrecs if q['source_qp_id']==sid and any(c['question_id']==q['id'] and pg in c['all_context_pages'] for c in contexts)]
 old['reviewer_status']='A2_V2_RELATION_REBUILT_PENDING_RETEST'; visuals.append(old)
for sid,pg in extra:
 visuals.append({'id':f'{sid}-p{pg}-whole-page-v2','source_id':sid,'pdf_page_1_based':pg,'page_ref':loc(sid,pg),'kind':'whole_page_a3_v_is_01_added','relates_to_ids':[q['id'] for q in qrecs if q['source_qp_id']==sid and any(c['question_id']==q['id'] and pg in c['all_context_pages'] for c in contexts)],'extraction_risk':'A3-identified number_or_table_layout','rendered_asset_ref':f'renders/{sid}-p{pg}.png','reviewer_status':'RENDER_REQUIRED_V2'})
for pg in pages:
 if any(x['source_id']==pg['source_id'] and x['pdf_page_1_based']==pg['pdf_page_1_based'] for x in visuals): pg['visual_status']='RENDERED_A2_V2_PENDING_RETEST'

# MS record rules: leaf exact labels are item links; a parent with children is
# only an explicitly unresolved context record. No child/row is guessed.
marks=[]; unresolved=[]
for part in precs:
 qid=part['question_id']; sid=part['question_id'].split('-q')[0]; msid=sid.replace('_qp_','_ms_'); q=qid.rsplit('-q',1)[1]
 children=[x for x in precs if x['parent_part_id_or_null']==part['id']]
 path=part['part_path'].replace('.',')(')
 printable=f'{q}({path})'
 hit=None
 for p in range(1,next(x['page_count'] for x in source_entries if x['source_id']==msid)+1):
  if re.search(re.escape(printable).replace(r'\(',r'\s*\(').replace(r'\)',r'\s*\)'),transcript[(msid,p)],re.I): hit=p;break
 if children:
  marks.append({'id':f'{msid}-{part["id"].split("-q",1)[1]}-parent-context','part_id':part['id'],'ms_locator':loc(msid,hit,q,part['label']) if hit else None,'transcript_ref':f'transcripts/{msid}-p{hit}.txt' if hit else None,'mark_or_condition_or_null':None,'table_row_ref_or_null':None,'visual_dependency_refs':[],'status':'UNRESOLVED','link_type':'PARENT_CONTEXT_ONLY','unresolved_reason':'Parent expands into child records; no parent allocation inferred.'})
 elif hit:
  part['ms_locator_or_null']=loc(msid,hit,q,part['label']);part['status']='MS_LINKED'
  marks.append({'id':f'{msid}-{part["id"].split("-q",1)[1]}-exact','part_id':part['id'],'ms_locator':loc(msid,hit,q,part['label']),'transcript_ref':f'transcripts/{msid}-p{hit}.txt','mark_or_condition_or_null':None,'table_row_ref_or_null':None,'visual_dependency_refs':[],'status':'MS_LINKED','link_type':'EXACT_PRINTED_LABEL'})
 else:
  part['status']='UNRESOLVED';unresolved.append(part['id'])
# Marking visual dependency is page-level only, and never implies a table-row relation.
for mi in marks:
 if mi['ms_locator']:
  mi['visual_dependency_refs']=[v['id'] for v in visuals if v['source_id']==mi['ms_locator']['source_id'] and v['pdf_page_1_based']==mi['ms_locator']['pdf_page_1_based']]

jlines(BASE/'PAGE_INDEX.jsonl',pages);jlines(BASE/'QUESTION_INDEX.jsonl',qrecs+precs);jlines(BASE/'MARKING_INDEX.jsonl',marks);jlines(BASE/'CONTEXT_INDEX.jsonl',contexts)
(BASE/'contexts').mkdir(exist_ok=True)
for context in contexts: jwrite(BASE/f"contexts/{context['question_id']}.json",context)
jwrite(BASE/'VISUAL_MANIFEST.json',{'schema_version':'1.0','artifact_version':'B21-A2-v2','regions':visuals})
batch={'schema_version':'1.0','artifact_version':'B21-A2-v2','task_id':'P1-S1-A2-B21','author':'A2','status':'SUBMITTED_FOR_RETEST','generated_at':datetime.now(timezone.utc).isoformat(),'supersedes':'B21-A2-v1','sources':source_entries,'record_counts':{'pages':len(pages),'questions':len(qrecs),'parts':len(precs),'marking_items':len(marks),'visual_regions':len(visuals),'visual_regions_v1_baseline':51,'visual_regions_v1_nonempty':18,'visual_regions_v1_empty':33,'visual_regions_v1_target_references':20,'unresolved_parts':len(unresolved)},'derived_transcripts':sorted(str(x.relative_to(BASE)).replace('\\','/') for x in (BASE/'transcripts').glob('*.txt')),'derived_renders_expected':[x['rendered_asset_ref'] for x in visuals]}
jwrite(BASE/'BATCH_MANIFEST.json',batch)
print(json.dumps(batch['record_counts'],indent=2))
