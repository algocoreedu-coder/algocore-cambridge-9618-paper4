import json,hashlib
from pathlib import Path
j=json.loads(Path('traces/TRACE_BUNDLE.json').read_text(encoding='utf-8')); bad=[]
for t in j['traces']:
 x=hashlib.sha256(json.dumps({k:v for k,v in t.items() if k!='trace_sha256'},sort_keys=True,ensure_ascii=False,separators=(',',':')).encode('utf-8')).hexdigest()
 if x!=t.get('trace_sha256'): bad.append(t['trace_id'])
qa=json.loads(Path('qa/A5_INDEPENDENT_RERUN.json').read_text(encoding='utf-8')); rep=json.loads(Path('B3_BATCH_REPORT.json').read_text(encoding='utf-8'))
print({'trace_records':len(j['traces']),'trace_hash_bad':bad,'a5_counts':qa['counts'],'reviewer':qa['reviewer'],'author_excluded_from_review':qa['author_excluded_from_review'],'batch_reviewer':rep['independent_reviewer'],'batch_status':rep['status'],'artifact_hashes':len(rep['artifact_hashes'])})
