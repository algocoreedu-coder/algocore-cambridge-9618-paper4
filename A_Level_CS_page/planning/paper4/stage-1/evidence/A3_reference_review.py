import json,re,hashlib,sys
from pathlib import Path
import pymupdf as f
sys.stdout.reconfigure(encoding='utf8')
E=Path(__file__).parent; S=E.parent
er=json.loads((S/'EXAMINER_REPORT_INDEX.json').read_text(encoding='utf8'))
ref=json.loads((S/'REFERENCE_DOCUMENT_INDEX.json').read_text(encoding='utf8'))
qi=json.loads((S/'QUESTION_INDEX.json').read_text(encoding='utf8'))
norm=lambda x:re.sub(r'\s+',' ',x).strip()
findings=[]; checked=[]; docs={}; manifest=[]
def source(sid):
    if sid not in docs:
        extract=json.loads((S/'extracted'/(sid+'.json')).read_text(encoding='utf8'))
        path=Path(extract['source_path']); data=path.read_bytes(); sha=hashlib.sha256(data).hexdigest()
        assert sha==extract['sha256']
        docs[sid]=f.open(path)
        manifest.append({'source_id':sid,'source_path':str(path),'sha256':sha,'page_count':len(docs[sid]),'extraction_hash_matches_original':True})
    return docs[sid]
def check(ok,code,detail):
    if not ok:findings.append({'code':code,'detail':detail,'severity':'required_rework'})
    return bool(ok)
for sid in dict.fromkeys(x['source_id'] for x in er['sections']):
    doc=source(sid); heads=[]
    for n,p in enumerate(doc,1):
        m=re.search(r'Paper\s+9618/(\d\d)\s+Practical',p.get_text())
        if m:heads.append((n,m[1]))
    paper4=[x for x in heads if x[1].startswith('4')]
    check(len(paper4)==3,'ER_COUNT',sid)
    for row in [x for x in er['sections'] if x['source_id']==sid]:
        begin=[n for n,c in paper4 if c==row['component']]
        check(len(begin)==1,'ER_HEADING',row['section_id'])
        if not begin:continue
        start=begin[0]; nexts=[n for n,c in heads if n>start]; end=min(nexts)-1 if nexts else len(doc)
        check(row['pdf_pages']==list(range(start,end+1)),'ER_BOUNDARY',row['section_id'])
        text='\n'.join(doc[n-1].get_text() for n in row['pdf_pages'])
        empty='too few candidates for a meaningful report' in text
        expected='no_meaningful_report_published' if empty else 'substantive_report_section_located'
        check(row['status']==expected,'ER_STATUS',row['section_id'])
        check(row['paper_id']==sid.replace('_er','')+'_'+row['component'],'ER_PAPER_ID',row['section_id'])
        actual=[]
        labels=['Key messages','General comments','Comments on specific questions','Question 1','Question 2','Question 3']
        for n in row['pdf_pages']:
            p=doc[n-1]
            for block in p.get_text('dict')['blocks']:
                for line in block.get('lines',[]):
                    text=norm(''.join(s['text'] for s in line['spans']))
                    if text in labels:actual.append({'label':text,'pdf_page':n,'display_bbox':[round(v,2) for v in f.Rect(line['bbox'])*p.rotation_matrix]})
        check({(a['label'],a['pdf_page']) for a in actual}=={(a['label'],a['pdf_page']) for a in row['anchors']},'ER_ANCHOR_COVERAGE',row['section_id'])
        for anchor in row['anchors']:
            matches=[a for a in actual if a['label']==anchor['label'] and a['pdf_page']==anchor['pdf_page']]
            check(any(max(abs(x-y) for x,y in zip(a['display_bbox'],anchor['display_bbox']))<.1 for a in matches),'ER_ANCHOR_BOX',row['section_id']+' '+anchor['label'])
        checked.append({'section_id':row['section_id'],'paper_id':row['paper_id'],'actual_start':start,'actual_end':end,'status':expected,'anchors_checked':len(actual),'heading':f'Paper 9618/{row["component"]} Practical'})
