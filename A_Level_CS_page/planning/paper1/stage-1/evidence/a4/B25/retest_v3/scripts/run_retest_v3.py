from pathlib import Path
import hashlib, json, re

ROOT = Path.cwd()
P1 = ROOT / 'A_Level_CS_page/planning/paper1'
STAGE = P1 / 'stage-1'
CAND = STAGE / 'evidence/a2/B25/versions/B25-A2-v3'
PARENT = STAGE / 'evidence/a2/B25/versions/B25-A2-v2'
OUT = STAGE / 'evidence/a4/B25/retest_v3'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def readjson(path):
    return json.loads(path.read_text(encoding='utf-8'))

def readlines(path):
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]

def norm(text):
    return re.sub(r'\s+', ' ', text or '').strip()

def generic_suffix(text):
    return bool(re.search(r'Question\s+Answer\s+Marks\s*$', text or '', re.I))

verification = readjson(OUT / 'INPUT_VERIFICATION_V3.json')
source_manifest = readjson(OUT / 'SOURCE_RENDER_MANIFEST_V3.json')
source_text_file = (OUT / 'DIRECT_SOURCE_TEXT_V3.txt').read_text(encoding='utf-8')
source_pages = {(m.group(1), int(m.group(2))): m.group(3)
                for m in re.finditer(r'(?ms)^=== ([^ ]+) p(\d+) ===\s*\n(.*?)(?=^=== |\Z)', source_text_file)}
marks = readlines(CAND / 'MARKING_INDEX.jsonl')
marks_v2 = readlines(PARENT / 'MARKING_INDEX.jsonl')
marks_by_id = {r['id']: r for r in marks}
marks_v2_by_id = {r['id']: r for r in marks_v2}
qrows = readlines(CAND / 'QUESTION_INDEX.jsonl')
pages = readlines(CAND / 'PAGE_INDEX.jsonl')
q_by_id = {r['id']: r for r in qrows}
page_by_key = {(r['source_id'], r['pdf_page_1_based']): r for r in pages}
visual = readjson(CAND / 'VISUAL_MANIFEST.json')
visual_v2 = readjson(PARENT / 'VISUAL_MANIFEST.json')
regions = {r['id']: r for r in visual['visual_regions']}
render_by_page = {(r['source_id'], r['pdf_page_1_based']): r for r in visual['full_page_renders']}

cases = [
    ('9618_w25_qp_12-q1-mi-1', '9618_w25_ms_12', 4, '1', '2'),
    ('9618_w25_qp_12-q2-pb-mi-1', '9618_w25_ms_12', 5, '2(b)', '2'),
    ('9618_w25_qp_12-q5-pe-mi-1', '9618_w25_ms_12', 8, '5(e)', '3'),
    ('9618_w25_qp_12-q6-pd-mi-1', '9618_w25_ms_12', 9, '6(d)', '2'),
    ('9618_w25_qp_12-q8-pb-pii-mi-1', '9618_w25_ms_12', 10, '8(b)(ii)', '2'),
    ('9618_w25_qp_12-q9-pb-mi-1', '9618_w25_ms_12', 11, '9(b)', '2'),
    ('9618_w25_qp_12-q10-pc-mi-1', '9618_w25_ms_12', 11, '10(c)', '1'),
    ('9618_w25_qp_13-q3-pb-mi-1', '9618_w25_ms_13', 6, '3(b)', '2'),
]
expected_ids = {x[0] for x in cases}
boundary_results = []
for rid, sid, page_no, row_ref, mark_token in cases:
    cur = marks_by_id.get(rid)
    old = marks_v2_by_id.get(rid)
    source_text = source_pages.get((sid, page_no), '')
    text = cur.get('mark_or_condition_or_null', '') if cur else ''
    old_text = old.get('mark_or_condition_or_null', '') if old else ''
    stripped = re.sub(r'\s*Question\s+Answer\s+Marks\s*$', '', old_text, flags=re.I).rstrip()
    row_ref_present = norm(row_ref) in norm(source_text)
    token_present = bool(re.search(rf'(?<!\d){re.escape(mark_token)}(?!\d)', source_text))
    terminal_mark_preserved = text.rstrip().endswith(mark_token)
    v2_suffix = generic_suffix(old_text)
    v3_suffix_absent = not generic_suffix(text)
    metadata_unchanged = bool(cur and old and all(cur.get(k) == old.get(k) for k in cur if k != 'mark_or_condition_or_null'))
    text_is_exact_v2_prefix = norm(text) == norm(stripped)
    render_path = f"evidence/a4/B25/retest_v3/source_renders/{sid}-p{page_no:03d}.png"
    boundary_results.append({
        'finding_id': 'A9-B25-MS-01', 'record_id': rid, 'source_id': sid,
        'pdf_page_1_based': page_no, 'table_row_ref': row_ref,
        'v2_had_terminal_generic_header': v2_suffix,
        'v3_terminal_generic_header_absent': v3_suffix_absent,
        'corrected_text_equals_v2_text_without_only_generic_header': text_is_exact_v2_prefix,
        'source_row_reference_present_on_original_page': row_ref_present,
        'source_terminal_mark_token_present': token_present,
        'candidate_terminal_mark_token_preserved': terminal_mark_preserved,
        'non_text_metadata_unchanged_from_v2': metadata_unchanged,
        'direct_original_render_path': render_path,
        'visual_observation': 'Inspected the original full-page mark-scheme render: the cited row ends at its displayed mark; the following generic Question / Answer / Marks header belongs to a separate next table.'
    })

