import hashlib, json
from collections import defaultdict
from pathlib import Path
from pypdf import PdfReader

ROOT=Path.cwd(); ST=ROOT/'A_Level_CS_page/planning/paper1/stage-1'; OUT=ST/'evidence/a3/B22/retest_v5'
C=ST/'evidence/a2/B22/versions/B22-A2-v5'; V4=ST/'evidence/a2/B22/versions/B22-A2-v4'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def j(p): return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def jl(p): return [json.loads(x) for x in Path(p).read_text(encoding='utf-8-sig').splitlines() if x.strip()]
def rel(p): return Path(p).resolve().relative_to(ROOT.resolve()).as_posix()
def pin(p,e=None):
 p=Path(p); h=sha(p); assert not e or h==e,(str(p),h,e)
 return {'path':rel(p),'sha256':h,'bytes':p.stat().st_size,'expected_sha256':e,'matches_expected':True if e else None}

# Frozen work-order, candidate, A0, prior-review and authority inputs.
EXPECTED={
'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A3_V5_RETEST_DISPATCH.md':'2471bd59020b0cb33f88b6496ac4f1cf00f1c6b580b7bf2acef38dfc25bf08a7',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A2_V5_A0_VALIDATE.json':'53d28c63b7390dd8019694e2769747dde6fb41ee5811cf5270e3ab23242f72ca',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A2_V5_A0_AUDIT.json':'e00c6233efe0de36565456dffe9d3c59263aee75292c0614f1e469b7b2f62ca5',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B22/retest_v4/HANDOFF_RETEST_V4.json':'84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B22/retest_v4/HANDOFF_RETEST_V4.json':'40e891f892c83e1e4b258eb625d173f2e7250d648da98597e3c1fce0dbf05a32',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A3_V4_HANDOFF_AUDIT.json':'cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A4_V4_HANDOFF_AUDIT.json':'921f8293b27965641a855170bc72f1bac2420120c47f2a5535939389a4c0281a',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22/versions/B22-A2-v5/HANDOFF_CHECK.json':'93dd40c9fe8172d07df01be9e9134ef3893ea1e29bd4f2a0b2524e37968c485e',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22/versions/B22-A2-v5/BATCH_MANIFEST.json':'adf4f8fd9a465aac4dee9bd52e9b39ea15ca3a541757dc7d42acf0592402bfd3',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22/versions/B22-A2-v5/SNAPSHOT_MANIFEST.json':'85dbffa1e2068b3baa49cd8cf99e0a6ed0729f2c10bae7438424babd14dd744a',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22/versions/B22-A2-v5/REVIEW_UNION_MANIFEST.json':'3f11507d2b798767d68969bf685b1616ba70ea0767450e60f3d9b4bbbd5cd9ef',
'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22/versions/B22-A2-v5/V4_TO_V5_SEMANTIC_DIFF.json':'a6654c788bbce697c526086086fc8fefbc353fa483584479a3f2268c3902d15c',
'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json':'195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c',
'697372-2026-syllabus.pdf':'bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470',
'A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md':'9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f',
'A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md':'97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2',
'A_Level_CS_page/planning/paper1/stage-0/SCOPE_AND_COVERAGE_PLAN.md':'1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb',
'A_Level_CS_page/planning/paper1/stage-0/evidence/a3/SYLLABUS_SCOPE.md':'87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c',
}
inputs=[pin(p,h) for p,h in EXPECTED.items()]
dispatch_record=ST/'evidence/a0/B22_A3_V5_RETEST_DISPATCH_RECORD.json'
dispatch_pin=pin(dispatch_record); assert j(dispatch_record)['work_order']['sha256']==EXPECTED['A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A3_V5_RETEST_DISPATCH.md']

# Verify all candidate snapshot file hashes and exact v4-to-v5 file delta.
snap=j(C/'SNAPSHOT_MANIFEST.json')['artifact_sha256']; cand_pins=[]
for name,digest in sorted(snap.items()):
 p=C/name; assert p.is_file() and sha(p)==digest,(name,digest,sha(p))
 cand_pins.append({'path':rel(p),'sha256':digest,'bytes':p.stat().st_size})
