import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path.cwd()
STAGE = ROOT / 'A_Level_CS_page/planning/paper1/stage-1'
OUT = STAGE / 'evidence/a3/B21/retest_v5'
CAND = STAGE / 'evidence/a2/B21/versions/B21-A2-v5'
V4 = STAGE / 'evidence/a2/B21/versions/B21-A2-v4'

def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()

def jread(p):
    return json.loads(p.read_text(encoding='utf-8-sig'))

def jlines(p):
    return [json.loads(x) for x in p.read_text(encoding='utf-8-sig').splitlines() if x.strip()]

def rel(p):
    return p.relative_to(ROOT).as_posix()

def pin(path, expected=None):
    p = path if isinstance(path, Path) else ROOT / path
    actual = sha(p)
    if expected and actual != expected:
        raise AssertionError(f'pin mismatch: {p}: {actual} != {expected}')
    return {'path': rel(p), 'sha256': actual, 'bytes': p.stat().st_size,
            'expected_sha256': expected, 'matches_expected': True if expected else None}

# Paths and digests from the frozen A0 dispatch.
EXPECTED = {
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A3_V5_RETEST_DISPATCH.md':'783a07ee95dde26b66568029719609cae71b3299741a91787028769b2c6e68a3',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A2_V5_A0_VALIDATE.json':'a89c4b2ad2a9b223a3575d00441d366f8ce7ac8b92ce20840f82ef7036929054',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A2_V5_A0_AUDIT.json':'6a68292017550ef9b5cb78a84071d1d46a5dd1ddcc7a740871167359d9e6a9e8',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A2_V5_DISPATCH.md':'751ebb858754e8ee6eff6bec8ac3b33822bf0bd970be3cda6425aa7d04d743b1',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v4/CONTEXT_SCOPE_RETEST_V4.md':'1d737e1afcf7c35fca45c83dc02dbf1c60e330d40129be72729ee28558505de8',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v4/CONTEXT_SCOPE_FINDINGS_V4.json':'23bc0b56cfd7aa46519829005948e0cba8ea6da6ba1bd45ad0483c93afb9685c',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v4/HANDOFF_RETEST_V4.json':'551a2e875239c8ead27988044e43de59ba6029260ca4e8d2d5845a40e14bc11e',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A3_V4_HANDOFF_AUDIT.json':'1f008a0eb88e92173f62b010dee47fa8e6c96d4437c6f6350e45bee114076173',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B21/retest_v4/RETEST_V4.md':'375711c02d59aad460d04bc910c07173d157eb66f8e90a72331f720a2b97c73b',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B21/retest_v4/RETEST_FINDINGS_V4.json':'922031cac6e7c3b6e9567ec9ac02296d02b5dafdbffeedcd3fb7dd04cf670c7e',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B21/retest_v4/HANDOFF_RETEST_V4.json':'0ee6293e60b99ce456b2ea66d68459935bcfa4344b9df63346b47a12283651d9',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A4_V4_HANDOFF_AUDIT.json':'4ebd25ee5326168255443d0ef14372645fbbee7747d93ce774374b7aeb7967eb',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v5/HANDOFF_CHECK.json':'d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v5/BATCH_MANIFEST.json':'61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7',
 'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v5/SNAPSHOT_MANIFEST.json':'63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581',
 'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json':'195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c',
 'A_Level_CS_page/planning/paper1/stage-0/SCOPE_AND_COVERAGE_PLAN.md':'1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb',
 'A_Level_CS_page/planning/paper1/stage-0/evidence/a3/SYLLABUS_SCOPE.md':'87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c',
 '697372-2026-syllabus.pdf':'bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470',
 'A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md':'9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f',
 'A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md':'97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2',
}
input_pins = [pin(p, h) for p, h in EXPECTED.items()]
dispatch_record_path = STAGE / 'evidence/a0/B21_A3_V5_RETEST_DISPATCH_RECORD.json'
dispatch_record = jread(dispatch_record_path)
dispatch_record_pin = pin(dispatch_record_path)
evidence_manifest = jread(OUT / 'SOURCE_EVIDENCE_MANIFEST_V5.json')
assert dispatch_record_pin['sha256'] == evidence_manifest['dispatch_record_sha256']
assert evidence_manifest['work_order_sha256'] == EXPECTED['A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A3_V5_RETEST_DISPATCH.md']

