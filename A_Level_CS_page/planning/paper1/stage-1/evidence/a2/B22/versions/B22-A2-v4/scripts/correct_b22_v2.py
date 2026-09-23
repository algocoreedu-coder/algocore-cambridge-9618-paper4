from pathlib import Path
import json,re,hashlib
ROOT=Path.cwd();B=ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22'
def loadl(n):return [json.loads(x) for x in (B/n).read_text(encoding='utf8').splitlines()]
def writel(n,x):(B/n).write_text(''.join(json.dumps(a,ensure_ascii=False,sort_keys=True)+'\n' for a in x),encoding='utf8')
def h(p):
 x=hashlib.sha256();x.update(Path(p).read_bytes());return x.hexdigest()
parts=[x for x in loadl('QUESTION_INDEX.jsonl') if 'question_id' in x]; questions=[x for x in loadl('QUESTION_INDEX.jsonl') if 'source_qp_id' in x]
base=json.loads((ROOT/'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf8'))
src={x['id']:x for x in base['primary_sources'] if re.fullmatch(r'9618_[sw]22_(qp|ms)_1[123]',x['id'])}
texts={}
for sid in src:
 texts[sid]=[(B/f'transcripts/{sid}-p{i:02}.txt').read_text(encoding='utf8') for i in range(1,200) if (B/f'transcripts/{sid}-p{i:02}.txt').exists()]
vis=json.loads((B/'VISUAL_MANIFEST.json').read_text(encoding='utf8'))['regions']
visby={(x['source_id'],x['pdf_page_1_based']):x['id'] for x in vis}
un=[];mi=[]
for p in parts:
 sid=p['qp_locator']['source_id'];q=str(p['question_id'].split('-q')[-1]);label=p['label'];pn=p['qp_locator']['pdf_page_1_based'];t=texts[sid][pn-1]
 # displayed QP mark: text from this printed part label to the next source part label/page boundary.
 key=re.escape(q)+r'\s*'+re.escape(label).replace(r'\)',r'\)\s*');m=re.search(key+r'[\s\S]{0,2400}?\[(\d+)\]',t)
 if m:p['marks_displayed_or_null']=int(m.group(1))
 else:
  p['marks_displayed_or_null']=None;un.append({'part_id':p['id'],'field':'marks_displayed_or_null','reason':'No explicit displayed mark reliably isolated from searchable text; retain null for visual retest.','qp_locator':p['qp_locator']})
 msid=sid.replace('_qp_','_ms_'); hits=[];rx=re.compile(re.escape(q+label))
 for i,mt in enumerate(texts[msid],1):
  if rx.search(mt):hits.append(i)
 if len(hits)==1:
  mp=hits[0];ml={'source_id':msid,'pdf_page_1_based':mp,'printed_page_or_null':None,'question':q,'part':label};p['ms_locator_or_null']=ml;p['status']='MS_LINKED'
  vd=[]
  if (msid,mp) in visby:vd=[visby[(msid,mp)]]
  mi.append({'id':p['id']+'-ms-part-reference','part_id':p['id'],'ms_locator':ml,'transcript_ref':f'transcripts/{msid}-p{mp:02}.txt','mark_or_condition_or_null':None,'table_row_ref_or_null':q+label if vd else None,'visual_dependency_refs':vd,'status':'MS_LINKED'})
 else:
  p['ms_locator_or_null']=None;p['status']='UNRESOLVED';un.append({'part_id':p['id'],'field':'ms_locator_or_null','reason':'No unique exact MS part-label match in searchable MS text.' if not hits else 'Part label occurs on multiple MS pages; exact stable locator requires reviewer resolution.','candidate_ms_pages':hits,'qp_locator':p['qp_locator']})
 # remove only dangling nested parent; preserve source label and avoid fabricated parent record.
 ids={x['id'] for x in parts}
 if p['parent_part_id_or_null'] and p['parent_part_id_or_null'] not in ids:
  un.append({'part_id':p['id'],'field':'parent_part_id_or_null','reason':'Nested label is retained but its printed parent was not a separately indexed record; parent field set null rather than inventing a record.','qp_locator':p['qp_locator']});p['parent_part_id_or_null']=None
