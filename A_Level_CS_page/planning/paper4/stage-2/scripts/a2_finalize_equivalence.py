from pathlib import Path
import json
S=Path(__file__).resolve().parents[1];E=S/'evidence';f=E/'A2_EQUIVALENCE.json'
x=json.loads(f.read_text(encoding='utf-8'));rr={r['paper_id']:r for r in x['sources']}
for g in x['strict_groups']:
    g['status']='verified_normalized_text_equivalence'
    if g['body_render_comparison']=='render_differences_require_review':
        g['render_review_status']='reviewed_difference_preserved'
        g['uncertainty']='Do not claim visual facsimile identity: underlying text matches but visible glyphs differ at the page recorded in render_findings.'
    else:g['render_review_status']='all_compared_pages_equal' if len(g['members'])>1 else 'singleton'
x['render_findings']=[
 {'id':'A2-EQ-01','pair':['9618_s22_41','9618_s22_43'],'source_kind':'ms','pdf_page':2,'region_display_points':[90,395,775,431],'finding':'Generic marking principles paragraph: normalized extracted text matches, but43 rendering visibly omits/overlaps several letter groups. Same non-whitespace extracted sequence; not the same facsimile.','evidence':['A2_region_9618_s22_41_2.png','A2_region_9618_s22_43_2.png'],'action':'Preserve both sources; compare task-body pattern incidence using the explicitly text-based grouping only. The affected generic-principle sentence is not a question taxonomy difference. No source mutation.','status':'reported_to_Lead'},
 {'id':'A2-EQ-02','pair':['9618_s23_41','9618_s23_43'],'source_kind':'ms','pdf_page':22,'region_display_points':[145,110,740,153],'finding':'Q2(c) marking alternative line: underlying sequence contains output // one method in each class in both;43 facsimile visually drops/overlaps parts of the line. Preserve discrepancy rather than claiming the rendered marking statements are identical.','evidence':['A2_region_9618_s23_41_22.png','A2_region_9618_s23_43_22.png'],'action':'When interpreting this MS row use the original source, exact extracted text and corroborating41variant, with a visible source caveat. Identical text does not certify all glyph rendering. No source mutation.','status':'reported_to_Lead'}]
for n in x['near_equivalent_pairs']:
    n['semantic_review']='A2 reviewed QP PDF9 renders in both: OUTPUT("Tree is full") versus OUTPUT "Tree is full" states the same intended output operation; all other body text pages and complete MS body match, and supplied data bytes match. This supports optional pedagogical-pattern sensitivity grouping, not strict text equality or executed-code correctness.'
    n['semantic_status']='supported_for_optional_pattern_incidence_sensitivity; pending_Lead_acceptance'
    n['visual_evidence']=['A2_9618_w21_41_qp_9.png','A2_9618_w21_42_qp_9.png']
conservative=[]
for g in x['strict_groups']:
    blocks=[[m] for m in g['members']] if g['body_render_comparison']=='render_differences_require_review' else [g['members']]
    for members in blocks:conservative.append({'group_id':'VR_'+members[0],'members':members,'representative':members[0],'basis':'Same normalized QP/MS text plus all body renders pixel-equal under documented identifier mask; singletons preserved where difference exists.','questions_per_representative':rr[members[0]]['questions'],'parts_per_representative':rr[members[0]]['parts'],'marks_per_representative':rr[members[0]]['marks']})
x['render_corroborated_groups']=conservative
semantic=[dict(g) for g in x['strict_groups'] if g['members']!=['9618_w21_42']]
for g in semantic:
    g['group_id']=g['group_id'].replace('EQ_','SEM_')
    if g['members']==['9618_w21_41']:g['members']=['9618_w21_41','9618_w21_42'];g['basis']='Manually reviewed output-parentheses wording change; equal MS and supplied data. Optional semantic grouping, not strict text equality.'
