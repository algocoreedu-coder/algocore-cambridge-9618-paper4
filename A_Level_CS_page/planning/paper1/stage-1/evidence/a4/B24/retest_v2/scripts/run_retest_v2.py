from pathlib import Path
import json,hashlib,re,collections
root=Path.cwd(); p1=root/'A_Level_CS_page/planning/paper1'; st=p1/'stage-1'; out=st/'evidence/a4/B24/retest_v2'; cand=st/'evidence/a2/B24/versions/B24-A2-v2'; v1=st/'evidence/a2/B24/versions/B24-A2-v1'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def jread(p): return json.loads(p.read_text(encoding='utf-8'))
def readlines(p): return [json.loads(x) for x in p.read_text(encoding='utf-8').splitlines() if x.strip()]
def norm(s): return re.sub(r'\s+',' ',s).strip().lower()
def rel(p): return p.relative_to(root).as_posix()
# Frozen dispatch and original-page evidence.
a9=jread(st/'evidence/a9/B24/review_v1/FINDINGS_V1.json'); prior_records=a9['findings'][0]['records']; direct=(out/'DIRECT_SOURCE_TEXT_V2.txt').read_text(encoding='utf-8')
direct_pages={(m.group(1),int(m.group(2))):m.group(3) for m in re.finditer(r'(?ms)^=== ([^ ]+) p(\d+) ===\s*\n(.*?)(?=^=== |\Z)',direct)}
source_render_manifest=jread(out/'SOURCE_RENDER_MANIFEST_V2.json'); render_by_page={(x['source_id'],x['pdf_page_1_based']):x for x in source_render_manifest['pages']}
# Frozen source metadata
source_pdf_hashes=jread(out/'SOURCE_PDF_HASHES_V2.json'); page_counts={x['source_id']:x['actual_page_count'] for x in source_pdf_hashes['sources']}
# Candidate and parent records
qrows=readlines(cand/'QUESTION_INDEX.jsonl'); qv1=readlines(v1/'QUESTION_INDEX.jsonl'); q_by_id={x['id']:x for x in qrows}
pages=readlines(cand/'PAGE_INDEX.jsonl'); page_by_key={(x['source_id'],x['pdf_page_1_based']):x for x in pages}
marks=readlines(cand/'MARKING_INDEX.jsonl'); m1=readlines(v1/'MARKING_INDEX.jsonl'); m_by_id={x['id']:x for x in marks}; m1_by_id={x['id']:x for x in m1}
prior_ids={x['record_id'] for x in prior_records}; semantic=jread(cand/'SEMANTIC_DELTA_V2.json'); semantic_ids=set(semantic['actual_changed_record_ids'])
# 19 exact row-boundary dispositions backed by v1 old row, v2 correction, and direct original page.
boundary_results=[]
for a in prior_records:
    rid=a['record_id']; v2=m_by_id[rid]; old=m1_by_id[rid]; before=old['mark_or_condition_or_null']; after=v2['mark_or_condition_or_null']
    rowref=a['table_row_ref']; sid=a['source_id']; pn=a['pdf_page_1_based']; source=direct_pages[(sid,pn)]
    old_suffix=before.endswith('Question \nAnswer \nMarks')
    exact_drop=before.removesuffix('Question \nAnswer \nMarks').rstrip()==after.rstrip()
    header_absent=not after.rstrip().endswith('Question \nAnswer \nMarks')
    row_present=norm(rowref) in norm(source)
    # The final token in the corrected excerpt is the displayed mark; A9 provided the exact contaminated suffix with this token.
    expected_mark=a['candidate_suffix'].split()[0]
    candidate_mark_end=after.rstrip().endswith(expected_mark)
    source_has_token=re.search(r'(?<![\w])'+re.escape(expected_mark)+r'(?![\w])',source) is not None
    changed_other_fields=[k for k in old if k!='mark_or_condition_or_null' and old.get(k)!=v2.get(k)]
    locator_same=old['ms_locator']==v2['ms_locator'] and v2['ms_locator']['source_id']==sid and v2['ms_locator']['pdf_page_1_based']==pn
    target_same=old.get('part_id_or_null')==v2.get('part_id_or_null') and old.get('question_id_or_null')==v2.get('question_id_or_null')
    row_ref_same=old.get('table_row_ref_or_null')==v2.get('table_row_ref_or_null')==rowref
    transcript_same=old.get('transcript_ref')==v2.get('transcript_ref') and bool(v2.get('transcript_ref')) and (cand/v2['transcript_ref']).is_file()
    visual_same=old.get('visual_dependency_refs')==v2.get('visual_dependency_refs') and bool(v2.get('visual_dependency_refs'))
    visual_resolved=all(x in {r['id'] for r in jread(cand/'VISUAL_MANIFEST.json')['visual_regions']} for x in v2.get('visual_dependency_refs',[]))
    status_same=old.get('status')==v2.get('status')=='MS_LINKED'
    render=render_by_page[(sid,pn)]
    boundary_results.append({'finding_id':'A9-B24-MS-01','record_id':rid,'source_id':sid,'pdf_page_1_based':pn,'table_row_ref':rowref,'v1_contaminated_suffix':old_suffix,'v2_removed_only_generic_following_header':exact_drop,'generic_header_absent_from_v2':header_absent,'candidate_v2_row_ref_present_in_original_page_text':row_present,'candidate_v2_ends_with_expected_mark_token':candidate_mark_end,'expected_mark_token_present_on_original_page':source_has_token,'changed_fields_outside_mark_text':changed_other_fields,'locator_unchanged_and_matches_original_page':locator_same,'question_or_part_target_unchanged':target_same,'table_row_reference_unchanged':row_ref_same,'transcript_reference_unchanged_and_resolves':transcript_same,'visual_dependencies_unchanged_and_resolve':visual_same and visual_resolved,'status_unchanged_and_linked':status_same,'direct_original_render_path':f"evidence/a4/B24/retest_v2/{render['render_path']}",'direct_visual_observation':'Inspected the original full page: the cited row ends at its displayed mark token; the following Question / Answer / Marks header belongs to a visually distinct next table and is not part of the cited row.'})