# Complete 183-item whole-question/part-target, source locator, transcript, visual and suffix regression.
target_errors, locator_errors, transcript_errors = [], [], []
visual_dependency_errors, visual_render_errors, source_identity_errors = [], [], []
duplicate_ids = len(marks_by_id) != len(marks)
all_terminal_header_ids = [r['id'] for r in marks if generic_suffix(r.get('mark_or_condition_or_null'))]
target_types = {'whole_question': 0, 'part': 0}
for mark in marks:
    rid = mark['id']
    part_id = mark.get('part_id_or_null')
    question_id = mark.get('question_id_or_null')
    if bool(part_id) == bool(question_id):
        target_errors.append({'id': rid, 'problem': 'must have exactly one whole-question or part target'})
        continue
    if part_id:
        target_types['part'] += 1
        target = q_by_id.get(part_id)
        if not target or 'question_id' not in target:
            target_errors.append({'id': rid, 'problem': 'missing or non-part target', 'target': part_id})
            continue
        root_id = target.get('question_id')
    else:
        target_types['whole_question'] += 1
        target = q_by_id.get(question_id)
        if not target or 'question_id' in target:
            target_errors.append({'id': rid, 'problem': 'missing or non-root whole-question target', 'target': question_id})
            continue
        root_id = question_id
    root = q_by_id.get(root_id)
    loc = mark.get('ms_locator') or {}
    ms_source = loc.get('source_id')
    qp_source = root.get('source_qp_id') if root else None
    if not root or not ms_source or ms_source.replace('_ms_', '_qp_') != qp_source:
        locator_errors.append({'id': rid, 'problem': 'MS source does not match target QP source', 'ms_source_id': ms_source, 'qp_source_id': qp_source})
    page_no = loc.get('pdf_page_1_based')
    if (ms_source, page_no) not in page_by_key:
        locator_errors.append({'id': rid, 'problem': 'MS locator page absent from PAGE_INDEX', 'source_id': ms_source, 'pdf_page_1_based': page_no})
    tref = mark.get('transcript_ref')
    if not tref or not (CAND / tref).is_file():
        transcript_errors.append({'id': rid, 'transcript_ref': tref, 'problem': 'missing transcript'})
    for ref in mark.get('visual_dependency_refs', []):
        region = regions.get(ref)
        if not region:
            visual_dependency_errors.append({'id': rid, 'visual_ref': ref, 'problem': 'missing region'})
            continue
        if region.get('source_id') != ms_source or region.get('pdf_page_1_based') != page_no:
            visual_dependency_errors.append({'id': rid, 'visual_ref': ref, 'problem': 'wrong source/page'})
        if rid not in region.get('relates_to_ids', []):
            visual_dependency_errors.append({'id': rid, 'visual_ref': ref, 'problem': 'missing backlink'})
    old = marks_v2_by_id.get(rid)
    if old is None:
        source_identity_errors.append({'id': rid, 'problem': 'missing from frozen v2 parent'})
    elif rid not in expected_ids and old != mark:
        source_identity_errors.append({'id': rid, 'problem': 'non-target row changed from v2'})
    elif rid in expected_ids:
        if any(old.get(k) != mark.get(k) for k in mark if k != 'mark_or_condition_or_null'):
            source_identity_errors.append({'id': rid, 'problem': 'metadata changed on corrected row'})

