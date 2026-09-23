"""A8 independent structural, provenance, catalog and statistics review."""
from pathlib import Path
import json,hashlib,collections,datetime,subprocess,sys
S=Path(__file__).resolve().parents[1];load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
idx=load(S.parent/'stage-1/QUESTION_INDEX.json');agg=load(S/'QUESTION_PATTERN_MAP.json');cat=load(S/'EXAM_PATTERN_CATALOG.json');stats=load(S/'PATTERN_STATISTICS.json')
raw={t['part_id']:(p,q,t) for p in idx['papers'] for q in p['questions'] for t in q['parts']}
batch={r['part_id']:r for f in (S/'batches').glob('*/classification.json') for r in load(f)['rows']}
rows={r['part_id']:r for r in agg['rows']};patterns={p['pattern_id']:p for p in cat['patterns']}
errors=[]
def check(condition,*detail):
 if not condition:errors.append(list(detail))
check(len(rows)==len(agg['rows'])==672 and set(rows)==set(raw)==set(batch),'row_coverage')
check(agg['input_sha256']==hashlib.sha256((S.parent/'stage-1/QUESTION_INDEX.json').read_bytes()).hexdigest(),'input_sha')
for pid,r in rows.items():
 p,q,t=raw[pid];b=batch[pid]
 for key,value in b.items():
  if key not in ['review_status','skill_tags']:check(r[key]==value,pid,'batch_field',key)
 check(r['analyst_skill_tags']==b['skill_tags'],pid,'analyst_skills_changed')
 check(r['source_part']==t,pid,'source_part_changed')
 check((r['paper_id'],r['question_id'],r['marks'])==(p['paper_id'],q['question_id'],t['marks']),pid,'source_join')
 expected={patterns[k]['candidate_skill_ids'][0] for k in r['assessed_pattern_ids']}|set(r['variants'].get('directly_assessed_additional_skills',[]))
 check(set(r['skill_tags'])==expected and len(r['skill_tags'])==len(expected),pid,'canonical_skills')
 check(not set(r['skill_tags'])&set(patterns),pid,'pattern_id_used_as_skill')
 check(set(r['topic_families'])=={patterns[k]['topic_family'] for k in r['assessed_pattern_ids']},pid,'topic_families')
 deps=[];expansions=[]
 for d in t['dependency_refs']:
  ref=p['paper_id']+'_'+d
  if ref in raw:deps.append(ref)
  else:
   children=[i for i,(pp,qq,tt) in raw.items() if pp['paper_id']==p['paper_id'] and qq['question_id']==q['question_id'] and tt['part'].startswith(d+'(')]
   check(bool(children),pid,'missing_parent_children',ref)
   expansions.append({'source_parent_ref':ref,'expanded_scored_children':children});deps.extend(children)
 check(r['dependency_part_ids']==list(dict.fromkeys(deps)),pid,'dependencies')
 check(r['dependency_parent_expansions']==expansions,pid,'parent_expansions')
 check(all(d!=pid and rows[d]['question_id']==r['question_id'] for d in deps),pid,'self_or_crossquestion_dependency')
for p in agg['papers']:
 original=next(x for x in idx['papers'] if x['paper_id']==p['paper_id'])
 check(p=={k:v for k,v in original.items() if k!='questions'},p['paper_id'],'paper_context_changed')
for q in agg['questions']:
 original=next(qq for p in idx['papers'] for qq in p['questions'] if qq['question_id']==q['question_id'])
 for k,v in original.items():
  if k!='parts':check(q[k]==v,q['question_id'],'question_context',k)
 qr=[r for r in rows.values() if r['question_id']==q['question_id']]
 check(q['part_ids']==[r['part_id'] for r in qr],q['question_id'],'part_ids')
 check(q['marks']==sum(r['marks'] for r in qr),q['question_id'],'marks')
 for mode in ['assessed','context']:check(set(q[mode+'_pattern_ids'])=={p for r in qr for p in r[mode+'_pattern_ids']},q['question_id'],mode+'_tags')
active=set();done=set()
def walk(i):
 if i in active:errors.append(['dependency_cycle',i]);return
 if i in done:return
 active.add(i)
 for d in rows[i]['dependency_part_ids']:walk(d)
 active.remove(i);done.add(i)
for i in rows:walk(i)
ind=load(S/'evidence/A8_INDEPENDENT_STATISTICS.json');ncomp=0
for own,their in [('raw','raw_29'),('strict_text','normalized_text_21'),('render_corroborated','render_corroborated_23')]:
 v=stats['views'][their];o=ind['views'][own]
 cmap={'papers':'papers','root_questions':'questions','scored_parts':'parts','marks':'whole_part_marks'}
 check({cmap[k]:val for k,val in o['denominator'].items()}==v['denominator'],their,'denominator')
 for row in o['counts']:
  t=next(x for x in v['patterns'] if x['pattern_id']==row['pattern_id'])
  for a,b in [('primary','primary'),('assessed_union','assessed'),('context','context_only')]:
   expected={cmap[k]:val for k,val in row[a].items()}
   check(t[b]==expected,their,row['pattern_id'],b,'metric_mismatch',expected,t[b]);ncomp+=4
 modecounts=collections.Counter(r['task_mode'] for r in rows.values() if r['paper_id'] in v['representative_papers'])
 check(dict(modecounts)==v['task_mode_counts'],their,'task_mode_counts')
