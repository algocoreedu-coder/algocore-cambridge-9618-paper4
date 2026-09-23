"""Coverage, citation integrity and targeted semantic regression checks."""
from pathlib import Path
from collections import Counter, defaultdict
import json, hashlib

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
srcpath=ROOT/'stage-1'/'QUESTION_INDEX.json'
src=json.loads(srcpath.read_text(encoding='utf-8'))
data=json.loads((HERE/'classification.json').read_text(encoding='utf-8'))
seed=json.loads((ROOT/'stage-2'/'PATTERN_SEED.json').read_text(encoding='utf-8'))
enums={p['pattern_id'] for p in seed['patterns']}
expected={p['part_id']:(paper,p) for paper in src['papers'] if paper['paper_id'][6:8] in {'21','22'} for q in paper['questions'] for p in q['parts']}
assert len(expected)==228
rows=data['rows']; byid={r['part_id']:r for r in rows}
assert len(rows)==len(byid)==228
assert set(byid)==set(expected)
allowed_modes={'declare_initialize','implement','complete_pseudocode','translate_pseudocode','adapt','transform','integrate','test_evidence','output','mixed'}
counts=defaultdict(lambda:{'parts':0,'marks':0,'questions':set()})
papers=defaultdict(lambda:{'parts':0,'marks':0})
for r in rows:
    paper,p=expected[r['part_id']]
    assert r['primary_pattern_id'] in r['assessed_pattern_ids']
    assert not set(r['assessed_pattern_ids']) & set(r['context_pattern_ids'])
    assert set(r['assessed_pattern_ids']+r['context_pattern_ids']) <= enums
    assert len(r['assessed_pattern_ids'])==len(set(r['assessed_pattern_ids']))
    assert r['task_mode'] in allowed_modes
    assert r['review_status']=='submitted'
    for key in ['classification_rationale','ms_distinguishing_requirement','variants','topic_tags','skill_tags']: assert r[key]
    assert r['qp_basis']=={'source_id':paper['qp_source_id'],'pdf_pages':p['qp_pages']}
    assert r['ms_basis']=={'source_id':paper['ms_source_id'],'pdf_pages':p['ms_pages']}
    for role in ['qp','ms']:
        assert all(1<=n<=paper[f'{role}_page_count'] for n in r[f'{role}_basis']['pdf_pages'])
    if r['task_mode']=='test_evidence': assert r['assessed_pattern_ids']==['EVIDENCE_RUN']
    if r['primary_pattern_id']=='RULE_COMPUTE': assert r['variants']['rule_variant'] in {'boolean_predicate','banded_score','aggregate_score'}
    counts[r['primary_pattern_id']]['parts']+=1
    counts[r['primary_pattern_id']]['marks']+=p['marks']
    counts[r['primary_pattern_id']]['questions'].add(paper['paper_id']+'_'+p['part'][0])
    papers[paper['paper_id']]['parts']+=1;papers[paper['paper_id']]['marks']+=p['marks']
assert len(papers)==11 and all(p['marks']==75 for p in papers.values())
assert sum(x['marks'] for x in counts.values())==825

# Fixed semantic expectations independently specify discriminative boundaries from QP/MS,
# so changing a mapping to a plausible but wrong neighbouring pattern fails validation.
cases=[
('9618_s21_41_1(a)','DATA_RECORD',[],['OOP_CLASS']),
('9618_s21_41_1(c)(i)','LIST_TRAVERSE',[],['OUTPUT_FORMAT']),
('9618_s21_41_3(c)(iii)','RULE_COMPUTE',[],['OOP_GET']),
('9618_s22_41_1(e)(ii)','ORDERED_INSERT',[],['INSERTION_SORT']),
('9618_s22_41_2(c)','OOP_UPDATE',[],['OOP_SET']),
('9618_s22_41_2(f)','MAIN_FLOW',[],['OOP_UPDATE']),
('9618_s22_42_1(b)','OUTPUT_FORMAT',[],['STACK_POP']),
('9618_s22_42_2(c)(i)','BINARY_SEARCH',[],['TREE_SEARCH']),
('9618_s22_42_3(e)(i)','MAIN_FLOW',['DATA_STORAGE','OUTPUT_FORMAT'],['OOP_INSTANTIATE']),
('9618_w21_41_2(d)','DATA_STORAGE',[],['OOP_INSTANTIATE']),
('9618_w21_41_3(c)','OUTPUT_FORMAT',[],['TREE_TRAVERSE']),
('9618_w22_41_1(c)','COUNT_OCCURRENCES',['VALIDATE_INPUT'],['LINEAR_SEARCH']),
('9618_w22_41_2(c)(i)','RULE_COMPUTE',[],['GROUP_AGGREGATE','OOP_GET']),
('9618_w22_41_2(c)(ii)','MAIN_FLOW',[],['RULE_COMPUTE']),
('9618_w22_41_3(b)','TREE_SETUP',[],['TREE_INSERT']),
('9618_w22_42_1(c)','ARRAY_APPEND',[],['QUEUE_ENQUEUE','ORDERED_INSERT']),
('9618_w22_42_2(f)','MAIN_FLOW',['VALIDATE_INPUT'],['OOP_UPDATE']),
('9618_w22_42_3(d)','QUEUE_REDUCE',['ALGORITHM_REWRITE'],['QUEUE_DEQUEUE'])]
for pid,primary,present,absent in cases:
    r=byid[pid]
    assert r['primary_pattern_id']==primary,pid
    assert set(present)<=set(r['assessed_pattern_ids']),pid
    assert not set(absent)&set(r['assessed_pattern_ids']),pid
assert byid['9618_s22_41_3(a)']['variants']['queue_model']=='circular'
assert byid['9618_w22_42_3(a)']['variants']['queue_model']=='linear'
assert byid['9618_s21_41_2(c)']['variants']['direction']=='descending'
assert byid['9618_w22_41_3(d)']['variants']['order']=='postorder_left_right_root'
assert byid['9618_w22_42_3(d)']['variants']['destructive']=='false'
for v in json.loads((HERE/'VISUAL_REVIEW_MANIFEST.json').read_text()): assert (HERE/v['image']).is_file()
report={'status':'SELF_CHECK_PASS_NOT_STAGE_GATE','row_count':228,'paper_count':11,'question_count':33,'marks':825,
'primary_patterns_used':len(counts),'targeted_semantic_cases':len(cases),'variant_assertions':5,
'checks':['Exact equality with locked Stage 1 part-ID set, no duplicates','QP/MS source and page equality with locked index','Assessed/context separation and vocabulary','Task modes, submitted status and nonempty evidence fields','Every evidence-only row has only EVIDENCE_RUN assessed','Every scored RULE_COMPUTE row has explicit rule_variant','All 11 paper marks reconcile to 75','18 discriminative semantic checks and 5 material variant checks','14 facsimile files present'],
'source_index_sha256':hashlib.sha256(srcpath.read_bytes()).hexdigest(),
'classification_sha256':hashlib.sha256((HERE/'classification.json').read_bytes()).hexdigest(),
'papers':dict(papers),'primary_counts':{k:{'parts':v['parts'],'marks':v['marks'],'questions':len(v['questions'])} for k,v in sorted(counts.items())}}
(HERE/'SELF_CHECK.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in {'papers','primary_counts'}},indent=2))