for region in visual['visual_regions']:
    path = CAND / region['rendered_asset_ref']
    full_page = render_by_page.get((region['source_id'], region['pdf_page_1_based']))
    if not full_page or full_page.get('rendered_asset_ref') != region.get('rendered_asset_ref') or full_page.get('sha256') != region.get('render_sha256'):
        visual_render_errors.append({'region_id': region['id'], 'problem': 'region/full render manifest mismatch'})
    if not path.is_file() or sha(path) != region.get('render_sha256'):
        visual_render_errors.append({'region_id': region['id'], 'problem': 'asset missing or SHA mismatch'})

# Structural, parent-group, and six QP mark-total checks.
qrows_v2 = readlines(PARENT / 'QUESTION_INDEX.jsonl')
pages_v2 = readlines(PARENT / 'PAGE_INDEX.jsonl')
context_hashes_v2 = {p.name: sha(p) for p in (PARENT / 'contexts').glob('*.json')}
context_hashes_v3 = {p.name: sha(p) for p in (CAND / 'contexts').glob('*.json')}
structure = {
    'question_index_byte_identical_to_v2': sha(CAND / 'QUESTION_INDEX.jsonl') == sha(PARENT / 'QUESTION_INDEX.jsonl'),
    'page_index_byte_identical_to_v2': sha(CAND / 'PAGE_INDEX.jsonl') == sha(PARENT / 'PAGE_INDEX.jsonl'),
    'contexts_identical_to_v2': context_hashes_v3 == context_hashes_v2,
    'visual_regions_identical_to_v2': visual.get('visual_regions') == visual_v2.get('visual_regions'),
    'full_page_render_manifest_identical_to_v2': visual.get('full_page_renders') == visual_v2.get('full_page_renders'),
    'mark_ids_identical_to_v2': set(marks_by_id) == set(marks_v2_by_id),
    'changed_mark_rows': [rid for rid in marks_by_id if marks_by_id[rid] != marks_v2_by_id.get(rid)],
}
parent_ids = {r.get('parent_part_id_or_null') for r in qrows if r.get('parent_part_id_or_null')}
parent_errors, synthetic_parent_marks = [], []
for pid in parent_ids:
    parent = q_by_id.get(pid)
    children = [r for r in qrows if r.get('parent_part_id_or_null') == pid]
    if not parent:
        parent_errors.append({'parent_id': pid, 'problem': 'missing parent'})
        continue
    if parent.get('status') != 'EXTRACTED' or parent.get('ms_locator_or_null') is not None or parent.get('marks_displayed_or_null') is not None:
        parent_errors.append({'parent_id': pid, 'problem': 'synthetic mark/link on parent or wrong status'})
    if any(m.get('part_id_or_null') == pid or m.get('question_id_or_null') == pid for m in marks):
        synthetic_parent_marks.append(pid)
    for child in children:
        if child.get('question_id') != parent.get('question_id') or child.get('status') != 'MS_LINKED':
            parent_errors.append({'parent_id': pid, 'child_id': child['id'], 'problem': 'child/question/status mismatch'})

totals_file = readjson(CAND / 'MARK_TOTAL_CHECK.json')
index_totals = {}
for row in qrows:
    sid = row.get('source_qp_id') or (row.get('qp_locator') or {}).get('source_id')
    if sid:
        index_totals[sid] = index_totals.get(sid, 0) + (row.get('marks_displayed_or_null') or 0)
source_text_by_page = source_pages
cover_checks = []
for sid, item in sorted(totals_file['pairs'].items()):
    cover = source_text_by_page.get((sid, 1), '')
    says_75 = bool(re.search(r'total mark for this paper is 75', cover, re.I))
    cover_checks.append({'source_id': sid, 'original_cover_says_75': says_75,
                         'candidate_mark_total_check_sum': item.get('displayed_mark_sum_from_source_transcript'),
                         'candidate_indexed_sum': index_totals.get(sid),
                         'candidate_mark_total_check_pass': item.get('matches') is True,
                         'pass': says_75 and item.get('displayed_mark_sum_from_source_transcript') == 75 and index_totals.get(sid) == 75 and item.get('matches') is True})

boundary_failures = [r['record_id'] for r in boundary_results if not all([
    r['v2_had_terminal_generic_header'], r['v3_terminal_generic_header_absent'],
    r['corrected_text_equals_v2_text_without_only_generic_header'], r['source_row_reference_present_on_original_page'],
    r['source_terminal_mark_token_present'], r['candidate_terminal_mark_token_preserved'], r['non_text_metadata_unchanged_from_v2']])]
