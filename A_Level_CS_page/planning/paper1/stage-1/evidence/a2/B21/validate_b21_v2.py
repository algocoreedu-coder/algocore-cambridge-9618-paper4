"""Structural/provenance checks for the submitted B21-A2-v2 evidence packet."""
import hashlib,json
from pathlib import Path
base=Path(__file__).resolve().parent
def lines(n): return [json.loads(x) for x in (base/n).read_text(encoding='utf-8').splitlines() if x]
def h(p):
 q=hashlib.sha256()
 with Path(p).open('rb') as f:
  for c in iter(lambda:f.read(1048576),b''):q.update(c)
 return q.hexdigest()
b=json.loads((base/'BATCH_MANIFEST.json').read_text(encoding='utf-8')); qi=lines('QUESTION_INDEX.jsonl'); pi=lines('PAGE_INDEX.jsonl'); mi=lines('MARKING_INDEX.jsonl'); vi=json.loads((base/'VISUAL_MANIFEST.json').read_text(encoding='utf-8'))['regions']; contexts=lines('CONTEXT_INDEX.jsonl')
questions=[x for x in qi if 'question_id' not in x]; parts=[x for x in qi if 'question_id' in x]; ids={x['id'] for x in qi}; pids={x['id'] for x in parts}; cycles=[]
for x in parts:
 seen=set(); cur=x
 while cur.get('parent_part_id_or_null'):
  par=cur['parent_part_id_or_null']
  if par in seen: cycles.append(x['id']);break
  seen.add(par); cur=next((z for z in parts if z['id']==par),{})
source_hash_ok=all(h(base.parents[6]/x['relative_path'])==x['sha256'] for x in b['sources'])
result={'artifact_version':b['artifact_version'],'status':b['status'],'source_hashes_match':source_hash_ok,'question_count':len(questions),'part_count':len(parts),'page_count':len(pi),'marking_count':len(mi),'visual_count':len(vi),'context_count':len(contexts),'unique_question_part_ids':len(ids)==len(qi),'part_parent_ids_resolve':all(not x['parent_part_id_or_null'] or x['parent_part_id_or_null'] in pids for x in parts),'hierarchy_cycles':cycles,'all_question_context_refs_exist':all((base/x['context_ref_or_null']).exists() for x in questions),'all_marking_part_ids_resolve':all(x['part_id'] in pids for x in mi),'all_visual_render_assets_exist':all((base/x['rendered_asset_ref']).exists() for x in vi),'w21_q1_corrected':all(next(x for x in questions if x['id']==sid+'-q1')['qp_locator']['pdf_page_1_based']==2 and next(x for x in questions if x['id']==sid+'-q6')['qp_locator']['pdf_page_1_based']==11 for sid in ['9618_w21_qp_11','9618_w21_qp_13'])}
(base/'V2_STRUCTURAL_PROVENANCE_CHECK.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result,indent=2))
