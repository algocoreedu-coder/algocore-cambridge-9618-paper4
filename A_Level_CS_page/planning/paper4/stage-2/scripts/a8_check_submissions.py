"""Independent A8 checks of taxonomy submissions and source partitions; read-only inputs."""
from pathlib import Path
import json,re,hashlib,collections,datetime,sys
sys.stdout.reconfigure(encoding='utf-8')
S=Path(__file__).resolve().parents[1];S1=S.parent/'stage-1'
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
idx=load(S1/'QUESTION_INDEX.json')
parts={t['part_id']:(p,q,t) for p in idx['papers'] for q in p['questions'] for t in q['parts']}
seed=load(S/'PATTERN_SEED.json');patterns={p['pattern_id'] for p in seed['patterns']}
out={'reviewer':'A8 independent taxonomy QA','checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'IN_PROGRESS','submissions':[]}
allrows={}
for fp in sorted((S/'batches').glob('*/classification.json')):
 a=load(fp);errors=[];seen=set();batchparts={pid for pid,(p,_,_) in parts.items() if p['batch']==a['batch']}
 for row in a['rows']:
  pid=row['part_id']
  if pid in seen:errors.append([pid,'duplicate'])
  seen.add(pid);allrows[pid]=row
  if pid not in parts:errors.append([pid,'unknown_id']);continue
  p,q,t=parts[pid]
  if row['primary_pattern_id'] not in row['assessed_pattern_ids']:errors.append([pid,'primary_not_assessed'])
  if len(row['assessed_pattern_ids'])!=len(set(row['assessed_pattern_ids'])):errors.append([pid,'duplicate_assessed'])
  if set(row['assessed_pattern_ids'])&set(row['context_pattern_ids']):errors.append([pid,'assessed_context_overlap'])
  for tag in row['assessed_pattern_ids']+row['context_pattern_ids']:
   if tag not in patterns:errors.append([pid,'unknown_pattern',tag])
  for kind in ['qp','ms']:
   if row[kind+'_basis']!={'source_id':p[kind+'_source_id'],'pdf_pages':t[kind+'_pages']}:errors.append([pid,kind+'_locator_mismatch'])
  if row['task_mode'] not in seed['task_modes']:errors.append([pid,'unknown_task_mode',row['task_mode']])
  if row['task_mode']=='test_evidence' and row['assessed_pattern_ids']!=['EVIDENCE_RUN']:errors.append([pid,'evidence_assessed_extra_review'])
  if not row.get('classification_rationale') or not row.get('ms_distinguishing_requirement'):errors.append([pid,'missing_rationale'])
 missing=sorted(batchparts-seen);extra=sorted(seen-batchparts)
 out['submissions'].append({'batch':a['batch'],'rows':len(a['rows']),'expected_rows':len(batchparts),'missing_ids':missing,'extra_ids':extra,'errors':errors,'source_sha256':hashlib.sha256(fp.read_bytes()).hexdigest()})
eq=load(S/'evidence/A2_EQUIVALENCE.json');groups=collections.defaultdict(list);evidence=[]
for p in idx['papers']:
 sig=[]
 for kind in ['qp','ms']:
  e=load(S1/'extracted'/f'{p[kind+"_source_id"]}.json')
  texts=[re.sub(r'\s+',' ',re.sub(r'9618/4[123](?!\d)','9618/4X',pg['text'])).strip() for pg in e['pages'][1:]]
  sig.append(tuple(texts))
 groups[tuple(sig)].append(p['paper_id'])
group_set={tuple(sorted(g)) for g in groups.values()};supplied={tuple(sorted(g['members'])) for g in eq['strict_groups']}
partition_errors=[]
if group_set!=supplied:partition_errors.append('strict_group_partition_differs')
byid={p['paper_id']:p for p in idx['papers']}
for name,gs in [('strict',eq['strict_groups']),('render',eq['render_corroborated_groups'])]:
 members=[p for g in gs for p in g['members']]
 if len(members)!=len(set(members)) or set(members)!=set(byid):partition_errors.append([name,'bad_partition'])
 tot={'groups':len(gs),'questions':0,'scored_parts':0,'marks':0}
 for g in gs:
  p=byid[g['representative']];tot['questions']+=len(p['questions'])
  tot['scored_parts']+=sum(len(q['parts']) for q in p['questions'])
  tot['marks']+=sum(t['marks'] for q in p['questions'] for t in q['parts'])
 evidence.append({'partition':name,**tot})
out['equivalence_partition_checks']={'independent_text_group_count':len(groups),'partitions':evidence,'errors':partition_errors}
equiv_map=[]
for g in eq['strict_groups']:
 if len(g['members'])<2:continue
 rep=g['representative'];ref={k.split('_',3)[3]:v for k,v in allrows.items() if k.startswith(rep+'_')}
 for member in g['members'][1:]:
  oth={k.split('_',3)[3]:v for k,v in allrows.items() if k.startswith(member+'_')}
  if not ref or not oth:continue
  for label,v in ref.items():
   w=oth.get(label)
   if w is None or any(v[f]!=w[f] for f in ['primary_pattern_id','assessed_pattern_ids','context_pattern_ids','task_mode']):equiv_map.append({'representative':rep,'member':member,'label':label,'reference':{f:v[f] for f in ['primary_pattern_id','assessed_pattern_ids','context_pattern_ids','task_mode']},'other':None if w is None else {f:w[f] for f in ['primary_pattern_id','assessed_pattern_ids','context_pattern_ids','task_mode']}})
out['equivalent_variant_mapping_discrepancies']=equiv_map
out['submitted_total']=len(allrows)
out['status']='PASS' if len(allrows)==672 and not partition_errors and not equiv_map and all(not x['errors'] and not x['missing_ids'] and not x['extra_ids'] for x in out['submissions']) else 'REWORK'
(S/'evidence/A8_MECHANICAL_CHECKS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'submitted':len(allrows),'batches':[{'batch':x['batch'],'errors':x['errors'],'missing':x['missing_ids']} for x in out['submissions']],'partitions':evidence,'partition_errors':partition_errors,'equiv_mapping_discrepancies':equiv_map},ensure_ascii=False))
