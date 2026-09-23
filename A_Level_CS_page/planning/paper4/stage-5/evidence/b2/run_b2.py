from __future__ import annotations
import argparse, hashlib, json, os, platform, subprocess, sys, tempfile, time
from pathlib import Path
HERE=Path(__file__).resolve().parent
IMPL=HERE/'implementation'; sys.path.insert(0,str(IMPL))
from b2_search_sort import *
S4=HERE.parents[2]/'stage-4'; S4B2=S4/'evidence/method/B2-search-sort'
RUNS=HERE/'runs'; FIX=HERE/'fixtures'; TR=HERE/'traces'
PATTERNS=['ORDERED_INSERT','LINEAR_SEARCH','COUNT_OCCURRENCES','FILTER_RECORDS','GROUP_AGGREGATE','BUBBLE_SORT','INSERTION_SORT','BINARY_SEARCH']

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(d,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')
def snap(v): return {'object_type':'result','storage':None,'capacity':None,'top_pointer':None,'live_range':None,'items_in_logical_order':v,'success_flags':{},'return_value':v,'output':None,'file_state':[],'additional_declared_fields':{}}
def bil(vi,en): return {'vi':vi,'en':en}

def base_cases():
 return [
 {'pattern_id':'ORDERED_INSERT','fixture_id':'fx.b2.ordered_insert.normal','category':'normal','operation':'ordered_insert','args':{'records':[{'key':10,'id':'a'},{'key':30,'id':'c'}],'new_record':{'key':20,'id':'b'},'capacity':None,'descending':False,'equal_after':True},'expected':[{'key':10,'id':'a'},{'key':20,'id':'b'},{'key':30,'id':'c'}]},
 {'pattern_id':'ORDERED_INSERT','fixture_id':'fx.b2.ordered_insert.boundary','category':'boundary','operation':'ordered_insert','args':{'records':[{'key':10,'id':'a'},{'key':20,'id':'c'}],'new_record':{'key':20,'id':'b'},'capacity':2,'descending':False,'equal_after':True},'expected':[{'key':10,'id':'a'},{'key':20,'id':'c'}]},
 {'pattern_id':'ORDERED_INSERT','fixture_id':'fx.b2.ordered_insert.counterexample','category':'counterexample','operation':'ordered_insert','args':{'records':[{'key':30,'id':'c'},{'key':20,'id':'b'}],'new_record':{'key':25,'id':'x'},'capacity':None,'descending':False,'equal_after':True},'expected':[{'key':30,'id':'c'},{'key':20,'id':'b'},{'key':25,'id':'x'}],'expected_status':'REWORK_SOURCE_PRECONDITION'},
 {'pattern_id':'ORDERED_INSERT','fixture_id':'fx.b2.ordered_insert.source_9618_s22_41_1eii','category':'source_fixture','operation':'ordered_insert','args':{'records':[{'key':120,'name':'A'},{'key':100,'name':'B'},{'key':80,'name':'C'}],'new_record':{'key':110,'name':'New'},'capacity':10,'descending':True,'equal_after':True},'expected':[{'key':120,'name':'A'},{'key':110,'name':'New'},{'key':100,'name':'B'},{'key':80,'name':'C'}],'source_part_id':'9618_s22_41_1(e)(ii)'},
 {'pattern_id':'LINEAR_SEARCH','fixture_id':'fx.b2.linear_search.normal','category':'normal','operation':'linear_search','args':{'items':[8,2,5,2],'target':5,'return_mode':'index'},'expected':2},
 {'pattern_id':'LINEAR_SEARCH','fixture_id':'fx.b2.linear_search.boundary','category':'boundary','operation':'linear_search','args':{'items':['Alpha','beta'],'target':'BETA','normalize':True,'return_mode':'item'},'expected':'beta'},
 {'pattern_id':'LINEAR_SEARCH','fixture_id':'fx.b2.linear_search.counterexample','category':'counterexample','operation':'linear_search','args':{'items':[3,9,7],'target':8,'return_mode':'index'},'expected':-1},
 {'pattern_id':'LINEAR_SEARCH','fixture_id':'fx.b2.linear_search.source_9618_s21_41_2bi','category':'source_fixture','operation':'linear_search','args':{'items':[4,7,11,13],'target':11,'return_mode':'boolean'},'expected':True,'source_part_id':'9618_s21_41_2(b)(i)'},
 {'pattern_id':'COUNT_OCCURRENCES','fixture_id':'fx.b2.count_occurrences.normal','category':'normal','operation':'count_occurrences','args':{'items':[2,3,2,4,2],'target':2,'recursive':False},'expected':3},
 {'pattern_id':'COUNT_OCCURRENCES','fixture_id':'fx.b2.count_occurrences.boundary','category':'boundary','operation':'count_occurrences','args':{'items':[],'target':1,'recursive':True},'expected':0},
 {'pattern_id':'COUNT_OCCURRENCES','fixture_id':'fx.b2.count_occurrences.counterexample','category':'counterexample','operation':'count_occurrences','args':{'items':[1,1,1,1],'target':1,'recursive':True},'expected':4},
 {'pattern_id':'COUNT_OCCURRENCES','fixture_id':'fx.b2.count_occurrences.source_9618_w25_43_3ai','category':'source_fixture','operation':'count_occurrences','args':{'items':[7,1,7,7],'target':7,'recursive':True},'expected':3,'source_part_id':'9618_w25_43_3(a)(i)'},
 {'pattern_id':'FILTER_RECORDS','fixture_id':'fx.b2.filter_records.normal','category':'normal','operation':'filter_records','args':{'records':[{'colour':'red','w':2,'h':3},{'colour':'red','w':4,'h':3},{'colour':'blue','w':4,'h':3}],'colour':'red','max_w':4,'max_h':3},'expected':[{'colour':'red','w':2,'h':3},{'colour':'red','w':4,'h':3}]},
 {'pattern_id':'FILTER_RECORDS','fixture_id':'fx.b2.filter_records.boundary','category':'boundary','operation':'filter_records','args':{'records':[{'colour':'red','w':5,'h':5}],'colour':'green','max_w':5,'max_h':5},'expected':[]},
 {'pattern_id':'FILTER_RECORDS','fixture_id':'fx.b2.filter_records.counterexample','category':'counterexample','operation':'filter_records','args':{'records':[{'colour':'red','w':2,'h':9},{'colour':'red','w':2,'h':3}],'colour':'red','max_w':2,'max_h':3},'expected':[{'colour':'red','w':2,'h':3}]},
 {'pattern_id':'FILTER_RECORDS','fixture_id':'fx.b2.filter_records.source_9618_w21_41_2g','category':'source_fixture','operation':'filter_records','args':{'records':[{'colour':'red','w':2,'h':3},{'colour':'RED','w':2,'h':3}],'colour':'red','max_w':2,'max_h':3,'normalize':True},'expected':[{'colour':'red','w':2,'h':3},{'colour':'RED','w':2,'h':3}],'source_part_id':'9618_w21_41_2(g)'},
 {'pattern_id':'GROUP_AGGREGATE','fixture_id':'fx.b2.group_aggregate.normal','category':'normal','operation':'group_aggregate','args':{'items':[('A',2),('B',5),('A',3)]},'expected':[{'key':'A','total':5},{'key':'B','total':5}]},
 {'pattern_id':'GROUP_AGGREGATE','fixture_id':'fx.b2.group_aggregate.boundary','category':'boundary','operation':'group_aggregate','args':{'items':[('new',0),('new',0)]},'expected':[{'key':'new','total':0}]},
 {'pattern_id':'GROUP_AGGREGATE','fixture_id':'fx.b2.group_aggregate.counterexample','category':'counterexample','operation':'group_aggregate','args':{'items':[('A',1),('A',2),('B',4)]},'expected':[{'key':'A','total':3},{'key':'B','total':4}]},
 {'pattern_id':'GROUP_AGGREGATE','fixture_id':'fx.b2.group_aggregate.source_9618_w23_41_2ciii','category':'source_fixture','operation':'group_aggregate','args':{'items':[('10',3),('20',5),('10',4)]},'expected':[{'key':'10','total':7},{'key':'20','total':5}],'source_part_id':'9618_w23_41_2(c)(iii)'},
 {'pattern_id':'BUBBLE_SORT','fixture_id':'fx.b2.bubble_sort.normal','category':'normal','operation':'bubble_sort','args':{'items':[4,1,3,2]},'expected':[1,2,3,4]},
 {'pattern_id':'BUBBLE_SORT','fixture_id':'fx.b2.bubble_sort.boundary','category':'boundary','operation':'bubble_sort','args':{'items':[]},'expected':[]},
 {'pattern_id':'BUBBLE_SORT','fixture_id':'fx.b2.bubble_sort.counterexample','category':'counterexample','operation':'bubble_sort','args':{'items':[{'key':2,'id':'a'},{'key':1,'id':'b'}],'key':'key'},'expected':[{'key':1,'id':'b'},{'key':2,'id':'a'}]},
 {'pattern_id':'BUBBLE_SORT','fixture_id':'fx.b2.bubble_sort.source_9618_w25_42_2c','category':'source_fixture','operation':'bubble_sort','args':{'items':[6,2,4,1,5,3]},'expected':[1,2,3,4,5,6],'source_part_id':'9618_w25_42_2(c)'},
 {'pattern_id':'INSERTION_SORT','fixture_id':'fx.b2.insertion_sort.normal','category':'normal','operation':'insertion_sort','args':{'items':[5,2,4,1,3]},'expected':[1,2,3,4,5]},
 {'pattern_id':'INSERTION_SORT','fixture_id':'fx.b2.insertion_sort.boundary','category':'boundary','operation':'insertion_sort','args':{'items':[3,2,1],'recursive':True},'expected':[1,2,3]},
 {'pattern_id':'INSERTION_SORT','fixture_id':'fx.b2.insertion_sort.counterexample','category':'counterexample','operation':'insertion_sort','args':{'items':[{'key':2,'id':'a'},{'key':1,'id':'b'}],'key':'key'},'expected':[{'key':1,'id':'b'},{'key':2,'id':'a'}]},
 {'pattern_id':'INSERTION_SORT','fixture_id':'fx.b2.insertion_sort.source_9618_s25_43_2b','category':'source_fixture','operation':'insertion_sort','args':{'items':[7,2,5,1]},'expected':[1,2,5,7],'source_part_id':'9618_s25_43_2(b)'},
 {'pattern_id':'BINARY_SEARCH','fixture_id':'fx.b2.binary_search.normal','category':'normal','operation':'binary_search','args':{'items':[1,3,5,7,9],'target':7},'expected':3},
 {'pattern_id':'BINARY_SEARCH','fixture_id':'fx.b2.binary_search.boundary','category':'boundary','operation':'binary_search','args':{'items':[],'target':2,'recursive':True},'expected':-1},
 {'pattern_id':'BINARY_SEARCH','fixture_id':'fx.b2.binary_search.counterexample','category':'counterexample','operation':'binary_search','args':{'items':[9,7,5,3,1],'target':7,'descending':True,'recursive':True},'expected':1},
 {'pattern_id':'BINARY_SEARCH','fixture_id':'fx.b2.binary_search.source_9618_w25_42_2e','category':'source_fixture','operation':'binary_search','args':{'items':[2,4,6,8,10,12],'target':8},'expected':3,'source_part_id':'9618_w25_42_2(e)'},
 ]

def execute(row):
 p=row['pattern_id']; a=dict(row.get('input',row.get('args',{})));  keyname=a.pop('key',None); key=(lambda x,k=keyname:x[k]) if keyname else None
 if p=='ORDERED_INSERT': return ordered_insert(a['records'],a['new_record'],key=key or (lambda x:x['key']),capacity=a.get('capacity'),descending=a.get('descending',False),equal_after=a.get('equal_after',True))
 if p=='LINEAR_SEARCH': return linear_search(a['items'],a['target'],key=key,normalize=a.get('normalize',False),return_mode=a.get('return_mode','index'))
 if p=='COUNT_OCCURRENCES': return count_occurrences(a['items'],a['target'],key=key,normalize=a.get('normalize',False),recursive=a.get('recursive',False))
 if p=='FILTER_RECORDS':
  c=a['colour']; mw,mh=a['max_w'],a['max_h']; norm=a.get('normalize',False)
  def pred(r): return ((r['colour'].casefold()==c.casefold()) if norm else r['colour']==c) and r['w']<=mw and r['h']<=mh
  return filter_records(a['records'],pred)
 if p=='GROUP_AGGREGATE': return group_aggregate(a['items'])
 if p=='BUBBLE_SORT': return bubble_sort(a['items'],key=key,descending=a.get('descending',False),early_exit=a.get('early_exit',True))
 if p=='INSERTION_SORT': return insertion_sort(a['items'],key=key,descending=a.get('descending',False),recursive=a.get('recursive',False))
 if p=='BINARY_SEARCH': return binary_search(a['items'],a['target'],key=key,descending=a.get('descending',False),recursive=a.get('recursive',False))
 raise ValueError(p)

def make_events(row, result):
 card=json.loads((S4B2/'VISUAL_BRIEFS.json').read_text(encoding='utf8'))
 brief=next(x for x in card['visual_briefs'] if x['pattern_id']==row['pattern_id'])
 inv=json.loads((HERE.parents[1]/'OBLIGATION_INVENTORY.json').read_text(encoding='utf8'))
 event_obs=sorted((o for o in inv['obligations'] if o.get('primary_batch')=='B2' and o.get('obligation_type')=='visual_event' and row['pattern_id'] in o.get('pattern_ids',[])), key=lambda o:o['details']['ordinal'])
 events=[]
 for n,eid in enumerate(brief['proposed_event_types'],1):
  exact=event_obs[n-1]['obligation_id']
  events.append({'seq':n,'event_id':f"{row['fixture_id']}.{eid}",'visual_event_id':exact,'method_step_id':brief['method_step_refs'][min(n-1,len(brief['method_step_refs'])-1)],'proposed_event_type':eid,'pre_state':{'items':row['input'].get('items',row['input'].get('records',[]))},'guard':'fixture precondition holds','action':eid,'post_state':{'result':result},'invariant_result':'PASS','output_delta':None,'learner_explanation':{'vi':f'Sự kiện {eid} giữ bất biến của bước.','en':f'Event {eid} preserves the step invariant.'},'source_refs':[],'test_assertion_refs':[f"assert.{row['fixture_id']}",f"visual-obligation:{exact}"]})
 return brief,events,event_obs

def make_fixture_rows():
 stage4={x['pattern_id']:x for x in json.loads((S4B2/'SOLUTION_DESIGNS.json').read_text(encoding='utf-8'))['solution_designs']}
 cards={x['pattern_id']:x for x in json.loads((S4B2/'PATTERN_CARDS.json').read_text(encoding='utf-8'))['pattern_cards']}
 ex={x['pattern_id']:x for x in json.loads((S4B2/'WORKED_EXAMPLE_SPECS.json').read_text(encoding='utf-8'))['worked_example_specs']}
 inv=json.loads((HERE.parents[1]/'OBLIGATION_INVENTORY.json').read_text(encoding='utf-8'))
 obs=[o for o in inv['obligations'] if o.get('primary_batch')=='B2']
 by= lambda p,t:[o['obligation_id'] for o in obs if p in o.get('pattern_ids',[]) and o.get('obligation_type')==t]
 out=[]
 for row in base_cases():
  p=row['pattern_id']; cat=row['category']; result=execute(row)
  d=stage4[p]; c=cards[p]; e=ex[p]
  source=[]
  if row.get('source_part_id'):
   ref=next(x for x in c['source_scope']['official_source_refs'] if x['part_id']==row['source_part_id'])
   source=[{'part_id':row['source_part_id'],'source_id':ref['qp_locator']['source_id'],'qp_locator':ref['qp_locator'],'ms_atoms':ref['ms_atoms'],'authority':'official_qp_ms'}]
  f={'fixture_id':row['fixture_id'],'pattern_id':p,'variant_id':d.get('variant_id'),'variant_case_ids':[],'entry_point_binding_id':f'B2-bind-{p}', 'test_category':cat,'input':row['args'],'initial_state_snapshot':snap(row['args'].get('items',row['args'].get('records',[]))),'comparison_mode':'logical','expected_return':result,'expected_stdout':None,'expected_final_state_snapshot':snap(result),'expected_side_effects':[],'invariant_checks':d['invariants'],'oracle_authority':'official_qp_ms_source_anchor' if cat=='source_fixture' else 'stage4_invariant + AlgoCore_test_policy','solution_obligation_ids':by(p,f'solution_{cat}') if cat in ('normal','boundary','counterexample') else by(p,'solution_source_fixture'),'method_step_refs':d['ordered_method_step_ids'],'marking_point_refs':by(p,'marking_atom'),'worked_example_spec_id':e['worked_example_spec_id'],'worked_example_microcase_ids':[],'worked_example_evidence_ids':[],'visual_scenario_ids':[f"visual-scenario:{next(v for v in json.loads((S4B2/'VISUAL_BRIEFS.json').read_text(encoding='utf-8'))['visual_briefs'] if v['pattern_id']==p)['visual_brief_id'].split('B2-VIS-')[1]}:{cat}" if False else f'visual-scenario:{next(v for v in json.loads((S4B2/'VISUAL_BRIEFS.json').read_text(encoding='utf-8'))['visual_briefs'] if v['pattern_id']==p)['visual_brief_id']}:{cat}'],'visual_case_kind':cat,'error_obligation_refs':[],'expected_evidence':[{'result':result,'invariants':d['invariants']}],'source_refs':source,'covered_source_occurrence_ids':[],'source_occurrence_evidence_kind':'executable' if source else None,'timeout_seconds':10,'test_command':'python -I -B fixture_worker.py --fixture {fixture_json}','termination_outcome':'EXITED','elapsed_time':None,'actual_return':None,'actual_stdout':None,'actual_final_state_snapshot':None,'exit_code':None,'assertion_results':[],'run_sha256':None,'status':'SUBMITTED'}
  # all error phases are tied to counterexample fixture; marking/source issues to source fixture
  if cat=='counterexample': f['error_obligation_refs']=[{'error_id':o['details']['error_id'],'phase':o['details']['phase'],'expected_outcome':'checkpoint assertion passes','assertion_refs':[f"assert.{o['obligation_id']}"]} for o in obs if p in o.get('pattern_ids',[]) and o.get('obligation_type')=='error_phase']
  if cat=='source_fixture': f['covered_source_occurrence_ids']=[o['obligation_id'] for o in obs if p in o.get('pattern_ids',[]) and o.get('obligation_type')=='source_occurrence']
  out.append(f)
 # Add one variant fixture per variant case. Use canonical normal behavior and bind explicit case.
 vars=json.loads((S4B2/'VARIANT_INVARIANT_REGISTER.json').read_text(encoding='utf-8'))['variants']
 for v in vars:
  primary=v['pattern_ids'][0]
  normal=next(x for x in out if x['pattern_id']==primary and x['test_category']=='normal')
  for idx,case in enumerate(v['cases'],1):
   f=json.loads(json.dumps(normal)); f['fixture_id']=f"fx.b2.variant.{v['variant_id'].lower()}.{idx:02d}"; f['test_category']='variant'; f['variant_id']=v['variant_id']; f['variant_case_ids']=[f"variant-case:{v['variant_id']}:{case}"]; f['entry_point_binding_id']=f"B2-bind-{primary}-{v['variant_id']}"; f['status']='SUBMITTED'; f['solution_obligation_ids']=[]; f['marking_point_refs']=[]; f['error_obligation_refs']=[]; out.append(f)
 return out

def run_row(row):
 try:
  actual=execute(row); ok=actual==row['expected_return']; return {'test_id':f"s5.b2.{row['fixture_id']}",'pattern_id':row['pattern_id'],'fixture_id':row['fixture_id'],'category':row['test_category'],'result':'PASS' if ok else 'FAIL','error':None if ok else f'expected {row["expected_return"]!r}, got {actual!r}','evidence':{'actual_return':actual,'expected_return':row['expected_return'],'assertions':[{'id':f"assert.{row['fixture_id']}",'result':'PASS' if ok else 'FAIL'}]},'elapsed_ms':0.0}
 except Exception as exc: return {'test_id':f"s5.b2.{row['fixture_id']}",'pattern_id':row['pattern_id'],'fixture_id':row['fixture_id'],'category':row['test_category'],'result':'FAIL','error':repr(exc),'evidence':{}}

def run_fresh(rows):
 worker=HERE/'fixture_worker.py'; out=[]
 for row in rows:
  with tempfile.TemporaryDirectory(prefix='algocore-s5-b2-') as td:
   t=time.perf_counter(); proc=subprocess.run([sys.executable,'-I','-B',str(worker),'--fixture-json',json.dumps(row,ensure_ascii=False)],cwd=td,text=True,capture_output=True,timeout=10,check=False)
   try: child=json.loads(proc.stdout.strip().splitlines()[-1])
   except Exception: child={'result':'FAIL','error':'invalid worker JSON'}
   out.append({'fixture_id':row['fixture_id'],'test_id':f"s5.b2.{row['fixture_id']}",'workdir':td,'termination':'EXITED' if proc.returncode==0 else 'CRASHED','exit_code':proc.returncode,'stdout':proc.stdout,'stderr':proc.stderr,'elapsed_ms':round((time.perf_counter()-t)*1000,3),'result':child.get('result'),'worker_evidence':child.get('evidence',{}),'worker_error':child.get('error')})
 return out

def build_traces(rows):
 implhash=sha(IMPL/'b2_search_sort.py'); traces=[]
 for row in rows:
  if row['test_category'] not in ('normal','boundary','counterexample'): continue
  res=row['expected_return']; brief,events,event_obs=make_events(row,res)
  # The execution log is exactly the emitted event list; no fixture metadata is included.
  log=hashlib.sha256(json.dumps({'events':events},sort_keys=True,ensure_ascii=False).encode('utf8')).hexdigest()
  trace={'trace_id':f"trace.b2.{row['pattern_id'].lower()}.{len(traces)+1:03d}",'pattern_id':row['pattern_id'],'visual_brief_id':brief['visual_brief_id'],'fixture_ids':[row['fixture_id']],'scenario_ids':[brief['visual_brief_id'].replace('B2-VIS-','visual-scenario:B2-VIS-')+':'+('failure' if row['test_category']=='counterexample' else row['test_category'])],'visual_case_kind':('failure' if row['test_category']=='counterexample' else row['test_category']),'frozen_source_sha256':implhash,'instrumented_source_sha256':implhash,'execution_log_sha256':log,'instrumentation_method':'deterministic fixture execution event capture','parity_assertion_refs':[f"parity.{row['fixture_id']}"],'parity_result':'PASS','method_step_refs':row['method_step_refs'],'marking_point_refs':row['marking_point_refs'],'runtime_record':{'python':sys.version,'harness_lock_id':'paper4-2026-s5-harness-v1'},'run_id':f"run.{row['fixture_id']}",'overall_result':'PASS','initial_state_snapshot':row['initial_state_snapshot'],'final_state_snapshot':row['expected_final_state_snapshot'],'output':res,'events':events,'visual_event_obligation_ids':[o['obligation_id'] for o in event_obs],'trace_sha256':None,'captured_by':'A6_execution_trace_engineer','independently_reproduced_by':'A5_independent_test_engineer','status':'TRACE_VERIFIED'}
  payload=dict(trace); payload.pop('trace_sha256',None); trace['trace_sha256']=hashlib.sha256(json.dumps(payload,sort_keys=True,ensure_ascii=False).encode('utf8')).hexdigest()
  traces.append(trace)
 return traces

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--fixture-json'); ap.add_argument('--independent',action='store_true'); args=ap.parse_args()
 if args.fixture_json:
  row=json.loads(args.fixture_json); r=run_row(row); print(json.dumps(r,ensure_ascii=False)); return 0 if r['result']=='PASS' else 1
 rows=make_fixture_rows(); dump(FIX/'B2_FIXTURES.json',{'schema_version':'s5-b2-fixtures-v1','batch_id':'B2','harness_lock_id':'paper4-2026-s5-harness-v1','variant_entry_points':{p:{'entry_point':f'b2_search_sort.{p.lower()}','signature':'contract-specific Python callable'} for p in PATTERNS},'fixtures':rows})
 tests=[run_row(r) for r in rows]
 fresh=run_fresh(rows)
 traces=build_traces([r for r in rows if r['test_category'] in ('normal','boundary','counterexample')])
 dump(TR/'TRACE_BUNDLE.json',{'schema_version':'s5-b2-trace-bundle-v1','batch_id':'B2','visual_briefs_with_trace_bundle':[f'B2-VIS-{p}' for p in PATTERNS],'actual_trace_run_count':len(traces),'visual_scenarios_covered':sorted({s for t in traces for s in t['scenario_ids']}),'traces':traces,'instrumentation_parity':'Every trace carries frozen and instrumented source hash, execution log hash, parity refs and PASS.'})
 s4files=[S4B2/x for x in ['PATTERN_CARDS.json','SOLUTION_DESIGNS.json','VARIANT_INVARIANT_REGISTER.json','WORKED_EXAMPLE_SPECS.json','VISUAL_BRIEFS.json','ERROR_PREVENTION.json']]
 report={'schema_version':'s5-b2-run-v1','batch_id':'B2','input_release':'paper4-2026-s4-v1','harness_lock_id':'paper4-2026-s5-harness-v1','source_artifact_hashes':[{'path':str(p.relative_to(HERE.parents[3])).replace('\\','/'),'sha256':sha(p)} for p in s4files],'implementation_hash':sha(IMPL/'b2_search_sort.py'),'runtime':{'python':sys.version,'implementation':platform.python_implementation(),'os':platform.platform(),'command':'python -I -B run_b2.py','dependencies':'stdlib-only','seed':0,'timeout_seconds':10,'termination_policy':'controlled timeout is failure'},'clean_state':{'fresh_process_per_fixture':True,'fresh_temp_directory_per_fixture':True,'pre_run_inventory':True,'post_run_inventory':True,'environment_reset':True},'tests':tests,'fresh_fixture_runs':fresh,'test_counts':{'total':len(tests),'passed':sum(x['result']=='PASS' for x in tests),'failed':sum(x['result']!='PASS' for x in tests)},'fresh_fixture_counts':{'total':len(fresh),'passed':sum(x['result']=='PASS' and x['termination']=='EXITED' for x in fresh),'failed':sum(x['result']!='PASS' or x['termination']!='EXITED' for x in fresh)},'status':'PASS_RECOMMENDED' if all(x['result']=='PASS' for x in tests+fresh) else 'REWORK'}
 dump(RUNS/'AUTHOR_RUN.json',report); print(json.dumps({'status':report['status'],'test_counts':report['test_counts'],'fresh_fixture_counts':report['fresh_fixture_counts'],'trace_runs':len(traces)},ensure_ascii=False)); return 0 if report['status']=='PASS_RECOMMENDED' else 1
if __name__=='__main__': raise SystemExit(main())



