from pathlib import Path
import json, hashlib, collections
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[5]
mf=OUT/'SOURCE_MANIFEST.json'
m=json.loads(mf.read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
m['inputs']=[{'path':'A_Level_CS_page/planning/paper1/'+n,'sha256':sha(ROOT/'A_Level_CS_page/planning/paper1'/n)} for n in ['AGENT_TEAM_PLAN.md','LEAD_PLAYBOOK.md','STAGE0_WORK_ORDERS.md']]
for r in m['primary_sources']:
    if r['kind']=='coursebook':
        r.update(visually_reviewed_pages_1_based=[5,6],human_text_reviewed_pages_1_based=[1,2,3,4,5,6],edition_or_version={'title':'Cambridge International AS & A Level Computer Science','authors':['David Watson','Helen Williams'],'publisher':'Hodder Education','first_published':2019,'isbn':'9781510457591','numbered_edition':'not_explicitly_stated_on_inspected_front_matter','evidence_pdf_pages':[5,6]},render_warning_evidence='poppler_book_stderr.txt')
    elif r['kind']=='syllabus':
        r.update(human_text_reviewed_pages_1_based=[1],edition_or_version={'exam_year':2026,'version':'2','evidence_pdf_pages':[1]})
        official=OUT.parent/'a3/tmp/official-2026-syllabus.pdf'
        if official.exists():
            r['official_comparison']={'download_owner':'A3','official_url':'https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf','downloaded_copy_path':official.relative_to(ROOT).as_posix(),'downloaded_copy_sha256_checked_by_A2':sha(official),'byte_hash_matches_local':sha(official)==r['sha256'],'scope':'A2 recomputed downloaded-copy hash; acquisition evidence owned by A3'}
    elif r['id']=='9618_s25_qp_11': r.update(visually_reviewed_pages_1_based=[2,3],human_text_reviewed_pages_1_based=[1,2,3,4])
    elif r['id']=='9618_s25_ms_11': r.update(visually_reviewed_pages_1_based=[4,5],human_text_reviewed_pages_1_based=[1,2,3,4])
    else: r['human_text_reviewed_pages_1_based']=[]
    if r['kind'] in ('qp','ms'):
        t=(OUT/'excerpts'/f"{r['id']}.txt").read_text(encoding='utf-8')
        r['automated_first_page_identity_checks']={'component_code_present':f"9618/{r['component']}" in t,'year_present':str(r['year']) in t,'paper1_title_present':'Paper 1' in t,'session_present':{'May_June':'May/June','Oct_Nov':'October/November'}[r['session']] in t}
checks={'primary_hashes_recomputed_match':all(sha(ROOT/r['path'])==r['sha256'] for r in m['primary_sources']),'primary_pdf_open_errors':m['summary']['pdf_open_errors'],'pairs_filename_exactly_one_qp_one_ms':all(len(p['qp_ids'])==len(p['ms_ids'])==1 for p in m['paper1_pairs']),'automated_header_failures':{r['id']:r['automated_first_page_identity_checks'] for r in m['primary_sources'] if 'automated_first_page_identity_checks' in r and not all(r['automated_first_page_identity_checks'].values())},'primary_identical_hash_groups':[v for v in {h:[r['id'] for r in m['primary_sources'] if r['sha256']==h] for h in set(r['sha256'] for r in m['primary_sources'])}.values() if len(v)>1],'derived_counts':dict(collections.Counter(r['classification'] for r in m['derived_inventory'])),'limits':'Checks do not prove question-level completeness, accuracy, variant independence or fit to syllabus 2026.'}
mf.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'CHECK_RESULTS.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(checks,ensure_ascii=False))
