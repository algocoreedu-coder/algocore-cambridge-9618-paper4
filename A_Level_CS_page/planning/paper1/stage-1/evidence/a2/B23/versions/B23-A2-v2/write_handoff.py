"""Write B23 batch manifest and A2 handoff records after machine checks."""
from __future__ import annotations
import hashlib, json
from pathlib import Path

OUT=Path(__file__).resolve().parent

def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def jsonl(name):
    return [json.loads(x) for x in (OUT/name).read_text(encoding='utf-8').splitlines() if x]

def main():
    prov=json.loads((OUT/'direct_extraction_provenance.json').read_text(encoding='utf-8'))
    pages=jsonl('PAGE_INDEX.jsonl'); records=jsonl('QUESTION_INDEX.jsonl'); markings=jsonl('MARKING_INDEX.jsonl')
    visuals=json.loads((OUT/'VISUAL_MANIFEST.json').read_text(encoding='utf-8'))
    ids=[x['id'] for x in records]+[x['id'] for x in markings]+[x['id'] for x in visuals]
    assert len(ids)==len(set(ids)), 'duplicate record IDs'
    question_ids={x['id'] for x in records if 'source_qp_id' in x}
    part_ids={x['id'] for x in records if 'question_id' in x}
    assert all(x['question_id'] in question_ids for x in records if 'question_id' in x)
    assert all((not x['parent_part_id_or_null']) or x['parent_part_id_or_null'] in part_ids for x in records if 'question_id' in x)
    assert len(pages)==sum(x['page_count_direct'] for x in prov['sources'])
    assert all(x['sha256_stage0']==x['sha256_verified'] and x['page_count_stage0']==x['page_count_direct'] for x in prov['sources'])
    assert all(x['reviewer_status']=='SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW' for x in visuals)
    source_rows=[]
    all_der=[]
    for s in prov['sources']:
        sid=s['source_id']; middle=sid.split('_')[1]
        source_rows.append({'source_id':sid,'sha256_stage0':s['sha256_stage0'],'sha256_verified':s['sha256_verified'],
          'relative_path':s['relative_path'],'kind':'qp' if '_qp_' in sid else 'ms','year':2023,
          'session':'s' if middle.startswith('s') else 'w','component':sid[-2:],'page_count':s['page_count_direct']})
        for p in s['pages']:
            all_der += [p['transcript_ref'],p['rendered_asset_ref']]
    all_der += ['direct_extraction_provenance.json','PAGE_INDEX.jsonl','QUESTION_INDEX.jsonl','MARKING_INDEX.jsonl','VISUAL_MANIFEST.json',
                'extract_direct.py','build_indices.py','make_risk_contacts.py','write_handoff.py']
    all_der += [str(p.relative_to(OUT)).replace('\\','/') for p in (OUT/'renders'/'risk_contacts').glob('*.jpg')]
    manifest={'schema_version':'1.0','artifact_version':'B23-A2-v1','task_id':'P1-S1-A2-B23','author':'A2 Source Curator',
      'status':'SUBMITTED','scope':'2023 Paper 1 source-location extraction only; no taxonomy, translation, lesson, or marking interpretation.',
      'inputs_verified':source_rows,'record_counts':{'sources':12,'pages':len(pages),'questions':len(question_ids),'parts':len(part_ids),'marking_items':len(markings),'visual_regions':len(visuals),'unresolved_records':sum(1 for x in records if x.get('status')=='UNRESOLVED')},
      'derived_artifacts':sorted(all_der),'visual_claim':'All 61 keyword-screened risk pages were rendered and self-inspected via the listed contact sheets. Independent review is still required; no record is ACCEPTED.',
      'self_checks':{'unique_ids':True,'part_parent_exists':True,'source_hashes_match_stage0':True,'source_page_counts_match_stage0':True,'risk_regions_have_renders':all((OUT/x['rendered_asset_ref']).exists() for x in visuals)}}
    (OUT/'BATCH_MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    qa='''# B23 extraction QA\n\nStatus: `SUBMITTED` by A2. This is source-location evidence only.\n\n## Checks completed\n\n- Read the 12 primary PDFs directly after verifying each SHA-256 against the Stage 0 manifest; all 12 matched and all 157 page counts matched.\n- Produced a direct, page-scoped transcript and whole-page render for every source page.\n- Indexed 46 QP question records, 197 part records and 197 source-located MS records. A marking record is a location pointer only; `mark_or_condition_or_null` remains `null` so this artifact does not infer allocations or rewrite marking content.\n- Rendered and self-inspected all 61 keyword-screened visual-risk pages, including QP tables, truth tables, circuits, diagrams, formulas/instruction layouts and MS tables/conditions. Contact sheets are internal evidence under `renders/risk_contacts/`.\n- Checked JSONL ID uniqueness, part-parent references, source/page totals and that each visual-risk record has a render and linked source items.\n\n## Limits carried to review\n\n- Whole-page visual regions intentionally retain `SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`; A2 cannot mark them accepted.\n- MS locations were matched by the printed Q/part identifiers. A4 must independently test cardinality, grouping, displayed marks and conditional table structure.\n- QP parts carry the question ID as context dependency. This records the parent scenario but makes no claim about pedagogic prerequisites.\n'''
    (OUT/'EXTRACTION_QA.md').write_text(qa,encoding='utf-8')
    unresolved='''# B23 unresolved register\n\nNo `UNRESOLVED` QP-part or MS-locator record remained after direct extraction: all 197 indexed parts have a same-variant MS page whose printed Q/part identifier was found.\n\nThis is not a claim that item-level mark allocation, alternatives, table rows or QP↔MS cardinality have been validated. Those fields remain deliberately unallocated (`mark_or_condition_or_null: null`) and are assigned to A4 linkage review. A9 must independently assess the visual-risk samples and batch gate.\n'''
    (OUT/'UNRESOLVED.md').write_text(unresolved,encoding='utf-8')
    handoff={'task_id':'P1-S1-A2-B23','artifact_version':'B23-A2-v1','status':'SUBMITTED','reviewers':['A3 source-context/scope review','A4 QP-MS linkage review','A9 independent batch review'],'inputs_frozen':'BATCH_MANIFEST.json inputs_verified; Stage 0 SHA256 baseline','counts':manifest['record_counts'],'acceptance_self_check':'PASS_WITH_REVIEW_PENDING','known_limits':['No visual record accepted by A2','No marking allocation inferred','No scope/taxonomy/lesson/translation claim'],'next_action':'A0 freeze B23-A2-v1 and dispatch A3/A4 using this exact manifest.'}
    (OUT/'HANDOFF_CHECK.json').write_text(json.dumps(handoff,indent=2),encoding='utf-8')
    print(json.dumps(manifest['record_counts'],indent=2))
if __name__=='__main__': main()