# Optional w21 similarity remains a note, never an authoritative statistical partition.
def denom(groups):return {'groups':len(groups),'questions':sum(g['questions_per_representative'] for g in groups),'scored_parts':sum(g['parts_per_representative'] for g in groups),'marks':sum(g['marks_per_representative'] for g in groups)}
x['denominators']['render_corroborated_groups']=denom(conservative)
x['denominators'].pop('optional_semantic_groups',None);x.pop('optional_semantic_groups',None)
x['counting_contract']={
 'primary_reporting':'Keep raw29paper /87question /672part /2175mark coverage. No source is removed, renamed or overwritten.',
 'paper_incidence':'For pattern P, count unique raw paper IDs containing at least one assessed P. Divide by29. Report context-only appearances separately.',
 'question_incidence':'Count unique (paper_id,Q1/Q2/Q3) containing at least one assessed P. Denominator87.',
 'part_incidence':'Count unique part_id assessed with P. Denominator672. Multi-tag rows can appear in multiple pattern rows.',
 'marks_primary':'Allocate each scored part once to its primary_pattern_id. Across primary patterns the total must equal2175. Allocation is editorial, not official split of marks among skills.',
 'marks_assessed_union':'For patternP sum marks once per unique assessed part_id. Across multi-tag pattern rows totals overlap and must not be added. For a set of patterns first union their part IDs, then sum marks.',
 'strict_text_sensitivity':'Collapse only within21strict_groups. Count group with P once if the corresponding reviewed members agree. Before representative selection verify per-part label/marks and assessed tags agree across group members; disagreement is a QA finding, not a reason to silently pick one variant.',
 'render_conservative_sensitivity':'Optional23groups preserve the two pairs whose body text matches but visible rendering differs. Useful if claiming facsimile identity would exceed evidence.',
 'near_equivalence_note':'w21/41,42 share intended output operation despite parentheses difference. Keep them separate for all authorized denominator views; do not publish20as an authoritative denominator.',
 'group_part_denominators':'For part/mark sensitivity use one reviewed representative per group with identical question/part labels and marks;21groups=487parts/1575marks,23groups=536parts/1725marks. Do not divide raw672parts or2175marks by group count.',
 'classification_guard':'Normalized text membership supports comparing proposed classifications, but glyph/format/context can differ. Never use this grouping as automatic verified-code deduplication.',
 'frequency_language':'Say appears in X of29paper files and Y of21normalized-body groups. Do not infer exam probability, causal independence, future coverage, or population frequency from this convenience corpus.',
 'rare_evidence':'Always print raw/group numerator and denominator; when only one group supports a pattern label it limited corpus evidence. Any additional rarity threshold is an explicit editorial choice, not a Cambridge fact.'}
idx=json.loads((S.parent/'stage-1/QUESTION_INDEX.json').read_text(encoding='utf-8'))
part_signatures={p['paper_id']:[(part['part'],part['marks']) for q in p['questions'] for part in q['parts']] for p in idx['papers']}
for g in x['strict_groups']:
    g['stage1_part_labels_and_marks_equal']=all(part_signatures[m]==part_signatures[g['representative']] for m in g['members'])
    assert g['stage1_part_labels_and_marks_equal']
x['self_checks']={'all_29_original_qp_ms_hashes_match_stage1':all(s['matches_stage1_release_source_hash'] for r in x['sources'] for s in r['sources'].values()),'body_page_pair_comparisons':len(x['page_pair_comparisons']),'body_page_render_equal':sum(c['masked_render_equal'] for c in x['page_pair_comparisons']),'body_page_render_differences_reviewed':2,'all_strict_groups_have_equal_supplied_data':all(g['data_bytes_equal'] for g in x['strict_groups']),'all_strict_groups_have_equal_part_labels_and_marks':True}
for name,groups in [('strict',x['strict_groups']),('render',conservative)]:
    ids=[m for g in groups for m in g['members']];assert len(ids)==29 and len(set(ids))==29 and set(ids)==set(rr)
    x['self_checks'][name+'_complete_disjoint_29_partition']=True
x['status']='SUBMITTED_for_Lead_and_independent_QA; no_Stage3'
f.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
md=['# A2 — Variant equivalence and denominators, Stage 2','', '**Status: SUBMITTED to Lead / independent QA.** Inputs: Stage1PASS `paper4-2026-s1-v1`. Scope:29paperfiles2021–2025. Original sources untouched.','', 'Đọc trực tiếp58PDF QP/MS và đối chiếu SHA-256 với release Stage1. Kết quả: **21nhóm cùng phần thân văn bản sau chuẩn hóa**, giữ đủ29paperID. Trong355cặp trang của các nhóm trùng,353cặp render giống từng pixel sau che mã component;2cặp trang có khác biệt hiển thị đã ghi cụ thể.','', '## Mẫu số có căn cứ','', '| View | Paper/groups | Q1/Q2/Q3 | Scored parts | Marks |','|---|---:|---:|---:|---:|']
for key,label in [('raw','Raw source IDs'),('strict_body_groups','Strict normalized task-body text'),('render_corroborated_groups','Conservative: also equal body facsimiles')]:
    d=x['denominators'][key];md.append(f"|{label}|{d.get('groups',d.get('paper_files'))}|{d['questions']}|{d['scored_parts']}|{d['marks']}|")
