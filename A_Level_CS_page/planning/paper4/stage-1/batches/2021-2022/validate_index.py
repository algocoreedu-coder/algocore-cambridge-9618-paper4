import json,re,sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf8')
HERE=Path(__file__).parent; EXT=HERE.parents[1]/'extracted'
index=json.loads((HERE/'index.json').read_text(encoding='utf8'))
results=[]
for paper in index['papers']:
    qp=json.loads((EXT/(paper['qp_source_id']+'.json')).read_text(encoding='utf8'))
    ms=json.loads((EXT/(paper['ms_source_id']+'.json')).read_text(encoding='utf8'))
    parts=[r for q in paper['questions'] for r in q['parts']]
    labels={r['part'] for r in parts}
    assert len(labels)==len(parts)
    qpmatches=[]
    for p in qp['pages']:
        qpmatches += [(m[1],int(m[2]),p['pdf_page']) for m in re.finditer(r'into\s+part\s+([123](?:\([a-zivx]+\))+)\s+in\s+the\s+evidence\s+document\.\s*\[(\d+)\]',p['text'],re.S)]
    assert {x[0] for x in qpmatches}==labels
    assert len(qpmatches)==len(parts)
    bylabel={x[0]:x for x in qpmatches}
    for part in parts:
        assert set(part['dependency_refs'])<=labels,(paper['paper_id'],part['part'])
        assert part['part'] not in part['dependency_refs']
        assert part['qp_marks']==part['marks']==part['ms_marks']==bylabel[part['part']][1]
        assert bylabel[part['part']][2] in part['qp_pages']
        assert all(0<n<=qp['page_count'] for n in part['qp_pages'])
        assert all(0<n<=ms['page_count'] for n in part['ms_pages'])
        assert all(part['part'] in ms['pages'][n-1]['text'] for n in part['ms_pages'])
        assert 'Copy and paste' in part['evidence_requirement']
    assert sum(x['marks'] for x in parts)==75
    for e in paper['review']['rendered_pages_checked']:assert (HERE/e['image']).exists()
    # Dependency graph must be acyclic, with explicit local labels.
    graph={r['part']:r['dependency_refs'] for r in parts}
    def visit(label,stack):
        assert label not in stack,(paper['paper_id'],label,stack)
        for d in graph[label]:visit(d,stack+[label])
    for label in labels:visit(label,[])
    results.append({'paper_id':paper['paper_id'],'scored_parts':len(parts),'qp_marks':sum(p[1] for p in qpmatches),'ms_marks':sum(x['ms_marks'] for x in parts),'indexed_marks':sum(x['marks'] for x in parts),'question_subtotals':{str(q['question_number']):sum(p['marks'] for p in q['parts']) for q in paper['questions']},'checks':'labels_unique; complete_qp_evidence_labels; qp_ms_marks_equal; locators_in_range_and_contain_labels; dependencies_resolve_and_acyclic; evidence_present; render_files_exist'})
report={'status':'checks_passed_submission_only','papers':results,'total_papers':len(results),'total_scored_parts':sum(x['scored_parts'] for x in results),'total_marks':sum(x['indexed_marks'] for x in results),'limitations':'Automated consistency checks supplement manual QP/MS and facsimile reading. They do not certify correctness of published example code or exercise Stage5 tests.'}
(HERE/'VALIDATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
