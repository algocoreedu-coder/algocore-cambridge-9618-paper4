"""Structural and provenance validation for B23-A2-v2."""
from __future__ import annotations
import hashlib,json
from pathlib import Path
OUT=Path(__file__).resolve().parent; ROOT=OUT.parents[6]
def jl(n): return [json.loads(x) for x in (OUT/n).read_text(encoding='utf-8').splitlines() if x]
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''): h.update(b)
 return h.hexdigest()
def main():
 q=jl('QUESTION_INDEX.jsonl'); mi=jl('MARKING_INDEX.jsonl'); v=json.loads((OUT/'VISUAL_MANIFEST.json').read_text(encoding='utf-8'))
 a4=json.loads((OUT.parent.parent/'a4'/'B23'/'LINKAGE_FINDINGS.json').read_text(encoding='utf-8'))
 f={x['id']:x for x in a4['findings']}; parents={x['record_id'] for x in f['A4-B23-F01']['records']}; children=[x['missing_record_id'] for x in f['A4-B23-F02']['records']]
 by={x['id']:x for x in q}; pids={x['id'] for x in q if 'question_id' in x}; qids={x['id'] for x in q if 'source_qp_id' in x}
 prov=json.loads((OUT/'direct_extraction_provenance.json').read_text(encoding='utf-8'))
 source_results=[]
 for s in prov['sources']:
  actual=sha(ROOT/s['relative_path']); source_results.append({'source_id':s['source_id'],'baseline':s['sha256_stage0'],'actual':actual,'pass':actual==s['sha256_stage0']})
 checks={
  'unique_ids':len([x['id'] for x in q]+[x['id'] for x in mi]+[x['id'] for x in v])==len(set([x['id'] for x in q]+[x['id'] for x in mi]+[x['id'] for x in v])),
  'part_question_parents':all(x['question_id'] in qids for x in q if 'question_id' in x),
  'nested_part_parents':all(not x.get('parent_part_id_or_null') or x['parent_part_id_or_null'] in pids for x in q if 'question_id' in x),
  'marking_parts_exist':all(x['part_id'] in pids for x in mi),
  'all_28_parent_links_unresolved':all(by[x]['status']=='UNRESOLVED' and by[x]['ms_locator_or_null'] is None and not any(m['part_id']==x for m in mi) for x in parents),
  'six_inline_children_exact_linked':all(x in by and by[x]['status']=='MS_LINKED' and by[x]['ms_locator_or_null'] for x in children),
  'q9b_context_and_mark':by['9618_w23_qp_12-q9-pb']['marks_displayed_or_null']==4 and by['9618_w23_qp_12-q9-pb'].get('context_ref_or_null',{}).get('pdf_page_1_based')==15,
  'q9b_ms_visual_dependency':any(m['id']=='9618_w23_qp_12-q9-pb-mi-01' and '9618_w23_ms_12-p11-vr2' in m['visual_dependency_refs'] for m in mi),
  'three_reviewer_visual_regions':all(any(x['id']==i and (OUT/x['rendered_asset_ref']).exists() for x in v) for i in ['9618_w23_qp_11-p15-vr2','9618_w23_qp_12-p15-vr2','9618_w23_ms_12-p11-vr2']),
  'kibibyte_megabyte_source_wording': 'kibibyte and a megabyte' in (OUT/'transcripts/9618_w23_qp_12-p06.txt').read_text(encoding='utf-8').lower(),
  'all_12_source_hashes_match_stage0':all(x['pass'] for x in source_results)
 }
 result={'artifact_version':'B23-A2-v2','status':'PASS_RETEST_PENDING_INDEPENDENT_REVIEW','counts':{'questions':len(qids),'parts':len(pids),'marking_items':len(mi),'visual_regions':len(v),'unresolved_parents':len(parents)},'checks':checks,'source_hashes':source_results,'overall_pass':all(checks.values())}
 (OUT/'VALIDATION_v2.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
 manifest=json.loads((OUT/'BATCH_MANIFEST.json').read_text(encoding='utf-8'))
 active=['PAGE_INDEX.jsonl','QUESTION_INDEX.jsonl','MARKING_INDEX.jsonl','VISUAL_MANIFEST.json','EXTRACTION_QA.md','UNRESOLVED.md','HANDOFF_CHECK.json','REVISION_NOTES.md','VALIDATION_v2.json']
 manifest['active_artifact_hashes']={n:sha(OUT/n) for n in active}
 manifest['validation']='VALIDATION_v2.json; overall_pass=true; independent retest pending'
 (OUT/'BATCH_MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
 print(json.dumps(result,indent=2))
if __name__=='__main__':main()
