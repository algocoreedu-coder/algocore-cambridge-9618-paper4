from pathlib import Path
import hashlib,json,re,collections,subprocess
from datetime import datetime,timezone
from pypdf import PdfReader
root=Path.cwd(); st=root/'A_Level_CS_page/planning/paper1/stage-1'; out=Path(__file__).resolve().parent
a2=st/'evidence/a2/B23'; a3=st/'evidence/a3/B23'; a4=st/'evidence/a4/B23'
def read(p):return json.loads(p.read_text('utf-8-sig'))
def lines(p):return [json.loads(x) for x in p.read_text('utf-8-sig').splitlines() if x.strip()]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
man=read(a2/'BATCH_MANIFEST.json'); base={x['id']:x for x in read(st.parent/'stage-0/evidence/a2/SOURCE_MANIFEST.json')['primary_sources']}
frozen=[]
for folder in [a2,a2/'versions/B23-A2-v1',a3,a4]:
 for p in sorted(folder.iterdir()):
  if p.is_file() and p.suffix in ['.json','.jsonl','.md']:
   frozen.append({'path':str(p.relative_to(root)).replace('\\','/'),'sha256':sha(p)})
for p in [st/'CORPUS_SCHEMA.md',st/'EXTRACTION_POLICY.md',st/'WORK_ORDERS.md',st/'LEAD_PLAYBOOK.md',st.parent/'stage-0/evidence/a2/SOURCE_MANIFEST.json']:
 frozen.append({'path':str(p.relative_to(root)).replace('\\','/'),'sha256':sha(p)})
if not (out/'INPUT_MANIFEST.json').exists():
 (out/'INPUT_MANIFEST.json').write_text(json.dumps({'task':'P1-S1-A9-B23','reviewed_version':'B23-A2-v2','frozen_at':datetime.now(timezone.utc).isoformat(),'inputs':frozen},indent=2),encoding='utf8')
report={'active_hash_checks':[{ 'path':k,'match':sha(a2/k)==v} for k,v in man['active_artifact_hashes'].items()]}
texts={};report['sources']=[]
for s in man['inputs_verified']:
 p=root/s['relative_path']; r=PdfReader(p); sid=s['source_id'];texts[sid]=[x.extract_text() for x in r.pages]
 if s['kind']=='ms':
  texts[sid]=[x.extract_text(extraction_mode='layout') for x in r.pages]
 report['sources'].append({'source_id':sid,'hash':sha(p),'hash_matches':sha(p)==s['sha256_verified']==base[sid]['sha256'],'pages':len(r.pages),'pages_match':len(r.pages)==s['page_count']==base[sid]['page_count']})
qs=lines(a2/'QUESTION_INDEX.jsonl');ms=lines(a2/'MARKING_INDEX.jsonl');pages=lines(a2/'PAGE_INDEX.jsonl');vs=read(a2/'VISUAL_MANIFEST.json');qmap={x['id']:x for x in qs};mmap={x['id']:x for x in ms};vmap={x['id']:x for x in vs};allids=set(qmap)|set(mmap)
parts=[x for x in qs if 'question_id'in x]; linked=[x for x in parts if x['status']=='MS_LINKED'];unresolved=[x for x in parts if x['status']=='UNRESOLVED']
report['counts']={'questions':len(qs)-len(parts),'parts':len(parts),'linked':len(linked),'unresolved':len(unresolved),'marking_items':len(ms),'pages':len(pages),'visual_regions':len(vs)}
report['exact_ms_rows']=[]
for x in linked:
 loc=x['ms_locator_or_null'];t=texts[loc['source_id']][loc['pdf_page_1_based']-1];label=loc['question']+loc['part']
 report['exact_ms_rows'].append({'id':x['id'],'label':label,'exact_line_found':bool(re.search(r'^\s*'+re.escape(label)+r'(?!\s*\()[ \t]+',t,re.M)),'page':loc['pdf_page_1_based']})
report['dangling_visual_relations']=[{'region':v['id'],'target':i} for v in vs for i in v['relates_to_ids'] if i not in allids]
report['empty_visual_relations']=[v['id'] for v in vs if not v['relates_to_ids']]
report['missing_visual_files']=[v['id'] for v in vs if not (a2/v['rendered_asset_ref']).exists()]
report['missing_derived_files']=[p for p in man['derived_artifacts'] if not (a2/p).exists()]
report['missing_transcripts']=[x.get('id') for x in qs+ms if not (a2/x.get('prompt_transcript_ref',x.get('transcript_ref',''))).is_file()]
report['bad_parents']=[x['id'] for x in parts if x['question_id'] not in qmap or (x.get('parent_part_id_or_null') and x['parent_part_id_or_null'] not in qmap)]
report['dangling_dependencies']=[{'id':x['id'],'target':i} for x in qs for i in x.get('dependency_refs',[]) if i not in allids]
report['invalid_marking_visual_dependencies']=[{'id':x['id'],'target':i} for x in ms for i in x['visual_dependency_refs'] if i not in vmap]
report['removed_v1_ids']=sorted(set(x['id'] for x in lines(a2/'versions/B23-A2-v1/QUESTION_INDEX.jsonl'))-set(qmap))
report['added_v2_ids']=sorted(set(qmap)-set(x['id'] for x in lines(a2/'versions/B23-A2-v1/QUESTION_INDEX.jsonl')))
report['unresolved_parent_checks']=[{'id':x['id'],'null_ms':x['ms_locator_or_null'] is None,'no_marking_item':not any(m['part_id']==x['id'] for m in ms),'null_marks':x['marks_displayed_or_null'] is None,'children':len([q for q in parts if q.get('parent_part_id_or_null')==x['id']])} for x in unresolved]
report['marks_by_paper']={sid:sum(x['marks_displayed_or_null']or 0 for x in parts if x['qp_locator']['source_id']==sid) for sid in texts if '_qp_'in sid}
report['parts_missing_marks']=[x['id'] for x in linked if x['marks_displayed_or_null']is None]
report['ms_pages_with_marking_records_without_region']=sorted(set((x['ms_locator']['source_id'],x['ms_locator']['pdf_page_1_based']) for x in ms)-set((v['source_id'],v['pdf_page_1_based']) for v in vs))
report['marking_records_empty_visual_dependencies']=[x['id'] for x in ms if not x['visual_dependency_refs']]
prior=read(a4/'LINKAGE_FINDINGS.json')['findings'];report['six_children']=[qmap[x['missing_record_id']] for x in prior[1]['records']]
report['former_parent_source_checks']=[]
for f in prior[0]['records']:
 loc=f['ms'];t=texts[loc['source_id']][loc['pdf_page_1_based']-1]
 report['former_parent_source_checks'].append({'id':f['record_id'],'no_exact_parent_row':not bool(re.search(r'^\s*'+re.escape(loc['expected_label'])+r'(?!\s*\()[ \t]+',t,re.M)),'all_cited_children_present':all(bool(re.search(r'^\s*'+re.escape(c)+r'(?!\s*\()[ \t]+',t,re.M))for c in loc['observed_child_labels'])})
(out/'CHECK_RESULTS.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k not in ['exact_ms_rows','six_children','unresolved_parent_checks','former_parent_source_checks','marking_records_empty_visual_dependencies']},indent=2))
print('EXACT_MS_MISSES', [x for x in report['exact_ms_rows'] if not x['exact_line_found']]);print('EMPTY_MI_VISUAL',len(report['marking_records_empty_visual_dependencies']))