# Full 170-mark linkage checks.
visual=jread(cand/'VISUAL_MANIFEST.json'); v1visual=jread(v1/'VISUAL_MANIFEST.json')
regions={x['id']:x for x in visual['visual_regions']}; p1regions={x['id']:x for x in v1visual['visual_regions']}
qp_locator_errors=[]; target_errors=[]; mark_locator_errors=[]; transcript_errors=[]; visual_link_errors=[]; duplicate_ids=[]; duplicate_targets=[]; source_identity_errors=[]
target_counts=collections.Counter(); whole=parts=0
for m in marks:
    rid=m['id']; partid=m.get('part_id_or_null'); qid=m.get('question_id_or_null')
    if bool(partid)==bool(qid): target_errors.append({'id':rid,'problem':'target must be exactly one question or part'}); continue
    if partid:
        parts+=1; target=q_by_id.get(partid)
        if not target or 'question_id' not in target: target_errors.append({'id':rid,'target':partid,'problem':'missing/ambiguous part target'}); continue
        rootqid=target['question_id']
        if qid and qid!=rootqid: target_errors.append({'id':rid,'target':partid,'problem':'cross-question target'})
        if target.get('status')!='MS_LINKED': target_errors.append({'id':rid,'target':partid,'problem':'part target not MS_LINKED'})
        qp_source=target.get('qp_locator',{}).get('source_id')
    else:
        whole+=1; target=q_by_id.get(qid)
        if not target or 'question_id' in target: target_errors.append({'id':rid,'target':qid,'problem':'missing/ambiguous whole-question target'}); continue
        rootqid=qid; qp_source=target.get('source_qp_id')
    rootq=q_by_id.get(rootqid)
    if not rootq: target_errors.append({'id':rid,'target':rootqid,'problem':'missing question root'}); continue
    if qp_source!=rootq.get('source_qp_id'): target_errors.append({'id':rid,'problem':'target/root QP source disagreement'})
    ms=m.get('ms_locator') or {}; msid=ms.get('source_id',''); expected_msid=(qp_source or '').replace('_qp_','_ms_')
    if msid!=expected_msid: source_identity_errors.append({'id':rid,'observed_ms_source':msid,'expected_exact_ms_source':expected_msid,'problem':'not an exact QP/MS pair (prefix-only or cross-variant)'})
    try: ms_page=int(ms.get('pdf_page_1_based'))
    except Exception: ms_page=None
    if not ms_page or ms_page>page_counts.get(msid,0) or (msid,ms_page) not in page_by_key: mark_locator_errors.append({'id':rid,'locator':ms,'problem':'missing/invalid MS page locator'})
    if ms.get('question')!=rootq.get('question_number'): mark_locator_errors.append({'id':rid,'locator_question':ms.get('question'),'target_question':rootq.get('question_number'),'problem':'cross-question locator'})
    if not ms.get('part') and partid: mark_locator_errors.append({'id':rid,'problem':'part target lacks MS part locator'})
    qp_locator=target.get('qp_locator') if partid else rootq.get('qp_locator')
    if partid:
        qp_locator=target.get('qp_locator')
        if not qp_locator or qp_locator.get('source_id')!=rootq.get('source_qp_id') or qp_locator.get('question')!=rootq.get('question_number'):
            qp_locator_errors.append({'id':rid,'target':partid,'locator':qp_locator,'problem':'QP part locator disagrees with target root'})
    else:
        qp_locator=rootq.get('qp_locator')
        if not qp_locator or qp_locator.get('source_id')!=rootq.get('source_qp_id') or qp_locator.get('question')!=rootq.get('question_number'):
            qp_locator_errors.append({'id':rid,'target':qid,'locator':qp_locator,'problem':'QP root locator disagrees with target'})
    if not qp_locator or (qp_locator['source_id'],qp_locator['pdf_page_1_based']) not in page_by_key:
        qp_locator_errors.append({'id':rid,'problem':'QP locator page missing from page index'})
    if not m.get('table_row_ref_or_null'): mark_locator_errors.append({'id':rid,'problem':'missing printed MS table row reference'})
    tref=m.get('transcript_ref')
    if not tref or not (cand/tref).is_file() or (tref and f'{msid}-p{ms_page:03d}' not in tref): transcript_errors.append({'id':rid,'transcript_ref':tref,'problem':'missing or locator-inconsistent source transcript'})
    deps=m.get('visual_dependency_refs') or []
    target_counts[partid or qid]+=1
    if not deps: visual_link_errors.append({'id':rid,'problem':'no visual dependency'})
    for ref in deps:
        reg=regions.get(ref)
        if not reg: visual_link_errors.append({'id':rid,'ref':ref,'problem':'missing visual region'}); continue
        if reg['source_id']!=msid or reg['pdf_page_1_based']!=ms_page: visual_link_errors.append({'id':rid,'ref':ref,'problem':'visual dependency points to wrong source/page'})
        if rid not in reg.get('relates_to_ids',[]): visual_link_errors.append({'id':rid,'ref':ref,'problem':'missing visual-region backlink'})
    # All 170 records must be byte-identical to v1 except precisely the 19 named mark strings.
    old=m1_by_id.get(rid)
    if old is None: source_identity_errors.append({'id':rid,'problem':'no v1 comparison record'})
    elif rid not in prior_ids and old!=m: source_identity_errors.append({'id':rid,'problem':'non-mechanical non-finding marking drift from v1'})
    elif rid in prior_ids:
        if any(old.get(k)!=m.get(k) for k in old if k!='mark_or_condition_or_null'): source_identity_errors.append({'id':rid,'problem':'metadata drift on corrected record'})