md+=['','21nhóm là kết quả so sánh mới, không phải21đề độc lập thống kê. Hai variantw21/41–42 vẫn tách riêng; không dùng số20từ học liệu cũ làm mẫu số. Không dùng tổng raw672ý/2175điểm với mẫu số nhóm.','', '## Quy tắc so sánh','', '1. Đọc văn bản natural-order của PyMuPDF từ PDF gốc. Giữ thứ tự và số trang; mỗi trang có hash raw và hash chuẩn hóa.','2. Chỉ thay mã component9618/41,42,43 bằng9618/4X và gom whitespace. Không xóa punctuation, tên biến, giá trị hoặc câu.','3. So sánh QP và MS từ PDF2đến trang cuối. Cover không thuộc phép bằng nhau vì mã sản xuất/barcode khác. Đây là task-body equality, không phải toàn tài liệu hay rawbyte equality.','4. Với mọi nhóm nhiều thành viên: render tất cả trang thân ở72DPI, chỉ che bbox header/footer mã component thực sự tìm được; so sánh byteRGB. Nhờ vậy có kiểm bổ sung cho bố trí bảng, hình và indentation bị whitespace normalization che khuất.','5. So sánh tên/role/hash của TXT được cấp. Mọi nhóm strict có dữ liệu giống byte. evidence.doc và instructionsPDF không thuộc chữ ký input.','', '## Phân hoạch21nhóm văn bản','', '| Group | Members | Raster corroboration |','|---|---|---|']
for g in x['strict_groups']:md.append(f"|{g['group_id']}|{', '.join(g['members'])}|{g['body_render_comparison']}|")
md+=['','## Khác biệt phải giữ','', '- **s22/41–43, MS PDF2:** text tương đương, nhưng một số chữ trong generic marking principles trên43hiển thị thiếu/chồng. Xem [41](A2_region_9618_s22_41_2.png), [43](A2_region_9618_s22_43_2.png). Không là khác dạng bài; không được gọi facsimileidentical.','- **s23/41–43, MS PDF22,2(c):** một dòng marking alternative có text bên dưới giống nhau nhưng43hiển thị thiếu/chồng chữ. Xem [41](A2_region_9618_s23_41_22.png), [43](A2_region_9618_s23_43_22.png). Khi đọc tiêu chí cần ghi caveat và đối chiếu41; không sửa PDF.','- **w21/41–42, QP PDF9,3(b):** `OUTPUT("Tree is full")` và `OUTPUT "Tree is full"`. Toàn bộMS thân và dữ liệu giống nhau; review hai ảnh xác nhận cùng thao tác output dự kiến. Giữ riêng trong strict21; chỉ ghi nhận gần tương đương về ý nghĩa thao tác, không đổi mẫu số thống kê đã chấp nhận. Không khẳng định code đã chạy đúng.','', '## Quy tắc thống kê cho Lead','', '- Đếm riêng paperID/29, cặp paper–question/87, partID/672 và marks/2175. Context-only không được cộng thành assessed appearance.','- Mỗi ý có một primary; tổng primary marks phải2175. Nhiều assessed tag thì tính unionpartID trong mỗi pattern; các hàng pattern có thể trùng điểm nên không cộng ngang.','- Group incidence đếm group có pattern một lần. Trước dùng representative phải kiểm label/mark và assessedtag giữa thành viên; khác nhau là findingQA. Không chọn tùy ý một variant để che bất nhất phân loại.','- Với pattern có một nhóm nguồn, ghi limited corpus evidence cùng tử/mẫu số. Không suy xác suất thi hoặc hiệu quả học tập.','', '## Evidence / tái lập','', '[A2_EQUIVALENCE.json](A2_EQUIVALENCE.json) chứa58sourcehash, hash theo trang, bbox mask,355page comparisons, đủ hai partition29ID và counting contract. [A2_RENDER_DIFFS.json](A2_RENDER_DIFFS.json) có bbox khác biệt. Script `../scripts/a2_equivalence.py` xây comparison, `a2_review_differences.py` dựng ảnh review, `a2_finalize_equivalence.py` bổ sung quyết định review.','', 'Không có source mutation, taxonomy mutation, lời giải hoặc Stage3. Lead quyết định gate và cách dùng sensitivity view.','']
(E/'A2_EQUIVALENCE.md').write_text('\n'.join(md),encoding='utf-8')
print(json.dumps(x['denominators']))
