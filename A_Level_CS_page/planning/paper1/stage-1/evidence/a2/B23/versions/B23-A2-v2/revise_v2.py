"""Apply evidence-backed A3/A4 corrections to frozen B23-A2-v1."""
from __future__ import annotations
import hashlib, json
from pathlib import Path

OUT=Path(__file__).resolve().parent
V1=OUT/'versions'/'B23-A2-v1'
A4=json.loads((OUT.parent.parent/'a4'/'B23'/'LINKAGE_FINDINGS.json').read_text(encoding='utf-8'))

def load_jsonl(p): return [json.loads(x) for x in p.read_text(encoding='utf-8').splitlines() if x]
def write_jsonl(p, rows): p.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in rows),encoding='utf-8')
def sha(p):
    h=hashlib.sha256();
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()
def locator(sid,page,question,part):
    return {'source_id':sid,'pdf_page_1_based':page,'printed_page_or_null':page if page>1 else None,'question':str(question),'part':part}

def main():
    q=load_jsonl(V1/'QUESTION_INDEX.jsonl'); mi=load_jsonl(V1/'MARKING_INDEX.jsonl')
    visual=json.loads((V1/'VISUAL_MANIFEST.json').read_text(encoding='utf-8'))
    findings={x['id']:x for x in A4['findings']}
    f01=findings['A4-B23-F01']['records']; f02=findings['A4-B23-F02']['records']
    byid={x['id']:x for x in q}
    # Parent labels in F01 exist in the QP but their MS pages contain only child
    # rows. Keep them as source context and explicitly mark exact MS linkage
    # unresolved; remove their false marking-item pointers.
    parents={x['record_id'] for x in f01}
    for pid in parents:
        r=byid[pid]
        r['ms_locator_or_null']=None; r['status']='UNRESOLVED'
        r['ms_linkage_note']='No exact standalone MS row; parent context only. See UNRESOLVED.md.'
    mi=[x for x in mi if x['part_id'] not in parents]
    # Add the six nested (i) QP children identified by A4.  QP and MS locators
    # and visible marks come only from that independent original-PDF review.
    for item in f02:
        child=item['missing_record_id']; parent=item['current_parent_record_id']; pr=byid[parent]
        suffix='(i)'; msl=item['correct_child_ms_locator']; qpl=item['qp']
        rec={'id':child,'question_id':pr['question_id'],'parent_part_id_or_null':parent,'label':'i',
             'marks_displayed_or_null':item['qp']['displayed_mark_on_missing_child'],
             'qp_locator':locator(qpl['source_id'],qpl['pdf_page_1_based'],pr['question_id'].split('-q')[-1],qpl['part']),
             'prompt_transcript_ref':f"transcripts/{qpl['source_id']}-p{qpl['pdf_page_1_based']:02d}.txt",
             'ms_locator_or_null':locator(msl['source_id'],msl['pdf_page_1_based'],pr['question_id'].split('-q')[-1],msl['part']),
             'dependency_refs':[pr['question_id'],parent],'context_required':True,'status':'MS_LINKED',
             'command_word_verbatim_or_null':None}
        q.append(rec); byid[child]=rec
        mi.append({'id':child+'-mi-01','part_id':child,'ms_locator':rec['ms_locator_or_null'],
                   'transcript_ref':f"transcripts/{msl['source_id']}-p{msl['pdf_page_1_based']:02d}.txt",
                   'mark_or_condition_or_null':None,'table_row_ref_or_null':None,'visual_dependency_refs':[],'status':'MS_LINKED'})
        # The visible mark belonged to the child, not to the structural parent.
        pr['marks_displayed_or_null']=None
    # Parent context lists its known child records; this is not an MS item link.
    for pid in parents:
        byid[pid]['dependency_refs']=sorted(set(byid[pid]['dependency_refs']+[x['id'] for x in q if x.get('parent_part_id_or_null')==pid]))
    # Required multi-page source context and its displayed mark.
    q9=byid['9618_w23_qp_12-q9-pb']
    q9['marks_displayed_or_null']=4
    q9['context_ref_or_null']={'source_id':'9618_w23_qp_12','pdf_page_1_based':15,'printed_page_or_null':15,'question':'9','part':'(b)','purpose':'required program, memory, ASCII and trace-table input'}
    q9['prompt_transcript_refs']=['transcripts/9618_w23_qp_12-p14.txt','transcripts/9618_w23_qp_12-p15.txt']
    q8=byid['9618_w23_qp_11-q8-pc-piii']
    q8['context_ref_or_null']={'source_id':'9618_w23_qp_11','pdf_page_1_based':14,'printed_page_or_null':14,'question':'8','part':'(c)','purpose':'instruction-set context for the p15 XOR operation'}
    q8['prompt_transcript_refs']=['transcripts/9618_w23_qp_11-p14.txt','transcripts/9618_w23_qp_11-p15.txt']
    # Three omitted visual regions use pre-existing immutable source renders.
    extras=[
      ('9618_w23_qp_11-p15-vr2','9618_w23_qp_11',15,'boxed ACC bits and XOR answer layout',['9618_w23_qp_11-q8-pc-piii'],'renders/9618_w23_qp_11-p15.png'),
      ('9618_w23_qp_12-p15-vr2','9618_w23_qp_12',15,'instruction, memory, ASCII and trace-table context',['9618_w23_qp_12-q9-pb'],'renders/9618_w23_qp_12-p15.png'),
      ('9618_w23_ms_12-p11-vr2','9618_w23_ms_12',11,'conditional shaded-row MS table for Q9(b)',['9618_w23_qp_12-q9-pb','9618_w23_qp_12-q9-pb-mi-01'],'renders/9618_w23_ms_12-p11.png')]
    for vid,sid,page,kind,rels,asset in extras:
        visual.append({'id':vid,'source_id':sid,'pdf_page_1_based':page,'page_ref':{'source_id':sid,'pdf_page_1_based':page,'printed_page_or_null':page},
                       'kind':kind,'relates_to_ids':rels,'extraction_risk':'reviewer-identified layout/conditional-table dependency; rendered; independent retest required',
                       'rendered_asset_ref':asset,'reviewer_status':'SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW'})
    for x in mi:
        if x['id']=='9618_w23_qp_12-q9-pb-mi-01':
            x['visual_dependency_refs']=['9618_w23_ms_12-p11-vr2']
            x['table_row_ref_or_null']='whole-page conditional shaded-row table; no per-row allocation inferred'
    # Structural validation.
    ids=[x['id'] for x in q]+[x['id'] for x in mi]+[x['id'] for x in visual]; assert len(ids)==len(set(ids))
    qids={x['id'] for x in q if 'source_qp_id' in x}; pids={x['id'] for x in q if 'question_id' in x}
    assert all(x['question_id'] in qids for x in q if 'question_id' in x)
    assert all(not x.get('parent_part_id_or_null') or x['parent_part_id_or_null'] in pids for x in q if 'question_id' in x)
    assert all(x['part_id'] in pids for x in mi)
    assert all(byid[x]['status']=='UNRESOLVED' and byid[x]['ms_locator_or_null'] is None for x in parents)
    assert all(x['missing_record_id'] in byid and byid[x['missing_record_id']]['status']=='MS_LINKED' for x in f02)
    write_jsonl(OUT/'QUESTION_INDEX.jsonl',q); write_jsonl(OUT/'MARKING_INDEX.jsonl',mi)
    (OUT/'VISUAL_MANIFEST.json').write_text(json.dumps(visual,ensure_ascii=False,indent=2),encoding='utf-8')
    old=json.loads((V1/'BATCH_MANIFEST.json').read_text(encoding='utf-8'))
    old.update({'artifact_version':'B23-A2-v2','status':'SUBMITTED_RETEST_PENDING','supersedes':'B23-A2-v1','review_inputs':{
        'a3_context_scope_review_sha256':sha(OUT.parent.parent/'a3'/'B23'/'CONTEXT_SCOPE_REVIEW.md'),
        'a4_linkage_findings_sha256':sha(OUT.parent.parent/'a4'/'B23'/'LINKAGE_FINDINGS.json')},
        'record_counts':{'sources':12,'pages':157,'questions':len(qids),'parts':len(pids),'marking_items':len(mi),'visual_regions':len(visual),'unresolved_records':len(parents)},
        'visual_claim':'Existing 61 source-risk renders plus 3 reviewer-identified risk renders are retained. A2 self-inspected the three additions; all 64 visual regions still require independent retest before acceptance.',
        'revision_note':'v2 corrects structure/context only and does not infer marking allocations or create learner content.'})
    old['active_artifact_hashes']={n:sha(OUT/n) for n in ['PAGE_INDEX.jsonl','QUESTION_INDEX.jsonl','MARKING_INDEX.jsonl','VISUAL_MANIFEST.json']}
    (OUT/'BATCH_MANIFEST.json').write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding='utf-8')
    unresolved='''# B23 unresolved register — v2\n\nThe 28 structural parent records listed below are preserved as QP context, but have no exact standalone MS row: their cited MS pages contain only separately indexed child rows. They are therefore `UNRESOLVED` for exact MS linkage and have no marking-item record. No mark allocation has been inferred.\n\n'''+ '\n'.join(f'- `{x}` — parent context only; child MS rows must be used for exact linkage.' for x in sorted(parents))+'\n\nThe six new inline `(i)` children are exact QP/MS location records. Q9(b) has its printed `[4]` and required QP p15 context; its MS record points to the whole-page shaded-row condition without per-row allocation.\n'
    (OUT/'UNRESOLVED.md').write_text(unresolved,encoding='utf-8')
    qa='''# B23 extraction QA — v2\n\nStatus: `SUBMITTED_RETEST_PENDING`. v1 remains immutable in `versions/B23-A2-v1/`.\n\n- A3/A4 findings were applied against their original-PDF locators. The 28 false parent MS links were removed and marked unresolved context; six missing nested `(i)` source records were added with their reviewer-cited visible QP marks and exact MS locators.\n- Added required page-context references and visual regions for W23/11 Q8(c)(iii), W23/12 Q9(b) QP p15, and W23/12 MS p11. Q9(b) retains visible `[4]`; its MS table is whole-page conditional evidence only.\n- Source wording for W23/12 Q3(a) remains “kibibyte” and “megabyte”; it has not been normalized.\n- Structural checks passed: unique IDs, all part/question parents, marking-item part references, all six inserted child IDs, all 28 unresolved parents, and 12 baseline source hashes/page counts retained.\n\nA4 must retest `B23-A2-v2`; A9 then reviews the batch.\n'''
    (OUT/'EXTRACTION_QA.md').write_text(qa,encoding='utf-8')
    handoff={'task_id':'P1-S1-A2-B23','artifact_version':'B23-A2-v2','status':'SUBMITTED_RETEST_PENDING','supersedes':'B23-A2-v1','frozen_v1_path':'versions/B23-A2-v1/','reviewers':['A4 retest','A9 independent batch review'],'counts':old['record_counts'],'major_findings_disposition':{'A4-B23-F01':'corrected: 28 parents unresolved as context; false marking links removed','A4-B23-F02':'corrected: six inline child records added; parent marks cleared','A4-B23-F03':'corrected: Q9(b) p15 context/[4] and MS p11 visual dependency added'},'next_action':'A4 retests B23-A2-v2 against original PDFs; A9 reviews only after retest evidence.'}
    (OUT/'HANDOFF_CHECK.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2),encoding='utf-8')
    notes='''# B23-A2-v2 revision notes\n\n| Finding | Disposition | Evidence retained | Retest |\n|---|---|---|---|\n| A4-B23-F01 | Corrected. 28 parent records are `UNRESOLVED` context records with no MS locator/marking item; exact children remain linked. | Frozen v1 and A4 finding list | A4 all 28 original QP/MS rows |\n| A4-B23-F02 | Corrected. Added six inline `(i)` children and moved visibly printed marks off their structural parents. | QP/MS locators cited by A4 | A4 six children plus parser sweep |\n| A4-B23-F03 / B23-CTX-01 / B23-VIS-02 | Corrected. Linked Q9(b) QP pp14–15, copied its visible `[4]`, added QP p15 and MS p11 visual regions, and attached MS whole-page condition dependency. | Original shared renders | A4 then A9 |\n| B23-VIS-01 | Corrected. Added W23/11 QP p15 boxed-ACC/XOR visual region and Q8(c)(iii) p14 context. | Original shared render | A9 |\n| B23-SCOPE-02 | Verified wording retained: “kibibyte” and “megabyte.” No content normalization. | A3/A4 original locators | A9 sample |\n\nNo marking point or per-row allocation was added.\n'''
    (OUT/'REVISION_NOTES.md').write_text(notes,encoding='utf-8')
    print(json.dumps(old['record_counts'],indent=2))
if __name__=='__main__': main()
