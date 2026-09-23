"""Example: python scripts/query_patterns.py STACK_PUSH STACK_POP --role assessed --view raw_29"""
from pathlib import Path
import json,argparse
p=argparse.ArgumentParser();p.add_argument('patterns',nargs='+');p.add_argument('--role',choices=['primary','assessed','context_only'],default='assessed');p.add_argument('--view',choices=['raw_29','normalized_text_21','render_corroborated_23'],default='raw_29');a=p.parse_args()
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'QUESTION_PATTERN_MAP.json').read_text(encoding='utf-8'))
stats=json.loads((root/'PATTERN_STATISTICS.json').read_text(encoding='utf-8'))
catalog=json.loads((root/'EXAM_PATTERN_CATALOG.json').read_text(encoding='utf-8'))
assert set(a.patterns)<={r['pattern_id'] for r in catalog['patterns']},'Unknown pattern ID'
papers=set(stats['views'][a.view]['representative_papers']);selected=[]
for row in data['rows']:
    if row['paper_id'] not in papers:continue
    labels=[row['primary_pattern_id']] if a.role=='primary' else row['assessed_pattern_ids'] if a.role=='assessed' else row['context_pattern_ids']
    if set(labels)&set(a.patterns):selected.append(row)
print(json.dumps({'patterns':a.patterns,'role':a.role,'view':a.view,'papers':len({r['paper_id'] for r in selected}),
 'questions':len({r['question_id'] for r in selected}),'distinct_parts':len(selected),'union_whole_part_marks':sum(r['marks'] for r in selected),
 'warning':'Whole-part marks, not separate Cambridge skill points. Union counts each part once.','part_ids':[r['part_id'] for r in selected]},indent=2))