# Rehash the complete candidate snapshot and the local source corpus.
snapshot = jread(CAND / 'SNAPSHOT_MANIFEST.json')
candidate_files = []
for x in snapshot['files']:
    p = CAND / x['path']
    assert sha(p) == x['sha256'] and p.stat().st_size == x['bytes'], x['path']
    candidate_files.append({'path': rel(p), 'sha256': x['sha256'], 'bytes': x['bytes']})
assert len(candidate_files) == snapshot['file_count']
stage0 = jread(ROOT / 'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json')
src_map = {x['id']: x for x in stage0['primary_sources'] if x['id'].startswith(('9618_s21_', '9618_w21_'))}
assert len(src_map) == 12
try:
    from pypdf import PdfReader
except Exception as e:
    raise AssertionError(f'pypdf page-count audit unavailable: {e}')
source_pins = []
for sid, x in sorted(src_map.items()):
    p = ROOT / x['path']
    page_count = len(PdfReader(str(p)).pages)
    digest = sha(p)
    assert digest == x['sha256'] and page_count == x['page_count']
    source_pins.append({'source_id': sid, 'path': x['path'], 'sha256': digest,
                        'bytes': p.stat().st_size, 'page_count': page_count,
                        'matches_stage0_manifest': True,
                        'authenticity_limit': 'Stage 0 local official-document copy; remote publisher authenticity not independently verified.'})
assert sum(x['page_count'] for x in source_pins) == 154

# Candidate indexes, the exact Q1 root + marking correction, and region linkage.
questions = jlines(CAND / 'QUESTION_INDEX.jsonl')
roots = [x for x in questions if 'source_qp_id' in x]
parts = [x for x in questions if 'question_id' in x]
root_by_id = {x['id']: x for x in roots}
q1 = root_by_id['9618_w21_qp_12-q1']
q1_children = [x for x in parts if x['question_id'] == q1['id']]
q1line = next(i for i, l in enumerate((CAND/'QUESTION_INDEX.jsonl').read_text(encoding='utf-8-sig').splitlines(), 1) if json.loads(l)['id'] == q1['id'])
assert q1['marks_displayed_or_null'] == 2 and q1['parent_id_or_null'] is None and not q1_children
assert q1['qp_locator'] == {'source_id':'9618_w21_qp_12','pdf_page_1_based':2,'question':'1'}
marks = jlines(CAND / 'MARKING_INDEX.jsonl')
mark_by_id = {x['id']: x for x in marks}
q1mark = mark_by_id['9618_w21_qp_12-q1-mi-1']
q1markline = next(i for i, l in enumerate((CAND/'MARKING_INDEX.jsonl').read_text(encoding='utf-8-sig').splitlines(), 1) if json.loads(l)['id'] == q1mark['id'])
assert q1mark['question_id_or_null'] == q1['id'] and q1mark['part_id_or_null'] is None
assert q1mark['ms_locator'] == {'source_id':'9618_w21_ms_12','pdf_page_1_based':3,'question':'1'}
assert q1mark['mark_or_condition_or_null'] == '1 mark for 3 correct lines only from Data Security; 1 mark for 2 correct lines only from Data Integrity'
visual = jread(CAND / 'VISUAL_MANIFEST.json')['regions']
visual_by_id = {x['id']: x for x in visual}
q1region = visual_by_id[q1mark['visual_dependency_refs'][0]]
assert q1region['source_id'] == '9618_w21_ms_12' and q1region['pdf_page_1_based'] == 3

# Independent mark arithmetic: total QP display marks from question and part records.
qp_source_for_question = {x['id']: x['source_qp_id'] for x in roots}
sums, mark_count = defaultdict(int), defaultdict(int)
for x in roots:
    if x['marks_displayed_or_null'] is not None:
        sums[x['source_qp_id']] += x['marks_displayed_or_null']; mark_count[x['source_qp_id']] += 1
