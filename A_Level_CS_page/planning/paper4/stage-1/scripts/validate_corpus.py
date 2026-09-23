from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,re,sys
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[1]
def read(f):return json.loads((stage/f).read_text(encoding='utf-8-sig'))
errors=[];warnings=[]
def check(ok,context):
 if not ok:errors.append(context)
manifest=read('SOURCE_MANIFEST.json');index=read('QUESTION_INDEX.json')
sources={s['source_id']:s for s in manifest['sources']}
check(len(sources)==len(manifest['sources'])==94,'94unique primary sourceIDs')
check(index['counts']=={'papers':29,'questions':87,'scored_parts':672,'marks':2175},'Aggregate counts')
baseline=read('../stage-0/evidence/A2_SOURCE_BASELINE.json')
baselineids={p.get('paper_id',p.get('id')) for p in baseline['papers']}
if None in baselineids:
 baselineids={Path(p['qp']['path']).stem.replace('_qp_','_') for p in baseline['papers']}
check({p['paper_id'] for p in index['papers']}==baselineids,'Exact baseline paper set')
checked_sources=0
for sid,s in sources.items():
 path=Path(s['source_path'])
 check(path.is_file(),sid+' source file exists')
 if path.is_file():check(hashlib.sha256(path.read_bytes()).hexdigest()==s['sha256'],sid+' source hash')
 if s['kind']!='source_bundle':
  check((stage/s['extraction_json']).is_file(),sid+' extractionJSON exists')
  check((stage/s['extraction_text']).is_file(),sid+' extractionTXT exists')
 checked_sources+=1
ers={s['section_id']:s for s in read('EXAMINER_REPORT_INDEX.json')['sections']}
check(len(ers)==15,'ER section count')
check(sum(s['status']=='no_meaningful_report_published' for s in ers.values())==1,'ER no-report status')
batchrows={}
for b in index['batch_inputs']:
 for p in read(b['index'])['papers']:batchrows[p['paper_id']]=p
allpartids=[];direct_filenames=[]
for p in index['papers']:
 pid=p['paper_id'];orig=batchrows[pid]
 check(p['qp_source_id'] in sources and p['ms_source_id'] in sources,pid+' QP/MS source joins')
 check(p['source_bundle_id'] in sources,pid+' SF join')
 sf=sources[p['source_bundle_id']]
 check(sf['paper_id']==pid,pid+' bundle identity')
 knownfiles={m['basename'].lower() for m in sf['members']}
 generated=p.get('candidate_generated_outputs',[])
 for item in generated:
  if isinstance(item,str):knownfiles.add(item.lower())
  elif isinstance(item,dict):knownfiles.add(str(item.get('filename','')).lower())
 check(len(p['questions'])==3,pid+' threequestions')
 rows=[r for q in p['questions'] for r in q['parts']]
 originalrows={r['part']:r for q in orig['questions'] for r in q['parts']}
 labels={r['part'] for r in rows}
 check(len(labels)==len(rows),pid+' unique scoringlabels')
 check(sum(r['marks'] for r in rows)==p['indexed_total_marks']==p['declared_total_marks']==75,pid+' 75marks')
 refs=labels|{str(q['question_number']) for q in p['questions']}|{x['part'] for q in p['questions'] for x in q['unscored_structure']}
 graph={r['part']:r['dependency_refs'] for r in rows}
 def walk(label,path):
  check(label not in path,pid+' dependency cycle '+label)
  if label in path:return
  for dep in graph.get(label,[]):walk(dep,path|{label})
 for q in p['questions']:
  check(bool(q['context_pages']),pid+' questioncontext '+str(q['question_number']))
  for n in q['context_pages']:check(1<=n<=p['qp_page_count'],pid+' contextpage range')
  for r in q['parts']:
   rid=r['part'];allpartids.append(r['part_id'])
   check(r['marks']==r['qp_marks']==r['ms_marks'] and r['marks']>0,pid+' '+rid+' pointreconcile')
   check(r['verification_status']=='qp_ms_cross_checked',pid+' '+rid+' indexreview status')
   for field in ['prompt_summary','evidence_requirement']:
    check(bool(r[field].strip()) and not re.search(r'PENDING_LEAD_REVIEW|TODO|PLACEHOLDER',r[field]),pid+' '+rid+' '+field)
   for field,limit in [('qp_pages',p['qp_page_count']),('ms_pages',p['ms_page_count'])]:
    check(bool(r[field]) and all(isinstance(n,int) and 1<=n<=limit for n in r[field]),pid+' '+rid+' '+field)
   check(all(d in refs for d in r['dependency_refs']),pid+' '+rid+' dependencyresolve')
   for key,value in originalrows[rid].items():check(r.get(key)==value,pid+' '+rid+' unchanged batchfield '+key)
   for file in r['required_source_files']:
    if isinstance(file,str):
     direct_filenames.append((pid,rid,file))
     if file.lower() not in knownfiles:warnings.append({'paper_id':pid,'part':rid,'filename':file,'issue':'Direct filename not matched to SF member or declared generated output; manually classify before gate.'})
   walk(rid,set())
 for erid in p['examiner_report_sections']:check(erid in ers and ers[erid]['paper_id']==pid,pid+' ER join')
check(len(allpartids)==len(set(allpartids))==672,'Globallyunique672partIDs')
fac=read('FACSIMILE_MANIFEST.json');count=0
for source in fac['sources']:
 sid=source['source_id'];s=sources[sid]
 check(source['source_sha256']==s['sha256'],sid+' facsimile sourceversion')
 check([p['pdf_page'] for p in source['pages']]==list(range(1,s['page_count']+1)),sid+' facsimile completepages')
 for page in source['pages']:check((stage/page['image']).is_file(),sid+' facsimile exists '+str(page['pdf_page']))
 count+=len(source['pages'])
check(count==1396 and len(fac['sources'])==58,'1396facsimiles/58QPMS')
for f in ['EXTRACTION_POLICY.md','MISSING_SOURCES.md','SOURCE_ISSUES.json','REFERENCE_DOCUMENT_INDEX.json']:
 check((stage/f).is_file(),f+' exists')
result={'run_utc':datetime.now(timezone.utc).isoformat(),'status':'PASS' if not errors and not warnings else 'REWORK','checks':{'source_hashes':checked_sources,'paper_ids':29,'questions':87,'scored_rows':672,'individual_point_reconciliations':672,'summed_marks':2175,'facsimile_page_links':count,'er_sections':len(ers),'direct_filename_mentions':len(direct_filenames)},'errors':errors,'unclassified_filename_warnings':warnings,'boundary':'Mechanical aggregate checks plus source hashing. Independent source label/mark/continuation reconstruction and content samples are in A8 review; this script alone does not approve corpus semantics.'}
(stage/'evidence/LEAD_CORPUS_VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
sys.exit(0 if result['status']=='PASS' else 1)
