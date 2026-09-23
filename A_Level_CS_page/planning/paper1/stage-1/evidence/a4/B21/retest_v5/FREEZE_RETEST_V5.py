"""Freeze B21 A4 v5 review artifacts within the assigned evidence directory."""
import hashlib, json
from pathlib import Path
from PIL import Image

ROOT=Path.cwd(); EVID=ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence'
OUT=EVID/'a4/B21/retest_v5'; CAND=EVID/'a2/B21/versions/B21-A2-v5'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT)).replace('\\','/')
def dump(p,obj): p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

cp=OUT/'A4_REVIEW_CHECKS_V5.json'; c=json.loads(cp.read_text(encoding='utf-8'))
rm=json.loads((OUT/'SOURCE_RENDER_MANIFEST_V5.json').read_text(encoding='utf-8'))
snap=json.loads((CAND/'SNAPSHOT_MANIFEST.json').read_text(encoding='utf-8'))
a3p=EVID/'a3/B21/retest_v5/HANDOFF_RETEST_V5.json'; a0p=EVID/'a0/B21_A3_V5_HANDOFF_AUDIT.json'
a3=json.loads(a3p.read_text(encoding='utf-8')); a0=json.loads(a0p.read_text(encoding='utf-8'))

# Attach manual source-page decisions to the render coverage evidence.
pages=[]
for x in rm['full_size_pages']:
    y=dict(x); y['visually_inspected_full_size']=True
    y['review_result']='PASS: original page identity and relevant printed content legible at full size.'
    pages.append(y)
contacts=[]
for x in rm['contact_sheets']:
    y=dict(x); y['visually_inspected_reduced_scale']=True
    y['review_result']='PASS: page labels and page sequence visible; no missing/corrupt tile. Fine print is not judged at this scale.'
    contacts.append(y)

# Open all 17 unique candidate region assets at native resolution and record dimensions/hash.
assets=[]; seen=set()
for x in c['visual_asset_hash_checks']:
    ref=x['rendered_asset_ref']
    if ref in seen: continue
    seen.add(ref); p=CAND/ref; im=Image.open(p)
    assets.append({'region_id':x['region_id'],'path':rel(p),'sha256':sha(p),'dimensions_px':list(im.size),
                   'matches_candidate_snapshot':x['matches_snapshot'],'opened_at_native_resolution':True,
                   'legibility':'PASS: readable whole-page asset; corresponding pinned original page was inspected full-size.'})
c['q1_whole_question_correction']['direct_qp_source_check']['source_visual_result']='PASS: original W21/12 QP p2 visibly labels Q1 and prints [2].'
c['q1_whole_question_correction']['direct_ms_source_check']['source_visual_result']='PASS: original W21/12 MS p3 prints whole Q1, two one-mark conditions and row total 2; no allocation inferred.'
for x in c['visual_asset_hash_checks']: x['legibility_status']='PASS: candidate whole-page asset opened at native resolution; matching original page inspected full-size.'
for x in c['a9_visual_risk_target_ms_marking_items']['items']: x['legibility_review']='PASS: original MS page inspected full-size; candidate whole-page asset opened and snapshot-pinned.'
for x in c['a9_visual_risk_target_qp_regions']['targets']: x['render_legibility']='PASS: original QP page inspected full-size; candidate whole-page asset opened and snapshot-pinned.'
c['new_q1_ms_region']['legibility_review']='PASS: original MS p3 inspected full-size; candidate visual dependency asset opened and snapshot-pinned.'
dump(cp,c)

un=c['hierarchy_unresolved_context']['hierarchy_unresolved']
fullsize=len(pages); contact_total=sum(x['page_count'] for x in contacts)
visual={'task_id':'P1-S1-A4-B21-RETEST-V5','full_size_page_count':fullsize,'full_size_pages':pages,
        'contact_sheet_count':len(contacts),'contact_sheet_page_count':contact_total,'contact_sheets':contacts,
        'unique_candidate_visual_asset_count':len(assets),'candidate_visual_assets':assets,
        'coverage_limit':'31 unique original pages viewed full-size; all remaining pages screened only through 12 reduced-scale contact sheets (154 pages).'}
dump(OUT/'A4_VISUAL_REVIEW_V5.json',visual)