assert len(cand_pins)==420
old=j(V4/'SNAPSHOT_MANIFEST.json')['artifact_sha256']
sem=j(C/'V4_TO_V5_SEMANTIC_DIFF.json')
all_old={p.relative_to(V4).as_posix():sha(p) for p in V4.rglob('*') if p.is_file()}
all_new={p.relative_to(C).as_posix():sha(p) for p in C.rglob('*') if p.is_file()}
actual_added=sorted(all_new.keys()-all_old.keys()); actual_removed=sorted(all_old.keys()-all_new.keys())
actual_changed=sorted(k for k in all_old.keys()&all_new.keys() if all_old[k]!=all_new[k])
assert actual_added==sorted(sem['files_added_from_v4']) and actual_removed==[] and actual_changed==sorted(sem['files_changed_from_v4'])
protected=['PAGE_INDEX.jsonl','QUESTION_INDEX.jsonl','MARKING_INDEX.jsonl','VISUAL_MANIFEST.json','UNRESOLVED.md']
protected_checks=[]
for name in protected:
 same=(V4/name).read_bytes()==(C/name).read_bytes(); assert same
 protected_checks.append({'file':name,'v4_sha256':sha(V4/name),'v5_sha256':sha(C/name),'byte_identical':same})

# Verify original sources against Stage 0, including all 166 PDF pages.
stage0=j(ROOT/'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json')
src={x['id']:x for x in stage0['primary_sources'] if x['id'].startswith(('9618_s22_','9618_w22_'))}; assert len(src)==12
source_pins=[]
for sid,x in sorted(src.items()):
 p=ROOT/x['path']; pages=len(PdfReader(str(p)).pages); digest=sha(p)
 assert digest==x['sha256'] and pages==x['page_count']
 source_pins.append({'source_id':sid,'path':x['path'],'sha256':digest,'bytes':p.stat().st_size,'page_count':pages,'matches_stage0':True,'remote_authenticity_verified':False})
assert sum(x['page_count'] for x in source_pins)==166

# Independently derive the correction/visual/cover page-set arithmetic.
union=j(C/'REVIEW_UNION_MANIFEST.json'); corr=j(C/'CORRECTION_EVIDENCE.json')
mark_rows=corr['mark_corrections']; loc_rows=corr['locator_corrections']; correction_rows=mark_rows+loc_rows
correction_pages={(x['source_id'],x.get('pdf_page_1_based',x.get('source_prompt_pdf_page_1_based'))) for x in correction_rows}
visual_pages={(x['source_id'],x['pdf_page_1_based']) for x in union['role_reconciliation']['changed_visual_region_source_pages']}
cover_pages={(x['source_id'],x['pdf_page_1_based']) for x in union['role_reconciliation']['cover_pages']}
overlap=correction_pages & visual_pages; page_union=correction_pages | visual_pages | cover_pages
unique_records={x['record_id'] for x in correction_rows}
assert (len(mark_rows),len(loc_rows),len(correction_rows),len(unique_records),len(correction_pages),len(visual_pages),len(cover_pages),len(overlap),len(page_union))==(7,12,19,18,11,12,6,7,22)
manifest_pages={(x['source_id'],x['pdf_page_1_based']) for x in union['pages']}
assert page_union==manifest_pages and len(union['pages'])==22
counts=union['counts']; assert counts['correction_rows']==19 and counts['distinct_corrected_records']==18
assert counts['correction_row_unique_source_pages']==11 and counts['changed_visual_region_source_pages']==12
assert counts['qp_cover_pages']==6 and counts['correction_region_overlap_pages']==7 and counts['deduplicated_expanded_review_union_pages']==22