book=ref['coursebook']; doc=source(book['source_id']); toc=norm(' '.join(doc[n-1].get_text() for n in book['toc_pdf_pages'])); metadata=norm(' '.join(doc[n-1].get_text() for n in book['metadata_pdf_pages']))
for name in book['authors']+[book['publisher'],book['isbn']]:check(name in metadata,'BOOK_METADATA',name)
check('First published 2019' in metadata,'BOOK_YEAR','2019')
check(all(word in metadata for word in book['title'].split()),'BOOK_TITLE',book['title'])
check(len(doc)==book['page_count']==576,'BOOK_PAGE_COUNT',str(len(doc)))
chapters=[]
for ch in book['chapters']:
    n=ch['pdf_start_page']; text=norm(doc[n-1].get_text()); marker=doc[n-1].get_text().strip().splitlines()[0].strip()
    toc_match=bool(re.search(r'\b'+str(ch['chapter'])+r'\s*'+re.escape(ch['title'])+r'\s*'+str(ch['printed_start_page'])+r'\b',toc))
    check(toc_match,'BOOK_TOC_CHAPTER',str(ch['chapter']))
    check(ch['title'] in text,'BOOK_ACTUAL_TITLE',str(ch['chapter']))
    check(marker==str(ch['printed_start_page']),'BOOK_PRINTED_MARKER',str(ch['chapter'])+' '+marker)
    check(n==ch['printed_start_page']+16,'BOOK_OFFSET',str(ch['chapter']))
    chapters.append({'chapter':ch['chapter'],'title':ch['title'],'pdf_page':n,'printed_page':ch['printed_start_page'],'original_pdf_first_text_line':marker,'toc_verified':toc_match})
sy=ref['syllabus']; doc=source(sy['source_id']); first=norm(doc[sy['title_version_pdf_page']-1].get_text()); change=norm(doc[sy['change_notice_pdf_page']-1].get_text())
check(len(doc)==sy['page_count']==49,'SYLLABUS_LENGTH',str(len(doc)))
check('Use this syllabus for exams in 2026.' in first and 'Version 2' in first and 'Computer Science 9618' in first,'SYLLABUS_ID',first)
check('version 2, published December 2025' in change,'SYLLABUS_CHANGE',change[:300])
sections={s['section_id']:s for s in er['sections']}; joins=[]
for p in qi['papers']:
    expected=[s['section_id'] for s in er['sections'] if s['paper_id']==p['paper_id']]
    actual=p.get('examiner_report_sections',[])
    check(actual==expected,'JOIN_PAPER_ER',p['paper_id']+' '+str(actual)+' expected '+str(expected))
    if expected:check(p['examiner_report_status']==sections[expected[0]]['status'],'JOIN_STATUS',p['paper_id'])
    joins.append({'paper_id':p['paper_id'],'section_ids':actual,'status':p.get('examiner_report_status')})
check(er['summary']=={'report_files':5,'paper_sections':15,'substantive_sections':14},'SUMMARY',str(er['summary']))
out={'reviewer':'A3 independent reference-document review','scope':'Examiner-report and reference-document indices plus exact joins; no question-index or data-integrity re-review. No Stage2 work.','status':'PASS' if not findings else 'REWORK_REQUIRED','findings':findings,'input_hashes':{name:hashlib.sha256((S/name).read_bytes()).hexdigest() for name in ['EXAMINER_REPORT_INDEX.json','REFERENCE_DOCUMENT_INDEX.json','QUESTION_INDEX.json']},'original_sources':manifest,'report_sections':checked,'anchor_count':sum(r['anchors_checked'] for r in checked),'coursebook_chapters':chapters,'syllabus':{'year':2026,'version':2,'pages':49,'cover_pdf_page':1,'change_notice_pdf_page':3,'source_change_notice_date':'December 2025'},'paper_report_joins':joins,'visual_review_status':'pending_render_inspection','limitations':['No remote byte comparison with Cambridge hosting performed.','Source-document navigation verified; detailed skill-to-book mapping remains Stage3.','Unavailable ER sections are not synthesized from another variant.']}
(E/'A3_REFERENCE_REVIEW.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
R=E/'A3_reference_renders';R.mkdir(exist_ok=True)
for sid,pages in [('9618_s21_er',[36,37]),('9618_w23_er',[38,39]),('coursebook_watson_williams',[6,9,466,514]),('syllabus_2026_v2',[1,3])]:
    doc=source(sid)
    for n in pages:doc[n-1].get_pixmap(matrix=f.Matrix(1.3,1.3)).save(R/(sid+'_p'+str(n)+'.png'))
print(json.dumps({'status':out['status'],'findings':findings,'sections':len(checked),'anchors':out['anchor_count'],'chapters':len(chapters),'joins':len(joins)},ensure_ascii=False,indent=2))