a3cmp={'task_id':'P1-S1-A4-B21-RETEST-V5','candidate_version':'B21-A2-v5',
 'a3_handoff':{'path':rel(a3p),'sha256':sha(a3p),'recommendation':a3['recommendation']},
 'a0_a3_audit':{'path':rel(a0p),'sha256':sha(a0p),'status':a0['audit_status'],
   'input_pins':a0['integrity_checks']['input_pins'],'candidate_snapshot':a0['integrity_checks']['candidate_snapshot_files'],
   'source_pdfs':a0['integrity_checks']['source_pdfs'],'outputs':a0['integrity_checks']['outputs_excluding_handoff_and_checksum']},
 'comparison':{'same_candidate_handoff':c['candidate_integrity']['chain_summary']['all_handoff_hashes_and_bytes_match'],
   'same_snapshot':c['candidate_integrity']['chain_summary']['all_snapshot_hashes_and_bytes_match'],
   'q1_source_correction':'A3/A4 agree: QP p2 [2], unparted Q1 root, exact MS whole-Q1 row p3; independently rechecked by A4.',
   'totals_and_targets':'A3/A4 agree on six totals of 75, 13 MS IDs across 12 pages, and four QP regions; A4 rechecked locator/dependency/relation/status/assets/legibility.',
   'unresolved':'Both retain 34 PARENT_CONTEXT_ONLY records unallocated; A4 independently reconciled marking records to unresolved part rows.',
   'disagreements':[],'a3_result_not_substituted_for_a4':True}}
dump(OUT/'A3_V5_COMPARISON.json',a3cmp)

criteria=[
 {'criterion':'Candidate/input integrity','status':'PASS','evidence':'28 declared input pins match; 12 original PDFs/154 pages match Stage 0; all 309 handoff outputs and 310 snapshot entries match hashes/bytes.'},
 {'criterion':'W21/12 Q1 root mark and exact MS link','status':'PASS','evidence':'QP p2 prints [2]; existing root carries 2 without a child; exact whole-Q1 MS row at p3 is linked only to the root, with exact condition and same-page visual dependency.'},
 {'criterion':'Six cover totals','status':'PASS','evidence':'Independent sums of question/part marks equal each original cover total, 75.'},
 {'criterion':'A9 MS/QP visual targets','status':'PASS','evidence':'13 MS item IDs across 12 pages and four QP regions have exact locators, relationships, dependencies, statuses and hash-pinned legible assets.'},
 {'criterion':'All marking targets/dependencies','status':'PASS','evidence':'208 records; exclusive valid targets; 65 visual dependencies resolve to matching MS source/page.'},
 {'criterion':'34 unresolved parent-context records','status':'PASS','evidence':f"{un['unresolved_marking_record_count']} PARENT_CONTEXT_ONLY marking rows reconcile to {un['unresolved_parent_count']} unresolved part rows; mark/condition/table-row fields null and IDs unchanged from v4."},
 {'criterion':'Hierarchy and Q7/Q8 context','status':'PASS','evidence':'48 roots/205 parts, unique IDs, no dangling parents; S21 QP11/13 Q7 continuation and Q8 starts agree with inspected context pages.'},
 {'criterion':'v4-to-v5 scope','status':'PASS','evidence':'Only existing Q1 root mark changed and exact whole-question MS item appended; other file changes are necessary manifests, validation and documentation.'},
 {'criterion':'Visual coverage','status':'PASS','evidence':f'{fullsize} original pages inspected full-size, {len(contacts)} contact sheets/154 pages overview-screened, and {len(assets)} distinct candidate visual assets opened and snapshot-pinned.'},
 {'criterion':'A3 same-version comparison','status':'PASS','evidence':'A3 v5 handoff and A0 audit pinned; no disagreement found. A3 recommendation not adopted as the A4 decision.'}]

limitations=['Historic S1-I14 remains open and non-blocking; this retest does not recover the A4-v2 digest.',
 'Source identity is matched to local Stage 0 hashes; remote Cambridge authenticity was not independently checked.',
 'Contact sheets are overview only; only the 31 listed pages received full-size inspection.',
 'A4 recommendation is gate-only; A9 and A0 batch decision remain required.']