for x in parts:
    if x['marks_displayed_or_null'] is not None:
        sid = qp_source_for_question[x['question_id']]
        sums[sid] += x['marks_displayed_or_null']; mark_count[sid] += 1
qp_ids = sorted(x for x in sums if x.startswith(('9618_s21_qp_', '9618_w21_qp_')))
assert len(qp_ids) == 6 and all(sums[x] == 75 for x in qp_ids)
render_map = {(x['source_id'],x['pdf_page_1_based']):x for x in evidence_manifest['full_size_renders']}
total_checks = []
for sid in qp_ids:
    cover = render_map[(sid,1)]
    total_checks.append({'source_id':sid,'qp_source_pdf_sha256':src_map[sid]['sha256'],
      'cover_pdf_page_1_based':1,'printed_cover_total_visually_read':75,
      'cover_render_path':cover['render_path'],'cover_render_sha256':cover['render_sha256'],
      'independently_recomputed_displayed_mark_sum':sums[sid],
      'non_null_question_or_part_mark_records':mark_count[sid],'difference':sums[sid]-75,'result':'PASS'})

# Retest all 13 MS rows / 12 source pages and four QP visual targets.
ms_ids = ['9618_s21_qp_11-q2-pa-mi-1','9618_s21_qp_11-q3-pb-mi-1','9618_s21_qp_11-q3-pc-pi-mi-1',
 '9618_s21_qp_12-q3-pa-mi-1','9618_s21_qp_12-q3-pb-mi-1','9618_s21_qp_13-q2-pa-mi-1',
 '9618_s21_qp_13-q3-pb-mi-1','9618_s21_qp_13-q3-pc-pi-mi-1','9618_w21_qp_11-q1-pa-mi-1',
 '9618_w21_qp_11-q6-pb-mi-1','9618_w21_qp_12-q7-pa-mi-1','9618_w21_qp_13-q1-pa-mi-1','9618_w21_qp_13-q6-pb-mi-1']
qp_ids_target = ['9618_s21_qp_12-q1-pa','9618_w21_qp_12-q1','9618_w21_qp_12-q4','9618_w21_qp_12-q7-pa']
ms_targets = []
for ident in ms_ids:
    row = mark_by_id[ident]; loc = row['ms_locator']
    assert len(row['visual_dependency_refs']) == 1
    reg = visual_by_id[row['visual_dependency_refs'][0]]
    assert (reg['source_id'],reg['pdf_page_1_based']) == (loc['source_id'],loc['pdf_page_1_based'])
    assert ident in reg['relates_to_ids']
    render = render_map[(loc['source_id'],loc['pdf_page_1_based'])]
    ms_targets.append({'marking_item_id':ident,'ms_locator':loc,'question_id':row['question_id_or_null'],
      'part_id':row['part_id_or_null'],'visual_region_id':reg['id'],'render_path':render['render_path'],
      'render_sha256':render['render_sha256'],'review_result':'PASS_SOURCE_PAGE_DEPENDENCY_AND_FULL_SIZE_LEGIBILITY'})
assert len(ms_targets) == 13 and len({(x['ms_locator']['source_id'],x['ms_locator']['pdf_page_1_based']) for x in ms_targets}) == 12
qp_targets = []
for ident in qp_ids_target:
    row = next(x for x in questions if x['id'] == ident); loc = row['qp_locator']
    reg = next(x for x in visual if ident in x['relates_to_ids'])
    assert (reg['source_id'],reg['pdf_page_1_based']) == (loc['source_id'],loc['pdf_page_1_based'])
    render = render_map[(loc['source_id'],loc['pdf_page_1_based'])]
    qp_targets.append({'target_id':ident,'qp_locator':loc,'context_ref':row.get('context_ref_or_null'),
      'visual_region_id':reg['id'],'render_path':render['render_path'],'render_sha256':render['render_sha256'],
      'review_result':'PASS_SOURCE_PAGE_CONTEXT_AND_FULL_SIZE_LEGIBILITY'})

