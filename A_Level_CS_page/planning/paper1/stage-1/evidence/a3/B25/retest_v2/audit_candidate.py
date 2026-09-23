from pathlib import Path
import json, hashlib, re, sys
from pypdf import PdfReader

ROOT=Path.cwd()
STAGE=ROOT/'A_Level_CS_page/planning/paper1/stage-1'
STAGE0=ROOT/'A_Level_CS_page/planning/paper1/stage-0'
OUT=STAGE/'evidence/a3/B25/retest_v2'
CAND=STAGE/'evidence/a2/B25/versions/B25-A2-v2'
V1=STAGE/'evidence/a2/B25/versions/B25-A2-v1'
A3V1=STAGE/'evidence/a3/B25/review_v1'
A4V1=STAGE/'evidence/a4/B25/review_v1'

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def load(path): return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def dump(name,obj):
    p=OUT/name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');return p

def resolve_pin(rel):
    rel=rel.replace('\\','/')
    if rel.startswith('stage-1/'): return STAGE/rel[len('stage-1/'):]
    if rel.startswith('stage-0/'): return STAGE0/rel[len('stage-0/'):]
    if rel.startswith('Past_Papers/'): return ROOT/rel
    return ROOT/rel

# Pinned dispatches and candidate integrity records.
wo=STAGE/'evidence/a0/B25_A3_V2_RETEST_DISPATCH.md'
dispatch_record=STAGE/'evidence/a0/B25_A3_V2_RETEST_DISPATCH_RECORD.json'
handoff=load(CAND/'HANDOFF_CHECK.json')
batch=load(CAND/'BATCH_MANIFEST.json')
snapshot=load(CAND/'SNAPSHOT_MANIFEST.json')
prior=load(A3V1/'CONTEXT_SCOPE_FINDINGS_V1.json')
prior_handoff=load(A3V1/'HANDOFF_REVIEW_V1.json')
prior_a4=load(A4V1/'HANDOFF_REVIEW_V1.json')
prior_a3_rows=prior.get('findings',prior.get('context_findings',[]))
if not prior_a3_rows:
    # handoff stores findings under its output path; load the pinned JSON directly.
    prior_a3_rows=load(A3V1/'CONTEXT_SCOPE_FINDINGS_V1.json').get('findings',[])

pins=[]
def add_pin(label,path,expected=None):
    p=Path(path)
    actual=sha(p) if p.is_file() else None
    pins.append({'label':label,'path':str(p.relative_to(ROOT)).replace('\\','/') if p.is_absolute() and str(p).startswith(str(ROOT)) else str(p),'expected_sha256':expected,'actual_sha256':actual,'exists':p.is_file(),'matches_expected':(expected is None or actual==expected)})

add_pin('a3_v2_retest_work_order',wo,'6570a79d61e6c5d5a649a42d4910039e5bfb0f5af7c814b695d3b4fa7cf8e276')
add_pin('a3_v2_retest_dispatch_record',dispatch_record)
for label,rel in [('candidate_handoff','HANDOFF_CHECK.json'),('candidate_batch_manifest','BATCH_MANIFEST.json'),('candidate_snapshot_manifest','SNAPSHOT_MANIFEST.json'),('candidate_validator_result','VALIDATOR_RESULT.json'),('candidate_correction_delta','CORRECTION_DELTA.json'),('candidate_correction_checks','CORRECTION_CHECKS.json'),('candidate_mark_total_check','MARK_TOTAL_CHECK.json'),('candidate_question_index','QUESTION_INDEX.jsonl'),('candidate_marking_index','MARKING_INDEX.jsonl'),('candidate_page_index','PAGE_INDEX.jsonl')]:
    exp={'candidate_handoff':'e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5','candidate_batch_manifest':'063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8','candidate_snapshot_manifest':'56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94','candidate_validator_result':handoff['schema_validator']['sha256']}.get(label)
    add_pin(label,CAND/rel,exp)