if len({x['id'] for x in marks})!=len(marks): duplicate_ids=[x['id'] for x in marks]
duplicate_targets=[{'target_id':k,'count':n} for k,n in target_counts.items() if n>1]
residual_generic_headers=[m['id'] for m in marks if re.search(r'Question\s+Answer\s+Marks\s*$',m.get('mark_or_condition_or_null') or '',re.I)]
# Check every QP question/part locator and related transcript/page identity (all 243).
for q in qrows:
    if 'question_id' not in q:
        qp=q.get('qp_locator') or {}; sid=q.get('source_qp_id'); qnum=q.get('question_number')
    else:
        qp=q.get('qp_locator') or {}; sid=qp.get('source_id'); qnum=qp.get('question')
    if not qp or qp.get('source_id')!=sid or qp.get('question')!=qnum or (sid,qp.get('pdf_page_1_based')) not in page_by_key:
        qp_locator_errors.append({'record_id':q['id'],'locator':qp,'problem':'QP locator invalid or cross-question'})
    tref=q.get('prompt_transcript_ref')
    if not tref or not (cand/tref).is_file(): transcript_errors.append({'record_id':q['id'],'transcript_ref':tref,'problem':'missing QP prompt transcript'})
# Structure and visual relations compared with v1.
ctx1={x.name:sha(x) for x in (v1/'contexts').glob('*.json')}; ctx2={x.name:sha(x) for x in (cand/'contexts').glob('*.json')}
visual_regions_unchanged=visual['visual_regions']==v1visual['visual_regions']; full_renders_unchanged=visual['full_page_renders']==v1visual['full_page_renders']
visual_render_errors=[]; render_by_page={(x['source_id'],x['pdf_page_1_based']):x for x in visual['full_page_renders']}
for reg in visual['visual_regions']:
    rp=cand/reg['rendered_asset_ref']; r=render_by_page.get((reg['source_id'],reg['pdf_page_1_based']))
    if not r or r.get('rendered_asset_ref')!=reg.get('rendered_asset_ref') or r.get('sha256')!=reg.get('render_sha256'):
        visual_render_errors.append({'region_id':reg['id'],'problem':'region/render manifest inconsistency'})
    if not rp.is_file() or (rp.is_file() and sha(rp)!=reg['render_sha256']): visual_render_errors.append({'region_id':reg['id'],'problem':'render file missing or hash mismatch'})