for pid,p in patterns.items():
 check(set(p['assessed_part_ids'])=={i for i,r in rows.items() if pid in r['assessed_pattern_ids']},pid,'catalog_members')
 check(p['raw_counts']==next(x for x in stats['views']['raw_29']['patterns'] if x['pattern_id']==pid),pid,'catalog_raw_stats')
 check(p['normalized_group_counts']==next(x for x in stats['views']['normalized_text_21']['patterns'] if x['pattern_id']==pid),pid,'catalog_group_stats')
 check(set(p['observed_task_modes'])=={r['task_mode'] for r in rows.values() if pid in r['assessed_pattern_ids']},pid,'catalog_modes')
 check((p['evidence_strength']=='LIMITED_CORPUS_EVIDENCE')==(p['normalized_group_counts']['assessed']['papers']<=2),pid,'evidence_strength')
 for e in p['evidence_examples']:
  check(pid in rows[e['part_id']]['assessed_pattern_ids'],pid,e['part_id'],'example_not_assessed')
  for k,v in e.items():check(rows[e['part_id']][k]==v,pid,e['part_id'],'example_field',k)
  for kind in ['qp','ms']:
   basis=e[kind+'_basis']
   for page in basis['pdf_pages']:check((S.parent/'stage-1/facsimiles'/basis['source_id']/f'p{page:03}.png').exists(),pid,'facsimile_missing')
for ref in [agg['source_manifest'],agg['fidelity_policy'],agg['source_issues']]:check((S/ref).exists(),'missing_source_reference',ref)
conf=load(S/'CONFUSABLE_PATTERNS.json');references=0
check(len(conf['contrasts'])==20,'contrast_count')
for c in conf['contrasts']:
 for side in ['left','right']:
  e=c[side];references+=1
  for k in ['primary_pattern_id','assessed_pattern_ids','context_pattern_ids','qp_basis','ms_basis']:
   check(e[k]==rows[e['part_id']][k],c['id'],side,'contrast_join',k)
 if c['contrast_kind']=='implementation_variant':check(c['left']['primary_pattern_id']==c['right']['primary_pattern_id'],c['id'],'variant_changed_pattern')
for n in ['LEAD_DECISIONS.md','batches/2021-2022/REVIEW.md','batches/2023-2024/REVIEW.md','batches/2025/REVIEW.md']:check((S/n).exists(),'missing_review',n)
query_cases=[]
for view in stats['views']:
 for role in ['primary','assessed','context_only']:
  command=[sys.executable,str(S/'scripts/query_patterns.py'),'DATA_STORAGE','OOP_INSTANTIATE','DATA_STORAGE','--view',view,'--role',role]
  answer=json.loads(subprocess.check_output(command,text=True,encoding='utf-8'))
  selected=[]
  for i,r in rows.items():
   if r['paper_id'] not in stats['views'][view]['representative_papers']:continue
   tags=[r['primary_pattern_id']] if role=='primary' else r['assessed_pattern_ids'] if role=='assessed' else r['context_pattern_ids']
   if {'DATA_STORAGE','OOP_INSTANTIATE'}&set(tags):selected.append(i)
  check(set(answer['part_ids'])==set(selected) and len(answer['part_ids'])==len(selected),view,role,'query_union_ids')
  check(answer['union_whole_part_marks']==sum(raw[i][2]['marks'] for i in selected),view,role,'query_union_marks')
  query_cases.append({'view':view,'role':role,'distinct_parts':len(selected),'whole_part_marks':answer['union_whole_part_marks']})
out={'reviewer':'A8 independent QA','checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if not errors else 'REWORK','rows_checked':len(rows),'patterns_checked':len(patterns),'confusable_pairs_checked':len(conf['contrasts']),'confusable_references_checked':references,'individual_pattern_metrics_compared':ncomp,'dependency_dag_checked':True,'source_context_exact_preservation':True,'query_union_cases':query_cases,'errors':errors,'input_sha256':{n:hashlib.sha256((S/n).read_bytes()).hexdigest() for n in ['QUESTION_PATTERN_MAP.json','EXAM_PATTERN_CATALOG.json','PATTERN_STATISTICS.json','UNCLASSIFIED_REPORT.json','CONFUSABLE_PATTERNS.json']}}
(S/'evidence/A8_AGGREGATE_CHECKS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in out.items() if k!='input_sha256'}))