# Source-confirmed cross-page contexts from A3/A4.
cases={'9618_w22_qp_11-q4':{'pages':[6,7,8],'ref':'9618_w22_qp_11-q4-context-p6-schema'},'9618_w22_qp_12-q7':{'pages':[10,11,12,13,14],'ref':'9618_w22_qp_12-q7-context-p10-instruction-set'}}
for p in parts:
 for prefix,c in cases.items():
  if p['id'].startswith(prefix):
   p['context_required']=True;p['dependency_refs']=[c['ref']]+[{'source_id':p['qp_locator']['source_id'],'pdf_page_1_based':n} for n in c['pages']]
# Add all affected source-page refs as explicit unresolved/audit entries, not fabricated parts.
for prefix,c in cases.items():un.append({'part_id':prefix,'field':'context_required/dependency_refs','reason':'Cross-page context repaired from independently cited source pages.','source_pages':c['pages'],'context_ref':c['ref']})
writel('QUESTION_INDEX.jsonl',questions+parts);writel('MARKING_INDEX.jsonl',mi)
(B/'UNRESOLVED.md').write_text('# B22-A2-v2 unresolved register\n\n'+''.join('- `'+x['part_id']+'` / `'+x['field']+'`: '+x['reason']+'\n' for x in un)+'\n',encoding='utf8')
man=json.loads((B/'BATCH_MANIFEST.json').read_text(encoding='utf8'));man['artifact_version']='B22-A2-v2';man['status']='SUBMITTED_FOR_RETEST';man['supersedes']='versions/B22-A2-v1/';man['record_counts'].update({'question':len(questions),'part':len(parts),'marking_item':len(mi)});man['revision_inputs']={'a3_context_scope_review_sha256':h(ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B22/CONTEXT_SCOPE_REVIEW.md'),'a4_linkage_review_sha256':h(ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B22/LINKAGE_REVIEW.md'),'a4_findings_sha256':h(ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B22/LINKAGE_FINDINGS.json')};(B/'BATCH_MANIFEST.json').write_text(json.dumps(man,ensure_ascii=False,indent=2),encoding='utf8')
check={'batch_id':'B22','artifact_version':'B22-A2-v2','handoff_status':'SUBMITTED_FOR_A4_A9_RETEST','checks':{'source_hashes_preserved':all(x['sha256_baseline']==x['sha256_verified'] for x in man['inputs']),'questions_preserved':len(questions)==52,'parts_preserved':len(parts)==156,'parent_ids_resolve':all(not x['parent_part_id_or_null'] or x['parent_part_id_or_null'] in {z['id'] for z in parts} for x in parts),'parts_have_ms_or_unresolved':all(x['ms_locator_or_null'] or x['status']=='UNRESOLVED' for x in parts),'context_cases_repaired':all(x['context_required'] for x in parts if x['id'].startswith(('9618_w22_qp_11-q4','9618_w22_qp_12-q7')))},'retest_required':['A4','A9']};(B/'HANDOFF_CHECK.json').write_text(json.dumps(check,ensure_ascii=False,indent=2),encoding='utf8')
(B/'EXTRACTION_QA.md').write_text('# B22-A2-v2 correction QA\n\n- Preserved 52 questions and 156 parts.\n- Exact MS part-label locators were added only where unique; all other parts have record-specific unresolved entries.\n- Explicit QP marks were parsed conservatively; unreliably isolated marks remain record-specific nulls.\n- Repaired cited cross-page contexts and removed dangling parent references without inventing records.\n- Requires A4/A9 retest.\n',encoding='utf8')
print(len(mi),len(un),sum(x['marks_displayed_or_null'] is not None for x in parts))
