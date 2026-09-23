import json,re,hashlib
from pathlib import Path
O=Path(__file__).parent
index=json.loads((O/'index.json').read_text(encoding='utf-8'))
raw=json.loads((O/'prepared.json').read_text(encoding='utf-8'))
checks=[]
for p in index['papers']:
 rows=[r for q in p['questions'] for r in q['parts']]
 ids=[r['part'] for r in rows]
 parents=[r['part'] for q in p['questions'] for r in q['unscored_structure']]
 assert len(ids)==len(set(ids))
 assert sum(r['qp_marks'] for r in rows)==sum(r['ms_marks'] for r in rows)==75
 for r in rows:
  assert r['qp_pages'] and r['ms_pages'] and r['marks']==r['qp_marks']==r['ms_marks']
  assert all(1<=n<=p['qp_page_count'] for n in r['qp_pages'])
  assert all(1<=n<=p['ms_page_count'] for n in r['ms_pages'])
  assert all((n in ids and ids.index(n)<ids.index(r['part'])) or (n in parents and any(x.startswith(n+'(') and ids.index(x)<ids.index(r['part']) for x in ids)) for n in r['dependency_refs'])
  assert r['part'] in r['evidence_requirement']
 for im in p['review']['rendered_pages_checked']:
  assert (O.parents[1]/im['image']).exists()
 checks.append({'paper_id':p['paper_id'],'parts':len(rows),'qp_total':75,'ms_total':75,'question_totals':{str(q['question_number']):sum(r['marks'] for r in q['parts']) for q in p['questions']},'unique_ids':True,'locators_in_bounds':True,'evidence_labels_match':True,'dependencies_resolve_and_precede':True})
equivalence=[]
for p in raw:
 if not p['paper_id'].endswith('41'):continue
 other=next(x for x in raw if x['paper_id']==p['paper_id'][:-1]+'3')
 for kind in ['qp','ms']:
  start=1 if kind=='qp' else 0
  norm=lambda s:re.sub(r'9618/4[13]','9618/4X',s)
  a=list(map(norm,p[kind+'_pages_text'][start:]));b=list(map(norm,other[kind+'_pages_text'][start:]))
  assert a==b,(p['paper_id'],kind)
  equivalence.append({'source_a':p[kind+'_source_id'],'source_b':other[kind+'_source_id'],'pages_compared':list(range(start+1,len(a)+start+1)),'normalisation':'paper number header only: 9618/41 and 9618/43 -> 9618/4X','equal':True,'normalised_content_sha256':hashlib.sha256('\n'.join(a).encode()).hexdigest()})
(O/'CHECKS.json').write_text(json.dumps({'scope':'mechanical checks complement manual reading and rendered-page inspection; do not establish solution correctness','papers':checks,'variant_equivalence':equivalence,'total_parts':sum(x['parts'] for x in checks),'total_marks':900},indent=2),encoding='utf-8')
print('PASS mechanical self-check:',len(checks),'papers',sum(x['parts'] for x in checks),'parts',len(equivalence),'source equivalence comparisons')