linkage_errors = target_errors + locator_errors + transcript_errors + visual_dependency_errors + visual_render_errors + source_identity_errors
recommendation = 'PASS_A4_ONLY' if (
    verification['pins_passed'] == verification['pins_checked'] and verification['snapshot_entries_passed'] == 450 and
    len(verification['source_pdfs']) == 12 and verification['source_pages_total'] == 178 and not verification['source_failures'] and
    len(boundary_results) == 8 and not boundary_failures and len(marks) == 183 and
    target_types == {'whole_question': 3, 'part': 180} and not target_errors and not locator_errors and
    not transcript_errors and not visual_dependency_errors and not visual_render_errors and not source_identity_errors and
    not duplicate_ids and not all_terminal_header_ids and len(parent_ids) == 27 and not parent_errors and not synthetic_parent_marks and
    len(cover_checks) == 6 and all(x['pass'] for x in cover_checks) and all(structure[k] for k in (
        'question_index_byte_identical_to_v2','page_index_byte_identical_to_v2','contexts_identical_to_v2',
        'visual_regions_identical_to_v2','full_page_render_manifest_identical_to_v2','mark_ids_identical_to_v2')) and
    len(structure['changed_mark_rows']) == 8 and set(structure['changed_mark_rows']) == expected_ids
) else 'CHANGES_REQUIRED'

result = {
    'artifact': 'B25-A2-v3 independent A4 boundary and linkage retest',
    'candidate_version': 'B25-A2-v3', 'recommendation': recommendation,
    'gate_scope': 'A4 specialist gate only; not A9 review or A0 batch acceptance',
    'source_rows': {'expected': 8, 'directly_inspected': len(boundary_results), 'failures': boundary_failures, 'results': boundary_results},
    'all_183_link_regression': {
        'marking_items': len(marks), 'whole_question_targets': target_types['whole_question'], 'part_targets': target_types['part'],
        'target_errors': target_errors, 'locator_errors': locator_errors, 'transcript_errors': transcript_errors,
        'visual_dependency_errors': visual_dependency_errors, 'visual_render_errors': visual_render_errors,
        'candidate_identity_or_v2_drift_errors': source_identity_errors,
        'duplicate_mark_ids': duplicate_ids, 'terminal_generic_header_ids': all_terminal_header_ids,
    },
    'structure': {
        'question_and_part_records': len(qrows), 'question_roots': sum('question_id' not in r for r in qrows),
        'parts': sum('question_id' in r for r in qrows), 'page_records': len(pages),
        'visual_regions': len(visual['visual_regions']), 'parent_groups': len(parent_ids),
        'parent_group_errors': parent_errors, 'synthetic_parent_mark_targets': synthetic_parent_marks,
        **structure,
    },
    'qp_cover_totals': cover_checks,
    'direct_source_visuals': {'render_count': source_manifest['render_count'],
                              'corrected_boundary_source_pages': sorted({(r['source_id'], r['pdf_page_1_based']) for r in source_manifest['pages'] if r['purpose'] == 'corrected-ms-row'}),
                              'risk_samples_and_covers': [{'source_id': r['source_id'], 'page': r['pdf_page_1_based'], 'purpose': r['purpose'], 'render_path': r['render_path'], 'sha256': r['sha256']} for r in source_manifest['pages'] if r['purpose'] != 'corrected-ms-row']},
    'a9_finding_disposition': {'finding_id': 'A9-B25-MS-01', 'severity_at_intake': 'Major',
                               'status': 'CLOSED_IN_CANDIDATE_PENDING_A0' if recommendation == 'PASS_A4_ONLY' else 'OPEN',
                               'candidate_corrections': len(boundary_results), 'candidate_correction_failures': len(boundary_failures)},
    'unresolved_a4_findings': [], 'batch_acceptance': False,
}
(OUT / 'RETEST_FINDINGS_V3.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'recommendation': recommendation, 'pins': (verification['pins_passed'], verification['pins_checked']),
                  'snapshot': (verification['snapshot_entries_passed'], 450), 'sources': (len(verification['source_pdfs']), verification['source_pages_total']),
                  'boundaries': (len(boundary_results), len(boundary_failures)), 'marks': len(marks), 'targets': target_types,
                  'target_errors': len(target_errors), 'locator_errors': len(locator_errors),
                  'transcript_errors': len(transcript_errors), 'visual_errors': len(visual_dependency_errors) + len(visual_render_errors),
                  'parent_groups': len(parent_ids), 'parent_errors': len(parent_errors), 'synthetic_parent_marks': len(synthetic_parent_marks),
                  'generic_header_rows': len(all_terminal_header_ids), 'totals': [(x['source_id'], x['pass']) for x in cover_checks],
                  'structure': structure}, indent=2, ensure_ascii=False))