# Check every declared pinned dependency in the immutable candidate handoff.
for label,obj in handoff.get('input_pins',{}).items():
    p=resolve_pin(obj['path'])
    add_pin('handoff_input:'+label,p,obj['sha256'])
# Independent gate-side evidence pinned by the dispatch.
for label,rel,exp in [
 ('a0_v2_candidate_audit','evidence/a0/B25_A2_V2_A0_AUDIT.json','72c73ab452386f56f5a07d8392a641ba7024d455608d10a90a4823ffc6cdca73'),
 ('a0_v2_validator','evidence/a0/B25_A2_V2_A0_VALIDATE.json','e2a33361079a98adb183ff4114ada2345e5cdf3dc2e9886eb8cc67811c3a8866'),
 ('a3_v1_handoff','evidence/a3/B25/review_v1/HANDOFF_REVIEW_V1.json','f96bf8d634b5bb5e37496b7f826fa330277f2219169e827bf3e0369fc0e18ea0'),
 ('a3_v1_output_manifest','evidence/a3/B25/review_v1/OUTPUT_MANIFEST_V1.json','5c14521a04c05766832c15a8933f1f0f2bbc68abee603613fae3e8a1b1917a63'),
 ('a3_v1_handoff_audit','evidence/a0/B25_A3_V1_HANDOFF_AUDIT.json','07c829ff02b3cb9490f77ac7ceac604d681184441d951b3529bd03a12a384703'),
 ('a4_v1_handoff','evidence/a4/B25/review_v1/HANDOFF_REVIEW_V1.json','2df0def5ebfd7c605c1c1c07750e307db2b4dbb95e5b3985e17d67e30d539179'),
 ('a4_v1_output_manifest','evidence/a4/B25/review_v1/OUTPUT_MANIFEST_V1.json','689efe3036bd5ffc9950e7e4557d8a8a852930a218cce3729bc2603a3f7f7a7e'),
 ('a4_v1_output_sums','evidence/a4/B25/review_v1/OUTPUT_SHA256SUMS.txt','f2e7635c3957cacc0171ee156f032f1b4ee749dcd1cb966645d629535a0820b9'),
 ('stage0_source_manifest','../stage-0/evidence/a2/SOURCE_MANIFEST.json','195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c'),
 ('official_2026_syllabus','../stage-0/evidence/a3/tmp/official-2026-syllabus.pdf','bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470'),
 ('corpus_schema','CORPUS_SCHEMA.md','9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f'),
 ('extraction_policy','EXTRACTION_POLICY.md','97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2')]:
    p=STAGE/rel if not rel.startswith('../') else STAGE/rel
    add_pin(label,p,exp)
# Additional source authority used for the A3 scope limitation check.
for label,path in [('syllabus_scope',STAGE0/'evidence/a3/SYLLABUS_SCOPE.md'),('pilot_scope_check',STAGE0/'evidence/a3/PILOT_SCOPE_CHECK.md'),('a3_v1_scope_flags',A3V1/'SCOPE_FLAGS_V1.json')]: add_pin(label,path)

# Candidate snapshot, independent file count and hashes (all 442 listed entries; snapshot manifest is intentionally self-excluded).
entries=[];listed=set()
for entry in snapshot['files']:
    rel=entry['path'];listed.add(rel);p=CAND/Path(rel)
    actual=sha(p) if p.is_file() else None
    byte_count=p.stat().st_size if p.is_file() else None
    entries.append({'path':rel,'expected_sha256':entry['sha256'],'actual_sha256':actual,'expected_byte_count':entry['byte_count'],'actual_byte_count':byte_count,'matches':p.is_file() and actual==entry['sha256'] and byte_count==entry['byte_count']})
actual_files={p.relative_to(CAND).as_posix() for p in CAND.rglob('*') if p.is_file()}
snapshot_result={'declared_file_count':snapshot['file_count'],'listed_entry_count':len(entries),'actual_packet_file_count_including_snapshot':len(actual_files),'expected_self_exclusion':'SNAPSHOT_MANIFEST.json','actual_unlisted_files':sorted(actual_files-listed-{'SNAPSHOT_MANIFEST.json'}),'listed_but_missing_files':sorted(listed-actual_files),'mismatches':[x for x in entries if not x['matches']],'all_442_entries_match':len(entries)==442 and all(x['matches'] for x in entries) and listed-actual_files==set() and actual_files-listed=={'SNAPSHOT_MANIFEST.json'}}