# Regression comparison, unresolved register and Q7/Q8 target contexts.
v4q = {x['id']:x for x in jlines(V4/'QUESTION_INDEX.jsonl')}
v5q = {x['id']:x for x in questions}
changed_qids = [k for k in v4q.keys() & v5q.keys() if v4q[k] != v5q[k]]
assert changed_qids == ['9618_w21_qp_12-q1']
v4m = {x['id']:x for x in jlines(V4/'MARKING_INDEX.jsonl')}
v5m = mark_by_id
assert not [k for k in v4m.keys() & v5m.keys() if v4m[k] != v5m[k]]
assert sorted(v5m.keys()-v4m.keys()) == ['9618_w21_qp_12-q1-mi-1']
assert (V4/'PAGE_INDEX.jsonl').read_bytes() == (CAND/'PAGE_INDEX.jsonl').read_bytes()
assert (V4/'CONTEXT_INDEX.jsonl').read_bytes() == (CAND/'CONTEXT_INDEX.jsonl').read_bytes()
contexts = jlines(CAND/'CONTEXT_INDEX.jsonl'); ctx_by_q = {x['question_id']:x for x in contexts}
parent_rows = [x for x in marks if x['status']=='UNRESOLVED' and x['unresolved_reason']=='Parent expands into child records; no parent allocation inferred.']
assert len(parent_rows)==34 and all(x['mark_or_condition_or_null'] is None and x['table_row_ref_or_null'] is None for x in parent_rows)
continuity = []
for comp in ('11','13'):
    qp = f'9618_s21_qp_{comp}'; q7=f'{qp}-q7'; q8=f'{qp}-q8'
    c7,c8=ctx_by_q[q7],ctx_by_q[q8]
    assert c7['question_start_page']==15 and c7['continuation_pages']==[16] and c7['all_context_pages']==[15,16]
    assert c8['question_start_page']==16 and c8['continuation_pages']==[] and c8['all_context_pages']==[16]
    q7r,q8r=root_by_id[q7],root_by_id[q8]
    biii=next(x for x in parts if x['id']==f'{q7}-pb-piii')
    qc=next(x for x in parts if x['id']==f'{q7}-pc')
    assert q7r['qp_locator']['pdf_page_1_based']==15 and q8r['qp_locator']['pdf_page_1_based']==16 and q8r['marks_displayed_or_null']==3
    assert biii['qp_locator']['pdf_page_1_based']==16 and biii['marks_displayed_or_null']==1
    assert qc['qp_locator']['pdf_page_1_based']==16 and qc['marks_displayed_or_null']==3
    continuity.append({'qp_source_id':qp,'q7_context_pages':[15,16],'q7_b_iii_page':16,'q7_b_iii_mark':1,
      'q7_c_page':16,'q7_c_mark':3,'q8_root_page':16,'q8_root_mark':3,'full_size_qp_ms_continuity_pages':'QP p15-p16; paired MS p9-p10','result':'PASS'})
for qid,start,cont in [('9618_w21_qp_12-q7',12,[]),('9618_w21_qp_12-q8',13,[14,15,16])]:
    c=ctx_by_q[qid]; row=root_by_id[qid]
    assert c['question_start_page']==start and c['continuation_pages']==cont and row['qp_locator']['pdf_page_1_based']==start
    continuity.append({'question_id':qid,'root_page':start,'continuation_pages':cont,
      'result':'PASS_INDEX_REGRESSION_FROM_V4; source pages were reduced-scale only in this retest'})

# Check every evidence image against its manifest pin, and coverage counts.
assert evidence_manifest['source_count']==12 and evidence_manifest['source_page_count_total']==154
assert evidence_manifest['full_size_page_count']==31 and evidence_manifest['contact_sheet_count']==12
assert len({(x['source_id'],x['pdf_page_1_based']) for x in evidence_manifest['full_size_renders']})==31
for x in evidence_manifest['full_size_renders']:
    assert sha(OUT/x['render_path']) == x['render_sha256']
for x in evidence_manifest['contact_sheets']:
    assert sha(OUT/x['contact_sheet_path']) == x['sha256']

