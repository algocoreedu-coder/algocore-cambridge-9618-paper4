from pathlib import Path
from datetime import datetime,timezone
import json,re,hashlib,sys,copy
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[1]
def read(name):return json.loads((stage/name).read_text(encoding='utf-8-sig'))
def write(name,data):(stage/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
extract=read('EXTRACTION_MANIFEST.json')
audit=read('evidence/A2_DATA_AUDIT.json')
recovery={r['paper_id']:r for r in read('evidence/A2_DATA_RECOVERY.json')}
data={r['paper_id']:r for r in audit['papers']}
fac=read('FACSIMILE_MANIFEST.json')
facids={r['source_id'] for r in fac['sources']}
now=datetime.now(timezone.utc).isoformat()

# ER section headings/end boundaries, not a teaching interpretation of their comments.
sections=[]
for row in extract:
 if not row['source_id'].endswith('_er'):continue
 doc=read(row['extraction_json']); heads=[]
 for p in doc['pages']:
  for match in re.finditer(r'Paper\s+9618/(\d\d)',p['text']):heads.append((p['pdf_page'],match.group(1)))
 for i,(start,component) in enumerate(heads):
  if component not in ['41','42','43']:continue
  end=heads[i+1][0]-1 if i+1<len(heads) else doc['page_count']
  pages=doc['pages'][start-1:end]
  no_report=any('too few candidates' in p['text'].lower() for p in pages)
  anchors=[]
  for p in pages:
   for line in p['lines']:
    label=line['text'].strip()
    if re.fullmatch(r'(?:Key messages|General comments|Comments on specific questions|Question [123])',label):
     anchors.append({'label':label,'pdf_page':p['pdf_page'],'display_bbox':line['display_bbox']})
  sections.append({'section_id':row['source_id']+'_'+component,'source_id':row['source_id'],'paper_id':row['source_id'].replace('_er','_'+component),'component':component,'pdf_pages':list(range(start,end+1)),
   'status':'no_meaningful_report_published' if no_report else 'substantive_report_section_located','anchors':anchors,
   'review_boundary':'Paper heading and section boundary verified; statements apply to this session/component. No marking-advice interpretation at Stage1.'})
write('EXAMINER_REPORT_INDEX.json',{'schema_version':'1.0','sections':sections,'summary':{'report_files':5,'paper_sections':len(sections),'substantive_sections':sum(s['status']=='substantive_report_section_located' for s in sections)}})

book=read('extracted/coursebook_watson_williams.json')
chapters=[(1,'Information representation and multimedia',1),(2,'Communication',27),(3,'Hardware',68),(4,'Processor fundamentals',107),(5,'System software',136),(6,'Security, privacy and data integrity',159),(7,'Ethics and ownership',178),(8,'Databases',196),(9,'Algorithm design and problem solving',217),(10,'Data types and structures',238),(11,'Programming',264),(12,'Software development',283),(13,'Data representation',304),(14,'Communication and internet technologies',328),(15,'Hardware',346),(16,'System software and virtual machines',372),(17,'Security',410),(18,'Artificial intelligence (AI)',425),(19,'Computational thinking and problem solving',450),(20,'Further programming',498)]
booknav=[]
for number,title,printed in chapters:
 pdf=printed+16
 assert book['pages'][pdf-1]['text'].strip().splitlines()[0]==str(printed),(number,printed,pdf)
 booknav.append({'chapter':number,'title':title,'printed_start_page':printed,'pdf_start_page':pdf,'toc_pdf_pages':[7,8,9],'verification':'TOC title/printed start; actual PDF printed-page marker checked'})
write('REFERENCE_DOCUMENT_INDEX.json',{'schema_version':'1.0','coursebook':{'source_id':'coursebook_watson_williams','title':'Cambridge International AS & A Level Computer Science','authors':['David Watson','Helen Williams'],'publisher':'Hodder Education','first_published':2019,'isbn':'9781510457591','metadata_pdf_pages':[5,6],'toc_pdf_pages':[7,8,9],'page_count':576,'printed_to_pdf_note':'Arabic body pages: PDF = printed +16; do not apply this to Roman front matter. Chapter starts checked individually.','chapters':booknav,'review_boundary':'Document identity and navigation only. Detailed skill-to-book mapping is Stage3.'},'syllabus':{'source_id':'syllabus_2026_v2','year':2026,'version':2,'title_version_pdf_page':1,'change_notice_pdf_page':3,'page_count':49,'stage0_scope_reference':'../stage-0/SCOPE.md','stage0_verification_reference':'../stage-0/SOURCE_BASELINE.md','review_boundary':'Retained Stage0 version baseline; no new claim of byte comparison with Cambridge hosting.'}})

papers=[];batches=[]; source_issues=[]
for b in ['2021-2022','2023-2024','2025']:
 batch=read(f'batches/{b}/index.json')
 batches.append({'batch':b,'index':f'batches/{b}/index.json','review':f'batches/{b}/REVIEW.md','paper_count':len(batch['papers'])})
 for p in batch['papers']:
  p=copy.deepcopy(p);p['batch']=b
  p['source_bundle_id']=p['paper_id'].rsplit('_',1)[0]+'_sf_'+p['paper_id'].rsplit('_',1)[1]
  p['data_requirements']=data[p['paper_id']]['required_input_files']
  p['candidate_generated_outputs']=data[p['paper_id']].get('candidate_generated_outputs',[])
  p['source_bundle_review']='evidence/A2_DATA_AUDIT.json'
  p['examiner_report_sections']=[s['section_id'] for s in sections if s['paper_id']==p['paper_id']]
  p['examiner_report_status']=next((s['status'] for s in sections if s['paper_id']==p['paper_id']),'not_available_in_baseline')
  for q in p['questions']:
   q['question_id']=p['paper_id']+'_q'+str(q['question_number'])
   q['source_requirements']=[f for f in p['data_requirements'] if str(f.get('question'))==str(q['question_number'])]
   for r in q['parts']:
    r['part_id']=p['paper_id']+'_'+r['part']
    r['source_fidelity_policy']='EXTRACTION_POLICY.md'
    r['source_links']={'qp':{'source_id':p['qp_source_id'],'pdf_pages':r['qp_pages']},'ms':{'source_id':p['ms_source_id'],'pdf_pages':r['ms_pages']}}
  if p.get('issues'):source_issues.append({'paper_id':p['paper_id'],'batch_index':f'batches/{b}/index.json','observations':p['issues']})
  papers.append(p)
write('QUESTION_INDEX.json',{'schema_version':'1.0','corpus_version':'paper4-2026-s1-v1','built_utc':now,'scope':'29 baseline papers,2021–2025. All file identities retained; not29 independent question sets.','status':'submitted_for_Lead_and_A8_gate','index_language':'English editorial navigation over original English sources; VI/EN lessons are later-stage outputs.','page_numbering':'PDF 1-based; per-part pages plus question context/parents must be read together.','dependency_semantics':'Cumulative saved-program and explicit source references; not a pedagogical prerequisite taxonomy or requirement to finish earlier parts before attempting later marks.','batch_inputs':batches,'counts':{'papers':len(papers),'questions':sum(len(p['questions']) for p in papers),'scored_parts':sum(len(q['parts']) for p in papers for q in p['questions']),'marks':sum(p['indexed_total_marks'] for p in papers)},'papers':papers})

sources=[]
for row in extract:
 r=copy.deepcopy(row);sid=r['source_id']
 r['kind']='question_paper' if '_qp_' in sid else 'mark_scheme' if '_ms_' in sid else 'examiner_report' if sid.endswith('_er') else 'coursebook' if sid.startswith('coursebook') else 'syllabus'
 r['origin']={'type':'local_user_corpus','retrieval_date':None,'remote_url':None,'authority_limit':'Local original retained with hash; no new official-host byte-authentication claim.'}
 r['integrity_status']='A8_hash_page_text_geometry_checked'
 r['status']='indexed_with_source_fidelity_policy'
 r['fidelity_policy']='EXTRACTION_POLICY.md'
 r['facsimile_manifest']='FACSIMILE_MANIFEST.json' if sid in facids else None
 r['content_review']='Question/batch index and review' if sid in facids else 'EXAMINER_REPORT_INDEX.json' if sid.endswith('_er') else 'REFERENCE_DOCUMENT_INDEX.json'
 sources.append(r)
for p in papers:
 d=data[p['paper_id']]
 sources.append({'source_id':p['source_bundle_id'],'kind':'source_bundle','paper_id':p['paper_id'],'source_path':d['archive_path'],'sha256':d['archive_sha256'],'size_bytes':Path(d['archive_path']).stat().st_size,'origin':recovery.get(p['paper_id'],{'type':'local_baseline','remote_url':None,'authority_limit':'Local corpus; no official-host byte comparison claimed.'}),'status':'A2_and_A8_crc_path_hash_member_and_QP_data_checks_pass','audit':'evidence/A2_DATA_AUDIT.json','members':d['members'],'required_files':d['required_input_files'],'candidate_generated_outputs':d.get('candidate_generated_outputs',[])})
write('SOURCE_MANIFEST.json',{'schema_version':'1.0','corpus_version':'paper4-2026-s1-v1','built_utc':now,'stage0_baseline':'../stage-0/evidence/A2_SOURCE_BASELINE.json','scope':'29 QP +29 MS +29 matching SF ZIP;5ER;1book;1syllabus.21local ZIP+8recovered mirror ZIP.','counts':{'pdfs':len(extract),'pdf_pages':sum(r['page_count'] for r in extract),'source_bundles':29,'primary_source_records':len(sources),'qp_ms_facsimile_pages':sum(len(r['pages']) for r in fac['sources'])},'fidelity_policy':'EXTRACTION_POLICY.md','questions':'QUESTION_INDEX.json','examiner_reports':'EXAMINER_REPORT_INDEX.json','reference_documents':'REFERENCE_DOCUMENT_INDEX.json','missing_sources':'MISSING_SOURCES.md','sources':sources})
write('SOURCE_ISSUES.json',{'schema_version':'1.0','scope':'Observed published-source inconsistencies; not an exhaustive code correctness audit. Keep originals; Stage4–5 must explicitly resolve before teaching or executing derived solutions.','batch_observations':source_issues,'required_review_documents':['batches/2021-2022/REVIEW.md','batches/2023-2024/REVIEW.md','batches/2025/REVIEW.md','evidence/A8_DATA_EXTRACTION_REVIEW.md'],'cross_corpus_extraction_issues':[{'source_ids':['9618_s23_qp_41','9618_s23_qp_43'],'pdf_pages':[9],'issue':'Assignment arrows visible in source but missing from text; use facsimile.'},{'source_ids':['9618_s25_ms_41'],'pdf_pages':[31,35],'issue':'Underscores lost in extraction; p31 visually prints single-underscore _init_ (source defect distinct from extraction loss).'}]})
print('ASSEMBLED',len(sources),'primary sources;',len(papers),'papers;',sum(len(q['parts']) for p in papers for q in p['questions']),'scored parts;',len(sections),'ER sections')