# Verify every union source/page render, 18 legacy assets (17 in union; 1 supplement) and 5 new renders.
render_map={}; union_pages=[]
for row in union['pages']:
 sid=row['source_id']; assert sid in src and row['source_pdf_sha256']==src[sid]['sha256'] and row['source_pdf_page_count']==src[sid]['page_count']
 p=C/row['render_path']; assert sha(p)==row['render_sha256']
 outname=f"{sid}-p{row['pdf_page_1_based']:02d}.png"; copy=OUT/'source_renders'/outname
 assert sha(copy)==row['render_sha256']
 entry={'source_id':sid,'pdf_page_1_based':row['pdf_page_1_based'],'roles':row['roles'],'source_pdf_sha256':row['source_pdf_sha256'],
  'candidate_render_path':row['render_path'],'candidate_render_sha256':row['render_sha256'],'review_copy_path':f'source_renders/{outname}',
  'review_copy_sha256':sha(copy),'render_provenance':row['render_provenance'],'visual_review':'PASS_FULL_PAGE_RENDER_LEGIBLE'}
 union_pages.append(entry); render_map[(sid,row['pdf_page_1_based'])]=entry
legacy=union['legacy_v4_dedicated_render_assets']; assert len(legacy)==18
legacy_check=[]
for x in legacy:
 p=C/x['file']; baseline=V4/x['file']; actual=sha(p)
 assert actual==x['render_sha256'] and baseline.is_file() and sha(baseline)==actual
 pair=(x['source_id'],x['pdf_page_1_based']); in_union=pair in manifest_pages
 assert in_union==x['in_expanded_union']
 legacy_check.append({'source_id':x['source_id'],'pdf_page_1_based':x['pdf_page_1_based'],'path':x['file'],'sha256':actual,
  'matches_v4_byte_for_byte':True,'in_review_union':in_union})
assert sum(x['in_review_union'] for x in legacy_check)==17 and sum(not x['in_review_union'] for x in legacy_check)==1
new_paths=sorted((C/'renders/v5-review-union').glob('*.png')); assert len(new_paths)==5
new_checks=[]
for p in new_paths:
 row=next(x for x in union['pages'] if x['render_path']==p.relative_to(C).as_posix())
 assert sha(p)==row['render_sha256']
 new_checks.append({'source_id':row['source_id'],'pdf_page_1_based':row['pdf_page_1_based'],'path':row['render_path'],'sha256':sha(p)})
assert sum(str(x['candidate_render_path']).startswith('renders/v5-review-union/') for x in union_pages)==5

# Source-backed correction rows: indexed values/pages and transcript hashes.
qrows=jl(C/'QUESTION_INDEX.jsonl'); qmap={x['id']:x for x in qrows}
partmap={x['id']:x for x in qrows if 'question_id' in x}
mark_audit=[]
for row in mark_rows:
 q=partmap[row['record_id']]; srcpage=row['pdf_page_1_based']; page=render_map[(row['source_id'],srcpage)]
 assert q['marks_displayed_or_null']==row['source_mark_observed']
 assert q['qp_locator']['source_id']==row['source_id'] and q['qp_locator']['pdf_page_1_based']==srcpage
 tr=C/row['transcript_ref']; assert sha(tr)==row['transcript_sha256']
 assert row['direct_render_sha256']==page['candidate_render_sha256']
 mark_audit.append({'record_id':row['record_id'],'source_id':row['source_id'],'pdf_page_1_based':srcpage,'printed_label':row['printed_label'],
  'source_mark_observed':row['source_mark_observed'],'candidate_mark':q['marks_displayed_or_null'],'transcript_ref':row['transcript_ref'],
  'transcript_sha256':sha(tr),'render_sha256':page['candidate_render_sha256'],'result':'PASS'})
locator_audit=[]
for row in loc_rows:
 q=partmap[row['record_id']]; srcpage=row['source_prompt_pdf_page_1_based']; page=render_map[(row['source_id'],srcpage)]
 assert q['qp_locator']['source_id']==row['source_id'] and q['qp_locator']['pdf_page_1_based']==srcpage
 assert q['prompt_transcript_ref']==row['transcript_ref']
 tr=C/row['transcript_ref']; assert sha(tr)==row['transcript_sha256']
 assert row['direct_render_sha256']==page['candidate_render_sha256']
 locator_audit.append({'record_id':row['record_id'],'source_id':row['source_id'],'printed_label':row['printed_label'],
  'source_page_label_token_verified':row['source_page_label_token_verified'],'source_prompt_pdf_page_1_based':srcpage,
  'candidate_qp_locator':q['qp_locator'],'candidate_part_label':q.get('label'),'transcript_ref':row['transcript_ref'],
  'transcript_sha256':sha(tr),'render_sha256':page['candidate_render_sha256'],'result':'PASS'})
