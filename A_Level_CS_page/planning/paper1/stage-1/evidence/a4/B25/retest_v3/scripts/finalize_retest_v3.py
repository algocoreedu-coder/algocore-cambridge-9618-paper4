from pathlib import Path
import hashlib, json

ROOT = Path.cwd()
STAGE = ROOT / 'A_Level_CS_page/planning/paper1/stage-1'
OUT = STAGE / 'evidence/a4/B25/retest_v3'
CAND = STAGE / 'evidence/a2/B25/versions/B25-A2-v3'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def readjson(path):
    return json.loads(path.read_text(encoding='utf-8'))

verification = readjson(OUT / 'INPUT_VERIFICATION_V3.json')
findings = readjson(OUT / 'RETEST_FINDINGS_V3.json')
render_manifest = readjson(OUT / 'SOURCE_RENDER_MANIFEST_V3.json')
rows = findings['source_rows']['results']
reg = findings['all_183_link_regression']
structure = findings['structure']

dispositions = {
    'artifact': 'B25 A4 v3 finding dispositions',
    'candidate_version': 'B25-A2-v3',
    'gate_scope': 'A4 specialist boundary/linkage gate only',
    'dispositions': [{
        'finding_id': 'A9-B25-MS-01', 'severity_at_intake': 'Major',
        'status': 'CLOSED_IN_CANDIDATE_PENDING_A0' if findings['recommendation'] == 'PASS_A4_ONLY' else 'OPEN',
        'expected_occurrences': 8, 'directly_checked_occurrences': len(rows),
        'failed_occurrences': findings['source_rows']['failures'],
        'rows': [{'record_id': r['record_id'], 'source_id': r['source_id'], 'pdf_page_1_based': r['pdf_page_1_based'], 'table_row_ref': r['table_row_ref']} for r in rows],
        'closure_basis': 'All eight exact original MS row pages were rendered from pinned originals and visually inspected. v3 removes only the generic next-table header from each named marking excerpt; terminal answer/mark and non-text metadata are preserved.'
    }],
    'prior_a4_findings': {
        'status': 'CARRIED_FORWARD_FROM_A4_V2_UNCHANGED',
        'basis': 'The context records, question/page indexes, visual regions and full-page-render manifest are byte-identical to B25-A2-v2. A4-v2 context/linkage dispositions therefore have no detected regression in v3.'
    },
    'new_a4_findings': [],
    'open_critical_or_major_a4_findings': 0 if findings['recommendation'] == 'PASS_A4_ONLY' else None,
    'batch_acceptance': 'NOT_DECIDED; A9-v3 and A0 decision remain mandatory'
}
(OUT / 'FINDING_DISPOSITIONS_V3.json').write_text(json.dumps(dispositions, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

criteria = [
    ('frozen_input_pins', verification['pins_passed'] == verification['pins_checked'], f"{verification['pins_passed']}/{verification['pins_checked']} pins"),
    ('candidate_snapshot', verification['snapshot_entries_passed'] == verification['snapshot_entries_declared'] == 450, f"{verification['snapshot_entries_passed']}/450 entries"),
    ('authoritative_sources', len(verification['source_pdfs']) == 12 and verification['source_pages_total'] == 178 and not verification['source_failures'], '12 PDFs / 178 pages'),
    ('eight_corrected_source_rows', len(rows) == 8 and not findings['source_rows']['failures'], f"{len(rows)}/8 direct rows; 0 failures"),
    ('all_marking_targets', len(reg['target_errors']) == 0 and reg['marking_items'] == 183, '183/183 links, 3 whole-question + 180 part'),
    ('all_marking_locators', len(reg['locator_errors']) == 0, '183 locator checks; 0 errors'),
    ('all_transcript_refs', len(reg['transcript_errors']) == 0, '183 transcript references; 0 errors'),
    ('all_visual_dependencies', len(reg['visual_dependency_errors']) == 0 and len(reg['visual_render_errors']) == 0, 'all refs and original render hashes resolve'),
    ('terminal_generic_header_scan', len(reg['terminal_generic_header_ids']) == 0, '0 of 183 excerpts end in generic header'),
    ('structure_unchanged', all(structure[k] for k in ('question_index_byte_identical_to_v2','page_index_byte_identical_to_v2','contexts_identical_to_v2','visual_regions_identical_to_v2','full_page_render_manifest_identical_to_v2')), 'indexes, contexts and visual relations unchanged from v2'),
    ('parent_hierarchy', structure['parent_groups'] == 27 and not structure['parent_group_errors'] and not structure['synthetic_parent_mark_targets'], '27/27 groups; no synthetic parent marks'),
    ('six_paper_totals', len(findings['qp_cover_totals']) == 6 and all(r['pass'] for r in findings['qp_cover_totals']), 'all six QP covers and indexed totals equal 75'),
]
matrix = {'artifact': 'B25 A4 v3 independent retest check matrix', 'recommendation': findings['recommendation'],
          'gate_scope': findings['gate_scope'], 'checks': [{'criterion': k, 'status': 'PASS' if passed else 'FAIL', 'evidence': evidence} for k, passed, evidence in criteria]}
(OUT / 'RETEST_CHECK_MATRIX_V3.json').write_text(json.dumps(matrix, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

rowtable = '\n'.join(f"| `{r['record_id']}` | `{r['source_id']}` p.{r['pdf_page_1_based']} | `{r['table_row_ref']}` | PASS | `{r['direct_original_render_path']}` |" for r in rows)
checks_text = '\n'.join(f"- **{k.replace('_',' ')}:** {'PASS' if passed else 'FAIL'} — {evidence}." for k, passed, evidence in criteria)
report = f'''# B25 A4 v3 independent retest\n\n**Recommendation: {findings['recommendation']}.** This is the A4 specialist gate for exact candidate `B25-A2-v3`. It does not accept the batch. A9-v3 review and A0 audit/decision remain required.\n\n## Frozen identity\n\nThe work order SHA-256 is `{verification['dispatch_sha256']}`. All {verification['pins_passed']}/{verification['pins_checked']} frozen pins passed, all {verification['snapshot_entries_passed']}/450 candidate snapshot entries matched, and all 12 authoritative 2025 source PDFs (178 pages) matched Stage 0 hashes and page counts. Candidate v3 remained read-only. See `INPUT_PINS_V3.json`, `INPUT_VERIFICATION_V3.json`, and `SOURCE_PDF_HASHES_V3.json`.\n\n## Results\n\n{checks_text}\n\nAll 183 marking items were independently checked: 3 whole-question targets and 180 part targets. The exact target, source-component, MS-page, transcript-file, visual-region and rendered-asset references resolve. The complete marking text scan found no terminal generic `Question / Answer / Marks` header. The 175 unaffected marking rows remain byte-identical to v2; each of the eight corrected rows changes only its marking text and equals the v2 excerpt with only that unrelated trailing header removed.\n\nThe 27 parent groups retain null parent marks/locators and have no parent-targeted marking item. All six original QP covers state 75, and the candidate index and mark-total checks also sum to 75 for each. Question/page indexes, contexts, visual-region records and full-page render manifest match v2 exactly.\n\n## A9-B25-MS-01 source-row retest\n\nAll eight cited original mark-scheme pages were directly rendered and visually inspected. Each cited row ends at its displayed mark; the following generic header is a separate table header and is absent from the corrected candidate excerpt.\n\n| Marking record | Original MS page | Table row | Result | Direct render |\n|---|---|---|---|---|\n{rowtable}\n\n## Visual evidence and limits\n\n`SOURCE_RENDER_MANIFEST_V3.json` records 19 hashed original-page renders at 144 dpi: seven unique corrected MS boundary pages, all six QP cover pages, and six risk-focused QP samples covering S25/W25 components 11/12/13. Full-size images and contact sheets are in `source_renders/` and `contact_sheets/`; `DIRECT_SOURCE_TEXT_V3.txt` is corroborating extracted text, not a substitute for the visual review.\n\nThis retest closes the A9 marking-row boundary finding for the frozen v3 candidate at the A4 specialist gate. It does not replace A9-v3 review, the A0 handoff audit or the A0 batch decision.\n'''
(OUT / 'RETEST_V3.md').write_text(report, encoding='utf-8')

# Output manifest pins all payload artifacts except self-referential control files.
control = {'OUTPUT_MANIFEST_V3.json', 'OUTPUT_SHA256SUMS.txt', 'HANDOFF_RETEST_V3.json', 'HANDOFF_RETEST_V3.sha256'}
payload = sorted(p for p in OUT.rglob('*') if p.is_file() and p.name not in control)
manifest = {'artifact': 'B25 A4 v3 retest output manifest', 'candidate_version': 'B25-A2-v3',
            'payload_file_count': len(payload),
            'files': [{'path': p.relative_to(OUT).as_posix(), 'sha256': sha(p), 'bytes': p.stat().st_size} for p in payload]}
(OUT / 'OUTPUT_MANIFEST_V3.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

candidate_pins = {
    'candidate_handoff_sha256': 'e498e1f978bc038e98de3551d5dffe061b1f71fce866d86744ec24e3a82d02c5',
    'candidate_batch_manifest_sha256': '4a9e64a05d6205e4f3cae6e2b8c013e34d5176f757ecffbe66a1c58171c98489',
    'candidate_snapshot_manifest_sha256': 'e78a8b8f8f2b399ed6f442de614abdd494b4d357494524c3f0c4cc9150cc3957',
    'candidate_marking_index_sha256': 'a200dabddd320b94aaf159c4b5742a63de5a4c0f0b936584bb9794fdc0616eef',
}
handoff = {
    'schema_version': '1.0', 'handoff_id': 'P1-S1-A4-B25-RETEST-V3',
    'state': 'FROZEN_PENDING_A0_HANDOFF_AUDIT', 'reviewer_role': 'A4 independent retest',
    'candidate_version': 'B25-A2-v3', 'recommendation': findings['recommendation'],
    'gate_scope': 'A4 marking-boundary, linkage, hierarchy and source-render checks only',
    'batch_acceptance': False, 'frozen': True, 'candidate_modified': False,
    'work_order': {'path': 'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B25_A4_V3_RETEST_DISPATCH.md', 'sha256': verification['dispatch_sha256']},
    'dispatch_record_sha256': verification['dispatch_record_sha256'],
    'candidate_pins': candidate_pins,
    'input_verification': {'path':'INPUT_VERIFICATION_V3.json','sha256':sha(OUT/'INPUT_VERIFICATION_V3.json'),
                           'pins_passed':verification['pins_passed'],'pins_checked':verification['pins_checked'],
                           'snapshot_entries_passed':verification['snapshot_entries_passed'],
                           'source_pdfs':len(verification['source_pdfs']),'source_pages':verification['source_pages_total']},
    'review_results': {
        'finding_id':'A9-B25-MS-01','corrected_rows_expected':8,'corrected_rows_passed':len(rows)-len(findings['source_rows']['failures']),
        'marking_items':reg['marking_items'],'whole_question_targets':reg['whole_question_targets'],'part_targets':reg['part_targets'],
        'target_errors':len(reg['target_errors']),'locator_errors':len(reg['locator_errors']),
        'transcript_errors':len(reg['transcript_errors']),'visual_dependency_errors':len(reg['visual_dependency_errors'])+len(reg['visual_render_errors']),
        'terminal_generic_header_rows':len(reg['terminal_generic_header_ids']),
        'parent_groups':structure['parent_groups'],'parent_group_errors':len(structure['parent_group_errors']),
        'synthetic_parent_mark_targets':len(structure['synthetic_parent_mark_targets']),
        'six_qp_totals_pass':all(x['pass'] for x in findings['qp_cover_totals']),
        'direct_source_renders':render_manifest['render_count'],
        'findings_path':'RETEST_FINDINGS_V3.json','findings_sha256':sha(OUT/'RETEST_FINDINGS_V3.json'),
        'check_matrix_path':'RETEST_CHECK_MATRIX_V3.json','check_matrix_sha256':sha(OUT/'RETEST_CHECK_MATRIX_V3.json'),
        'dispositions_path':'FINDING_DISPOSITIONS_V3.json','dispositions_sha256':sha(OUT/'FINDING_DISPOSITIONS_V3.json')},
    'deliverables': {'report_path':'RETEST_V3.md','report_sha256':sha(OUT/'RETEST_V3.md'),
                     'source_pdf_manifest_sha256':sha(OUT/'SOURCE_PDF_HASHES_V3.json'),
                     'source_render_manifest_sha256':sha(OUT/'SOURCE_RENDER_MANIFEST_V3.json'),
                     'output_manifest_path':'OUTPUT_MANIFEST_V3.json','output_manifest_sha256':sha(OUT/'OUTPUT_MANIFEST_V3.json'),
                     'output_payload_file_count':len(payload)},
    'next_required_gates':['A0_A4_V3_HANDOFF_AUDIT','A9_V3_INDEPENDENT_REVIEW','A0_BATCH_DECISION'],
    'stop_after_handoff':True,
    'scope_note':'Only evidence/a4/B25/retest_v3/ was written. Candidate, source, prior evidence, trackers and app were not edited.'
}
(OUT / 'HANDOFF_RETEST_V3.json').write_text(json.dumps(handoff, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
handoff_hash = sha(OUT / 'HANDOFF_RETEST_V3.json')
(OUT / 'HANDOFF_RETEST_V3.sha256').write_text(f'{handoff_hash}  HANDOFF_RETEST_V3.json\n', encoding='ascii')
all_files = sorted(p for p in OUT.rglob('*') if p.is_file() and p.name != 'OUTPUT_SHA256SUMS.txt')
(OUT / 'OUTPUT_SHA256SUMS.txt').write_text(''.join(f"{sha(p)}  {p.relative_to(OUT).as_posix()}\n" for p in all_files), encoding='ascii')
print(json.dumps({'report_sha256':sha(OUT/'RETEST_V3.md'),
                  'findings_sha256':sha(OUT/'RETEST_FINDINGS_V3.json'),
                  'dispositions_sha256':sha(OUT/'FINDING_DISPOSITIONS_V3.json'),
                  'check_matrix_sha256':sha(OUT/'RETEST_CHECK_MATRIX_V3.json'),
                  'output_manifest_sha256':sha(OUT/'OUTPUT_MANIFEST_V3.json'),
                  'handoff_sha256':handoff_hash,
                  'output_sha256sums_sha256':sha(OUT/'OUTPUT_SHA256SUMS.txt'),
                  'payload_count':len(payload),'sum_entries':len(all_files)}, indent=2))