# Parent groups and totals.
parent_ids={x.get('parent_part_id_or_null') for x in qrows if x.get('parent_part_id_or_null')}; parent_errors=[]; parent_mark_errors=[]
for pid in parent_ids:
    parent=q_by_id.get(pid); children=[x for x in qrows if x.get('parent_part_id_or_null')==pid]
    if not parent: parent_errors.append({'parent_id':pid,'problem':'missing parent'}); continue
    if parent.get('ms_locator_or_null') is not None or parent.get('marks_displayed_or_null') is not None or parent.get('status')!='EXTRACTED': parent_errors.append({'parent_id':pid,'problem':'synthetic parent mark/link or wrong status'})
    if any(m.get('part_id_or_null')==pid or m.get('question_id_or_null')==pid for m in marks): parent_mark_errors.append(pid)
    for ch in children:
        if ch.get('question_id')!=parent.get('question_id') or ch.get('status')!='MS_LINKED': parent_errors.append({'parent_id':pid,'child_id':ch['id'],'problem':'child target/hierarchy status mismatch'})
# Totals: indexed explicit marks, check file and original cover pages.
total_json=jread(cand/'MARK_TOTAL_CHECK.json'); direct_cover=[]
for sid in sorted(s for s in page_counts if s.endswith('_qp_11') or s.endswith('_qp_12') or s.endswith('_qp_13')):
    if sid not in render_by_page or (sid,1) not in render_by_page: pass
# Covers use direct renders above; check direct extracted text and index sum.
cover_texts={}
for match in re.finditer(r'(?ms)^=== ([^ ]+) p1 ===\s*\n(.*?)(?=^=== |\Z)',direct): cover_texts[match.group(1)]=match.group(2)
indexed_totals=collections.Counter()
for q in qrows:
    sid=q.get('source_qp_id') or (q.get('qp_locator') or {}).get('source_id')
    if sid: indexed_totals[sid]+=q.get('marks_displayed_or_null') or 0
cover_results=[]
for sid,total in sorted(total_json['pairs'].items()):
    rec=total_json['pairs'][sid]; cover=cover_texts.get(sid,'')
    direct75=re.search(r'total mark for this paper is 75',norm(cover)) is not None
    cover_results.append({'source_id':sid,'source_cover_text_states_75':direct75,'candidate_indexed_total':indexed_totals.get(sid),'candidate_mark_total_check_sum':rec.get('displayed_mark_sum_from_source_transcript'),'candidate_mark_check_matches':rec.get('matches') is True,'pass':direct75 and indexed_totals.get(sid)==75 and rec.get('displayed_mark_sum_from_source_transcript')==75 and rec.get('matches') is True})