criteria = [
 {'id':'A3-V5-01','criterion':'Frozen input, candidate snapshot and source integrity','status':'PASS'},
 {'id':'A3-V5-02','criterion':'W21/12 QP Q1 whole-question mark and root hierarchy','status':'PASS','source_pdf_page':2,'candidate_record':q1['id'],'candidate_line':q1line,'mark':2,'child_parts':0},
 {'id':'A3-V5-03','criterion':'Exact W21/12 Q1 paired MS row and same-page visual dependency','status':'PASS','source_pdf_page':3,'candidate_record':q1mark['id'],'candidate_line':q1markline,'region_id':q1region['id'],'printed_condition':q1mark['mark_or_condition_or_null']},
 {'id':'A3-V5-04','criterion':'Six independent displayed-mark sums vs original QP covers','status':'PASS','totals':total_checks},
 {'id':'A3-V5-05','criterion':'Thirteen MS target rows/12 pages and four QP visual targets','status':'PASS','ms_targets':ms_targets,'qp_targets':qp_targets},
 {'id':'A3-V5-06','criterion':'Prior Q7/Q8 hierarchy, marks, locators and context','status':'PASS','focus_records':continuity},
 {'id':'A3-V5-07','criterion':'34 unresolved parent-context records remain unallocated','status':'PASS','count':34,'mark_and_table_row_fields_all_null':True},
 {'id':'A3-V5-08','criterion':'Complete source-page screen and scale disclosure','status':'PASS','contact_sheets':12,'source_pages_reduced_scale':154,'full_size_pages':31},
 {'id':'A3-V5-09','criterion':'Historical source, syllabus and provenance limits retained','status':'PASS_WITH_RETAINED_LIMITS','S1-I14':'non-blocking unrecovered historic A4-v2 digest'},
]

findings = {
 'schema_version':'1.2','artifact_version':'B21-A3-RETEST-v5','task_id':'P1-S1-A3-B21-RETEST-V5',
 'reviewer_role':'Independent A3 same-version reviewer; did not author B21-A2-v5.',
 'candidate':{'artifact_version':'B21-A2-v5','path':rel(CAND),'handoff_sha256':sha(CAND/'HANDOFF_CHECK.json'),
   'batch_manifest_sha256':sha(CAND/'BATCH_MANIFEST.json'),'snapshot_manifest_sha256':sha(CAND/'SNAPSHOT_MANIFEST.json'),
   'snapshot_file_count':len(candidate_files)},
 'recommendation':'PASS','gate_scope':'A3 only. A4 v5, A9 retest, and A0 batch decision remain mandatory; no batch acceptance is claimed.',
 'criteria':criteria,
 'q1_source_witnesses':{'qp_render':{'path':q1_render_path if False else render_map[('9618_w21_qp_12',2)]['render_path'],'sha256':render_map[('9618_w21_qp_12',2)]['render_sha256'],'source_pdf_sha256':src_map['9618_w21_qp_12']['sha256']},
  'ms_render':{'path':render_map[('9618_w21_ms_12',3)]['render_path'],'sha256':render_map[('9618_w21_ms_12',3)]['render_sha256'],'source_pdf_sha256':src_map['9618_w21_ms_12']['sha256']},
  'qp_root_record':q1,'child_count':0,'paired_ms_item':q1mark,'mark_allocation_inferred':False},
 'independent_mark_total_recomputation':total_checks,
 'visual_risk_retest':{'ms_item_count':13,'ms_unique_pages':12,'ms_targets':ms_targets,'qp_target_count':4,'qp_targets':qp_targets},
 'q7_q8_regression':continuity,
 'parent_context_unresolved':{'count':34,'all_remain_unresolved':True,'all_mark_and_table_row_fields_null':True,'reason_verbatim':'Parent expands into child records; no parent allocation inferred.'},
 'page_review':{'source_count':12,'source_pages':154,'contact_sheets_reduced_scale':12,'full_size_page_count':31,
  'full_size_classes':{'A9_and_Q1_targets':17,'Q7_Q8_continuity':8,'QP_cover_totals':6},
  'limit':'All remaining pages were screened only by reduced-scale contact sheets.'},
 'retained_flags':[{'id':'S1-I14','severity':'MINOR','status':'RETAINED_NONBLOCKING','description':'Historic A3-v2 recorded A4-v2 digest remains unrecovered.'},
  {'id':'B21-SCOPE-01','severity':'LOW','status':'RETAINED','description':'2021 sources do not prove 2026 lesson coverage, frequency or variant equivalence.'}],
 'limits':['No separate MS allocation is inferred for Q1.','Remote source authenticity is not independently checked.','A4, A9 and A0 gates remain open.'],
 'candidate_untouched':True,'structural_validator':'PASS; structural validation is not semantic approval.'}
