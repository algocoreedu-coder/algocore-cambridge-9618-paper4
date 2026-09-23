"""Independent statistics from immutable source rows + submitted classifications."""
from pathlib import Path
import json,hashlib,datetime
S=Path(__file__).resolve().parents[1]
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
index=load(S.parent/'stage-1/QUESTION_INDEX.json')
parts={t['part_id']:(p['paper_id'],q['question_id'],t['marks']) for p in index['papers'] for q in p['questions'] for t in q['parts']}
rows={r['part_id']:r for f in (S/'batches').glob('*/classification.json') for r in load(f)['rows']}
assert set(parts)==set(rows)
patterns=[p['pattern_id'] for p in load(S/'PATTERN_SEED.json')['patterns']]
eq=load(S/'evidence/A2_EQUIVALENCE.json')
views={'raw':set(p['paper_id'] for p in index['papers']),'strict_text':set(g['representative'] for g in eq['strict_groups']),'render_corroborated':set(g['representative'] for g in eq['render_corroborated_groups'])}
results={}
def metrics(ids):
 return {'papers':len({parts[i][0] for i in ids}),'root_questions':len({parts[i][1] for i in ids}),'scored_parts':len(ids),'marks':sum(parts[i][2] for i in ids)}
for view,selected in views.items():
 ids={i for i in parts if parts[i][0] in selected}
 counts=[]
 for p in patterns:
  counts.append({'pattern_id':p,'primary':metrics({i for i in ids if rows[i]['primary_pattern_id']==p}),'assessed_union':metrics({i for i in ids if p in rows[i]['assessed_pattern_ids']}),'context':metrics({i for i in ids if p in rows[i]['context_pattern_ids']})})
 assert sum(x['primary']['scored_parts'] for x in counts)==len(ids)
 assert sum(x['primary']['marks'] for x in counts)==sum(parts[i][2] for i in ids)
 results[view]={'denominator':metrics(ids),'counts':counts}
out={'reviewer':'A8','generated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Independent set-based computation directly from locked Stage 1 marks/question IDs and submitted row memberships. Selected representatives taken from verified A2 partitions; no shared Lead statistics functions. Context marks are diagnostic union only, not credit.','views':results}
(S/'evidence/A8_INDEPENDENT_STATISTICS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({v:r['denominator'] for v,r in results.items()}))
