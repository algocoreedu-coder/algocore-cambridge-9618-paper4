from pathlib import Path
from pypdf import PdfReader
import hashlib, json, re, datetime

ROOT=Path(__file__).resolve().parents[6]
OUT=Path(__file__).resolve().parent
(OUT/'excerpts').mkdir(exist_ok=True)
def rel(p): return p.relative_to(ROOT).as_posix()
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
book=ROOT/'dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf'
syll=ROOT/'697372-2026-syllabus.pdf'
pat=re.compile(r'9618_([sw])(\d{2})_(qp|ms)_(1[123])\.pdf$',re.I)
papers=sorted(p for p in (ROOT/'Past_Papers').rglob('*.pdf') if pat.fullmatch(p.name))
records=[]
for p in [syll,book]+papers:
    m=pat.fullmatch(p.name)
    rec={'id':p.stem,'path':rel(p),'kind':m[3] if m else ('syllabus' if p==syll else 'coursebook'),'bytes':p.stat().st_size,'sha256':sha(p),'exists':True,'origin':'official_document_local_copy' if p!=book else 'publisher_coursebook_local_copy','source_authenticity':'not_verified_against_remote_by_A2','text_pages_extracted_1_based':[],'visually_reviewed_pages_1_based':[],'question_content_audit':'not_performed_stage0'}
    if m: rec.update(year=2000+int(m[2]),session={'s':'May_June','w':'Oct_Nov'}[m[1]],component=m[4],variant=int(m[4][1]),pair_key=f'9618_{m[1]}{m[2]}_{m[4]}')
    try:
        reader=PdfReader(p)
        rec.update(pdf_open_status='readable_by_pypdf',page_count=len(reader.pages),encrypted=reader.is_encrypted)
        pages=list(range(1,7)) if p==book else [1]
        if p.name in ['9618_s25_qp_11.pdf','9618_s25_ms_11.pdf']: pages=[1,2,3,4]
        texts=[]
        for page in pages:
            t=reader.pages[page-1].extract_text() or ''
            texts.append(f'=== PDF PAGE {page} (1-based) ===\n{t}\n')
        ep=OUT/'excerpts'/f'{p.stem}.txt'
        ep.write_text('\n'.join(texts),encoding='utf-8')
        rec.update(text_pages_extracted_1_based=pages,extraction_evidence=rel(ep),first_page_text_chars=len(reader.pages[0].extract_text() or ''),readability_limit='Parser opened page tree; selected-page extraction only, not full-document visual/content validation')
    except Exception as e: rec.update(pdf_open_status='error',error=str(e))
    records.append(rec)
pairs=[]
for key in sorted(set(r['pair_key'] for r in records if 'pair_key' in r)):
    rs=[r for r in records if r.get('pair_key')==key]
    qp=[r['id'] for r in rs if r['kind']=='qp']; ms=[r['id'] for r in rs if r['kind']=='ms']
    pairs.append({'pair_key':key,'qp_ids':qp,'ms_ids':ms,'pair_status':'filename_pair_present' if len(qp)==len(ms)==1 else 'unmatched_or_duplicate','contents_matched':False,'variant_equivalence':'not_assessed'})
derived=[]
for d in ['Topical_Papers','Solved_Papers','output/markdown','output/docx']:
    for p in sorted((ROOT/d).rglob('*')):
        if not p.is_file(): continue
        n=rel(p).lower()
        candidacy='candidate_paper1_or_as_theory' if ('paper_1' in n or 'paper1' in n or 'chapter2_paper1' in n or 'as-level' in n) else 'scope_unverified_by_filename'
        if 'paper_2' in n or 'paper_3' in n or 'chapter_13' in n: candidacy='other_paper_by_filename'
        derived.append({'path':rel(p),'bytes':p.stat().st_size,'sha256':sha(p),'classification':candidacy,'origin':'derived_or_third_party_unverified','content_audit':'not_performed','opened':False})
manifest={'schema_version':'1.0','artifact_version':'1.0','task_id':'P1-S0-A2-01','author':'A2','status':'SUBMITTED_PENDING_INDEPENDENT_REVIEW','generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'workspace_root':str(ROOT),'read_scope':'Local syllabus/coursebook and every filename-matched Paper 1 QP/MS under Past_Papers; file inventory of all four named derived roots. No per-question corpus extraction.','primary_sources':records,'paper1_pairs':pairs,'derived_inventory':derived,'derived_scope_exclusions':['tmp','output/qa','output/pdf','output/html','output/sites','Workbook','assets','other curriculum/project subdirectories'],'summary':{'primary_files':len(records),'paper1_qp':sum(r['kind']=='qp' for r in records),'paper1_ms':sum(r['kind']=='ms' for r in records),'filename_pairs':len(pairs),'pdf_open_errors':sum(r.get('pdf_open_status')=='error' for r in records),'derived_files':len(derived),'question_content_audited_pairs':0}}
(OUT/'SOURCE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest['summary']))
for r in records[:2]: print(r['id'],r['sha256'],r.get('page_count'))
