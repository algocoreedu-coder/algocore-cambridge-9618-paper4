"""Join reviewed editorial mappings; never infer knowledge mappings by keyword."""
import copy
import hashlib
import json
from collections import Counter
from pathlib import Path
from lead_book_links import get_links as book_links
from lead_objective_links import get_links as objective_links, CONSTRAINT_BLOCKS

ROOT = Path(__file__).resolve().parents[1]
PAPER = ROOT.parent
COURSE = 'ac-9618-p4-2026-python'

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def write(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def md(name, lines):
    (ROOT / name).write_text('\n'.join(lines)+'\n', encoding='utf-8')

def unique(items):
    return list(dict.fromkeys(items))

def table(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')

def layers(nodes, edges):
    remaining=set(nodes); done=set(); result=[]
    while remaining:
        layer=sorted(n for n in remaining if all(a in done for a,b in edges if b==n))
        assert layer, 'Prerequisite cycle: '+str(remaining)
        result.append(layer); done.update(layer);remaining.difference_update(layer)
    return result

def main():
    a1=read(ROOT/'evidence/A1_LESSON_BLUEPRINT.json')
    a2=read(ROOT/'evidence/A2_BOOK_SECTION_INDEX.json')
    a3=read(ROOT/'evidence/A3_OBJECTIVE_INVENTORY.json')
    catalog=read(PAPER/'stage-2/EXAM_PATTERN_CATALOG.json')
    questions=read(PAPER/'stage-2/QUESTION_PATTERN_MAP.json')
    bl=book_links(); ol=objective_links()
    sections={s['section_id']:s for s in a2['sections']}
    objectives={o['objective_id']:o for o in a3['objectives']}
    plans=copy.deepcopy(a1)
    blocks={}; key_by_id={}; lesson_by_block={}
    for lesson in plans['lessons']:
        for block in lesson['blocks']:
            key=lesson['slug']+'/'+block['anchor'].removeprefix('knowledge-')
            blocks[key]=block;key_by_id[block['block_id']]=key
            lesson_by_block[block['block_id']]=lesson['lesson_id']
    assert set(bl)==set(blocks), (set(bl)-set(blocks),set(blocks)-set(bl))
    assert set(ol)=={o for o,v in objectives.items() if v['scope']!='excluded'}
    assert all(set(v['block_keys'])<=blocks.keys() for v in ol.values())
    assert all(set(v['book_section_ids'])<=sections.keys() for v in bl.values())
    constraint_targets={
        'P4-ADM-01':['exam-workflow/evidence-document'],
        'P4-ADM-02':['exam-workflow/source-and-rubric'],
        'P4-ADM-03':['exam-workflow/source-and-rubric'],
        'P4-ADM-04':['testing/source-contract','exam-workflow/evidence-document'],
        'P4-ADM-05':['testing/source-contract','exam-workflow/evidence-document'],
        'P4-ADM-06':['exam-workflow/evidence-document'],
        'P4-ADM-07':['exam-workflow/evidence-document'],
        'P4-ADM-08':['testing/source-contract','random-files/organisation-access'],
        'P4-ADM-09':['exam-workflow/evidence-document'],
        'P4-ADM-10':['testing/capture-provenance','exam-workflow/evidence-document'],
        'P4-ADM-11':['exam-workflow/evidence-document'],
        'P4-ADM-12':['testing/capture-provenance','exam-workflow/evidence-document'],
        'P4-ADM-13':['random-files/organisation-access','exam-workflow/evidence-document'],
        'P4-ADM-14':['procedural-design/decomposition','exam-workflow/source-and-rubric'],
    }
    assert set(constraint_targets)=={c['constraint_id'] for c in a3['assessment_constraints']}
    knowledge=[]
    for key,block in blocks.items():
        objective_ids=[o for o,v in ol.items() if key in v['block_keys']]
        constraints=[c for c,targets in constraint_targets.items() if key in targets]
        assert objective_ids or constraints,key
        refs=[copy.deepcopy(sections[s]) for s in bl[key]['book_section_ids']]
        row={
            'knowledge_id':block['block_id'], 'block_key':key,
            'lesson_id':lesson_by_block[block['block_id']],
            'titles':{'vi':block['knowledge_label_vi'],'en':block['knowledge_label_en']},
            'knowledge_topics':block['knowledge_topics'],
            'objective_ids':objective_ids, 'assessment_constraint_ids':constraints,
            **copy.deepcopy(bl[key]), 'book_locators':refs,
            'source_authority_note':'Book references provide the stated foundation. QP/MS control each exam task; the syllabus controls scope. No book code is certified.',
            'planned_locale_targets':block['planned_locale_targets'],
            'content_status':'PLANNED_NOT_AUTHORED',
        }
        knowledge.append(row)
        block.update({'objective_ids':objective_ids,'assessment_constraint_ids':constraints,
                      'book_section_ids':row['book_section_ids'],'source_mapping_status':'LEAD_MAPPED',
                      'book_relationship':row['book_relationship']})
    kb={k['knowledge_id']:k for k in knowledge}
    pattern_chains=[]
    destinations={d['pattern_id']:d for d in a1['pattern_destinations']}
    for pattern in catalog['patterns']:
        dest=copy.deepcopy(destinations[pattern['pattern_id']])
        assert set(dest['stage2_assessed_part_ids'])==set(pattern['assessed_part_ids'])
        all_blocks=unique(dest['knowledge_block_ids']+dest['secondary_knowledge_block_ids'])
        chain=[]
        for bid in all_blocks:
            k=kb[bid]
            chain.append({'knowledge_id':bid,'lesson_id':k['lesson_id'],
                          'destination_role':'primary' if bid in dest['knowledge_block_ids'] else 'secondary',
                          'objective_ids':k['objective_ids'],'assessment_constraint_ids':k['assessment_constraint_ids'],
                          'book_section_ids':k['book_section_ids'],'book_relationship':k['book_relationship']})
        pattern_chains.append({**dest,'titles':{'vi':pattern['name_vi'],'en':pattern['name_en']},
                               'candidate_skill_ids':pattern['candidate_skill_ids'],
                               'skill_scope':pattern['skill_scope'],
                               'variant_axes_to_preserve':pattern['variant_axes_to_preserve'],
                               'source_examples':pattern['evidence_examples'],
                               'knowledge_chain':chain,
                               'interpretation':'Instructional destinations for this task family. An objective linked to a block is not proof that every historical occurrence assesses that objective. Exact-part objective evidence lives in COVERAGE_MATRIX.'})
    requirement_path=ROOT/'evidence/A1_OBJECTIVE_ASSESSMENT_REQUIREMENTS.json'
    requirements=[]
    if requirement_path.exists():
        obj=read(requirement_path)
        requirements=obj['requirements']
    req_by_obj={r['objective_id']:r for r in requirements}
    coverage=[]
    for source in a3['objectives']:
        row=copy.deepcopy(source); oid=row['objective_id']
        row.pop('prerequisite_objective_ids', None)
        if oid=='SYL-19.1-30':
            row['gap']['recommended_assessment_brief']='Plan a dictionary implemented through the linked-list ADT interface: represent key/value entries and verify lookup, insertion/update and removal with absent/repeated keys. Show delegated ADT calls. Array-only representation does not satisfy the composition check.'
            row['lead_brief_decision']='Default backend aligned with A1 assessment and conditional block dependency BLOCK-DEP-04; the A3 two-stack queue suggestion is not selected (A3-AGG-01).'
        row['objective_id_authority']='AlgoCore editorial decomposition; not official Cambridge objective numbering.'
        if row['scope']=='excluded':
            row.update(knowledge_block_ids=[],lesson_ids=[],book_section_ids=[],assessment_requirement_ids=[],
                       planned_coverage_status='EXCLUDED_WITH_REASON',mapping_rationale_en=row['rationale'])
        else:
            keys=ol[oid]['block_keys']; bids=[blocks[k]['block_id'] for k in keys]
            row.update(knowledge_block_ids=bids,
                       lesson_ids=unique(lesson_by_block[b] for b in bids),
                       book_section_ids=unique(s for b in bids for s in kb[b]['book_section_ids']),
                       assessment_requirement_ids=[req_by_obj[oid]['requirement_id']] if oid in req_by_obj else [],
                       planned_coverage_status='MAPPED_ASSESSMENT_PLANNED' if oid in req_by_obj else 'AWAITING_ASSESSMENT_REQUIREMENT',
                       mapping_rationale_en=ol[oid]['mapping_rationale_en'])
        coverage.append(row)
    constraints=[]
    for source in a3['assessment_constraints']:
        row=copy.deepcopy(source)
        row['knowledge_block_ids']=[blocks[k]['block_id'] for k in constraint_targets[row['constraint_id']]]
        row['planning_status']='MAPPED; instruction text and checks to be authored in later stages'
        constraints.append(row)
    for lesson in plans['lessons']:
        lesson['scope']['objective_mapping_status']='LEAD_MAPPED'
        lesson['objective_ids']=unique(o for b in lesson['blocks'] for o in b['objective_ids'])
        lesson['assessment_requirement_ids']=[r['requirement_id'] for r in requirements if any(b in lesson_by_block and lesson_by_block[b]==lesson['lesson_id'] for b in r['knowledge_block_ids'])]
    plans['status']='LEAD_MAPPED'
    plans['acceptance_authority']='GATE_REVIEW.json; mapping status alone is not a stage approval.'
    plans['assessment_requirements']=requirements
    plans['assessment_requirement_semantics']='107 capability-level check requirements can be combined into the 37 planned assessment destinations. They are not 107 authored exercises. Original assessment requirements carry no official Cambridge marks.'
    plans['source_mapping_authority']='Manual Lead book/objective links with A2/A3 source locators; no keyword-derived joins.'
    plans['cross_lesson_application_links_reference']='PREREQUISITE_MAP.json#conditional_block_dependencies'
    conditional=[]
    conditions=[{'variant':'recursive_binary_search'},{'variant':'recursive_queue_reduction'},
                {'source_part':'9618_w25_43_2(e)','variant':'queue_based_rle'},
                {'backend':'linked_list'},{'backend':'binary_tree'},
                {'representation':'object_backed_tree'},{'address_scheme':'hash_addressed_file'}]
    for i,edge in enumerate(a1['cross_lesson_application_links']):
        conditional.append({'dependency_id':f'BLOCK-DEP-{i+1:02}',
                            'consumer_block_id':edge['from_block_id'],
                            'prerequisite_block_ids':[edge['recommended_before_block_id']]+edge.get('additional_required_block_ids',[]),
                            'condition':edge.get('condition',conditions[i]),
                            'required_if_variant_selected':True,
                            'default_course_variant':i==3,
                            'reason':edge['reason']})
    nodes=[l['lesson_id'] for l in plans['lessons']]
    req_edges=[(e['from_lesson_id'],e['to_lesson_id']) for e in plans['prerequisite_edges'] if e['kind']=='required']
    topo=layers(nodes,req_edges)
    all_topo=layers(nodes,[(e['from_lesson_id'],e['to_lesson_id']) for e in plans['prerequisite_edges']])
    block_edges=[(b,e['consumer_block_id']) for e in conditional for b in e['prerequisite_block_ids']]
    layers(kb,block_edges)
    prereq={'schema_version':'1.0','status':'LEAD_MAPPED',
            'edge_direction':'prerequisite -> consumer; review edges are reminders, not universal entry requirements.',
            'lesson_nodes':[{'lesson_id':l['lesson_id'],'titles':l['titles']} for l in plans['lessons']],
            'lesson_edges':plans['prerequisite_edges'],'required_topological_layers':topo,
            'all_edges_topological_layers':all_topo,'conditional_block_dependencies':conditional,
            'conditional_execution_policy':'Layer order applies to base lessons. Revisit conditional blocks after their named prerequisites. Dictionary uses linked-list backend by default; binary-tree backend is an optional alternative. Do not impose both. Whole-lesson order does not waive block prerequisites.',
            'rejected_input_proposals':'A3 objective-level prerequisite IDs were broad topic defaults without per-edge reasons. They are not accepted prerequisites and are omitted from the final coverage/operational graph (S3-A8-07).',
            'checks':{'required_lesson_dag':True,'all_lesson_edges_dag':True,'conditional_block_dag':True}}
    gaprows=[]
    for row in coverage:
        if row['scope']=='excluded':continue
        gaprows.append({'gap_id':'GAP-'+row['objective_id'],'objective_id':row['objective_id'],
                        'scope':row['scope'],'corpus_coverage':row['corpus_coverage'],
                        'priority':'TRANSFER_CHECK' if row['corpus_coverage']=='observed' else 'AUTHORED_CAPABILITY_CHECK',
                        'capability_vi':row['capability_vi'],'capability_en':row['capability_en'],
                        'coverage_limit':row['coverage_limit'],'knowledge_block_ids':row['knowledge_block_ids'],
                        'assessment_requirement_ids':row['assessment_requirement_ids'],
                        'recommended_assessment_brief':row['gap']['recommended_assessment_brief'],
                        'status':'PLANNED_NOT_CLOSED_BY_TEACHING','owner':'Stage4 content author + Stage5 Python verifier + independent reviewer',
                        'closure_evidence_required':['Authored task and source mapping','Independent solution / expected trace or justified comparison','AlgoCore rubric and edge cases','Full VI/EN parity','Applicable event/visual verification']})
    common={'schema_version':'1.0','status':'LEAD_MAPPED',
            'acceptance_authority':'GATE_REVIEW.json; mapping status alone is not a stage approval.',
            'scope':catalog['scope'],'content_status':'PLANNED_NOT_AUTHORED',
            'source_policy':'Frozen Stage1 corpus + Stage2 taxonomy; original syllabus controls requirements, book supplies knowledge, QP/MS controls task criteria.',
            'evidence_semantics':'Coverage measures a reviewed plan. Historical assessment evidence, book knowledge support, planned content and published content are distinct.'}
    bookmap={**common,'source':a2['source'],'locator_policy':a2['locator_policy'],
             'sections':a2['sections'],'knowledge_blocks':knowledge,'pattern_chains':pattern_chains,
             'book_gaps':a2['pattern_book_gaps'],'book_authority_boundary':a2['authority_boundary'],
             'counts':{'book_sections':len(sections),'knowledge_blocks':len(knowledge),'pattern_chains':len(pattern_chains)}}
    matrix={**common,'objective_id_policy':'SYL IDs are editorial, not official Cambridge atom codes.',
            'objectives':coverage,'assessment_constraints':constraints,
            'whole_syllabus_disposition':a3['whole_syllabus_disposition'],
            'coverage_vocabulary':a3['coverage_vocabulary'],'counts':{
                'objectives':len(coverage),'by_scope':dict(Counter(o['scope'] for o in coverage)),
                'by_corpus_coverage':dict(Counter(o['corpus_coverage'] for o in coverage)),
                'mapped_non_excluded_objectives':sum(bool(o['knowledge_block_ids']) for o in coverage),
                'assessment_requirements':len(requirements),'whole_syllabus_subsections':len(a3['whole_syllabus_disposition']),
                'assessment_constraints':len(constraints)}}
    gaps={**common,'objective_obligations':gaprows,'book_specific_gaps':a2['pattern_book_gaps'],
          'inherited_source_issues':{'path':'../stage-1/SOURCE_ISSUES.json','policy':'All source caveats remain active; no code certification performed.'},
          'counts':{'new_or_partial_capability_checks':sum(g['priority']=='AUTHORED_CAPABILITY_CHECK' for g in gaprows),
                    'observed_transfer_checks':sum(g['priority']=='TRANSFER_CHECK' for g in gaprows),
                    'book_specific_gaps':len(a2['pattern_book_gaps'])}}
    for name,obj in [('BOOK_KNOWLEDGE_MAP',bookmap),('COVERAGE_MATRIX',matrix),('LESSON_PACKAGES',plans),('PREREQUISITE_MAP',prereq),('GAP_REGISTER',gaps)]:write(name+'.json',obj)
    render_markdown(bookmap,matrix,plans,prereq,gaps)
    print(json.dumps({'assembled':True,'matrix':matrix['counts'],'knowledge':bookmap['counts'],'gaps':gaps['counts']},ensure_ascii=False))

def render_markdown(bookmap,matrix,plans,prereq,gaps):
    lines=['# Coverage matrix — Stage 3','',
           'Bản đồ kế hoạch cho Paper 4 năm 2026, Python, hai bản Việt–Anh. 111 mục là phân rã biên tập của AlgoCore; không phải mã mục tiêu chính thức do Cambridge cấp.',
           '','**107 mục trong phạm vi đã có lesson/block và sách; 4 mục loại trừ có lý do.** Chưa có bài học, lời giải hay đánh giá được biên soạn ở Stage 3. JSON giữ đầy đủ từng locator QP/MS và ý nghĩa dẫn chứng.',
           '', '## Toàn bộ syllabus: quyết định phạm vi','', '| Mục | Nội dung | Quyết định | Lý do |','|---|---|---|---|']
    for r in matrix['whole_syllabus_disposition']:lines.append('| '+' | '.join(table(r[k]) for k in ['section','title','disposition','rationale'])+' |')
    lines+=['','## Mục tiêu → lesson/block → sách → đánh giá','',
            'Trạng thái corpus: observed = có ví dụ đánh giá đúng kỹ năng; partial = mới một phần; support_only = ngữ cảnh hỗ trợ; absent = chưa xác nhận câu độc lập. Không trạng thái nào chứng minh học sinh đã thành thạo.', '']
    for r in matrix['objectives']:
        lines += [f"### {r['objective_id']} — {r['capability_vi']}",'',r['capability_en'],'',
                  f"Phạm vi: `{r['scope']}` · corpus: `{r['corpus_coverage']}` · syllabus trang in/PDF {r['source']['printed_page']}/{r['source']['pdf_page']} ({r['source']['bullet_locator']}).",'',
                  'Đích kiến thức: '+('; '.join('`'+b.replace(COURSE+'.lesson.','')+'`' for b in r['knowledge_block_ids']) or 'Loại trừ'),
                  'Sách: '+(', '.join(r['book_section_ids']) or 'Không yêu cầu'),
                  'Yêu cầu đánh giá: '+(', '.join(r['assessment_requirement_ids']) or 'Không áp dụng / chờ tổng hợp'),
                  '',r['mapping_rationale_en'],'', 'Giới hạn dẫn chứng: '+r['coverage_limit'],'']
        for e in r['corpus_evidence']:lines+=['- `'+e['part_id']+'` — '+e['reason']+' QP '+str(e['qp_basis']['pdf_pages'])+'; MS '+str(e['ms_basis']['pdf_pages'])+'.']
        if r['scope']!='excluded':lines+=['','Cần kiểm tra thêm: '+r['gap']['recommended_assessment_brief'],'']
    lines+=['','## Quy tắc đánh giá và thực hành','']
    for r in matrix['assessment_constraints']:lines += [f"- **{r['constraint_id']}** (syllabus PDF p{r['source']['pdf_page']}): {r['statement']} Đích: "+'; '.join(b.replace(COURSE+'.lesson.','') for b in r['knowledge_block_ids'])]
    md('COVERAGE_MATRIX.md',lines)
    lines=['# Book knowledge map — Stage 3','','55 locator sách, 108 block kiến thức, 58 chuỗi dạng bài. Trang in và PDF tách riêng; quan hệ nền tảng/thành phần không có nghĩa sách chứa sẵn lời giải đề thi.','','## Các dạng bài','', '| Dạng bài | Kỹ năng ứng viên | Block chính |','|---|---|---|']
    for r in bookmap['pattern_chains']:lines.append('| '+r['pattern_id']+' — '+r['titles']['vi']+' | '+', '.join(r['candidate_skill_ids'])+' | '+'; '.join(b.replace(COURSE+'.lesson.','') for b in r['knowledge_block_ids'])+' |')
    lines+=['','## Kiến thức và trang sách','']
    for r in bookmap['knowledge_blocks']:
        lines += [f"### {r['block_key']} — {r['titles']['vi']}",'',
                  'Quan hệ: `'+r['book_relationship']+'`. '+r['mapping_rationale_en'],'',
                  'Mục tiêu: '+', '.join(r['objective_ids']+r['assessment_constraint_ids']), '']
        for s in r['book_locators']:
            lines += [f"- **{s['section_id']}** — {s['section']}, {s['subheading']}; trang in {s['printed_pages']}; PDF {s['pdf_pages']}.",
                      '  '+s['supported_knowledge_actions'], '  Giới hạn: '+' '.join(s['limitations'])]
    lines+=['','## 19 khoảng trống cần tổng hợp thêm','']
    for g in bookmap['book_gaps']:lines+=['- **'+g['pattern_id']+'**: '+g['gap']+' '+g['disposition']]
    md('BOOK_KNOWLEDGE_MAP.md',lines)
    lines=['# Lesson packages — Stage 3','','13 gói, 26 lesson, 108 knowledge block; VI/EN dùng chung IDs. Các URL là đích dự kiến, chưa được tạo trên website. 10 khối learning page được giữ ở từng gói.',
           '', '37 đích bài luyện là nhóm sản xuất dự kiến. Các yêu cầu đánh giá theo mục tiêu có thể dùng chung một bài; không phải số bài đã viết.','']
    lessons={l['lesson_id']:l for l in plans['lessons']}
    for p in plans['packages']:
        lines += [f"## {p['titles']['vi']} / {p['titles']['en']}",'','ID: `'+p['package_id']+'`','',p['visual_policy'],'',
                  '10 khối: '+' → '.join(s['titles']['vi'] for s in p['contract_slots']), '']
        for lid in p['lesson_ids']:
            l=lessons[lid];lines += [f"### {l['slug']} — {l['titles']['vi']}",'',l['titles']['en'],'',
                'Tiên quyết: '+(', '.join(i.split('.')[-1] for i in l['prerequisite_lesson_ids']) or 'Không có'),
                'Routes dự kiến: `'+l['proposed_routes']['vi']+'`; `'+l['proposed_routes']['en']+'`','']
            for b in l['blocks']:lines += ['- `'+b['anchor']+'` — '+b['knowledge_label_vi']+' / '+b['knowledge_label_en']+'; '+', '.join(b['objective_ids']+b['assessment_constraint_ids'])+'; '+', '.join(b['book_section_ids'])]
    lines+=['','## Yêu cầu đánh giá gắn với từng mục tiêu','']
    for r in plans['assessment_requirements']:
        lines += [f"### {r['objective_id']} — {r['capability']['vi']}",'',
                  '`'+r['requirement_id']+'`','',r['task_brief']['vi'],'',r['task_brief']['en'],'',
                  'Nhóm đánh giá dự kiến: `'+r['suggested_assessment_id']+'`','',
                  'Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):','']
        lines += ['- '+check for check in r['acceptance_checks']]
        lines += ['','Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.','']
    md('LESSON_PACKAGES.md',lines)
    lines=['# Prerequisite map — Stage 3','','Mũi tên đi từ kiến thức cần trước tới bài sử dụng. Required là điều kiện đầu vào; review là nhắc ôn khi biến thể cần. Thứ tự lớp dưới đây chỉ áp dụng phần cơ sở; các block có điều kiện phải học lại sau tiên quyết cụ thể.','','## Các lớp học cơ sở','']
    for i,layer in enumerate(prereq['required_topological_layers']):lines += [f"{i+1}. "+', '.join(x.split('.')[-1] for x in layer)]
    lines+=['','## Quan hệ lesson','', '| Cần trước | Bài dùng | Loại | Lý do |','|---|---|---|---|']
    for e in prereq['lesson_edges']:lines += ['| '+' | '.join([e['from_lesson_id'].split('.')[-1],e['to_lesson_id'].split('.')[-1],e['kind'],table(e['reason'])])+' |']
    lines+=['','## Điều kiện ở từng block','']
    for e in prereq['conditional_block_dependencies']:lines += ['- **'+e['consumer_block_id'].replace(COURSE+'.lesson.','')+'** cần '+', '.join(b.replace(COURSE+'.lesson.','') for b in e['prerequisite_block_ids'])+' khi `'+json.dumps(e['condition'])+'`. '+e['reason']]
    lines+=['','Dictionary dùng linked-list backend trong kế hoạch mặc định. Backend tree là lựa chọn khác, không yêu cầu học cả hai và không tự thêm xóa binary tree vào phạm vi.','', 'Đồ thị lesson (required và cả review) và liên kết block có điều kiện đã kiểm tra không có chu trình. Các đề xuất tiên quyết ở mức objective trong đầu vào A3 bị loại vì quá rộng và thiếu lý do từng cạnh (S3-A8-07).']
    md('PREREQUISITE_MAP.md',lines)
    lines=['# Gap register — Stage 3','','65 mục cần bổ sung đánh giá năng lực vì corpus mới có một phần/ngữ cảnh hỗ trợ/chưa có dẫn chứng. 42 mục observed vẫn cần kiểm tra khả năng vận dụng. Tất cả là nghĩa vụ sản xuất tương lai; Stage 3 khóa cách xử lý, chưa đóng khoảng trống bằng bài học đã viết.','','| Mục | Corpus | Phạm vi | Cần làm |','|---|---|---|']
    for g in gaps['objective_obligations']:lines += ['| '+' | '.join(table(g[k]) for k in ['objective_id','corpus_coverage','scope','recommended_assessment_brief'])+' |']
    lines+=['','## Giới hạn sách','']
    for g in gaps['book_specific_gaps']:lines += ['- **'+g['pattern_id']+'**: '+g['gap']+' '+g['disposition']]
    lines+=['','## Điều kiện đóng khoảng trống','',
            'Stage 4 xác định nhiệm vụ, phương pháp và rubric; Stage 5 kiểm chứng Python, kết quả và trường hợp biên; các stage tiếp theo kiểm tra event, VI/EN, giao diện và chất lượng. Rubric tự biên soạn phải ghi AlgoCore; không gán điểm Cambridge cho suy luận.',
            '', 'Mọi caveat trong Stage 1 SOURCE_ISSUES vẫn có hiệu lực. Không dùng bảng này như chứng nhận rằng code mẫu trong sách/MS đã chạy đúng.']
    md('GAP_REGISTER.md',lines)

if __name__=='__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    main()