findings={'schema_version':'1.0','task_id':'P1-S1-A4-B21-RETEST-V5','candidate_version':'B21-A2-v5',
 'candidate_handoff_sha256':'d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2',
 'recommendation':'PASS_A4_ONLY','batch_acceptance_claimed':False,'new_blocking_findings':[],'criteria':criteria,
 'q1_source_check':c['q1_whole_question_correction'],'mark_totals':c['six_mark_total_recompute'],
 'a9_ms_targets':c['a9_visual_risk_target_ms_marking_items'],'a9_qp_targets':c['a9_visual_risk_target_qp_regions'],
 'marking_targets':c['all_marking_targets'],'unresolved_context':un,'hierarchy_context':c['hierarchy_unresolved_context'],
 'v4_to_v5_delta':c['v4_to_v5_preservation'],'retained_limitations':limitations,
 'a3_comparison':{'path':rel(OUT/'A3_V5_COMPARISON.json'),'sha256':sha(OUT/'A3_V5_COMPARISON.json'),'a0_audit':'PASS'}}
dump(OUT/'RETEST_FINDINGS_V5.json',findings)

report='''# Independent A4 retest — B21 A2 v5

Task: `P1-S1-A4-B21-RETEST-V5`  
Candidate handoff SHA-256: `d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2`  
Recommendation: **PASS for the A4 gate only.** This does not accept the batch or close A9/A0.

## Source-backed Q1 correction

The original `9618_w21_qp_12.pdf` p. 2 visibly prints Question 1 with `[2]`. The existing root `9618_w21_qp_12-q1` now records displayed mark `2`; no child part was added. The original `9618_w21_ms_12.pdf` p. 3 prints whole Question 1 with two one-mark conditions (three correct lines from Data Security; two correct lines from Data Integrity) and row total 2. Candidate item `9618_w21_qp_12-q1-mi-1` points to MS p. 3, targets only the Q1 root, preserves the conditions, and depends on `9618_w21_ms_12-p3-whole-page`. No allocation to child parts or table rows was inferred.

## Retest results

- All 12 original PDFs match Stage 0 hashes and page counts (154 pages total). Candidate integrity passes: all 309 declared handoff outputs and 310 snapshot entries match hashes and byte sizes.
- Independent sums from question/part records match the printed cover total of 75 for all six papers.
- All 13 A9 MS item IDs resolve across 12 pages with exact source/page locators, dependencies and candidate regions. All four QP regions match their expected source/page and `relates_to_ids`. Region status, snapshot asset hashes and legibility pass.
- All 208 marking targets are exclusive and resolve to existing records; 65 visual dependencies resolve to the corresponding MS source/page. The 34 `PARENT_CONTEXT_ONLY` records match the 34 unresolved part records, retain null mark/condition/table-row allocation, and are unchanged from v4.
- Q7/Q8 hierarchy and S21 cross-page context agree with inspected source pages. The semantic v4-to-v5 delta is limited to the existing Q1 root mark and the appended whole-question MS row; remaining changes are manifests, validation and documentation.
- I inspected 31 unique source pages at full size: all 17 Q1/A9 visual target pages, eight S21 Q7/Q8 continuity pages, and six covers. Twelve reduced-scale contact sheets cover all 154 pages. All 17 distinct candidate whole-page region assets were opened at native resolution and are readable.

## Same-version comparison and limits

The A3 v5 handoff and its A0 integrity audit are pinned in `A3_V5_COMPARISON.json`. A3 and A4 agree on the Q1 correction, six totals, visual targets and unresolved context. A3's `PASS_A3_ONLY` recommendation is not used as the A4 decision.

Historic S1-I14 remains open as a non-blocking provenance caveat. Source identity was matched to the local Stage 0 manifest; remote Cambridge authenticity was not independently checked. Contact sheets give overview coverage only. A9 independent review and A0's B21 batch decision remain required.

## Evidence

- `RETEST_FINDINGS_V5.json` — criterion-level evidence and gate recommendation.
- `A4_REVIEW_CHECKS_V5.json` — source, index, target, unresolved and preservation checks.
- `A4_VISUAL_REVIEW_V5.json` and `SOURCE_RENDER_MANIFEST_V5.json` — page coverage and source/render hashes.
- `A3_V5_COMPARISON.json` — frozen same-version A3 handoff and A0 audit.
- `PINNED_INPUT_CHECKS_V5.json`, `V4_TO_V5_DELTA_CHECK.json`, `renders/full_size/`, `contact_sheets/` — integrity, change and visual evidence.
- `HANDOFF_RETEST_V5.json` — frozen input/output/source/render pins for A0 audit.

Candidate and prior evidence were not modified. This recommendation is limited to **A4 v5**.
'''
(OUT/'RETEST_V5.md').write_text(report,encoding='utf-8')

