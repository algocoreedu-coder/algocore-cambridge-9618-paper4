import collections, hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[6]
P4 = ROOT / 'A_Level_CS_page' / 'planning' / 'paper4'; S4=P4/'stage-4'; S5=P4/'stage-5'; OUT=S5/'evidence'/'s5-0'; OUT.mkdir(parents=True,exist_ok=True)
def R(p): return json.loads(p.read_text(encoding='utf-8'))
def H(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def J(path,*parts):
 e=lambda x:str(x).replace('~','~0').replace('/','~1')
 return path+''.join('/'+e(x) for x in parts)
def WH(path,body,field):
 raw=json.dumps(body,ensure_ascii=False,indent=2,sort_keys=True,separators=(',',': '))+'\n'; dg=hashlib.sha256(raw.encode()).hexdigest(); out=dict(body); out[field]=dg
 path.write_text(json.dumps(out,ensure_ascii=False,indent=2,sort_keys=True,separators=(',',': '))+'\n',encoding='utf-8',newline='\n'); return dg
lock=R(S5/'INPUT_LOCK.json'); bp=R(S5/'BATCH_PLAN.json'); order=[x['batch_id'] for x in bp['batches']]; bpat={x['batch_id']:set(x['patterns']) for x in bp['batches']}
fs=['PATTERN_CARDS.json','VARIANT_INVARIANT_REGISTER.json','MARKING_MAP.json','MARKING_METHOD_OWNERSHIP.json','ERROR_PREVENTION_MATRIX.json','SOLUTION_DESIGN_BRIEFS.json','WORKED_EXAMPLE_SPECS.json','PRELIMINARY_VISUAL_BRIEFS.json','SOURCE_CAVEAT_CARRYOVER.json']; D={f:R(S4/f) for f in fs}; rel={f:'../stage-4/'+f for f in fs}
ih={p:H((S5/p).resolve()) for p in [x['path'] for x in lock['canonical_inputs']]}
for x in lock['upstream_source_authority_locks']:
 p=(S5/x['path']).resolve(); a=H(p); assert a==x['sha256'],(x['path'],a,x['sha256']); ih[x['path']]=a
ih['BATCH_PLAN.json']=H(S5/'BATCH_PLAN.json'); ih['INPUT_LOCK.json']=H(S5/'INPUT_LOCK.json')
rows=[]
def add(oid,typ,fn,ptr,pats,auth,ev,details=None):
 ms=[b for b in order if any(p in bpat[b] for p in (pats or []))]; r={'obligation_id':oid,'obligation_type':typ,'source_path':rel[fn],'source_json_pointer':ptr,'source_sha256':ih[rel[fn]],'pattern_ids':sorted(set(pats or [])),'primary_batch':ms[0] if ms else 'SOURCE_REGISTER','secondary_consumers':ms[1:],'authority_class':auth,'expected_evidence_kind':ev}
 if details:r['details']=details
 rows.append(r)
P=D['PATTERN_CARDS.json']['pattern_cards']
for i,x in enumerate(P):add('pattern:'+x['pattern_id'],'pattern','PATTERN_CARDS.json',J('/pattern_cards',i),[x['pattern_id']],'stage4_pattern_contract','implementation_fixture_trace',{'card_id':x.get('card_id')})
S=D['SOLUTION_DESIGN_BRIEFS.json']['solution_designs']; sc=collections.Counter(); up=set()
for i,x in enumerate(S):
 for k in ('normal','boundary','counterexample','source_fixture'):
  for j,v in enumerate(x['stage5_test_obligations'][k],1):
   d={'solution_design_id':x['solution_design_id'],'ordinal':j,'requirement':v}
   if k=='source_fixture':d['source_part_id']=v;up.add(v)
   add(f"solution-obligation:{x['solution_design_id']}:{k}:{j:03d}",'solution_'+k,'SOLUTION_DESIGN_BRIEFS.json',J('/solution_designs',i,'stage5_test_obligations',k,j-1),[x['pattern_id']],'stage4_solution_contract','executable_fixture',d);sc[k]+=1
V=D['VARIANT_INVARIANT_REGISTER.json']['variants']; vids=[]; cids=[]
for i,x in enumerate(V):
 vids.append(x['variant_id']);add('variant:'+x['variant_id'],'variant','VARIANT_INVARIANT_REGISTER.json',J('/variants',i),x['pattern_ids'],'stage4_variant_contract','variant_fixture_or_disposition',{'axis':x.get('axis'),'method_changing':x.get('method_changing')})
 for j,c in enumerate(x['cases']):
  case_id=c['case_id'] if isinstance(c,dict) else str(c); cid=x['variant_id']+':'+case_id;cids.append(cid); details={'variant_id':x['variant_id'],'case_id':case_id}; details.update({'observed_parts':c.get('observed_parts',[]) } if isinstance(c,dict) else {'case_text':c}); add('variant-case:'+cid,'variant_case','VARIANT_INVARIANT_REGISTER.json',J('/variants',i,'cases',j),x['pattern_ids'],'stage4_variant_contract','variant_fixture_or_disposition',details)
W=D['WORKED_EXAMPLE_SPECS.json']['worked_example_specs']; specs=[]; micros=[]; evis=[]
for i,x in enumerate(W):
 sid=x['worked_example_spec_id'];specs.append(sid);add('worked-example-spec:'+sid,'worked_example_spec','WORKED_EXAMPLE_SPECS.json',J('/worked_example_specs',i),[x['pattern_id']],'stage4_worked_example_contract','fixture_run_evidence',{'anchor_part_id':x.get('anchor_source',{}).get('part_id')})
 for j,v in enumerate(x.get('contrast_and_boundary_microcases',[]),1):
  oid=f'worked-example-microcase:{sid}:{j:03d}';micros.append(oid);add(oid,'worked_example_microcase','WORKED_EXAMPLE_SPECS.json',J('/worked_example_specs',i,'contrast_and_boundary_microcases',j-1),[x['pattern_id']],'stage4_worked_example_contract','fixture_run_evidence',{'worked_example_spec_id':sid,'ordinal':j,'microcase':v})
 for j,v in enumerate(x.get('evidence_to_capture_later',[]),1):
  oid=f'worked-example-evidence:{sid}:{j:03d}';evis.append(oid);add(oid,'worked_example_evidence','WORKED_EXAMPLE_SPECS.json',J('/worked_example_specs',i,'evidence_to_capture_later',j-1),[x['pattern_id']],'stage4_worked_example_contract','run_evidence_capture',{'worked_example_spec_id':sid,'ordinal':j,'evidence_item':v})
E=D['ERROR_PREVENTION_MATRIX.json']['error_rows'];eids=[];pids=[]
for i,x in enumerate(E):
 eids.append(x['error_id']);add('error-row:'+x['error_id'],'error_row','ERROR_PREVENTION_MATRIX.json',J('/error_rows',i),[x['pattern_id']],'AlgoCore_risk_or_source_caveat','error_fixture_or_disposition',{'error_id':x['error_id'],'basis':x.get('basis')})
 for phase,key in [('detection','detection_check'),('repair','repair_action')]:
  oid=f"error-phase:{x['error_id']}:{phase}";pids.append(oid);add(oid,'error_phase','ERROR_PREVENTION_MATRIX.json',J('/error_rows',i,key),[x['pattern_id']],'AlgoCore_risk_or_source_caveat','error_phase_assertion_or_disposition',{'error_id':x['error_id'],'phase':phase,'requirement':x.get(key)})
M=D['MARKING_MAP.json']; O=D['MARKING_METHOD_OWNERSHIP.json']; ptrs={}
for i,p in enumerate(M['rows']):
 for j,m in enumerate(p.get('marking_points',[])):ptrs[m['marking_point_id']]=(i,j)
marks=[]
for i,x in enumerate(O['decisions']):
 mid=x['marking_point_id'];marks.append(mid);fn='MARKING_MAP.json' if mid in ptrs else 'MARKING_METHOD_OWNERSHIP.json';ptr=J('/rows',ptrs[mid][0],'marking_points',ptrs[mid][1]) if mid in ptrs else J('/decisions',i)
 add('marking-atom:'+mid,'marking_atom',fn,ptr,[x['owner_pattern_id']],'official_ms_joined_stage4_method_owner','assertion_evidence_or_approved_disposition',{'marking_point_id':mid,'part_id':x.get('part_id'),'owner_pattern_id':x.get('owner_pattern_id'),'candidate_pattern_ids':x.get('candidate_pattern_ids',[])})
VI=D['PRELIMINARY_VISUAL_BRIEFS.json']['visual_briefs'];vbr=[];vsc=[];vev=[]
for i,x in enumerate(VI):
 vid=x['visual_brief_id'];vbr.append(vid);add('visual-brief:'+vid,'visual_brief','PRELIMINARY_VISUAL_BRIEFS.json',J('/visual_briefs',i),[x['pattern_id']],'stage4_visual_brief','event_trace_bundle',{'visual_mode':x.get('visual_mode')})
 for k,key in [('normal','normal_case'),('boundary','boundary_case'),('failure','failure_case')]:
  sid=vid+':'+k;vsc.append(sid);add('visual-scenario:'+sid,'visual_scenario','PRELIMINARY_VISUAL_BRIEFS.json',J('/visual_briefs',i,key),[x['pattern_id']],'stage4_visual_brief','event_trace_bundle',{'visual_brief_id':vid,'visual_case_kind':k})
 for j,e in enumerate(x.get('proposed_event_types',[]),1):
  eid=f'{vid}:event:{j:03d}:{e}';vev.append(eid);add('visual-event:'+eid,'visual_event','PRELIMINARY_VISUAL_BRIEFS.json',J('/visual_briefs',i,'proposed_event_types',j-1),[x['pattern_id']],'stage4_visual_brief','executed_event_trace',{'visual_brief_id':vid,'ordinal':j,'proposed_event_type':e})
C=D['SOURCE_CAVEAT_CARRYOVER.json'];iss=[];occ=[];by=collections.defaultdict(list)
for o in C['occurrences']:by[o['issue_id']].append(o)
for i,x in enumerate(C['issues']):
 iss.append(x['issue_id']);pats=[p for o in by[x['issue_id']] for p in o.get('pattern_ids',[])+o.get('context_pattern_ids',[])];add('source-issue:'+x['issue_id'],'source_issue','SOURCE_CAVEAT_CARRYOVER.json',J('/issues',i),pats,'stage1_source_caveat_carryover','source_occurrence_union_evidence',{'issue_id':x['issue_id'],'kind':x.get('kind'),'occurrence_ids':[o['occurrence_id'] for o in by[x['issue_id']] ]})
for i,x in enumerate(C['occurrences']):
 oid=x['occurrence_id'];occ.append(oid);pats=x.get('pattern_ids',[])+x.get('context_pattern_ids',[]);ms=[b for b in order if any(p in bpat[b] for p in pats)];ek='executable' if ms else ('adjudication' if ('mark' in x['issue_id'].lower() or 'rubric' in str(x.get('interpretation_risk','')).lower()) else 'documentary_facsimile');add('source-occurrence:'+oid,'source_occurrence','SOURCE_CAVEAT_CARRYOVER.json',J('/occurrences',i),pats,'stage1_source_caveat_carryover',ek,{'occurrence_id':oid,'issue_id':x['issue_id'],'part_id':x.get('part_id'),'batch_id':x.get('batch_id'),'source_locators':x.get('source_locators',[])})
rows.sort(key=lambda r:(r['obligation_type'],r['obligation_id']));bt=collections.Counter(r['obligation_type'] for r in rows)
actual={'patterns':bt['pattern'],'solution_obligations':sum(sc.values()),'solution_obligations_by_kind':dict(sc),'unique_source_parts_in_solution_fixtures':len(up),'variants':bt['variant'],'variant_cases':bt['variant_case'],'error_rows':bt['error_row'],'error_phase_obligations':bt['error_phase'],'marking_atoms':bt['marking_atom'],'solution_designs':len(S),'worked_example_specs':bt['worked_example_spec'],'worked_example_microcases':bt['worked_example_microcase'],'worked_example_evidence_items':bt['worked_example_evidence'],'minimum_source_anchor_fixtures':len(S),'visual_briefs_with_trace_bundle':bt['visual_brief'],'visual_scenarios':bt['visual_scenario'],'proposed_visual_event_entries':bt['visual_event'],'source_issue_ids':bt['source_issue'],'source_issue_occurrences':bt['source_occurrence']}
for k,v in bp['target_counts'].items():assert actual.get(k)==v,(k,actual.get(k),v)
inv={'schema_version':'s5-obligation-inventory-v1','status':'FROZEN_S5_0','source_release':lock['release_id'],'stage4_manifest_sha256':lock['release_manifest_sha256'],'input_hashes':dict(sorted(ih.items())),'denominators':actual,'obligations':rows};invh=WH(S5/'OBLIGATION_INVENTORY.json',inv,'inventory_sha256')
owners=[]
for i,x in enumerate(C['occurrences']):
 pats=x.get('pattern_ids',[])+x.get('context_pattern_ids',[]);ms=[b for b in order if any(p in bpat[b] for p in pats)];ek='executable' if ms else ('adjudication' if ('mark' in x['issue_id'].lower() or 'rubric' in str(x.get('interpretation_risk','')).lower()) else 'documentary_facsimile');owners.append({'occurrence_id':x['occurrence_id'],'issue_id':x['issue_id'],'primary_owner':'A3:'+ms[0] if ms else 'A3:SOURCE_REGISTER','primary_batch':ms[0] if ms else 'SOURCE_REGISTER','secondary_consumers':['A3:'+b for b in ms[1:]],'evidence_kind':ek,'authority_locators':x.get('source_locators',[]),'disposition_id':None,'pattern_ids':sorted(set(x.get('pattern_ids',[]))),'context_pattern_ids':sorted(set(x.get('context_pattern_ids',[]))),'source_part_id':x.get('part_id'),'source_json_pointer':J('/occurrences',i),'source_sha256':ih['../stage-4/SOURCE_CAVEAT_CARRYOVER.json']})
owners.sort(key=lambda x:x['occurrence_id']);counts={'issue_ids':len(iss),'occurrences':len(owners),'executable':sum(x['evidence_kind']=='executable' for x in owners),'documentary_facsimile':sum(x['evidence_kind']=='documentary_facsimile' for x in owners),'adjudication':sum(x['evidence_kind']=='adjudication' for x in owners)}
own={'schema_version':'s5-source-occurrence-ownership-v1','status':'FROZEN_S5_0','source_release':lock['release_id'],'inventory_sha256':invh,'source_caveat_input_sha256':ih['../stage-4/SOURCE_CAVEAT_CARRYOVER.json'],'counts':counts,'ownership_policy':'Earliest matching batch in canonical BATCH_PLAN order from pattern_ids, else context_pattern_ids; no match -> A3:SOURCE_REGISTER.','occurrences':owners};ownh=WH(S5/'SOURCE_OCCURRENCE_OWNERSHIP.json',own,'ownership_sha256')
S5_ids=lambda p,x:[p+':'+z for z in x]; sets=[]
def addset(typ,vals):
 vals=sorted(vals);sets.append({'obligation_type':typ,'expected_ids':vals,'evidence_refs_by_id':{},'approved_disposition_refs_by_id':{},'missing_ids':vals,'unexpected_ids':[],'duplicate_primary_owners':[],'count_expected':len(vals),'count_covered':0,'status':'NOT_STARTED'})
addset('pattern',S5_ids('pattern',[x['pattern_id'] for x in P]));addset('solution_obligation',[r['obligation_id'] for r in rows if r['obligation_type'].startswith('solution_')]);addset('variant',S5_ids('variant',vids));addset('variant_case',S5_ids('variant-case',cids));addset('worked_example_spec',S5_ids('worked-example-spec',specs));addset('worked_example_microcase',micros);addset('worked_example_evidence',evis);addset('error_row',S5_ids('error-row',eids));addset('error_phase',pids);addset('marking_atom',S5_ids('marking-atom',marks));addset('source_issue',S5_ids('source-issue',iss));addset('source_occurrence',S5_ids('source-occurrence',occ));addset('visual_brief',S5_ids('visual-brief',vbr));addset('visual_scenario',S5_ids('visual-scenario',vsc));addset('visual_event',S5_ids('visual-event',vev))
cov={'schema_version':'s5-coverage-matrix-v1','status':'EMPTY_AT_S5_0','source_release':lock['release_id'],'inventory_sha256':invh,'ownership_sha256':ownh,'artifact_hashes':{'OBLIGATION_INVENTORY.json':invh,'SOURCE_OCCURRENCE_OWNERSHIP.json':ownh},'coverage_sets':sets,'notes':['Frozen expected ID sets generated from Stage 4 locked hashes. Execution evidence and approved dispositions are intentionally empty at S5-0.']};covh=WH(S5/'COVERAGE_MATRIX.json',cov,'coverage_matrix_sha256')
for n in ('OBLIGATION_INVENTORY.json','SOURCE_OCCURRENCE_OWNERSHIP.json','COVERAGE_MATRIX.json'):(OUT/n).write_text((S5/n).read_text(encoding='utf-8'),encoding='utf-8',newline='\n')
report={'status':'PASS_RECOMMENDED','inventory_sha256':invh,'ownership_sha256':ownh,'coverage_matrix_sha256':covh,'denominators':actual,'source_occurrence_evidence_counts':counts,'unmapped_source_occurrences':[x['occurrence_id'] for x in owners if x['primary_batch']=='SOURCE_REGISTER'],'discrepancies':[]};(OUT/'S5_0_INVENTORY_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8',newline='\n');print(json.dumps(report,ensure_ascii=False,indent=2,sort_keys=True))


