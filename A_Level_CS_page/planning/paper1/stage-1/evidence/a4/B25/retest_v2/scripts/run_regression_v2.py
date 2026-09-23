from pathlib import Path
import json,hashlib,re
workspace=Path.cwd(); p1=workspace/'A_Level_CS_page/planning/paper1'; stage=p1/'stage-1'; cand=stage/'evidence/a2/B25/versions/B25-A2-v2'; parent=cand.parent/'B25-A2-v1'; out=stage/'evidence/a4/B25/retest_v2'
def readjson(p): return json.loads(p.read_text(encoding='utf-8'))
def lines(p): return [json.loads(x) for x in p.read_text(encoding='utf-8').splitlines() if x.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return p.relative_to(workspace).as_posix()
# Context correction retest against the exact original pages rendered and visually inspected.
context_cases=[
 ('9618_s25_qp_11-q3','9618_s25_qp_11',7,'Question 4'),
 ('9618_s25_qp_12-q2','9618_s25_qp_12',5,'Question 3'),
 ('9618_s25_qp_12-q5','9618_s25_qp_12',11,'Question 6'),
 ('9618_w25_qp_11-q2','9618_w25_qp_11',7,'Question 3'),
 ('9618_w25_qp_11-q5','9618_w25_qp_11',11,'Question 6'),
 ('9618_w25_qp_12-q7','9618_w25_qp_12',13,'Question 8'),
 ('9618_w25_qp_12-q9','9618_w25_qp_12',15,'Question 10'),
 ('9618_w25_qp_13-q1','9618_w25_qp_13',3,'Question 2'),
 ('9618_w25_qp_13-q3','9618_w25_qp_13',5,'Question 4'),
 ('9618_w25_qp_13-q5','9618_w25_qp_13',9,'Question 6 starts on the next page')]
context_results=[]
direct_source_full=(out/'DIRECT_SOURCE_TEXT_V2.txt').read_text(encoding='utf-8')
direct_source_pages={(m.group(1),int(m.group(2))):m.group(3).strip() for m in re.finditer(r'(?ms)^=== ([^ ]+) p(\d+) ===\s*\n(.*?)(?=^=== |\Z)',direct_source_full)}
for qid,sid,pn,obs in context_cases:
    cur=readjson(cand/'contexts'/f'{qid}.json'); old=readjson(parent/'contexts'/f'{qid}.json')
    text=direct_source_pages.get((sid,pn),'')
    fields={k:cur.get(k) for k in ['all_context_pages','continuation_pages']}
    source_pages=[x['pdf_page_1_based'] for x in cur.get('source_evidence',[])]
    absent=(pn not in cur.get('all_context_pages',[]) and pn not in cur.get('continuation_pages',[]) and pn not in source_pages)
    context_results.append({'finding_group':'A4-B25-CTX-01' if pn!=9 or sid!='9618_w25_qp_13' else 'A4-B25-CTX-02','question_id':qid,'source_id':sid,'pdf_page_1_based':pn,'candidate_v1_sha256':sha(parent/'contexts'/f'{qid}.json'),'candidate_v2_sha256':sha(cand/'contexts'/f'{qid}.json'),'candidate_v2_context_pages':fields,'candidate_v2_source_evidence_pages':source_pages,'forbidden_page_absent_from_all_context_fields':absent,'page_visual_observation':obs,'direct_source_text_excerpt':text[0:420] if text else None,'visual_render_path':f"evidence/a4/B25/retest_v2/source_renders/{sid}-p{pn:03d}.png"})
# Legitimate continuation boundary checks.
legit=[]
for qid,sid,expected in [('9618_s25_qp_11-q8','9618_s25_qp_11',15),('9618_w25_qp_13-q5','9618_w25_qp_13',7),('9618_w25_qp_13-q5','9618_w25_qp_13',8)]:
    c=readjson(cand/'contexts'/f'{qid}.json'); p=readjson(parent/'contexts'/f'{qid}.json')
    legit.append({'question_id':qid,'source_id':sid,'pdf_page_1_based':expected,'present_in_v2_all_context_pages':expected in c.get('all_context_pages',[]),'present_in_v2_continuation_pages':expected in c.get('continuation_pages',[]),'was_present_in_v1':expected in p.get('all_context_pages',[]),'direct_page_render_path':f'evidence/a4/B25/retest_v2/source_renders/{sid}-p{expected:03d}.png'})
# Q7(e) and published-wording retests.
marks=lines(cand/'MARKING_INDEX.jsonl'); old_marks=lines(parent/'MARKING_INDEX.jsonl'); byid={r['id']:r for r in marks}; oldbyid={r['id']:r for r in old_marks}
q7id='9618_w25_qp_13-q7-pe-mi-1'; q7=byid[q7id]; q7old=oldbyid[q7id]
q7v2=q7['mark_or_condition_or_null']; q7v1=q7old['mark_or_condition_or_null']
expected_q7='7(e) \n1 mark for each validation check correctly identified, max 3 marks \n \nRange Check \nExistence Check \nFormat Check \n3 '
q8id='9618_w25_qp_13-q8-pb-mi-1'; q8=byid[q8id]
source_text=(out/'DIRECT_SOURCE_TEXT_V2.txt').read_text(encoding='utf-8')
source_phrase='Programming time is saved as code does not have to written from scratch'
# record changed-vs-v1 counts
changed_mark_ids=[]
for i,r in byid.items():
    if r!=oldbyid.get(i): changed_mark_ids.append(i)
nontext_fields=[k for k in q7 if k!='mark_or_condition_or_null' and q7[k]!=q7old[k]]
# Structural index and visual regression comparisons.
qrows=lines(cand/'QUESTION_INDEX.jsonl'); oldqrows=lines(parent/'QUESTION_INDEX.jsonl'); pages=lines(cand/'PAGE_INDEX.jsonl'); oldpages=lines(parent/'PAGE_INDEX.jsonl')
q_byid={r['id']:r for r in qrows}; roots={k:v for k,v in q_byid.items() if 'question_id' not in v}; parts={k:v for k,v in q_byid.items() if 'question_id' in v}
# parent group consistency
parent_ids={r['parent_part_id_or_null'] for r in qrows if r.get('parent_part_id_or_null')}
parent_errors=[]
parent_mark_errors=[]
for pid in parent_ids:
    par=q_byid.get(pid)
    children=[r for r in qrows if r.get('parent_part_id_or_null')==pid]
    if not par: parent_errors.append({'parent_id':pid,'error':'missing_parent'}); continue
    if par.get('parent_part_id_or_null') is not None: parent_errors.append({'parent_id':pid,'error':'nested_parent_unexpected'})
    if par.get('status')!='EXTRACTED' or par.get('ms_locator_or_null') is not None or par.get('marks_displayed_or_null') is not None:
        parent_errors.append({'parent_id':pid,'error':'parent_must_remain_unlinked_with_null_mark'})
    if any(m.get('part_id_or_null')==pid or m.get('question_id_or_null')==pid for m in marks):
        parent_mark_errors.append({'parent_id':pid,'error':'synthetic_marking_item_targets_parent'})
    for ch in children:
        if ch.get('question_id')!=par.get('question_id') or ch.get('status')!='MS_LINKED':
            parent_errors.append({'parent_id':pid,'child_id':ch['id'],'error':'child_question_or_status_mismatch'})
# Page and transcript reference index
page_by_key={(p['source_id'],p['pdf_page_1_based']):p for p in pages}
source_docs=json.loads((p1/'stage-0/evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf-8'))
source_by_id={s['id']:s for s in source_docs['primary_sources']}
valid_locator_errors=[]; target_errors=[]; missing_transcripts=[]
for m in marks:
    part_id=m.get('part_id_or_null'); qid=m.get('question_id_or_null')
    if bool(part_id)==bool(qid): target_errors.append({'id':m['id'],'problem':'must have exactly one question or part target'}); continue
    if part_id:
        target=q_byid.get(part_id)
        if not target or 'question_id' not in target: target_errors.append({'id':m['id'],'problem':'missing part target'}); continue
        if qid and qid!=target.get('question_id'): target_errors.append({'id':m['id'],'problem':'part/question target mismatch'})
        target_qid=target.get('question_id')
    else:
        target=q_byid.get(qid); target_qid=qid
        if not target or 'question_id' in target: target_errors.append({'id':m['id'],'problem':'missing root target'}); continue
    qroot=q_byid.get(target_qid)
    qp_source=qroot.get('source_qp_id') if qroot else None
    ms=m.get('ms_locator') or {}; ms_sid=ms.get('source_id','')
    if not qroot or ms_sid.replace('_ms_','_qp_')!=qp_source:
        valid_locator_errors.append({'id':m['id'],'problem':'MS source does not match target QP source','ms_source_id':ms_sid,'qp_source':qp_source})
    try: page=int(ms.get('pdf_page_1_based'))
    except Exception: page=None
    if not page or (ms_sid,page) not in page_by_key:
        valid_locator_errors.append({'id':m['id'],'problem':'MS locator page missing from page index','source_id':ms_sid,'pdf_page':page})
    tref=m.get('transcript_ref')
    if not tref or not (cand/tref).is_file(): missing_transcripts.append({'id':m['id'],'transcript_ref':tref})
# Visual regions and render evidence check.
visual=readjson(cand/'VISUAL_MANIFEST.json'); oldvisual=readjson(parent/'VISUAL_MANIFEST.json')
regions=visual['visual_regions']; oldregions=oldvisual['visual_regions']; regionmap={r['id']:r for r in regions}
renders=visual['full_page_renders']; render_by_page={(r['source_id'],r['pdf_page_1_based']):r for r in renders}
visual_errors=[]; render_errors=[]; visual_type_counts={}
for r in regions:
    visual_type_counts[r['kind']]=visual_type_counts.get(r['kind'],0)+1
    p=(cand/r['rendered_asset_ref'])
    rr=render_by_page.get((r['source_id'],r['pdf_page_1_based']))
    if not rr: visual_errors.append({'region_id':r['id'],'problem':'missing full page render record'})
    else:
        if rr['rendered_asset_ref']!=r['rendered_asset_ref'] or rr['sha256']!=r['render_sha256']:
            visual_errors.append({'region_id':r['id'],'problem':'render ref/hash mismatch'})
    if not p.is_file() or (p.is_file() and sha(p)!=r['render_sha256']): render_errors.append({'region_id':r['id'],'path':r['rendered_asset_ref'],'problem':'missing file or hash mismatch'})
# Check marking visual refs all resolve to an exact page/source region.
mark_visual_errors=[]
for m in marks:
    loc=m['ms_locator']
    for ref in m.get('visual_dependency_refs',[]):
        region=regionmap.get(ref)
        if not region: mark_visual_errors.append({'id':m['id'],'ref':ref,'problem':'unknown region'}); continue
        if region['source_id']!=loc['source_id'] or region['pdf_page_1_based']!=loc['pdf_page_1_based']:
            mark_visual_errors.append({'id':m['id'],'ref':ref,'problem':'wrong page/source'})
# Six total cross-checks from original cover renders/text and candidate indexes.
totals=readjson(cand/'MARK_TOTAL_CHECK.json')['pairs']; index_sums={}
for r in qrows:
    sid=r.get('source_qp_id') or r.get('qp_locator',{}).get('source_id')
    if sid: index_sums[sid]=index_sums.get(sid,0)+(r.get('marks_displayed_or_null') or 0)
cover_text=(out/'COVER_TOTAL_SOURCE_TEXT_V2.txt').read_text(encoding='utf-8')
total_checks=[]
cover_blocks=re.split(r'(?m)(?=^=== 9618_[sw]25_qp_\d{2} p1 ===)',cover_text)
for sid, rec in sorted(totals.items()):
    source_cover=next((block for block in cover_blocks if block.startswith(f'=== {sid} p1 ===')), '')
    total_checks.append({'source_id':sid,'direct_original_cover_says_75':'The total mark for this paper is 75.' in source_cover,'candidate_mark_total_check_sum':rec['displayed_mark_sum_from_source_transcript'],'candidate_cover_locator':rec['cover_total_source']['pdf_page_1_based'],'indexed_question_and_part_sum':index_sums.get(sid),'pass':rec.get('matches') is True and rec['displayed_mark_sum_from_source_transcript']==75 and index_sums.get(sid)==75 and 'The total mark for this paper is 75.' in source_cover})
# Semantic equality/deltas.
semantic={
 'question_index_byte_identical_to_v1':sha(cand/'QUESTION_INDEX.jsonl')==sha(parent/'QUESTION_INDEX.jsonl'),
 'page_index_byte_identical_to_v1':sha(cand/'PAGE_INDEX.jsonl')==sha(parent/'PAGE_INDEX.jsonl'),
 'visual_regions_identical_to_v1':regions==oldregions,
 'full_page_render_manifest_identical_to_v1':renders==oldvisual['full_page_renders'],
 'mark_ids_identical_to_v1':set(byid)==set(oldbyid),
 'mark_rows_changed_count':len(changed_mark_ids),
 'mark_rows_changed_ids':changed_mark_ids,
 'q7e_only_nontext_metadata_unchanged':not nontext_fields,
 'context_changed_count_vs_v1':len([x for x in json.loads((out/'INPUT_VERIFICATION_V2.json').read_text())['context_diffs_vs_v1']]),
}
result={
 'artifact':'B25-A2-v2 independent A4 regression retest','candidate_version':'B25-A2-v2',
 'context_findings':context_results,'legitimate_continuation_checks':legit,
 'q7e':{'id':q7id,'candidate_v1_mark_text':q7v1,'candidate_v2_mark_text':q7v2,'exact_expected_v2_text':expected_q7,'v1_suffix_present':q7v1.endswith('Question \nAnswer \nMarks'),'v2_suffix_absent':not q7v2.endswith('Question \nAnswer \nMarks'),'full_response_and_3_mark_preserved':q7v2==expected_q7,'locator_unchanged':q7['ms_locator']==q7old['ms_locator'],'part_target_unchanged':q7['part_id_or_null']==q7old['part_id_or_null'],'table_row_ref_unchanged':q7['table_row_ref_or_null']==q7old['table_row_ref_or_null'],'transcript_ref_unchanged':q7['transcript_ref']==q7old['transcript_ref'],'visual_dependencies_unchanged':q7['visual_dependency_refs']==q7old['visual_dependency_refs'],'source_locator':q7['ms_locator'],'direct_source_render':'evidence/a4/B25/retest_v2/source_renders/9618_w25_ms_13-p012.png'},
 'q8b_source_wording_non_finding':{'id':q8id,'candidate_phrase_present':source_phrase in q8['mark_or_condition_or_null'],'original_ms_phrase_present':source_phrase in source_text,'finding':'Non-finding: exact source-published grammar is preserved by the candidate; the source PDF itself has the same wording.','source_locator':q8['ms_locator'],'direct_source_render':'evidence/a4/B25/retest_v2/source_renders/9618_w25_ms_13-p012.png'},
 'regression':{
   'counts':{'question_and_part_rows':len(qrows),'question_roots':len(roots),'parts':len(parts),'marking_items':len(marks),'visual_regions':len(regions),'visual_regions_qp':sum(1 for r in regions if r['kind'].startswith('question_paper')),'visual_regions_ms':sum(1 for r in regions if r['kind'].startswith('mark_scheme')),'parent_groups':len(parent_ids),'source_pages':len(pages),'rendered_source_pages':len(renders)},
   'valid_marking_targets':len(marks)-len(target_errors),'target_errors':target_errors,
   'valid_ms_locators':len(marks)-len(valid_locator_errors),'locator_errors':valid_locator_errors,
   'missing_transcript_references':missing_transcripts,
   'visual_region_errors':visual_errors,'visual_render_hash_errors':render_errors,'mark_visual_dependency_errors':mark_visual_errors,
   'parent_group_errors':parent_errors,'parent_mark_errors':parent_mark_errors,'parent_groups_without_synthetic_marks':len(parent_ids)-len(parent_mark_errors),'mark_totals':total_checks,
   'semantic_v1_v2':semantic,
 },
 'recommendation':'PASS_A4_ONLY' if (all(c['forbidden_page_absent_from_all_context_fields'] for c in context_results) and all(x['present_in_v2_all_context_pages'] and x['present_in_v2_continuation_pages'] for x in legit) and q7v2==expected_q7 and not nontext_fields and not target_errors and not valid_locator_errors and not missing_transcripts and not visual_errors and not render_errors and not mark_visual_errors and not parent_errors and not parent_mark_errors and all(t['pass'] for t in total_checks) and semantic['question_index_byte_identical_to_v1'] and semantic['page_index_byte_identical_to_v1'] and semantic['visual_regions_identical_to_v1'] and semantic['mark_rows_changed_count']==1 and len(context_results)==10) else 'CHANGES_REQUIRED'
}
(out/'RETEST_FINDINGS_V2.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('recommendation',result['recommendation'])
print('counts',result['regression']['counts'])
print('target errors',len(target_errors),'locator errors',len(valid_locator_errors),'transcript errors',len(missing_transcripts),'visual errors',len(visual_errors),'render errors',len(render_errors),'mark visual errors',len(mark_visual_errors),'parent errors',len(parent_errors))
print('totals',[(x['source_id'],x['pass'],x['indexed_question_and_part_sum']) for x in total_checks])
print('semantic',semantic)