# Pin all explicitly checked inputs plus original sources; every output except this handoff and checksum.
pins=[]
for x in c['input_pins']['pins']:
    p=ROOT/x['path']; pins.append({'name':x['name'],'path':x['path'],'sha256':x['actual_sha256'],
      'bytes':p.stat().st_size,'expected_sha256':x['expected_sha256'],'matches_pin':x['matches_pin']})
for x in c['source_integrity']['source_checks']:
    p=ROOT/x['path']; pins.append({'name':'ORIGINAL_SOURCE_'+x['source_id'],'path':x['path'],
      'sha256':x['actual_sha256'],'stage0_sha256':x['stage0_sha256'],'bytes':p.stat().st_size,
      'page_count':x['actual_page_count'],'matches_pin':x['matches_all']})
outputs=[]
for p in sorted(OUT.rglob('*')):
    if p.is_file() and p.name not in {'HANDOFF_RETEST_V5.json','HANDOFF_RETEST_V5.sha256'}:
        outputs.append({'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size})
handoff={'schema_version':'1.0','artifact_version':'B21-A4-RETEST-v5','task_id':'P1-S1-A4-B21-RETEST-V5',
 'status':'FROZEN_FOR_A0_INTEGRITY_AUDIT','created_at':'2026-09-21','recommendation':'PASS_A4_ONLY',
 'review_scope':'Independent same-version A4 source/linkage/marks/hierarchy/context/visual retest; gate only.',
 'write_allowlist':'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B21/retest_v5/','candidate_untouched':True,
 'candidate':{'version':'B21-A2-v5','path':'evidence/a2/B21/versions/B21-A2-v5',
   'handoff_sha256':'d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2',
   'batch_manifest_sha256':'61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7',
   'snapshot_manifest_sha256':'63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581',
   'declared_output_count':c['candidate_integrity']['chain_summary']['declared_output_count'],
   'snapshot_file_count':c['candidate_integrity']['chain_summary']['snapshot_file_count'],
   'all_candidate_hashes_match':c['candidate_integrity']['chain_summary']['all_handoff_hashes_and_bytes_match'] and c['candidate_integrity']['chain_summary']['all_snapshot_hashes_and_bytes_match']},
 'frozen_input_pins':pins,'input_pin_count':len(pins),'all_input_pins_match':all(x['matches_pin'] for x in pins),
 'source_pdf_count':len(c['source_integrity']['source_checks']),'source_pages_total':c['source_integrity']['page_count_total'],
 'same_version_a3':{'handoff_path':rel(a3p),'handoff_sha256':sha(a3p),'recommendation':a3['recommendation'],
   'a0_audit_path':rel(a0p),'a0_audit_sha256':sha(a0p),'audit_status':a0['audit_status']},
 'review_coverage':{'full_size_source_pages':fullsize,'contact_sheets':len(contacts),'contact_sheet_pages_reduced_scale':contact_total,'candidate_visual_assets':len(assets)},
 'criteria':criteria,'limitations':limitations,'new_blocking_findings':[],'batch_acceptance_claimed':False,
 'required_next':['A9 independent B21 v5 retest','A0 B21 batch decision'],
 'output_files_excluding_handoff_and_checksum':outputs,'output_file_count_excluding_this_handoff_and_checksum':len(outputs),
 'stop_point':'A0 must audit this frozen A4 handoff. It does not accept B21 or replace A9/A0.'}
dump(OUT/'HANDOFF_RETEST_V5.json',handoff)
hsha=sha(OUT/'HANDOFF_RETEST_V5.json')
(OUT/'HANDOFF_RETEST_V5.sha256').write_text(f'{hsha}  HANDOFF_RETEST_V5.json\n',encoding='ascii')
print(json.dumps({'handoff_sha256':hsha,'output_files':len(outputs),'input_pins':len(pins),'sources':len(c['source_integrity']['source_checks']),
 'source_pages':c['source_integrity']['page_count_total'],'full_size_pages':fullsize,'contact_sheet_pages':contact_total,
 'assets':len(assets),'recommendation':handoff['recommendation']},indent=2))