special=next(x for x in loc_rows if x['record_id']=='9618_w22_qp_13-q6-pbiii')
special_part=partmap[special['record_id']]; special_transcript=(C/special['transcript_ref']).read_text(encoding='utf-8-sig')
assert special['source_page_label_token_verified']=='(iii)' and special['source_prompt_pdf_page_1_based']==13
assert special_part['qp_locator']['pdf_page_1_based']==13 and special_part['label']=='(b)(iii)'
assert '(iii)' in special_transcript and sha(C/special['transcript_ref'])=='5c458e6ae76f4b2f77e1238d034f2611422f9b2fe94915bb2a13695ef06bb7d0'

# Independent six-paper mark sums from QP question roots and their parts.
roots=[x for x in qrows if 'source_qp_id' in x]; parts=[x for x in qrows if 'question_id' in x]
root_src={x['id']:x['source_qp_id'] for x in roots}; totals=defaultdict(int); marked=defaultdict(int)
for x in roots:
 if x['marks_displayed_or_null'] is not None: totals[x['source_qp_id']]+=x['marks_displayed_or_null']; marked[x['source_qp_id']]+=1
for x in parts:
 if x['marks_displayed_or_null'] is not None: sid=root_src[x['question_id']]; totals[sid]+=x['marks_displayed_or_null']; marked[sid]+=1
mt=j(C/'MARK_TOTAL_CHECK.json')['papers']; totals_audit=[]
for sid in sorted(k for k in totals if k.startswith(('9618_s22_qp_','9618_w22_qp_'))):
 cover=render_map[(sid,1)]; assert totals[sid]==75 and mt[sid]['printed_total_observed']==75
 totals_audit.append({'source_id':sid,'indexed_sum_recomputed':totals[sid],'printed_cover_total':75,'marked_rows':marked[sid],
  'source_pdf_sha256':src[sid]['sha256'],'cover_render_path':cover['candidate_render_path'],'cover_render_sha256':cover['candidate_render_sha256'],
  'result':'PASS_TOTAL_USED_AS_INTEGRITY_CHECK_ONLY'})
assert len(totals_audit)==6

# Contact-sheet and all output render pins.
contact_records=[]
for x in sorted((OUT/'contact_sheets').glob('*.png')):
 sid=x.name.replace('-all-pages.png',''); source=src[sid]; pages=source['page_count']
 contact_records.append({'source_id':sid,'source_pdf_sha256':source['sha256'],'page_count':pages,'pages_included_1_based':list(range(1,pages+1)),
  'path':f'contact_sheets/{x.name}','sha256':sha(x),'method':'Reviewer-generated PyMuPDF thumbnails at 0.40 scale; labeled four-column page sheet; reduced-scale screen.'})
assert len(contact_records)==12 and sum(x['page_count'] for x in contact_records)==166
source_evidence={'task_id':'P1-S1-A3-B22-RETEST-V5','work_order_sha256':EXPECTED['A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_A3_V5_RETEST_DISPATCH.md'],
 'source_count':12,'source_page_total':166,'review_union_page_count':22,'review_union_pages':union_pages,
 'correction_page_set_count':11,'changed_visual_region_page_set_count':12,'cover_page_set_count':6,'overlap_page_set_count':7,
 'legacy_v4_render_asset_count':18,'legacy_assets_in_union':17,'legacy_assets_outside_union':1,'legacy_assets':legacy_check,
 'new_v5_direct_render_count':5,'new_v5_renders':new_checks,'supplementary_outside_union':{'source_id':'9618_s22_qp_12','pdf_page_1_based':16,'sha256':next(x['sha256'] for x in legacy_check if x['source_id']=='9618_s22_qp_12' and x['pdf_page_1_based']==16),'reviewed_full_page':True,'union_member':False},
 'contact_sheet_count':12,'contact_sheets':contact_records,'visual_review_limits':['All 22 union page pairs were inspected on full-page source renders.','All 166 source pages were screened through reduced-scale contact sheets; this is not full-size review of all pages.','Original Cambridge remote authenticity was not checked; hashes match local Stage 0 copies.']}
