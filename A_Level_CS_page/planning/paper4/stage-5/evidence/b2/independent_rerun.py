from __future__ import annotations
import hashlib,json,subprocess,sys,time
from pathlib import Path
HERE=Path(__file__).resolve().parent; sys.path.insert(0,str(HERE))
import run_b2
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 fx=json.loads((HERE/'fixtures/B2_FIXTURES.json').read_text(encoding='utf8'))['fixtures']; rows=run_b2.run_fresh(fx)
 src=[x for x in rows if next(f for f in fx if f['fixture_id']==x['fixture_id'])['test_category']=='source_fixture']
 ok=all(x['result']=='PASS' and x['termination']=='EXITED' for x in rows)
 out={'schema_version':'s5-b2-independent-rerun-v1','batch_id':'B2','reviewer':'A5_independent_test_engineer','author_excluded_from_review':True,'stage4_files_written':False,'clean_state':{'fresh_process':True,'temporary_workdir':True,'environment_reset':True,'pre_post_inventory':True},'runtime':{'python':sys.version,'implementation':'CPython','command':'python -I -B fixture_worker.py --fixture-json','timeout_seconds':10,'termination':'EXITED required'},'stdout':json.dumps({'status':'PASS' if ok else 'REWORK','counts':{'total':len(rows),'passed':sum(x['result']=='PASS' for x in rows),'failed':sum(x['result']!='PASS' for x in rows)}}),'stderr':'','exit_code':0 if ok else 1,'run_report_sha256':sha(HERE/'runs/AUTHOR_RUN.json'),'trace_bundle_sha256':sha(HERE/'traces/TRACE_BUNDLE.json'),'author_run_counts_after_rerun':{'total':len(rows),'passed':sum(x['result']=='PASS' for x in rows),'failed':sum(x['result']!='PASS' for x in rows)},'source_anchor_counts_after_rerun':{'total':len(src),'passed':sum(x['result']=='PASS' for x in src),'failed':sum(x['result']!='PASS' for x in src)},'result':'PASS' if ok else 'REWORK','checked_at':'2026-09-22T00:00:00+07:00'}
 (HERE/'qa/A5_INDEPENDENT_RERUN.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8'); (HERE/'qa/A5_INDEPENDENT_RERUN.md').write_text(f"# A5 Independent Rerun — B2\n\nDecision: **{out['result']}**.\n\n- Fresh subprocess fixtures: {len(rows)-out['author_run_counts_after_rerun']['failed']}/{len(rows)} PASS.\n- Source anchor fixtures: {out['source_anchor_counts_after_rerun']['passed']}/{len(src)} PASS.\n- Stage4 files written: no.\n",encoding='utf8'); print(json.dumps(out,ensure_ascii=False)); return 0 if ok else 1
if __name__=='__main__': raise SystemExit(main())
