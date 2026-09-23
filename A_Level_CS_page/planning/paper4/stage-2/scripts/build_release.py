"""Join Lead-reviewed manual classifications. No keyword classification or mark splitting."""
from pathlib import Path
import json, hashlib, sys
from collections import Counter
from catalog_metadata import get_metadata

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[1]
S1=ROOT.parent/'stage-1'
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def write(name,obj): (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
index=read(S1/'QUESTION_INDEX.json')
seed=read(ROOT/'PATTERN_SEED.json')['patterns']
meta=get_metadata()
assert set(meta)=={p['pattern_id'] for p in seed}
annotations={}
for batch in ['2021-2022','2023-2024','2025']:
    for a in read(ROOT/'batches'/batch/'classification.json')['rows']:
        assert a['part_id'] not in annotations
        annotations[a['part_id']]={**a,'analyst_batch':batch}

rows=[]; questions=[]; papers=[]
for paper in index['papers']:
    paper_id=paper['paper_id']
    papers.append({k:v for k,v in paper.items() if k!='questions'})
    for question in paper['questions']:
        qid=question['question_id']
        question_rows=[]
        for part in question['parts']:
            a=annotations.pop(part['part_id'])
            assert a['qp_basis']==part['source_links']['qp']
            assert a['ms_basis']==part['source_links']['ms']
            assert a['primary_pattern_id'] in a['assessed_pattern_ids']
            assert not set(a['assessed_pattern_ids'])&set(a['context_pattern_ids'])
            assert set(a['assessed_pattern_ids']+a['context_pattern_ids'])<=set(meta)
            # Narrow core index, not all candidate skills of the pattern.
            core={meta[x]['skill_ids'][0] for x in a['assessed_pattern_ids']}
            core.update(a['variants'].get('directly_assessed_additional_skills',[]))
            r={**a,'paper_id':paper_id,'question_id':qid,'marks':part['marks'],
               'analyst_skill_tags':a['skill_tags'],'skill_tags':sorted(core),
               'topic_families':sorted({meta[x]['topic_family'] for x in a['assessed_pattern_ids']}),
               'source_part':part,
               'dependency_part_ids':[paper_id+'_'+v for v in part['dependency_refs']],
               'review_status':'lead_reviewed',
               'review_evidence':['LEAD_DECISIONS.md',f"batches/{a['analyst_batch']}/REVIEW.md",'evidence/A8_REVIEW.md']}
            rows.append(r);question_rows.append(r)
        questions.append({**{k:v for k,v in question.items() if k!='parts'},'paper_id':paper_id,
            'part_ids':[r['part_id'] for r in question_rows],
            'assessed_pattern_ids':sorted({p for r in question_rows for p in r['assessed_pattern_ids']}),
            'context_pattern_ids':sorted({p for r in question_rows for p in r['context_pattern_ids']}),
            'marks':sum(r['marks'] for r in question_rows)})
assert not annotations
assert len(rows)==672 and len(questions)==87 and sum(r['marks'] for r in rows)==2175
byid={r['part_id']:r for r in rows}
for r in rows:
    resolved=[];parent_refs=[]
    for dependency in r['dependency_part_ids']:
        if dependency in byid: resolved.append(dependency)
        else:
            children=[key for key in byid if key.startswith(dependency+'(')]
            assert children,(r['part_id'],dependency)
            resolved.extend(children);parent_refs.append({'source_parent_ref':dependency,'expanded_scored_children':children})
    r['dependency_part_ids']=list(dict.fromkeys(resolved))
    r['dependency_parent_expansions']=parent_refs
    assert set(r['dependency_part_ids'])<=set(byid)
eq=read(ROOT/'evidence/A2_EQUIVALENCE.json')
group_checks=[]
for groups_key in ['strict_groups','render_corroborated_groups']:
    for g in eq[groups_key]:
        rep=g['representative']
        a=[r for r in rows if r['paper_id']==rep]
        for member in g['members']:
            for r in a:
                other=byid[member+'_'+r['source_part']['part']]
                assert (r['marks'],r['primary_pattern_id'],set(r['assessed_pattern_ids']),set(r['context_pattern_ids']),r['task_mode']) == (other['marks'],other['primary_pattern_id'],set(other['assessed_pattern_ids']),set(other['context_pattern_ids']),other['task_mode']), (r['part_id'],other['part_id'])
        group_checks.append({'view':groups_key,'group_id':g['group_id'],'members':g['members'],'status':'PASS'})

def incidence(selected):
    return {'papers':len({r['paper_id'] for r in selected}),'questions':len({r['question_id'] for r in selected}),
            'parts':len(selected),'whole_part_marks':sum(r['marks'] for r in selected)}
views={}
for name,reps in [('raw_29',[p['paper_id'] for p in papers]),
    ('normalized_text_21',[g['representative'] for g in eq['strict_groups']]),
    ('render_corroborated_23',[g['representative'] for g in eq['render_corroborated_groups']])]:
    selected=[r for r in rows if r['paper_id'] in reps]
    patterns=[]
    for p in seed:
        key=p['pattern_id']
        patterns.append({'pattern_id':key,'primary':incidence([r for r in selected if r['primary_pattern_id']==key]),
            'assessed':incidence([r for r in selected if key in r['assessed_pattern_ids']]),
            'context_only':incidence([r for r in selected if key in r['context_pattern_ids']])})
    assert sum(p['primary']['whole_part_marks'] for p in patterns)==sum(r['marks'] for r in selected)
    assert sum(p['primary']['parts'] for p in patterns)==len(selected)
    views[name]={'denominator':incidence(selected),'representative_papers':reps,'patterns':patterns,
                 'task_mode_counts':dict(sorted(Counter(r['task_mode'] for r in selected).items()))}
assert views['normalized_text_21']['denominator']=={'papers':21,'questions':63,'parts':487,'whole_part_marks':1575}
assert views['render_corroborated_23']['denominator']=={'papers':23,'questions':69,'parts':536,'whole_part_marks':1725}
stats={'schema_version':'1.0','status':'LEAD_REVIEWED',
    'counting_contract':{
        'primary':'One editorial primary per scored part. Its whole marks belong once to that primary, not a Cambridge marking-point allocation.',
        'assessed':'All operations newly assessed within a part. Incidence and whole-part marks overlap between patterns; never sum pattern rows.',
        'context_only':'Invoked, previously provided or tested operations. These are NOT newly implemented/assessed incidence.',
        'union':'To total a selection of assessed patterns, take the distinct union of part_id first, then sum each original mark once.',
        'denominators':'29 published paper identities is primary; 21 normalized-text and 23 render-corroborated representative groups are sensitivity views, not independent exam observations.',
        'limited_evidence':'Flag when assessed in at most two normalized-text groups. This editorial threshold measures corpus support, not syllabus importance or future probability.',
        'prediction':'No future-exam probability, completeness of 2026 syllabus, or frequency beyond this frozen corpus is claimed.'},
    'views':views,'equivalence_evidence':'evidence/A2_EQUIVALENCE.json','group_label_checks':group_checks}
write('PATTERN_STATISTICS.json',stats)

catalog=[]
raw={p['pattern_id']:p for p in views['raw_29']['patterns']}
grouped={p['pattern_id']:p for p in views['normalized_text_21']['patterns']}
for p in seed:
    key=p['pattern_id'];m=meta[key]
    assessed=[r for r in rows if key in r['assessed_pattern_ids']]
    assert assessed,key
    # Examples prioritise distinct group representatives and differing material variants.
    example_rows=[];seen_papers=set()
    for r in assessed:
        if r['paper_id'] in seen_papers:continue
        if r['paper_id'] not in views['normalized_text_21']['representative_papers']:continue
        seen_papers.add(r['paper_id']);example_rows.append(r)
        if len(example_rows)==4:break
    catalog.append({'pattern_id':key,'name_vi':m['name_vi'],'name_en':p['working_title'],
        'recognition_vi':m['recognition_vi'],'boundary_en':p['boundary'],
        'topic_family':m['topic_family'],'candidate_skill_ids':m['skill_ids'],
        'skill_scope':'Candidate skills vary by source part; map skill_tags are a narrow index, analyst_skill_tags and MS basis retain further detail. Neither is a separate scored rubric.',
        'variant_axes_to_preserve':m['variant_axes_to_preserve'],
        'observed_task_modes':sorted({r['task_mode'] for r in assessed}),
        'assessed_part_ids':[r['part_id'] for r in assessed],
        'evidence_examples':[{k:r[k] for k in ['part_id','qp_basis','ms_basis','ms_distinguishing_requirement','variants']} for r in example_rows],
        'raw_counts':raw[key],'normalized_group_counts':grouped[key],
        'evidence_strength':'LIMITED_CORPUS_EVIDENCE' if grouped[key]['assessed']['papers']<=2 else 'MORE_THAN_TWO_CORPUS_GROUPS',
        'status':'OBSERVED_LEAD_REVIEWED'})
write('EXAM_PATTERN_CATALOG.json',{'schema_version':'1.0','scope':{'exam_year':2026,'language':'Python','lesson_languages':['vi','en'],'observed_corpus_years':[2021,2022,2023,2024,2025]},
    'taxonomy_authority':'AlgoCore editorial taxonomy, derived from QP tasks and MS criteria; not an official Cambridge classification.',
    'levels':{'topic':'Broad subject area, not a question type.','skill':'Transferable action such as comparison, pointer update or parsing.','pattern':'Repeatable task boundary with distinctive recognition and required behavior.','variant':'Source-dependent representation, pointer convention, ordering, algorithm form or constraint.','task_mode':'What the candidate must produce: declaration, implementation, completion, translation, adaptation, integration, output or evidence.'},
    'count':len(catalog),'patterns':catalog,'decisions':'LEAD_DECISIONS.md','statistics':'PATTERN_STATISTICS.json'})
write('QUESTION_PATTERN_MAP.json',{'schema_version':'1.0','status':'LEAD_REVIEWED','input_corpus':'paper4-2026-s1-v1',
    'input_sha256':sha(S1/'QUESTION_INDEX.json'),'source_manifest':'../stage-1/SOURCE_MANIFEST.json',
    'fidelity_policy':'../stage-1/EXTRACTION_POLICY.md','source_issues':'../stage-1/SOURCE_ISSUES.json',
    'counts':{'papers':29,'questions':87,'parts':672,'original_marks':2175,'observed_patterns':len(catalog)},
    'papers':papers,'questions':questions,'rows':rows})
write('UNCLASSIFIED_REPORT.json',{'status':'NO_UNCLASSIFIED_ROWS','total_expected':672,'total_classified':672,'missing_part_ids':[],
    'unknown_pattern_ids':[],'unresolved_taxonomy_rows':[],'source_caveats':'Source inconsistencies and missing reports remain in Stage1; classification does not resolve or certify published solutions.',
    'review_findings':'evidence/A8_REVIEW.md','lead_decisions':'LEAD_DECISIONS.md'})

md=['# Hệ thống dạng bài Paper 4 — Stage 2','',
    '58 dạng do Lead xây từ QP và tiêu chí MS trong corpus 2021–2025. Đây là taxonomy biên tập của AlgoCore, không phải danh sách dạng chính thức của Cambridge hoặc cam kết phủ toàn bộ syllabus 2026.','',
    'Mỗi dạng có tên Việt–Anh, dấu hiệu nhận diện, ranh giới, biến thể và ví dụ truy về nguồn. Phần căn cứ giữ tiếng Anh để đối chiếu đề; đây chưa phải hai bản bài học hoàn chỉnh.','',
    'Số đề bên dưới là incidence được đánh giá trực tiếp trên 29 paper; một đề có thể chứa nhiều dạng. Điểm primary là phân bổ biên tập toàn bộ điểm mỗi ý vào đúng một dạng, không phải điểm riêng Cambridge cho từng kỹ năng.','',
    '| ID | Dạng bài | Đề có đánh giá / 29 | Ý primary | Điểm primary | Nhóm có đánh giá / 21 |','|---|---|---:|---:|---:|---:|']
for p in catalog:
    c=p['raw_counts'];md.append(f"| [{p['pattern_id']}](#{p['pattern_id'].lower()}) | {p['name_vi']} | {c['assessed']['papers']} | {c['primary']['parts']} | {c['primary']['whole_part_marks']} | {p['normalized_group_counts']['assessed']['papers']} |")
for p in catalog:
    md += ['',f"## {p['pattern_id']}",'',f"**{p['name_vi']}** — {p['name_en']}",'',p['recognition_vi'],'',f"Ranh giới: {p['boundary_en']}",'',
        'Biến thể phải giữ: '+', '.join(p['variant_axes_to_preserve'])+'.','',
        ('**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.' if p['evidence_strength']=='LIMITED_CORPUS_EVIDENCE' else 'Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.'),'']
    for ex in p['evidence_examples']:
        qp=ex['qp_basis'];ms=ex['ms_basis']
        qpl=f"../stage-1/facsimiles/{qp['source_id']}/p{qp['pdf_pages'][0]:03}.png"
        msl=f"../stage-1/facsimiles/{ms['source_id']}/p{ms['pdf_pages'][0]:03}.png"
        md.append(f"- `{ex['part_id']}` — [QP PDF {','.join(map(str,qp['pdf_pages']))}]({qpl}); [MS PDF {','.join(map(str,ms['pdf_pages']))}]({msl}). {ex['ms_distinguishing_requirement']}")
    md+=['','Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.']
(ROOT/'EXAM_PATTERN_CATALOG.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
sm=['# Thống kê dạng bài và mẫu số','',
    'Thống kê mô tả corpus đã khóa, không dự báo đề 2026. Nguồn tính là 672 `part_id` và số điểm gốc; không cộng các co-tag thành tổng điểm.','',
    '| Cách đếm | Đề / nhóm đại diện | Câu | Ý có điểm | Điểm gốc |','|---|---:|---:|---:|---:|']
for name,v in views.items():
    d=v['denominator'];sm.append(f"| {name} | {d['papers']} | {d['questions']} | {d['parts']} | {d['whole_part_marks']} |")
sm+=['','29 đề là báo cáo chính. Hai cách gom nhóm chỉ là kiểm tra độ nhạy: 21 nhóm giống văn bản thân QP/MS đã chuẩn hóa; 23 nhóm được xác nhận thêm bằng ảnh render. Hai cặp có chữ trong MS khác khi render được tách ở cách đếm 23. Cặp w21/41–42 gần tương đương vẫn tách ở cả hai cách đếm. Xem [bằng chứng A2](evidence/A2_EQUIVALENCE.md).','',
     '`primary` gán mỗi ý đúng một dạng để tổng 2.175 điểm không lặp. `assessed` ghi tất cả thao tác mới được chấm trong ý: số đề, câu, ý và toàn bộ điểm của các ý chứa dạng đó. Các cột assessed chồng lấp, tuyệt đối không cộng theo dạng. `context_only` là thao tác được gọi hoặc kiểm thử, không tính thành cài đặt mới.','',
     'Muốn cộng một nhóm dạng: lấy hợp các `part_id` chứa ít nhất một dạng đã chọn, rồi cộng điểm mỗi ID đúng một lần. Xem [script truy vấn](scripts/query_patterns.py).','',
     'Mỗi dạng có bốn số riêng ở cả ba cách đếm trong [JSON thống kê](PATTERN_STATISTICS.json). Bảng ngắn của 58 dạng nằm trong [catalog](EXAM_PATTERN_CATALOG.md).','',
     'Cờ ít bằng chứng áp dụng khi có đánh giá trực tiếp trong tối đa hai nhóm văn bản. Ngưỡng này do Lead chọn để ưu tiên đối chiếu syllabus ở Stage 3; không có nghĩa dạng ít quan trọng. Tổng điểm primary là cách phân bổ biên tập, không phải tách marking points của Cambridge.']
(ROOT/'PATTERN_STATISTICS.md').write_text('\n'.join(sm)+'\n',encoding='utf-8')
write('evidence/LEAD_MECHANICAL_CHECKS.json',{'status':'PASS','rows':len(rows),'questions':len(questions),'marks':sum(r['marks'] for r in rows),
    'patterns':len(catalog),'exact_source_locator_joins':True,'dependency_links_valid':True,'equivalence_group_label_parity':True,
    'input_index_sha256':sha(S1/'QUESTION_INDEX.json'),'batch_sha256':{b:sha(ROOT/'batches'/b/'classification.json') for b in ['2021-2022','2023-2024','2025']}})
print('BUILT:',len(catalog),'patterns;',len(rows),'parts;',len(questions),'questions; primary marks2175; Lead reviewed')