# Load candidate indexes/context maps.
qrows=[json.loads(x) for x in (CAND/'QUESTION_INDEX.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
mrows=[json.loads(x) for x in (CAND/'MARKING_INDEX.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
prows=[json.loads(x) for x in (CAND/'PAGE_INDEX.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
roots={r['id']:r for r in qrows if 'question_number' in r}
parts=[r for r in qrows if 'question_id' in r]
contexts={p.stem:load(p) for p in sorted((CAND/'contexts').glob('*.json'))}
page_by_id={(r['source_id'],r['pdf_page_1_based']):r for r in prows}
source_pages={x['source_id']:x['page_count_actual'] for x in batch['source_validation']['checks']}
context_matrix=[]
for qid,ctx in sorted(contexts.items()):
    rootrow=roots.get(qid)
    source=ctx.get('source_qp_id')
    allp=ctx.get('all_context_pages',[]); cont=ctx.get('continuation_pages',[]); ev=ctx.get('source_evidence',[])
    qparts=[p for p in parts if p.get('question_id')==qid]
    child_pages=sorted({p.get('qp_locator',{}).get('pdf_page_1_based') for p in qparts if p.get('qp_locator')})
    root_page=rootrow.get('qp_locator',{}).get('pdf_page_1_based') if rootrow else None
    evidence_pages=[x.get('pdf_page_1_based') for x in ev]
    page_transcripts=[]
    for pg in allp:
        page=page_by_id.get((source,pg),{})
        tr=page.get('transcript_ref_or_null')
        tp=CAND/tr if tr else None
        content=tp.read_text(encoding='utf-8-sig') if tp and tp.is_file() else ''
        page_transcripts.append({'page':pg,'transcript':tr,'exists':bool(tp and tp.is_file()),'is_blank':bool(re.search(r'\bBLANK PAGE\b',content,re.I)),'text_preview':' '.join(content.split())[:180]})
    unlocated=sorted(set(allp)-set(child_pages)-({root_page} if root_page else set()))
    basic=(rootrow is not None and source==rootrow.get('source_qp_id') and ctx.get('question_start_page')==root_page and bool(allp) and allp==sorted(set(allp)) and set(cont)<=set(allp) and root_page in allp and set(child_pages)<=set(allp) and sorted(evidence_pages)==sorted(allp) and len(evidence_pages)==len(set(evidence_pages)) and all(x.get('source_id')==source and x.get('question')==rootrow.get('question_number') and x.get('pdf_page_1_based') in allp for x in ev) and all(1<=pg<=source_pages.get(source,0) for pg in allp) and all(x['exists'] and not x['is_blank'] for x in page_transcripts))
    context_matrix.append({'question_id':qid,'context_path':f'contexts/{qid}.json','source_id':source,'question_number':rootrow.get('question_number') if rootrow else None,'root_locator_page':root_page,'question_start_page':ctx.get('question_start_page'),'all_context_pages':allp,'continuation_pages':cont,'source_evidence_pages':evidence_pages,'child_locator_pages':child_pages,'unlocated_context_pages_after_root_and_parts':unlocated,'transcript_checks':page_transcripts,'contact_sheet_source_reviewed':source in {f'9618_{term}_qp_{v}' for term in ['s25','w25'] for v in ['11','12','13']},'structural_checks_pass':basic})
contexts_ok=(len(contexts)==51 and set(contexts)==set(roots) and len(roots)==51 and len(parts)==207 and all(x['structural_checks_pass'] for x in context_matrix))

# Exact v1-to-v2 context delta, checking every field against frozen prior rows and byte pins.
prior_findings=prior.get('findings',[])
if not prior_findings:
    # The artifact wraps findings in context_findings.
    prior_findings=prior.get('context_findings',[])
if not prior_findings:
    prior_findings=[x for x in prior.get('issues',[]) if x.get('finding_id','').startswith('A3-B25-CONTEXT-')]
# robust extraction: handoff output findings are authoritative if top-level shape differs
if not prior_findings:
    prior_findings=prior_handoff.get('findings',[])
context_findings=[x for x in prior_findings if x.get('finding_id','').startswith('A3-B25-CONTEXT-')]
delta=load(CAND/'CORRECTION_DELTA.json')
delta_context={x['record_id']:x for x in delta['changes'] if x.get('finding')=='false_context_page_reference' and x.get('path','').startswith('contexts/')}
dispositions=[]
for finding in sorted(context_findings,key=lambda x:x['finding_id']):
    qid=finding['candidate_record_id']; pnum=finding['misassigned_pdf_page_1_based']; rel=finding['candidate_context_file']; before=CAND.parents[0]/'B25-A2-v1'/rel
    # Candidate v1 context path resolution, based on sibling versions.
    before=V1/rel; after=CAND/rel
    old=load(before); new=load(after); old_sha=sha(before); new_sha=sha(after); change=delta_context.get(qid)
    absent={field:pnum not in new.get(field,[]) and not any(e.get('pdf_page_1_based')==pnum for e in new.get(field,[]) if isinstance(e,dict)) for field in ['all_context_pages','continuation_pages','source_evidence']}
    expected= json.loads(json.dumps(old))
    expected['all_context_pages']=[p for p in expected.get('all_context_pages',[]) if p!=pnum]
    expected['continuation_pages']=[p for p in expected.get('continuation_pages',[]) if p!=pnum]
    expected['source_evidence']=[e for e in expected.get('source_evidence',[]) if e.get('pdf_page_1_based')!=pnum]
    exact=(new==expected)
    nextid=finding.get('next_question_id_for_boundary')
    nextrow=roots.get(nextid) if nextid else None
    next_start_matches=bool(nextrow and nextrow.get('qp_locator',{}).get('pdf_page_1_based')==pnum)
    if finding.get('source_classification')=='navigation_notice_only': next_start_matches='notice_page_not_next_start'
    v1_pin_ok=old_sha==finding.get('candidate_context_file_sha256')
    delta_ok=bool(change and change.get('before_sha256')==old_sha and change.get('after_sha256')==new_sha and change.get('removed_pdf_page_1_based')==pnum and change.get('fields')=={'all_context_pages':1,'continuation_pages':1,'source_evidence':1})
    dispositions.append({'finding_id':finding['finding_id'],'severity':finding.get('severity','Major'),'candidate_record_id':qid,'candidate_context_file':rel,'source_id':finding['source_id'],'source_pdf':finding['source_pdf'],'source_pdf_sha256':finding['source_pdf_sha256'],'pdf_page_1_based':pnum,'v1_context_sha256':old_sha,'v1_pin_matches_finding':v1_pin_ok,'v2_context_sha256':new_sha,'v2_absent_from_all_three_required_fields':absent,'exactly_one_page_removed_and_no_other_context_field_changed':exact,'delta_record_matches_before_after_and_field_counts':delta_ok,'next_question_boundary_matches_source':next_start_matches,'source_classification':finding.get('source_classification'),'visual_observation':finding.get('source_visual_observation'),'retest_disposition':'CLOSED_BY_V2_CHANGE_AND_DIRECT_SOURCE_RETEST' if v1_pin_ok and all(absent.values()) and exact and delta_ok else 'OPEN_CHANGES_REQUIRED','owner':'A2 corrected; A3 independent retest'})
changed_contexts={x['path'] for x in delta['changes'] if x.get('finding')=='false_context_page_reference' and x.get('path','').startswith('contexts/')}
expected_changed={x['candidate_context_file'] for x in context_findings}
actual_changed_contexts=set()
for v1_file in (V1/'contexts').glob('*.json'):
    v2_file=CAND/'contexts'/v1_file.name
    if not v2_file.is_file() or sha(v1_file)!=sha(v2_file): actual_changed_contexts.add(f'contexts/{v1_file.name}')
context_delta_exact=(len(context_findings)==10 and set(delta_context)=={x['candidate_record_id'] for x in context_findings} and changed_contexts==expected_changed and actual_changed_contexts==expected_changed and len(contexts)==51 and all(x['retest_disposition'].startswith('CLOSED') for x in dispositions))
# control retention and exact errant page exclusion.
def has_source_page(ctx,p): return any(x.get('pdf_page_1_based')==p for x in ctx.get('source_evidence',[]))
q8=contexts['9618_s25_qp_11-q8']; q5=contexts['9618_w25_qp_13-q5']
controls={'9618_s25_qp_11-q8_p15':{'page':15,'in_all_context_pages':15 in q8['all_context_pages'],'in_continuation_pages':15 in q8['continuation_pages'],'in_source_evidence':has_source_page(q8,15),'source_visual_classification':'legitimate shared scenario context; full-size source page 15 shows processor memory/instruction state'},'9618_w25_qp_13-q5_p7_p8':{'pages':[7,8],'in_all_context_pages':all(p in q5['all_context_pages'] for p in [7,8]),'in_continuation_pages':all(p in q5['continuation_pages'] for p in [7,8]),'in_source_evidence':all(has_source_page(q5,p) for p in [7,8]),'source_visual_classification':'Q5 staff-table/SQL continuation pages, visually screened full-size'},'9618_w25_qp_13-q5_p9':{'page':9,'absent_from_all_context_pages':9 not in q5['all_context_pages'],'absent_from_continuation_pages':9 not in q5['continuation_pages'],'absent_from_source_evidence':not has_source_page(q5,9),'source_visual_classification':'page 9 contains only notice that Question 6 starts next page'}}
controls_ok=all(all(v for k,v in value.items() if k.startswith('in_') or k.startswith('absent_')) for value in controls.values())

# Recompute 27 parent grouping labels and ensure no mark allocation is attached to parent.
prior_groups=prior_handoff.get('parent_grouping_review',{}).get('rows',[])
q_by_id={x['id']:x for x in qrows}; m_by_part={}
for row in mrows:
    if row.get('part_id_or_null') is not None: m_by_part.setdefault(row['part_id_or_null'],[]).append(row)
parent_rows=[]
for exp in prior_groups:
    pid=exp['parent_part_id']; parent=q_by_id.get(pid); children=sorted([x for x in parts if x.get('parent_part_id_or_null')==pid],key=lambda x:x['id'])
    child_ids=[x['id'] for x in children]; direct=len(m_by_part.get(pid,[]))
    checks={'parent_exists':parent is not None,'label_preserved':bool(parent and parent.get('label')),'label':parent.get('label') if parent else None,'parent_marks_null':bool(parent and parent.get('marks_displayed_or_null') is None),'parent_ms_locator_null':bool(parent and parent.get('ms_locator_or_null') is None),'child_ids_equal_prior_review':child_ids==sorted(exp['child_ids']),'child_count_equal_prior_review':len(children)==exp['child_count'],'direct_marking_items_zero':direct==0,'all_children_have_explicit_ms_locator':bool(children) and all(c.get('ms_locator_or_null') for c in children),'all_children_ms_linked':bool(children) and all(c.get('status')=='MS_LINKED' for c in children)}
    parent_rows.append({'parent_part_id':pid,'label':checks['label'],'prior_child_ids':sorted(exp['child_ids']),'candidate_child_ids':child_ids,'checks':checks,'pass':all(v for k,v in checks.items() if k!='label')})
parent_ok=(len(prior_groups)==27 and len(parent_rows)==27 and all(x['pass'] for x in parent_rows))

# Reconcile the separate, already-dispatched A4 MS excerpt delta without adjudicating MS correctness.
v1_marks=[json.loads(x) for x in (V1/'MARKING_INDEX.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
v2_marks=[json.loads(x) for x in (CAND/'MARKING_INDEX.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
v1_mark_by_id={x['id']:x for x in v1_marks};v2_mark_by_id={x['id']:x for x in v2_marks}
changed_mark_ids=sorted(k for k in set(v1_mark_by_id)|set(v2_mark_by_id) if v1_mark_by_id.get(k)!=v2_mark_by_id.get(k))
mark_delta_record=next((x for x in delta['changes'] if x.get('finding')=='next_table_header_captured_in_ms_excerpt'),None)
mark_id='9618_w25_qp_13-q7-pe-mi-1'; m1=v1_mark_by_id.get(mark_id);m2=v2_mark_by_id.get(mark_id)
suffix='\nQuestion \nAnswer \nMarks'
expected_m2=json.loads(json.dumps(m1)) if m1 else None
if expected_m2 and expected_m2.get('mark_or_condition_or_null','').endswith(suffix): expected_m2['mark_or_condition_or_null']=expected_m2['mark_or_condition_or_null'][:-len(suffix)]
mark_delta_result={'candidate_marking_records_changed':changed_mark_ids,'expected_single_changed_record_id':mark_id,'only_expected_record_changed':changed_mark_ids==[mark_id],'before_record_matches_delta':bool(mark_delta_record and mark_delta_record.get('before_record')==m1),'after_record_matches_delta':bool(mark_delta_record and mark_delta_record.get('after_record')==m2),'only_exact_generic_header_suffix_removed':bool(expected_m2==m2),'source_locator_unchanged':bool(m1 and m2 and m1.get('ms_locator')==m2.get('ms_locator') and m2.get('ms_locator',{}).get('source_id')=='9618_w25_ms_13' and m2.get('ms_locator',{}).get('pdf_page_1_based')==12 and m2.get('table_row_ref_or_null')=='7(e)'),'a3_scope_note':'Mechanical change-set reconciliation only. A3 does not certify marking-scheme extraction correctness; the separately pinned A4 review/retest remains required.'}
mark_delta_result['pass_mechanical_delta_only']=all([mark_delta_result['only_expected_record_changed'],mark_delta_result['before_record_matches_delta'],mark_delta_result['after_record_matches_delta'],mark_delta_result['only_exact_generic_header_suffix_removed'],mark_delta_result['source_locator_unchanged']])

# Recheck all six totals against original PDFs directly (cover statement, bracket tokens), indexed marks, and packet checks.
mark_check=load(CAND/'MARK_TOTAL_CHECK.json')
q_by_source={}
for row in qrows:
    src=(row.get('source_qp_id') or row.get('qp_locator',{}).get('source_id'))
    if src: q_by_source.setdefault(src,[]).append(row)
mark_rows=[]
for src in sorted(source_pages):
    if '_qp_' not in src: continue
    rel=next(x['relative_path'] for x in batch['source_validation']['checks'] if x['source_id']==src)
    pdf=ROOT/rel; reader=PdfReader(str(pdf)); cover=reader.pages[0].extract_text() or ''
    cm=re.search(r'total mark for this paper is\s+(\d+)',cover,re.I)
    cover_total=int(cm.group(1)) if cm else None
    text='\n'.join(pg.extract_text() or '' for pg in reader.pages[1:])
    nums=[int(x) for x in re.findall(r'\[\s*(\d{1,2})\s*\]',text)]
    indexed=[x.get('marks_displayed_or_null') for x in q_by_source.get(src,[]) if isinstance(x.get('marks_displayed_or_null'),int)]
    packet=mark_check['pairs'].get(src,{})
    hand=handoff.get('mark_total_status',{}).get(src,{})
    mark_rows.append({'source_id':src,'pdf_sha256':sha(pdf),'page_count':len(reader.pages),'cover_total':cover_total,'direct_pdf_mark_token_count':len(nums),'direct_pdf_mark_token_sum':sum(nums),'indexed_mark_count':len(indexed),'indexed_mark_sum':sum(indexed),'packet_displayed_sum':packet.get('displayed_mark_sum_from_source_transcript'),'packet_observation_count':packet.get('mark_observation_count'),'handoff_indexed_sum':hand.get('indexed_sum'),'all_total_arithmetic_equal_75':cover_total==75 and sum(nums)==75 and sum(indexed)==75 and packet.get('displayed_mark_sum_from_source_transcript')==75 and hand.get('indexed_sum')==75,'observation_count_matches_direct_pdf':len(nums)==packet.get('mark_observation_count')})
mark_ok=len(mark_rows)==6 and all(x['all_total_arithmetic_equal_75'] and x['observation_count_matches_direct_pdf'] for x in mark_rows)

# Scope remains strictly observational, grounded in pinned 2026 authority.
scope=load(A3V1/'SCOPE_FLAGS_V1.json')
syllabus_scope=(STAGE0/'evidence/a3/SYLLABUS_SCOPE.md').read_text(encoding='utf-8')
scope_text=scope.get('scope_conclusion','')+' '+json.dumps(scope,ensure_ascii=False)
limits=' '.join(scope.get('limitations',[])).lower()
scope_checks={'authority_sha256_matches_2026_syllabus':'bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470'==sha(STAGE0/'evidence/a3/tmp/official-2026-syllabus.pdf'),'paper1_sections_1_through_8':scope.get('authority',{}).get('paper1_sections')=='1-8','review_flags_observational':all(x.get('status') in ('observation_only','historical_evidence_only') for x in scope.get('review_flags',[])),'no_out_of_scope_objective_claim':len(scope.get('out_of_scope_flags',[]))==0,'coverage_and_frequency_limits_explicit':'no objective-level mapping or frequency estimate' in limits and 'not lesson coverage' in limits,'no_2027_2029_scope_imported_explicitly':'no 2027-2029 scope is imported' in limits,'scope_doc_supports_paper1_sections_1_8':bool(re.search(r'Paper 1.*?sections 1[–-]8',syllabus_scope,re.I|re.S)),'scope_document_hash_matches_authority':scope.get('authority',{}).get('scope_document_sha256')==sha(STAGE0/'evidence/a3/SYLLABUS_SCOPE.md')}
scope_ok=all(scope_checks.values())

# Record manual visual screenings of all 12 source sheets and the 13 freshly-rendered full-page boundary/control pages.
render=load(OUT/'SOURCE_RENDER_EVIDENCE_V2.json')
stage0_manifest=load(STAGE0/'evidence/a2/SOURCE_MANIFEST.json')
stage0_sources={x['id']:x for x in stage0_manifest.get('primary_sources',[])}
for sr in render.get('sources',[]):
    s0=stage0_sources.get(sr['source_id'],{})
    sr['stage0_expected_sha256']=s0.get('sha256')
    sr['stage0_expected_page_count']=s0.get('page_count')
    sr['matches_stage0_source_manifest']=bool(s0 and sr.get('sha256_actual')==s0.get('sha256') and sr.get('page_count_actual')==s0.get('page_count'))
render['all_sources_match_stage0_manifest']=all(x.get('matches_stage0_source_manifest') for x in render.get('sources',[])) and len(render.get('sources',[]))==12
target_dir=OUT/'source_renders/target_full_240dpi'
targets=[]
for p in sorted(target_dir.glob('*.png')):
    m=re.match(r'(9618_[sw]25_qp_1[123])-p(\d+)-\d+\.png',p.name)
    if m: targets.append({'source_id':m.group(1),'pdf_page_1_based':int(m.group(2)),'path':p.relative_to(OUT).as_posix(),'sha256':sha(p),'byte_count':p.stat().st_size})
# Make source render evidence accurate after two extra control renders and actual visual screening.
render['full_size_target_render_count']=len(targets);render['full_size_target_renders']=[{**x,'dimensions_px':list(__import__('PIL').Image.open(OUT/x['path']).size),'dpi':240} for x in targets]
render['contact_sheet_visual_screening']='PASS: all 12 original-PDF contact sheets visually screened; the six QP sheets cover all 51 roots and 178 pages; six MS sheets visually screened for source integrity/context; source-page boundaries checked.'
render['full_size_visual_screening']='PASS: all 10 finding pages and 3 control pages freshly rendered at 240 dpi from pinned original QP PDFs and visually reviewed.'
dump('SOURCE_RENDER_EVIDENCE_V2.json',render)

# Persist review evidence.
dump('PINNED_INPUTS_V2.json',{'schema_version':'1.0','artifact_version':'B25-A3-RETEST-v2','pins':pins,'pin_count':len(pins),'all_pins_match':all(x['matches_expected'] for x in pins),'candidate_snapshot_recomputation':snapshot_result,'candidate_snapshot_entries':entries})
dump('CONTEXT_AUDIT_MATRIX_V2.json',{'schema_version':'1.0','candidate_version':'B25-A2-v2','root_count':len(roots),'part_count':len(parts),'context_file_count':len(contexts),'all_51_contexts_structurally_screened':contexts_ok,'contact_sheets_visually_screened':6,'context_records':context_matrix})
dump('FINDING_DISPOSITIONS_V2.json',{'schema_version':'1.0','review_id':'P1-S1-A3-B25-RETEST-V2','finding_count':len(dispositions),'findings':dispositions,'context_delta_exact':context_delta_exact,'controls':controls,'controls_pass':controls_ok,'a3_context_gate_recommendation':'PASS_A3_ONLY' if context_delta_exact and controls_ok and contexts_ok and scope_ok and parent_ok and mark_ok and all(x['matches_expected'] for x in pins) and snapshot_result['all_442_entries_match'] else 'CHANGES_REQUIRED'})
dump('PARENT_GROUPING_RECHECK_V2.json',{'schema_version':'1.0','reviewed_against':'A3-v1 frozen parent group baseline','group_count':len(parent_rows),'all_27_groups_preserved_without_parent_mark_inference':parent_ok,'no_parent_mark_allocation_inferred':True,'groups':parent_rows})
dump('REVISION_DELTA_REVIEW_V2.json',{'schema_version':'1.0','candidate_delta_count':len(delta['changes']),'context_change_count':len(delta_context),'context_change_set_exact':context_delta_exact,'separate_a4_mark_excerpt_change':mark_delta_result})
dump('MARK_TOTAL_RECHECK_V2.json',{'schema_version':'1.0','method':'Extract original pinned PDF text directly with pypdf; count and sum visible bracketed numeric mark tokens on pages 2 onward; compare with candidate indexed numeric marks, MARK_TOTAL_CHECK, and A2 handoff totals.','variant_count':len(mark_rows),'all_six_cover_and_sum_checks_pass':mark_ok,'variants':mark_rows})
dump('SCOPE_REVIEW_V2.json',{'schema_version':'1.0','source':'frozen A3-v1 scope flags and pinned 2026 syllabus scope authority','scope_flags_sha256':sha(A3V1/'SCOPE_FLAGS_V1.json'),'syllabus_scope_sha256':sha(STAGE0/'evidence/a3/SYLLABUS_SCOPE.md'),'official_syllabus_sha256':sha(STAGE0/'evidence/a3/tmp/official-2026-syllabus.pdf'),'checks':scope_checks,'pass':scope_ok,'conclusion':'Flags remain observation-only/historical-evidence-only; no coverage, frequency, translation, question-correctness, or taxonomy claim is made.'})
status={'pin_ok':all(x['matches_expected'] for x in pins),'snapshot_ok':snapshot_result['all_442_entries_match'],'contexts_ok':contexts_ok,'context_delta_exact':context_delta_exact,'context_files_changed_in_v2':sorted(actual_changed_contexts),'expected_context_files_changed':sorted(expected_changed),'controls_ok':controls_ok,'parent_ok':parent_ok,'mark_ok':mark_ok,'scope_ok':scope_ok,'unlocated_context_pages':{x['question_id']:x['unlocated_context_pages_after_root_and_parts'] for x in context_matrix if x['unlocated_context_pages_after_root_and_parts']}}
(OUT/'AUDIT_STATUS_V2.json').write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(status,ensure_ascii=False,indent=2))
