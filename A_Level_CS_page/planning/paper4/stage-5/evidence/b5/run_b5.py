"""Locked-harness fresh-process runner for B5."""
from __future__ import annotations
import json, subprocess, sys, tempfile, time
from pathlib import Path
root=Path(__file__).resolve().parent
fixtures=json.loads((root/"fixtures"/"B5_FIXTURES.json").read_text(encoding="utf-8"))
rows=[]; start=time.perf_counter()
for f in fixtures:
    t=time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="algocore-s5-b5-") as td:
        p=subprocess.run([sys.executable,"-I","-B",str(root/"fixture_worker.py")],input=json.dumps({"operation":f["operation"],"input":f["input"]},ensure_ascii=False),text=True,capture_output=True,timeout=10,cwd=td)
    got=json.loads(p.stdout) if p.returncode==0 else {"error":p.stderr.strip()}; ok=p.returncode==0 and got==f["expected_return"]
    rows.append({"fixture_id":f["fixture_id"],"status":"PASS" if ok else "FAIL","actual_return":got,"expected_return":f["expected_return"],"exit_code":p.returncode,"termination_outcome":"EXITED" if p.returncode==0 else "CRASHED","stdout":p.stdout,"stderr":p.stderr,"elapsed_time":round(time.perf_counter()-t,6),"fresh_process":True,"harness_lock_id":"paper4-2026-s5-harness-v1"})
result={"schema_version":"s5-run-record-v1","batch_id":"B5","harness_lock_id":"paper4-2026-s5-harness-v1","actor":"A5_independent_test_engineer","command":"python -I -B run_b5.py","runtime":{"python":"3.12.4","implementation":"CPython","os":"Windows 11"},"clean_state":"fresh process and isolated fixture state per test","counts":{"total":len(rows),"passed":sum(x["status"]=="PASS" for x in rows),"failed":sum(x["status"]=="FAIL" for x in rows)},"tests":rows,"overall_status":"PASS" if all(x["status"]=="PASS" for x in rows) else "FAIL","elapsed_time":round(time.perf_counter()-start,6)}
(root/"qa"/"A5_INDEPENDENT_RERUN.json").write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"status":result["overall_status"],"counts":result["counts"]},ensure_ascii=False))
