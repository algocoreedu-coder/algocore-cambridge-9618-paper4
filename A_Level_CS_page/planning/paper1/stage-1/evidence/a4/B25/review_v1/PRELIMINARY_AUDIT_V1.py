import json, hashlib, pathlib, re, sys, unicodedata, collections
from pypdf import PdfReader
ROOT=pathlib.Path.cwd()
STAGE=ROOT/'A_Level_CS_page/planning/paper1/stage-1'
OUT=STAGE/'evidence/a4/B25/review_v1'
CAND=STAGE/'evidence/a2/B25/versions/B25-A2-v1'
DISPATCH=STAGE/'evidence/a0/B25_A4_V1_REVIEW_DISPATCH.md'
SOURCE_MAN=ROOT/'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json'
SCHEMA=STAGE/'CORPUS_SCHEMA.md'; POLICY=STAGE/'EXTRACTION_POLICY.md'

def sha(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def readj(p): return json.loads(pathlib.Path(p).read_text(encoding='utf-8'))
def rows(p): return [json.loads(x) for x in pathlib.Path(p).read_text(encoding='utf-8').splitlines() if x.strip()]
def norm(s):
 s=unicodedata.normalize('NFKC',s or '').replace('\u00ad','')
 return re.sub(r'\s+',' ',s).strip().casefold()
# Exact dispatch and frozen inputs
pinned={
 'dispatch':(DISPATCH,'00d5eb0e1e3695a56a984cb3a7d92ab1ad4037348e62dcbe934cefe283891eb2'),
 'candidate_handoff':(CAND/'HANDOFF_CHECK.json','6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b'),
 'candidate_batch_manifest':(CAND/'BATCH_MANIFEST.json','7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244'),
 'candidate_snapshot_manifest':(CAND/'SNAPSHOT_MANIFEST.json','a9a96b6ba8db064578a73798228839c837e99f614ae4e05186e206ad6e6c14d6'),
 'a0_candidate_audit':(STAGE/'evidence/a0/B25_A2_V1_A0_AUDIT.json','bcb35b2855ca5ae297174901c31ea7d4846a308a279aa0a55109c26a2d5e4660'),
 'stage0_source_manifest':(SOURCE_MAN,'195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c'),
 'schema':(SCHEMA,'9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f'),
 'policy':(POLICY,'97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2')}
pin_results=[]
for name,(p,expected) in pinned.items():
 actual=sha(p) if p.exists() else None
 pin_results.append({'name':name,'path':str(p.relative_to(ROOT)),'expected_sha256':expected,'actual_sha256':actual,'status':'PASS' if actual==expected else 'FAIL'})
# Candidate handoff input pins (independently resolve paths)
hand=readj(CAND/'HANDOFF_CHECK.json')
for name,info in hand['input_pins'].items():
 p=(STAGE/info['path'].removeprefix('stage-1/') if info['path'].startswith('stage-1/') else STAGE.parent/info['path'] if info['path'].startswith('stage-0/') else ROOT/info['path'])
 if not p.is_absolute(): p=ROOT/p
 actual=sha(p) if p.exists() else None
 pin_results.append({'name':'candidate_input:'+name,'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'expected_sha256':info['sha256'],'actual_sha256':actual,'status':'PASS' if actual==info['sha256'] else 'FAIL'})
# Snapshot full candidate file tree
snap=readj(CAND/'SNAPSHOT_MANIFEST.json'); snap_rows=snap['files']; snap_results=[]
for row in snap_rows:
 p=CAND/row['path']; actual=sha(p) if p.exists() else None
 size=p.stat().st_size if p.exists() else None
 snap_results.append({'path':row['path'],'expected_sha256':row['sha256'],'actual_sha256':actual,'expected_bytes':row['byte_count'],'actual_bytes':size,'status':'PASS' if actual==row['sha256'] and size==row['byte_count'] else 'FAIL'})
# Authoritative source PDFs: restrict exact 2025 scope from candidate batch manifest and Stage0
batch=readj(CAND/'BATCH_MANIFEST.json'); stage0=readj(SOURCE_MAN)
stage0_byid={x['id']:x for x in stage0['primary_sources']}
sources=[]
for inp in batch['inputs']:
 sid=inp['source_id']
 src0=stage0_byid.get(sid)
 path=ROOT/inp['relative_path']
 actual=sha(path) if path.exists() else None
 pages=len(PdfReader(str(path)).pages) if path.exists() else None
 sources.append({'source_id':sid,'relative_path':inp['relative_path'],'year_token_2025':bool(re.search(r'_(?:s|w)25_',sid)),'kind':inp['kind'],'expected_sha256':inp['sha256_verified'],'actual_sha256':actual,'stage0_sha256':src0.get('sha256') if src0 else None,'expected_pages':inp['page_count'],'actual_pages':pages,'status':'PASS' if re.search(r'_(?:s|w)25_',sid) and src0 and actual==inp['sha256_verified']==src0.get('sha256') and pages==inp['page_count']==src0.get('page_count') else 'FAIL'})
# Extract original exact PDF page text for all 12 2025 sources
source_text={}; source_paths={}
for s in sources:
 p=ROOT/s['relative_path']; source_paths[s['source_id']]=p
 reader=PdfReader(str(p)); source_text[s['source_id']]=[page.extract_text() or '' for page in reader.pages]
# Candidate records
qrows=rows(CAND/'QUESTION_INDEX.jsonl'); mrows=rows(CAND/'MARKING_INDEX.jsonl'); qmap={x['id']:x for x in qrows}; roots=[x for x in qrows if 'question_number' in x]; parts=[x for x in qrows if 'question_id' in x]
# Locator checks and row links
link_errors=[]; qlabels=[]; parent_groups=[]; part_byid={x['id']:x for x in parts}
for x in roots:
 loc=x.get('qp_locator',{}); sid=x.get('source_qp_id'); qno=str(x.get('question_number'))
 if loc.get('source_id')!=sid or loc.get('question')!=qno or not (1<=loc.get('pdf_page_1_based',0)<=len(source_text.get(sid,[]))): link_errors.append({'record_id':x['id'],'type':'root_locator_scope','locator':loc})
 # Verify expected root/question label is on its exact original page where extraction permits
 txt=source_text.get(sid,[''])[loc.get('pdf_page_1_based',1)-1]
 present=bool(re.search(r'(?m)^\s*'+re.escape(qno)+r'\s+(?:[A-Z]|[a-z])',txt))
 qlabels.append({'id':x['id'],'source_id':sid,'page':loc.get('pdf_page_1_based'),'question_number':qno,'question_start_prefix_present_in_original_text':present,'excerpt':re.sub(r'\s+',' ',txt[:240]).strip()})
for x in parts:
 qid=x.get('question_id'); root=qmap.get(qid); loc=x.get('qp_locator',{}); sid=root.get('source_qp_id') if root else None
 if not root or loc.get('source_id')!=sid or str(loc.get('question'))!=str(root.get('question_number')) or not (1<=loc.get('pdf_page_1_based',0)<=len(source_text.get(sid,[]))):
  link_errors.append({'record_id':x['id'],'type':'part_locator_scope','locator':loc,'question_id':qid})
 # Validate hierarchy parent exists, same question, label path sane
 parent_id=x.get('parent_part_id_or_null'); parent=part_byid.get(parent_id) if parent_id else None
 if parent_id and (not parent or parent.get('question_id')!=qid): link_errors.append({'record_id':x['id'],'type':'parent_scope','parent_id':parent_id})
 if not parent_id and x.get('label') in ['(i)','(ii)','(iii)','(iv)','(v)','(vi)']:
  link_errors.append({'record_id':x['id'],'type':'orphan_roman_part','label':x.get('label')})
 txt=source_text.get(sid,[''])[loc.get('pdf_page_1_based',1)-1]
 label=x.get('label','')
 qlabels.append({'id':x['id'],'source_id':sid,'page':loc.get('pdf_page_1_based'),'question_number':loc.get('question'),'part_label':label,'part_token_present_in_original_page_text':label.casefold() in txt.casefold() if label else False,'printed_marks':x.get('marks_displayed_or_null')})
 if not x.get('ms_locator_or_null') and x.get('marks_displayed_or_null') is None:
  parent_groups.append(x)
# Mark scheme linkage/text checks
mark_errors=[]; unresolved_mark_checks=[]
for m in mrows:
 pid=m.get('part_id_or_null'); qid=m.get('question_id_or_null'); target=qmap.get(pid) if pid else qmap.get(qid) if qid else None; loc=m.get('ms_locator',{}); sid=loc.get('source_id'); page=loc.get('pdf_page_1_based',0)
 if (bool(pid)==bool(qid)) or not target: mark_errors.append({'id':m['id'],'type':'target_cardinality_or_missing','part_id':pid,'question_id':qid})
 expected_q=target.get('question_id') if pid and target else target.get('id') if target else None
 if pid and target and not loc.get('part'): mark_errors.append({'id':m['id'],'type':'part_target_missing_ms_part'})
 if not target or sid!=('9618_'+str(target.get('session'))+'25_ms_'+str(target.get('component'))) and target and sid not in [sid.replace('_qp_','_ms_') for sid in [target.get('source_qp_id') or target.get('source_id') or '']]:
  # Validate source by replacing qp with ms using target's root record.
  root=target if not pid else qmap.get(target.get('question_id'))
  expected_sid=(root.get('source_qp_id','').replace('_qp_','_ms_') if root else None)
  if sid!=expected_sid: mark_errors.append({'id':m['id'],'type':'paired_ms_source_mismatch','expected':expected_sid,'actual':sid})
 if not (isinstance(page,int) and 1<=page<=len(source_text.get(sid,[]))): mark_errors.append({'id':m['id'],'type':'ms_page_range','source_id':sid,'page':page}); continue
 mt=source_text[sid][page-1]; condition=m.get('mark_or_condition_or_null') or ''
 if norm(condition) not in norm(mt): mark_errors.append({'id':m['id'],'type':'condition_not_exact_page_substring','source_id':sid,'page':page,'row':m.get('table_row_ref_or_null')})
 if m.get('table_row_ref_or_null') and norm(m['table_row_ref_or_null']) not in norm(mt): mark_errors.append({'id':m['id'],'type':'table_row_ref_not_page_text','source_id':sid,'page':page,'row':m.get('table_row_ref_or_null')})
 ref=m.get('transcript_ref','')
 if not (CAND/ref).exists(): mark_errors.append({'id':m['id'],'type':'transcript_ref_missing','ref':ref})
 # target locator must identify same exact QP part/root path
 if pid and target:
  root=qmap.get(target.get('question_id'))
  if loc.get('question')!=str(root.get('question_number')) or loc.get('part')!=target.get('ms_locator_or_null',{}).get('part') if target.get('ms_locator_or_null') else False:
   # candidate may store exact ms locator on each indexed part; compare locator directly
   mloc=target.get('ms_locator_or_null') or {}
   if loc.get('part')!=mloc.get('part') or loc.get('question')!=mloc.get('question'): mark_errors.append({'id':m['id'],'type':'target_locator_disagrees','target':pid,'mark_locator':loc,'target_ms_locator':mloc})
# Visual references and reverse links
visual=readj(CAND/'VISUAL_MANIFEST.json'); regions=visual['visual_regions']; regmap={x['id']:x for x in regions}; mi_ids={m['id'] for m in mrows}; question_part_ids=set(qmap); visual_errors=[]
for v in regions:
 if v['source_id'] not in source_text or not (1<=v['pdf_page_1_based']<=len(source_text.get(v['source_id'],[]))): visual_errors.append({'id':v['id'],'type':'visual_page_scope'})
 if not (CAND/v['page_ref']).exists() or not (CAND/v['rendered_asset_ref']).exists(): visual_errors.append({'id':v['id'],'type':'visual_asset_missing'})
 if len(v.get('relates_to_ids',[]))!=len(set(v.get('relates_to_ids',[]))): visual_errors.append({'id':v['id'],'type':'duplicate_related_ids'})
 if v['kind']=='mark_scheme_scoring_table_page':
  for rid in v.get('relates_to_ids',[]):
   if rid not in mi_ids: visual_errors.append({'id':v['id'],'type':'unknown_ms_related_marking_id','ref':rid})
   else:
    target=next(m for m in mrows if m['id']==rid); ml=target.get('ms_locator',{})
    if ml.get('source_id')!=v['source_id'] or ml.get('pdf_page_1_based')!=v['pdf_page_1_based']: visual_errors.append({'id':v['id'],'type':'ms_related_page_mismatch','ref':rid})
 else:
  for rid in v.get('relates_to_ids',[]):
   if rid not in question_part_ids: visual_errors.append({'id':v['id'],'type':'unknown_qp_related_record','ref':rid})
   else:
    target=qmap[rid]; loc=target.get('qp_locator',{})
    allowed_pages={loc.get('pdf_page_1_based')}
    if 'question_number' in target and target.get('context_ref_or_null'):
     cpath=CAND/target['context_ref_or_null']
     if cpath.exists(): allowed_pages.update(readj(cpath).get('all_context_pages',[]))
    if loc.get('source_id')!=v['source_id'] or v['pdf_page_1_based'] not in allowed_pages: visual_errors.append({'id':v['id'],'type':'qp_related_page_mismatch','ref':rid})
for m in mrows:
 for vid in m.get('visual_dependency_refs',[]):
  v=regmap.get(vid)
  if not v: visual_errors.append({'id':m['id'],'type':'dangling_visual_dependency','ref':vid})
  elif m['id'] not in v.get('relates_to_ids',[]): visual_errors.append({'id':m['id'],'type':'missing_visual_backlink','ref':vid})
  elif v.get('source_id')!=m.get('ms_locator',{}).get('source_id') or v.get('pdf_page_1_based')!=m.get('ms_locator',{}).get('pdf_page_1_based'): visual_errors.append({'id':m['id'],'type':'visual_dependency_page_mismatch','ref':vid})
# Independent displayed-mark totals and covers
byqp=collections.defaultdict(int)
for x in qrows:
 if x.get('marks_displayed_or_null') is not None:
  sid=x.get('source_qp_id') or x.get('qp_locator',{}).get('source_id')
  if sid: byqp[sid]+=int(x['marks_displayed_or_null'])
covers=[]
for sid,total in sorted(byqp.items()):
 cover=source_text[sid][0]
 match=re.search(r'total mark for this paper is\s+(\d+)',cover,re.I)
 printed=int(match.group(1)) if match else None
 covers.append({'source_id':sid,'index_displayed_mark_sum':total,'printed_cover_total':printed,'cover_text_excerpt':re.sub(r'\s+',' ',cover[:300]).strip(),'status':'PASS' if total==printed==75 else 'FAIL'})
# Context records: pins + contents, flag only known observed page signals for subsequent manual check
contexts=[]
for p in sorted((CAND/'contexts').glob('*.json')):
 c=readj(p); root=qmap.get(c['question_id']); n=int(c['question_number']); entries=[]
 for ev in c['source_evidence']:
  sid=ev['source_id']; page=ev['pdf_page_1_based']; txt=source_text[sid][page-1]
  excerpt=re.sub(r'\s+',' ',txt[:420]).strip()
  starts=[]
  for mm in re.finditer(r'(?m)^\s*(\d{1,2})\s+(?=[A-Z])',txt):
   num=int(mm.group(1))
   if num>n: starts.append({'question_number':num,'offset':mm.start(),'text':re.sub(r'\s+',' ',txt[mm.start():mm.start()+140]).strip()})
  entries.append({'source_id':sid,'page':page,'declared_question':ev.get('question'),'next_question_start_signals':starts,'original_excerpt':excerpt})
 contexts.append({'question_id':c['question_id'],'question_number':n,'context_pages':c['all_context_pages'],'continuation_pages':c['continuation_pages'],'entries':entries})
# 27 parent grouping labels and children counts
for p in parent_groups:
 ch=[x for x in parts if x.get('parent_part_id_or_null')==p['id']]
 parent_groups_obj={'id':p['id'],'label':p.get('label'),'question_id':p.get('question_id'),'qp_locator':p.get('qp_locator'),'ms_locator':p.get('ms_locator_or_null'),'marks_displayed':p.get('marks_displayed_or_null'),'child_ids':[x['id'] for x in ch],'child_count':len(ch),'children_all_ms_linked':all(x.get('ms_locator_or_null') for x in ch)}
 # mutable append while parent_groups references parts; replace object data below
# Rebuild parent groups with detailed child evidence
pg=[]
for p in parent_groups:
 ch=[x for x in parts if x.get('parent_part_id_or_null')==p['id']]
 pg.append({'id':p['id'],'label':p.get('label'),'question_id':p.get('question_id'),'qp_locator':p.get('qp_locator'),'ms_locator':p.get('ms_locator_or_null'),'marks_displayed':p.get('marks_displayed_or_null'),'child_ids':[x['id'] for x in ch],'child_count':len(ch),'children_all_ms_linked':all(x.get('ms_locator_or_null') for x in ch),'child_mark_sum':sum(x.get('marks_displayed_or_null') or 0 for x in ch)})
# Full page set from visual regions
page_set=sorted({(v['source_id'],v['pdf_page_1_based']) for v in regions})
# manual risk-based 12 QP sample: all next-Q context pages by parent direction plus source-specific coverage; exact full-size pages
qp_sample=set()
for sid in [s['source_id'] for s in sources if s['kind']=='qp']:
 pages=[p for ss,p in page_set if ss==sid]
 qp_sample.update([(sid,pages[0]),(sid,pages[-1])])
# add all pages named in candidate contexts that were flagged as question starts/boundaries (later manual review)
for c in contexts:
 sid=c['entries'][0]['source_id'] if c['entries'] else None
 for e in c['entries']:
  if e['next_question_start_signals'] or 'starts on the next page' in e['original_excerpt'].casefold(): qp_sample.add((e['source_id'],e['page']))
# include QP pages for all 11 named context cases
for sid,page in [('9618_s25_qp_11',7),('9618_s25_qp_11',15),('9618_s25_qp_12',5),('9618_s25_qp_12',11),('9618_w25_qp_11',7),('9618_w25_qp_11',11),('9618_w25_qp_12',13),('9618_w25_qp_12',15),('9618_w25_qp_13',3),('9618_w25_qp_13',5),('9618_w25_qp_13',9)]:qp_sample.add((sid,page))
report={
 'work_order':'P1-S1-A4-B25-REVIEW-V1','date':'2026-09-21','scope':'A4-only independent linkage/source review; 2025 six QP/MS pairs only',
 'pins':pin_results,'pin_failures':[x for x in pin_results if x['status']!='PASS'],
 'candidate_snapshot':{'declared_entries':snap.get('file_count'),'listed_entries':len(snap_rows),'pass_count':sum(x['status']=='PASS' for x in snap_results),'failures':[x for x in snap_results if x['status']!='PASS']},
 'sources':{'count':len(sources),'page_total':sum(s['actual_pages'] or 0 for s in sources),'all_source_ids_2025':all(s['year_token_2025'] for s in sources),'rows':sources,'failures':[s for s in sources if s['status']!='PASS']},
 'counts':{'question_roots':len(roots),'parts':len(parts),'question_part_rows':len(qrows),'marking_items':len(mrows),'visual_regions':len(regions),'ms_visual_regions':sum(v['kind']=='mark_scheme_scoring_table_page' for v in regions),'qp_visual_regions':sum(v['kind']!='mark_scheme_scoring_table_page' for v in regions),'parent_groups':len(pg),'question_contexts':len(contexts)},
 'linkage_failures':link_errors,'mark_failures':mark_errors,'visual_failures':visual_errors,'mark_totals':covers,'parent_group_review':pg,'question_page_label_checks':qlabels,'context_review':contexts,
 'visual_page_set':[{'source_id':s,'pdf_page_1_based':p,'kind':'MS dependency' if '_ms_' in s else 'QP region'} for s,p in page_set],
 'qp_full_size_sample':[{'source_id':s,'pdf_page_1_based':p} for s,p in sorted(qp_sample)],
 'recommendation':'CHANGES_REQUIRED' if pin_results and (any(x['status']!='PASS' for x in pin_results) or link_errors or mark_errors or visual_errors or any(x['status']!='PASS' for x in covers)) else 'PENDING_VISUAL_REVIEW'
}
(OUT/'PRELIMINARY_AUDIT_V1.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'INPUT_PINS_V1.json').write_text(json.dumps({'work_order':'P1-S1-A4-B25-REVIEW-V1','pins':pin_results},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'SOURCE_PAGE_REQUESTS_V1.json').write_text(json.dumps({'scope':'Direct original-page renders; every visual region plus full-size QP sample','pages':[{'source_id':s,'pdf_page_1_based':p,'is_ms_dependency':'_ms_' in s,'qp_sample':(s,p) in qp_sample} for s,p in page_set if '_ms_' in s or (s,p) in qp_sample]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'pin_pass':len(pin_results)-len(report['pin_failures']),'pin_total':len(pin_results),'snapshot':report['candidate_snapshot'],'source_total':report['sources']['count'],'source_pages':report['sources']['page_total'],'source_failures':len(report['sources']['failures']),'counts':report['counts'],'linkage_failures':len(link_errors),'mark_failures':len(mark_errors),'visual_failures':len(visual_errors),'mark_totals':covers,'parent_groups':len(pg),'context_count':len(contexts),'qp_sample':len(qp_sample),'recommendation':report['recommendation']},ensure_ascii=False,indent=2))