(OUT/'SOURCE_EVIDENCE_MANIFEST_V5.json').write_text(json.dumps(source_evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Criterion evidence and disposition.
criteria=[
 {'id':'A3-B22-V5-01','criterion':'Frozen candidate, inputs, source PDFs and snapshot integrity','status':'PASS','candidate_snapshot_files_verified':len(cand_pins),'source_pdfs_verified':12,'source_pages':166},
 {'id':'A3-B22-V5-02','criterion':'W22/13 Q6(b)(iii) correction evidence label and locator','status':'PASS','prior_finding':'A3-B22-V4-01 resolved','candidate_record':special_part,'evidence_token':special['source_page_label_token_verified'],'source_qp_locator_page':special_part['qp_locator']['pdf_page_1_based'],'source_render':render_map[('9618_w22_qp_13',13)],'transcript_ref':special['transcript_ref'],'transcript_sha256':sha(C/special['transcript_ref'])},
 {'id':'A3-B22-V5-03','criterion':'Correction-row and review-union count semantics','status':'PASS','counts':{'mark_rows':7,'locator_rows':12,'correction_rows':19,'distinct_corrected_record_ids':18,'correction_row_unique_source_pages':11,'changed_visual_region_source_pages':12,'qp_cover_pages':6,'correction_region_overlap_pages':7,'deduplicated_union_pages':22,'legacy_assets':18,'legacy_in_union':17,'legacy_outside_union':1,'new_v5_direct_renders':5},'mark_rows':mark_audit,'locator_rows':locator_audit},
 {'id':'A3-B22-V5-04','criterion':'All 22 source/page pairs, render hashes and legibility','status':'PASS','review_union_pages':union_pages},
 {'id':'A3-B22-V5-05','criterion':'Five protected corpus files and whole-candidate semantic delta','status':'PASS','protected_files':protected_checks,'changed_files_recomputed':actual_changed,'added_files_recomputed':actual_added,'deleted_files_recomputed':actual_removed},
 {'id':'A3-B22-V5-06','criterion':'No question, mark, locator, context, dependency or unresolved drift','status':'PASS','basis':'Five protected files match v4 byte-for-byte; recomputed v4/v5 candidate delta is exactly the semantic-diff allowlist, with no changed or added context/transcript/index records.'},
 {'id':'A3-B22-V5-07','criterion':'Six indexed mark sums vs original full-page cover totals','status':'PASS','papers':totals_audit},
 {'id':'A3-B22-V5-08','criterion':'Syllabus scope retention','status':'PASS','authority':'2026 syllabus v2, Paper 1 sections 1-8, pinned Stage 0 scope artifacts.','historical_supporting_example':'W22/13 Q1(b) sound-file-size arithmetic remains SUPPORTING under §1.2 only; not a separate required objective.','new_out_of_scope_records':'none in v5 metadata-only delta.'},
 {'id':'A3-B22-V5-09','criterion':'Whole-source reduced-scale coverage with stated limits','status':'PASS','contact_sheets':12,'pages_screened':166,'full_page_union_renders':22}
]
findings={'schema_version':'1.0','artifact_version':'B22-A3-RETEST-v5','task_id':'P1-S1-A3-B22-RETEST-V5','reviewer_role':'Independent A3 same-version reviewer.',
 'candidate':{'artifact_version':'B22-A2-v5','path':rel(C),'handoff_sha256':sha(C/'HANDOFF_CHECK.json'),'batch_manifest_sha256':sha(C/'BATCH_MANIFEST.json'),'snapshot_manifest_sha256':sha(C/'SNAPSHOT_MANIFEST.json'),'snapshot_file_count':len(cand_pins)},
 'recommendation':'PASS','gate_scope':'A3 source/context/scope only. A4 v5, A9 and A0 remain mandatory; no batch acceptance claimed.',
 'criteria':criteria,'correction_source_page_set':sorted([{'source_id':s,'pdf_page_1_based':p} for s,p in correction_pages],key=lambda x:(x['source_id'],x['pdf_page_1_based'])),
 'changed_visual_region_page_set':sorted([{'source_id':s,'pdf_page_1_based':p} for s,p in visual_pages],key=lambda x:(x['source_id'],x['pdf_page_1_based'])),
 'cover_page_set':sorted([{'source_id':s,'pdf_page_1_based':p} for s,p in cover_pages],key=lambda x:(x['source_id'],x['pdf_page_1_based'])),
 'overlap_page_set':sorted([{'source_id':s,'pdf_page_1_based':p} for s,p in overlap],key=lambda x:(x['source_id'],x['pdf_page_1_based'])),
 'deduplicated_review_union_page_count':22,'protected_corpus_checks':protected_checks,'whole_candidate_delta':{'changed':actual_changed,'added':actual_added,'deleted':actual_removed},
 'six_paper_total_retest':totals_audit,'source_integrity':source_pins,'historic_scope_guardrail':'2021/2022 Paper 1 sources do not establish 2026 coverage/frequency/variant equivalence.',
 'candidate_untouched':True,'limits':['All-page contact sheets are reduced-scale screens only.','Source authenticity was checked against local Stage 0 hashes; remote Cambridge publisher authenticity is not independently verified.','A3 result does not close A4, A9 or A0.']}
flags={'schema_version':'1.0','artifact_version':'B22-A3-RETEST-v5','task_id':'P1-S1-A3-B22-RETEST-V5','recommendation':'PASS','gate':'A3 source/context/scope only','flags':[
 {'id':'A3-B22-V4-01','type':'evidence_token_mismatch','status':'RESOLVED_V5','severity':'MINOR_PRIOR_FINDING_RESOLVED','record_id':'9618_w22_qp_13-q6-pbiii','source_locator':{'source_id':'9618_w22_qp_13','pdf_page_1_based':13,'printed_token':'(iii)'},'candidate_evidence_token':'(iii)','candidate_qp_locator_page':13,'transcript_ref':special['transcript_ref'],'evidence':'Original PDF p13 and page transcript both show (iii); actual question-index locator remains correct at p13.'},
 {'id':'A3-B22-V4-02','type':'correction_page_count_semantics','status':'RESOLVED_V5','severity':'MINOR_PRIOR_FINDING_RESOLVED','evidence':'Counts now distinguish 19 correction rows / 18 records / 11 correction pages / 12 changed-region pages / 6 covers / 7 overlaps / 22 unique union pages / 18 legacy render assets / 5 new direct renders.'},
 {'id':'B22-SCOPE-01','type':'historical_syllabus_scope_guardrail','status':'RETAINED','severity':'LOW','evidence':'W22/13 Q1(b) sound-file-size calculation remains a labelled supporting example under 2026 syllabus §1.2, not a new required objective. No coverage or frequency claim is made.'}
 ],'limits':['PASS applies to A3 only.','A4 v5, A9 and A0 batch decision remain required.']}
(OUT/'CONTEXT_SCOPE_FINDINGS_V5.json').write_text(json.dumps(findings,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'SCOPE_FLAGS_RETEST_V5.json').write_text(json.dumps(flags,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

report='''# B22 A3 v5 context and source retest

Task: P1-S1-A3-B22-RETEST-V5. Candidate: frozen B22-A2-v5. **Recommendation: PASS for the A3 source/context/scope gate only.** A4 v5, A9 and A0 remain mandatory; this is not batch acceptance.

## W22/13 Q6(b)(iii)

Original W22/13 QP PDF p.13 visibly prints (iii). The pinned page transcript also contains “(iii)” before the LSR #2 prompt. Candidate CORRECTION_EVIDENCE.json now records source_page_label_token_verified as “(iii)”; the matching Question Index record remains Q6(b)(iii) with its QP locator on PDF p.13 and transcript p.13. This resolves the prior A3-B22-V4-01 annotation finding. The source locator itself was already correct in v4; the finding concerned the evidence token only. Page render hash and transcript hash are pinned in SOURCE_EVIDENCE_MANIFEST_V5.json and the findings JSON.

## Correction and review-union counts

I recomputed the distinct sets from the 7 mark-correction rows and 12 locator-correction rows. They are 19 rows across 18 corrected record IDs and 11 unique correction source pages. The declared changed-visual-region set has 12 source pages; six QP covers add six pages; seven correction pages overlap the changed-visual set. The deduplicated union is 22 unique (source_id, PDF page) pairs. The arithmetic matches the frozen REVIEW_UNION_MANIFEST and its enumerated page set.

The 18 legacy v4 PNG assets are a file count: 17 are members of the 22-page union and one is the S22/12 p.16 supplementary blank page outside it. Five additional pages were rendered directly in v5. Thus 18 is neither a correction-page count nor the union page count. All 22 union pages were full-page visually inspected; every candidate render hash matches its manifest and its v4 baseline where reused. The out-of-union supplement is separately identified in the source manifest.

## Source accuracy, mark totals and preservation

All 19 correction rows were checked against the original QP page renders and their page transcripts. The seven visible displayed-mark corrections match the candidate question/part rows. The twelve locator corrections point to the page showing the nested label, and transcript refs/hash pins resolve to that same PDF page. All twelve original QP/MS PDFs were independently rehashed and page-count checked against Stage 0, totaling 166 pages.

I independently summed the non-null question-root and part displayed marks for all six QPs. Each sum is 75, matching the printed total on its full-page original cover. Totals were used only as integrity checks; no mark was inferred from a cover total.

PAGE_INDEX.jsonl, QUESTION_INDEX.jsonl, MARKING_INDEX.jsonl, VISUAL_MANIFEST.json and UNRESOLVED.md are byte-identical to v4. I also recomputed the entire v4/v5 candidate file delta: changed, added and deleted paths exactly match the frozen semantic-diff allowlist. No context, transcript, question, mark, locator, dependency or unresolved record drift occurred. The v5 revision is metadata/evidence and source-render scope only.

## Source scope and page-screen limits

Authority remains the pinned Cambridge 9618 2026 v2 syllabus, Paper 1 sections 1–8, and Stage 0 scope review. The historical W22/13 Q1(b) sound-file-size arithmetic example remains labelled SUPPORTING under §1.2, not a separate required objective. No new out-of-scope record, coverage claim or frequency claim is introduced.

Twelve reviewer-generated contact sheets cover all 166 original source pages at reduced scale. They are a broad screen, not full-page semantic inspection. Full-page visual review for this retest covers the exact 22-page review union; no additional full-page coverage is claimed beyond the separately examined S22/12 p.16 supplement. Cambridge remote authenticity is not independently checked; source PDFs match the local Stage 0 SHA256 pins.

## Gate result

Both v4 MINOR evidence-metadata findings are resolved: A3-B22-V4-01 now has the correct (iii) token while the locator remains p.13; A3-B22-V4-02 uses the correct 19/18/11/12/6/7/22/18/5 set semantics. No new A3 defect was found. Recommendation: **PASS for A3 only**. A4 v5, A9 and A0 batch decision remain open. Candidate, source PDFs, tracker and app were not edited.
'''
(OUT/'CONTEXT_SCOPE_RETEST_V5.md').write_text(report,encoding='utf-8')
risk='''# B22 A3 v5 source-risk retest

Task P1-S1-A3-B22-RETEST-V5. Source identity and review evidence are listed in SOURCE_EVIDENCE_MANIFEST_V5.json; itemized criteria and correction rows are in CONTEXT_SCOPE_FINDINGS_V5.json.

## Original source integrity and render review

- Rehashed all 12 S22/W22 Paper 1 QP/MS PDFs and independently counted pages: every digest and count matches Stage 0; 166 pages total.
- Inspected all 22 full-page source/render pairs in the correction + changed-region + cover union. Hashes resolve to the pinned original QP files; reused render assets are byte-identical to v4 where declared. All target pages were legible.
- Screened all 12 contact sheets for the complete 166-page set at reduced scale. These sheets are not full-page validation.
- The one 18th legacy render outside the union is S22/12 QP p.16, an explicitly blank supplement; it remains outside the 22-page arithmetic.
- Remote Cambridge source authenticity was not independently checked; this review confirms local Stage 0 hash identity.

## Correction risks

All seven displayed mark changes agree with adjacent printed marks on the rendered original QP page. All twelve nested-child locator changes land on the original page carrying the target label and use transcript files for the same page. W22/13 Q6(b)(iii) p.13 visibly and textually has (iii); the v5 evidence token matches, and the actual QP locator remains p.13. The two prior MINOR evidence-only findings are resolved.

The recalculated review union has 22 unique source/page pairs from 11 correction pages, 12 changed-region pages, six covers and seven overlaps. Counts separately report 18 legacy assets (17 union members plus one supplement) and five new direct renders.

## Mark totals and scope boundaries

Each QP's question/part displayed marks independently sum to 75; each original cover prints 75. Cover totals are integrity checks only. 2022 papers do not establish 2026 course coverage, topic frequency or variant equivalence. The W22/13 Q1(b) sound-file arithmetic example remains supporting material under §1.2, not a separate required syllabus objective.

## A3 disposition

A3 source/context/scope retest: **PASS**. A4 v5, A9 and A0 remain open; no lesson or app acceptance is implied.
'''
(OUT/'SOURCE_RISK_RETEST_V5.md').write_text(risk,encoding='utf-8')

# Freeze all input and output hashes; the handoff SHA is mirrored in a companion file.
out_files=[]
for p in sorted(OUT.rglob('*')):
 if p.is_file() and p.name not in ('HANDOFF_RETEST_V5.json','HANDOFF_RETEST_V5.sha256'):
  out_files.append({'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size})
handoff={'schema_version':'1.0','artifact_version':'B22-A3-RETEST-v5','task_id':'P1-S1-A3-B22-RETEST-V5','status':'FROZEN_FOR_A0_INTEGRITY_AUDIT',
 'recommendation':'PASS_A3_ONLY','candidate_untouched':True,'write_allowlist':'A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B22/retest_v5/',
 'candidate':findings['candidate'],'dispatch_record':dispatch_pin,'frozen_input_pins':inputs,'candidate_snapshot_files_verified':cand_pins,
 'original_source_pdfs':source_pins,'review_union_counts':counts,'review_union_page_manifest':union_pages,'legacy_assets':legacy_check,'new_v5_assets':new_checks,
 'contact_sheets':contact_records,'protected_corpus_checks':protected_checks,'candidate_delta':{'changed':actual_changed,'added':actual_added,'deleted':actual_removed},
 'criteria_summary':[{'id':x['id'],'status':x['status']} for x in criteria],'output_files_excluding_handoff_and_checksum':out_files,
 'output_file_count_excluding_handoff_and_checksum':len(out_files),'stop_point':'Stop for A0 integrity audit; A4 v5, A9, and A0 batch decision remain mandatory.'}
(OUT/'HANDOFF_RETEST_V5.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
hs=sha(OUT/'HANDOFF_RETEST_V5.json'); (OUT/'HANDOFF_RETEST_V5.sha256').write_text(hs+'  HANDOFF_RETEST_V5.json\n',encoding='ascii')
print(json.dumps({'handoff_sha256':hs,'candidate_files':len(cand_pins),'sources':12,'pages':166,'union':22,'rows':19,'records':18,'correction_pages':11,'visual_pages':12,'overlap':7,'legacy':18,'new_renders':5,'six_totals':{x['source_id']:x['indexed_sum_recomputed'] for x in totals_audit},'recommendation':'PASS_A3_ONLY','outputs':len(out_files)},indent=2))