flags = {'schema_version':'1.2','artifact_version':'B21-A3-RETEST-v5','task_id':'P1-S1-A3-B21-RETEST-V5','recommendation':'PASS','flags':[
 {'id':'B21-SCOPE-01','type':'historical_source_scope_guardrail','status':'RETAINED','severity':'LOW','evidence':'Six QPs are from 2021 and cannot establish 2026 teaching coverage, frequency, variant equivalence or marking validity.','action':'Cite 2026 syllabus objectives independently before Stage 2 reuse.','owner':'A0 and Stage 2 authors'},
 {'id':'A3-B21-MARK-01','type':'missing_displayed_whole_question_mark','status':'RESOLVED_V5_A3_RETEST_PASS','severity':'MAJOR_PRIOR_FINDING_RESOLVED','source_locator':{'source_id':'9618_w21_qp_12','pdf_page_1_based':2,'question':'1','printed_mark':'[2]','source_pdf_sha256':src_map['9618_w21_qp_12']['sha256'],'render_path':render_map[('9618_w21_qp_12',2)]['render_path'],'render_sha256':render_map[('9618_w21_qp_12',2)]['render_sha256']},'candidate_locator':{'artifact':rel(CAND/'QUESTION_INDEX.jsonl'),'line_1_based':q1line,'record_id':q1['id'],'marks_displayed_or_null':2,'child_part_count':0},'evidence':'v5 stores the source-printed Q1 [2] on the existing root and links one exact whole-question MS row; no synthetic child or allocation is inferred.','owner':'A3 reviewer'},
 {'id':'S1-I14','type':'historic_review_artifact_provenance_limit','status':'RETAINED_NONBLOCKING','severity':'MINOR','evidence':'Historic A4-v2 digest cited by A3-v2 remains unrecovered.','owner':'A0 Lead'},
 {'id':'S1-I15','type':'visual_dependency_coverage','status':'A3_TARGETED_RETEST_PASS_A4_A9_PENDING','severity':'MAJOR','evidence':'13 MS rows over 12 pages plus four QP targets map to exact source/page regions and full-size readable renders.','owner':'A4 and A9'}],
 'limits':['A3 gate only; A4 v5, A9 and A0 remain mandatory.','QP totals were not used to invent displayed marks or MS allocation.']}

