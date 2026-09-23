"""Independent Stage 0 review checks. Writes only adjacent A9 evidence."""
from pathlib import Path
import collections, hashlib, json, re, urllib.request
from datetime import datetime, timezone
from pypdf import PdfReader

root = Path.cwd()
out = Path(__file__).resolve().parent
stage = out.parent.parent
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = json.loads((stage/'evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf-8-sig'))
review = json.loads((stage/'evidence/a0/REVIEW_INPUT_MANIFEST.json').read_text(encoding='utf-8-sig'))
report = {'reviewer':'A9', 'checked_at':datetime.now(timezone.utc).isoformat(), 'review_manifest_sha256':sha(stage/'evidence/a0/REVIEW_INPUT_MANIFEST.json')}
report['reviewed_artifacts']=[{'path':x['path'],'actual_sha256':sha(stage/x['path']), 'matches':sha(stage/x['path'])==x['sha256']} for x in review['artifacts']]
report['primary_checks']=[]
for x in manifest['primary_sources']:
    p=root/x['path']; r=PdfReader(p)
    check={'id':x['id'],'hash_matches':sha(p)==x['sha256'],'page_count_matches':len(r.pages)==x['page_count']}
    if x['kind'] in ('qp','ms'):
        t=r.pages[0].extract_text()
        check['cover_identity_matches']=all([f"9618/{x['component']}" in t, str(x['year']) in t, 'Paper 1' in t, ('May/June' if x['session']=='May_June' else 'October/November') in t])
    report['primary_checks'].append(check)
keys=list(manifest)
derived=next(manifest[k] for k in keys if k.startswith('derived') and isinstance(manifest[k],list) and manifest[k] and isinstance(manifest[k][0],dict) and 'path' in manifest[k][0])
report['derived_checks']=[{'path':x['path'],'hash_matches':sha(root/x['path'])==x['sha256']} for x in derived]
derived_actual={str(p.relative_to(root)).replace('\\','/') for d in ['Topical_Papers','Solved_Papers','output/markdown','output/docx'] for p in (root/d).rglob('*') if p.is_file()}
report['derived_inventory_difference']=sorted(derived_actual.symmetric_difference(x['path'] for x in derived))
primary_actual={str(p.relative_to(root)).replace('\\','/') for p in (root/'Past_Papers').rglob('*.pdf') if re.fullmatch(r'9618_[sw]\d{2}_(?:qp|ms)_1[123]\.pdf',p.name)}
report['past_papers_inventory_difference']=sorted(primary_actual.symmetric_difference(x['path'] for x in manifest['primary_sources'] if x['kind'] in ('qp','ms')))
pairs=collections.defaultdict(list)
for x in manifest['primary_sources']:
    if x['kind'] in ('qp','ms'):pairs[x['pair_key']].append(x['kind'])
report['pair_count']=len(pairs)
report['pair_errors']={k:v for k,v in pairs.items() if sorted(v)!=['ms','qp']}
app=root/'A_Level_CS_page/algocore-fumadocs'
baseline=json.loads((stage/'evidence/a0/APP_BASELINE_HASHES.json').read_text(encoding='utf-8-sig'))
report['app_checks']=[{'path':x['path'],'hash_matches':sha(app/x['path'])==x['sha256']} for x in baseline]
app_paths={str(p.relative_to(app)).replace('\\','/') for p in app.rglob('*') if p.is_file() and not any(s in ['node_modules','.next'] for s in p.relative_to(app).parts)}
report['app_inventory_difference']=sorted(app_paths.symmetric_difference(x['path'] for x in baseline))
url='https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf'
data=urllib.request.urlopen(url,timeout=30).read()
report['independent_official_download']={'url':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'matches_local':hashlib.sha256(data).hexdigest()==sha(root/'697372-2026-syllabus.pdf'),'matches_A3_copy':hashlib.sha256(data).hexdigest()==sha(stage/'evidence/a3/tmp/official-2026-syllabus.pdf')}
coverage=(stage/'evidence/a3/COVERAGE_PLAN.md').read_text(encoding='utf-8-sig')
ids=re.findall(r'^\| (AC26-(\d\.\d+)-\d+) \|',coverage,re.M)
report['coverage']={'rows':len(ids),'unique_ids':len(set(x[0] for x in ids)),'sections':dict(collections.Counter(x[1] for x in ids)),'domains':sorted(set(x[1][0] for x in ids)),'limit':'Count only; semantic audit recorded separately in STAGE0_REVIEW.md.'}
(out/'INDEPENDENT_CHECKS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'primary':len(report['primary_checks']),'primary_errors':[c for c in report['primary_checks'] if False in c.values()],'derived':len(derived),'derived_errors':[c for c in report['derived_checks'] if not c['hash_matches']],'derived_inventory_difference':report['derived_inventory_difference'],'past_papers_inventory_difference':report['past_papers_inventory_difference'],'app':len(baseline),'app_errors':[c for c in report['app_checks'] if not c['hash_matches']],'app_inventory_difference':report['app_inventory_difference'],'artifact_hash_errors':[c for c in report['reviewed_artifacts'] if not c['matches']],'official':report['independent_official_download'],'coverage':report['coverage']},ensure_ascii=False,indent=2))