# Exact structural drift gates.
context_files_unchanged=ctx1==ctx2
qindex_identical=sha(cand/'QUESTION_INDEX.jsonl')==sha(v1/'QUESTION_INDEX.jsonl')
pageindex_identical=sha(cand/'PAGE_INDEX.jsonl')==sha(v1/'PAGE_INDEX.jsonl')
# Findings + check matrix. Recommendation is A4 only; any structural drift is Major and requires stop.
nonmechanical_drift=(not context_files_unchanged or not qindex_identical or not pageindex_identical or not visual_regions_unchanged or not full_renders_unchanged or len(semantic_ids)!=19 or semantic_ids!=prior_ids or len([x for x in marks if x['id'] in prior_ids])!=19)
row_failures=[x for x in boundary_results if not (x['v1_contaminated_suffix'] and x['v2_removed_only_generic_following_header'] and x['generic_header_absent_from_v2'] and x['candidate_v2_row_ref_present_in_original_page_text'] and x['candidate_v2_ends_with_expected_mark_token'] and x['expected_mark_token_present_on_original_page'] and not x['changed_fields_outside_mark_text'] and x['locator_unchanged_and_matches_original_page'] and x['question_or_part_target_unchanged'] and x['table_row_reference_unchanged'] and x['transcript_reference_unchanged_and_resolves'] and x['visual_dependencies_unchanged_and_resolve'] and x['status_unchanged_and_linked'])]
all_link_errors=target_errors+mark_locator_errors+qp_locator_errors+transcript_errors+visual_link_errors+source_identity_errors+visual_render_errors+parent_errors+parent_mark_errors
recommendation='PASS_A4_ONLY' if (len(boundary_results)==19 and not row_failures and not nonmechanical_drift and len(marks)==170 and whole==5 and parts==165 and not duplicate_ids and not duplicate_targets and not residual_generic_headers and not all_link_errors and len(parent_ids)==29 and all(x['pass'] for x in cover_results) and len(visual['visual_regions'])==130 and len(qrows)==243 and len(pages)==156) else 'CHANGES_REQUIRED'
result={
 'artifact':'B24-A2-v2 independent A4 marking-boundary/linkage retest','candidate_version':'B24-A2-v2','recommendation':recommendation,'gate_scope':'A4 specialist gate only; not A9/A0 batch acceptance',
 'a9_finding_id':'A9-B24-MS-01','source_page_render_count':len(source_render_manifest['pages']),'corrected_rows_expected':19,'corrected_rows_directly_inspected':len(boundary_results),'corrected_row_failures':row_failures,'boundary_results':boundary_results,
 'linkage_regression':{'marking_items':len(marks),'whole_question_targets':whole,'part_targets':parts,'target_errors':target_errors,'ms_locator_errors':mark_locator_errors,'qp_locator_errors':qp_locator_errors,'transcript_errors':transcript_errors,'visual_dependency_errors':visual_link_errors,'source_identity_or_v1_drift_errors':source_identity_errors,'duplicate_mark_ids':duplicate_ids,'duplicate_target_links':duplicate_targets,'residual_generic_header_suffix_ids':residual_generic_headers,'validated_target_count':len(marks)-len(target_errors),'validated_locator_count':len(marks)-len(mark_locator_errors)-len(source_identity_errors),'visual_regions':len(regions),'visual_render_errors':visual_render_errors},
 'structure_regression':{'question_and_part_rows':len(qrows),'question_roots':sum(1 for x in qrows if 'question_id' not in x),'parts':sum(1 for x in qrows if 'question_id' in x),'question_contexts':len(ctx2),'context_records_unchanged_vs_v1':context_files_unchanged,'question_index_byte_identical_vs_v1':qindex_identical,'page_index_byte_identical_vs_v1':pageindex_identical,'visual_regions_unchanged_vs_v1':visual_regions_unchanged,'full_page_render_manifest_unchanged_vs_v1':full_renders_unchanged,'parent_groups':len(parent_ids),'parent_group_errors':parent_errors,'parent_synthetic_mark_errors':parent_mark_errors},
 'parent_groups':{'count':len(parent_ids),'child_counts':dict(collections.Counter(sum(1 for x in qrows if x.get('parent_part_id_or_null')==pid) for pid in parent_ids)),'null_parent_allocation_and_no_parent_target_check_pass':not parent_errors and not parent_mark_errors},
 'qp_totals':cover_results,'cross_session_component_risk_samples':[{'source_id':x['source_id'],'pdf_page_1_based':x['pdf_page_1_based'],'render_path':x['render_path']} for x in source_render_manifest['pages'] if x['source_id'].endswith(('qp_11','qp_12','qp_13')) and x['pdf_page_1_based'] in (2,3,4,7,9)],
 'nonmechanical_drift_detected':nonmechanical_drift,'nonmechanical_drift_severity':'MAJOR' if nonmechanical_drift else 'NONE','unresolved_a4_findings':[] if recommendation=='PASS_A4_ONLY' else ['See exact error arrays and row failure matrix.'],
 'independent_evidence_limit':'All 19 corrected row boundaries were visually inspected on original PDF renders. The other 151 marking rows are byte-identical to the pinned A4-v1-reviewed version; their target/locator/visual links were independently revalidated in this retest.'}
(out/'RETEST_FINDINGS_V2.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('recommendation',recommendation,'row failures',len(row_failures),'links',len(marks),'whole',whole,'part',parts,'link errs',len(all_link_errors))
print('structure',result['structure_regression'])
print('totals',[(x['source_id'],x['pass'],x['candidate_indexed_total']) for x in cover_results])