(OUT/'CONTEXT_SCOPE_FINDINGS_V5.json').write_text(json.dumps(findings,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'SCOPE_FLAGS_RETEST_V5.json').write_text(json.dumps(flags,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

report = f'''# A3 context and scope retest — B21 A2-v5

Task: P1-S1-A3-B21-RETEST-V5. Candidate: B21-A2-v5. A3 recommendation: **PASS for the A3 gate only**. A4 v5, A9 retest and A0 batch decision remain mandatory; this is not batch acceptance.

## Frozen basis and integrity

The A0 dispatch matches its frozen SHA256 783a07ee95dde26b66568029719609cae71b3299741a91787028769b2c6e68a3. Candidate HANDOFF_CHECK, BATCH_MANIFEST and SNAPSHOT_MANIFEST match their dispatched SHA256 values. Every one of the {len(candidate_files)} snapshot files was rehashed and size-checked. I rechecked all 12 original Paper 1 PDFs against Stage 0: every hash and page count matches; 154 source pages total.

## Q1 correction and six component totals

Original 9618_w21_qp_12.pdf, PDF p2 / printed p2, shows unparted Q1 with [2]. Candidate QUESTION_INDEX.jsonl line {q1line}, root 9618_w21_qp_12-q1, records mark 2 and has no synthetic child. The paired original 9618_w21_ms_12.pdf p3 prints the whole-question Q1 row. Candidate MARKING_INDEX.jsonl line {q1markline} adds 9618_w21_qp_12-q1-mi-1 with exact MS p3/Q1 locator, the printed two-condition text, and dependency on region {q1region['id']} on that same source page. Direct-source render witnesses and hashes are in SOURCE_EVIDENCE_MANIFEST_V5.json. No QP-mark allocation to individual MS conditions is inferred.

I independently summed every non-null question-root and part mark in the QP index and compared each sum with the printed total on a full-size original cover. All six are 75: S21 components 11, 12, 13 and W21 components 11, 12, 13. Exact row counts, source hashes and cover-render hashes are recorded in CONTEXT_SCOPE_FINDINGS_V5.json. Cover totals were integrity checks only.

## Visual targets and page review

All 13 distinct MS marking-item IDs across 12 original MS pages, and four QP target IDs, were checked for exact source/page, page-specific region/dependency, context and legibility in direct full-size original renders. The target mappings and render SHA256s are listed in the findings JSON.

All 12 labeled contact sheets covering 154 source pages were screened at reduced scale. Full-size inspection is claimed for exactly 31 PDF pages: 17 A9/Q1 target pages (16 v4 A9 targets plus the paired W21/12 MS p3), eight S21 Q7/Q8 continuity pages (QP11/13 pp.15–16 and MS11/13 pp.9–10), and six QP cover p1 pages. Remaining pages were contact-sheet only; that screen is not full-size semantic validation.

## Q7/Q8 context and unresolved records

For S21 variants 11 and 13, Q7 starts at QP p15 and continues on p16; Q7(b)(iii) [1] and Q7(c) [3] are on p16, followed by a separate Q8 root [3]. Paired MS p9 contains Q7 rows; MS p10 begins Q8. I inspected both QP page pairs and both MS page pairs full-size. W21/12 Q7 remains rooted on p12; Q8 remains rooted p13 with continuation p14–p16. Those candidate records match v4; v5 PAGE_INDEX and CONTEXT_INDEX are byte-identical to v4. W21/12 pages were reduced-scale only in this retest and retain the prior v4 review as baseline.

All 34 UNRESOLVED parent-context MS records remain without mark/condition or table-row allocations. Their reason remains that the parent expands into child records. No marking point was invented.

## Findings, limits and gate

Prior Major A3-B21-MARK-01 is resolved in v5. No A3 source-fidelity, context, syllabus-scope or visual-dependency defect was found in this targeted retest. S1-I14 remains a non-blocking historic provenance limit: the A3-v2-recorded A4-v2 digest remains unrecovered. 2021 papers are historical sources, not proof of 2026 coverage, frequency or variant equivalence. Local source authenticity was not checked against a remote publisher; this retest verifies local hash identity only.

A3 recommendation: **PASS for A3 only**. A4 v5, A9 independent batch review and A0 final batch decision remain open. The frozen handoff stops at A0 integrity verification.
'''
(OUT/'CONTEXT_SCOPE_RETEST_V5.md').write_text(report,encoding='utf-8')
risk = '''# Source risk retest — B21 A2-v5 (A3)

Task: P1-S1-A3-B21-RETEST-V5. The review compares the frozen B21-A2-v5 registers with original 2021 QP/MS PDFs. Page/render hashes are pinned in SOURCE_EVIDENCE_MANIFEST_V5.json; criterion details are in CONTEXT_SCOPE_FINDINGS_V5.json.

## Integrity and review coverage

- Rehashed all 12 original QP/MS PDFs and independently read page counts: all Stage 0 hashes/page counts match, 154 pages total.
- Screened 12 contact sheets covering every PDF page at reduced scale. This is a broad screen, not fine-print full-size validation.
- Inspected 31 direct original-PDF renders full-size: 16 A9 v4 target pages, paired W21/12 MS Q1 p3, eight Q7/Q8 continuity pages, and six QP cover pages. Every render is hash-pinned.
- No other page is claimed full-size reviewed. Cambridge remote authenticity is not independently checked; source identity is local-hash based.

## A3 target findings

The 13 named marking items across 12 MS pages resolve to the exact source/page and a matching candidate whole-page visual region. Each region relates to the item, and the full-size source render was legible. Four QP targets resolve to their exact QP source page, context record and matching visual region; each full-size render was legible. The findings JSON gives exact IDs, locators, regions and render hashes.

W21/12 QP p2 visibly prints unparted Q1 [2]. The candidate root now stores 2 without a child. Paired MS p3 visibly prints a whole-question Q1 row. The added item has an exact Q1 locator, retains the printed scoring condition and depends on the MS p3 region. This confirms source linkage only; it does not split QP marks among the MS conditions.

All six full-size QP covers print total 75. Independently summed question/part displays are 75 for S21/11, S21/12, S21/13, W21/11, W21/12 and W21/13. Cover totals are integrity checks only.

## Context and retained limits

S21 QP11/13 pages 15–16 and MS11/13 pages 9–10 support the Q7 continuation and distinct Q8 start. W21/12 Q8 remains rooted at p13 and context spans p14–p16, matching the unchanged v4 context index; its pages are contact-sheet only in this retest and rely on the prior v4 review baseline. Thirty-four parent-context rows remain unresolved and unallocated. Historic S1-I14 (unrecovered A4-v2 digest referenced by A3-v2) remains non-blocking. 2021 papers do not establish 2026 syllabus coverage, topic frequency or variant equivalence.

## Gate impact

A3 source-risk criteria: **PASS** for this targeted set. A4 v5, A9 and A0 remain open. This review does not authorize lessons, app edits or batch acceptance.
'''
(OUT/'SOURCE_RISK_RETEST_V5.md').write_text(risk,encoding='utf-8')

# Input/source/render/output hash handoff. Handoff is frozen after it is written.
output_files=[]
for p in sorted(OUT.rglob('*')):
    if p.is_file() and p.name not in ('HANDOFF_RETEST_V5.json','HANDOFF_RETEST_V5.sha256'):
        output_files.append({'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size})
handoff = {'schema_version':'1.0','artifact_version':'B21-A3-RETEST-v5','task_id':'P1-S1-A3-B21-RETEST-V5',
 'status':'FROZEN_FOR_A0_INTEGRITY_AUDIT','recommendation':'PASS_A3_ONLY',
 'review_scope':'Exact B21-A2-v5 A3 context/source-fidelity/scope/source-risk retest; stop after handoff for A0 audit.',
 'write_allowlist':'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v5/',
 'candidate_untouched':True,'candidate':findings['candidate'],
 'dispatch_record':dispatch_record_pin,'frozen_input_pins':input_pins,
 'candidate_snapshot_files_verified':candidate_files,'original_source_pdfs':source_pins,
 'page_review':findings['page_review'],'source_evidence_manifest':{'path':rel(OUT/'SOURCE_EVIDENCE_MANIFEST_V5.json'),'sha256':sha(OUT/'SOURCE_EVIDENCE_MANIFEST_V5.json')},
 'criterion_summary':[{'id':x['id'],'status':x['status']} for x in criteria],
 'output_files_excluding_this_handoff_and_checksum':output_files,
 'output_file_count_excluding_this_handoff_and_checksum':len(output_files),
 'stop_point':'A0 must audit this frozen A3 handoff before the next gate decision. A4 v5, A9 and A0 batch decision remain mandatory.'}
(OUT/'HANDOFF_RETEST_V5.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
digest=sha(OUT/'HANDOFF_RETEST_V5.json')
(OUT/'HANDOFF_RETEST_V5.sha256').write_text(f'{digest}  HANDOFF_RETEST_V5.json\n',encoding='ascii')
print(json.dumps({'status':handoff['status'],'candidate_snapshot_files_verified':len(candidate_files),
 'source_pdfs':len(source_pins),'source_pages':154,'q1_mark':q1['marks_displayed_or_null'],
 'paper_sums':{k:sums[k] for k in qp_ids},'ms_targets':len(ms_targets),'ms_pages':12,'qp_targets':len(qp_targets),
 'full_size_pages':31,'contact_sheets':12,'unresolved_parent_context':len(parent_rows),
 'handoff_sha256':digest,'output_files_before_handoff':len(output_files)},indent=2))
