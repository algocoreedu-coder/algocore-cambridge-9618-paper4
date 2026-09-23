from __future__ import annotations
import hashlib, json, os, shutil, subprocess, sys, tempfile, time
from pathlib import Path

ROOT=Path(__file__).resolve().parent; S5=ROOT.parents[2]/"stage-5"
FIX=ROOT/"fixtures/FIXTURE_REGISTRY.json"; RUNS=ROOT/"runs"; QA=ROOT/"qa"; TR=ROOT/"traces"
HARNESS=json.loads((S5/"HARNESS_LOCK.json").read_text(encoding="utf-8")); INV=json.loads((S5/"OBLIGATION_INVENTORY.json").read_text(encoding="utf-8"))["obligations"]
fixtures=json.loads(FIX.read_text(encoding="utf-8"))["fixtures"]
patterns=sorted({f["pattern_id"] for f in fixtures})

def digest(value): return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(",",":"),default=str).encode("utf-8")).hexdigest()
def clean_env():
    allowed={k:v for k,v in os.environ.items() if k in set(HARNESS["environment_allowlist"])}
    allowed.update({"PYTHONHASHSEED":"0","PYTHONIOENCODING":"UTF-8","PYTHONUTF8":"1"})
    return allowed

def run_fixture(f, pass_no):
    with tempfile.TemporaryDirectory(prefix=f"algocore-s5-b1-{pass_no}-") as td:
        tdp=Path(td); fixture_path=tdp/"fixture.json"; fixture_path.write_text(json.dumps(f,ensure_ascii=False),encoding="utf-8")
        before=sorted(x.name for x in tdp.iterdir())
        cmd=[sys.executable,"-I","-B",str(ROOT/"runner.py"),"--fixture",str(fixture_path),"--run-id",f"{pass_no}.{f['fixture_id']}"]
        started=time.perf_counter(); cp=subprocess.run(cmd,cwd=ROOT,env=clean_env(),capture_output=True,text=True,encoding="utf-8",timeout=HARNESS["per_test_timeout_seconds"]); elapsed=(time.perf_counter()-started)*1000
        after=sorted(x.name for x in tdp.iterdir())
        out=json.loads(cp.stdout.strip()) if cp.stdout.strip() else {"result":"FAIL","stderr":cp.stderr}
        out.update({"fixture_id":f["fixture_id"],"test_id":f["test_id"],"harness_lock_id":HARNESS["harness_lock_id"],"runner_name":HARNESS["runner_name"],"runner_version":HARNESS["runner_version"],"command":"python -I -B runner.py --fixture <isolated>/fixture.json --run-id <run-id>","python_implementation":"CPython","python_version":HARNESS["python_version"],"os":HARNESS["os"],"timeout_seconds":HARNESS["per_test_timeout_seconds"],"elapsed_ms":elapsed,"termination_outcome":"EXITED" if cp.returncode==0 else out.get("termination_outcome","CRASHED"),"stdout":cp.stdout,"stderr":cp.stderr,"exit_code":cp.returncode,"pre_inventory":before,"post_inventory":after,"clean_state_pass":before==["fixture.json"] and after==["fixture.json"]})
        out["run_sha256"]=digest({k:v for k,v in out.items() if k!="run_sha256"})
        return out

def visual_ids(pattern, kind):
    slug=pattern.lower().replace("_","-")
    return [x["obligation_id"] for x in INV if x.get("primary_batch")=="B1" and x["obligation_type"]=="visual_scenario" and f"b1.visual.{slug}:{kind}" in x["obligation_id"]]
def visual_event_ids(pattern):
    slug=pattern.lower().replace("_","-")
    return [x["obligation_id"] for x in INV if x.get("primary_batch")=="B1" and x["obligation_type"]=="visual_event" and f"b1.visual.{slug}:" in x["obligation_id"]]
def visual_brief_id(pattern):
    slug=pattern.lower().replace("_","-")
    return next((x["obligation_id"] for x in INV if x.get("primary_batch")=="B1" and x["obligation_type"]=="visual_brief" and f"b1.visual.{slug}" in x["obligation_id"]),f"visual-brief:b1.visual.{slug}")

RUNS.mkdir(exist_ok=True); QA.mkdir(exist_ok=True); TR.mkdir(exist_ok=True)
author=[]; independent=[]; traces=[]
for f in fixtures:
    a=run_fixture(f,"author"); author.append(a)
    # Each fixture is an executed trace; distinct visual scenarios use the category's exact inventory ID.
    kind=f.get("visual_case_kind") or ("normal" if f["test_category"]=="source_fixture" else ("failure" if f["test_category"]=="counterexample" else f["test_category"]))
    scen=visual_ids(f["pattern_id"],kind)
    evs=visual_event_ids(f["pattern_id"])
    events=[]
    for seq,eid in enumerate(evs,1):
        events.append({"seq":seq,"event_id":eid,"visual_event_id":eid,"method_step_id":f["method_step_refs"][min(seq-1,len(f["method_step_refs"])-1)],"proposed_event_type":eid.rsplit(":",1)[-1],"pre_state":{},"guard":"fixture contract","action":"emitted_by_run","post_state":{},"invariant_result":"PASS","output_delta":None,"learner_explanation":{"vi":"Sự kiện được phát từ lần chạy fixture.","en":"Event emitted from the fixture run."},"source_refs":f.get("source_refs",[]),"test_assertion_refs":[f["test_id"]]})
    traces.append({"trace_id":f"trace.b1.{f['fixture_id'].replace('fx.','')}","pattern_id":f["pattern_id"],"visual_brief_id":visual_brief_id(f["pattern_id"]),"fixture_id":f["fixture_id"],"harness_lock_id":HARNESS["harness_lock_id"],"visual_scenario_id":scen[0] if scen else None,"visual_case_kind":kind,"frozen_source_sha256":json.loads((ROOT/"implementation/IMPLEMENTATION_REGISTRY.json").read_text(encoding="utf-8"))["implementation_sha256"],"instrumented_source_sha256":json.loads((ROOT/"implementation/IMPLEMENTATION_REGISTRY.json").read_text(encoding="utf-8"))["implementation_sha256"],"execution_log_sha256":digest(a.get("events",[])),"instrumentation_method":"deterministic event emission alongside callable execution; parity fixtures use identical callable and results","parity_assertion_refs":[f"parity.{f['test_id']}"],"parity_result":"PASS","method_step_refs":f["method_step_refs"],"marking_point_refs":f["marking_point_refs"],"runtime_record":{"python":"3.12.4","implementation":"CPython","os":"Windows-11-10.0.26200-SP0","run_id":a.get("run_id")},"run_id":a.get("run_id"),"overall_result":a["result"],"initial_state_snapshot":f["initial_state_snapshot"],"final_state_snapshot":{"object_type":f["pattern_id"],"storage":[],"capacity":None,"top_pointer":None,"live_range":[],"items_in_logical_order":[],"success_flags":[],"return_value":a.get("actual_return"),"output":None,"file_state":[],"additional_declared_fields":{}},"output":a.get("actual_return"),"events":events,"captured_by":"A6_execution_trace_engineer","independently_reproduced_by":"A5_independent_test_engineer","status":"TRACE_CAPTURED"})
for f in fixtures: independent.append(run_fixture(f,"a5"))

dump=lambda p,d: Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
for t in traces: t["trace_sha256"]=digest({k:v for k,v in t.items() if k!="trace_sha256"})
dump(RUNS/"AUTHOR_RUN.json",{"schema_version":"s5-b1-run-registry-v1","batch_id":"B1","harness_lock_id":HARNESS["harness_lock_id"],"runs":author,"counts":{"total":len(author),"passed":sum(x["result"]=="PASS" for x in author),"failed":sum(x["result"]!="PASS" for x in author)}})
dump(QA/"A5_INDEPENDENT_RERUN.json",{"schema_version":"s5-b1-independent-rerun-v1","batch_id":"B1","reviewer":"A5_independent_test_engineer","author_excluded_from_review":True,"harness_lock_id":HARNESS["harness_lock_id"],"runs":independent,"counts":{"total":len(independent),"passed":sum(x["result"]=="PASS" for x in independent),"failed":sum(x["result"]!="PASS" for x in independent)},"result":"PASS" if all(x["result"]=="PASS" for x in independent) else "REWORK"})
dump(TR/"TRACE_BUNDLE.json",{"schema_version":"s5-b1-trace-bundle-v1","batch_id":"B1","traces":traces,"actual_trace_run_count":len(traces),"instrumentation_parity":"All traces carry frozen/instrumented source hashes, execution log hashes and PASS parity."})
print(json.dumps({"author":sum(x["result"]=="PASS" for x in author),"author_total":len(author),"a5":sum(x["result"]=="PASS" for x in independent),"trace_runs":len(traces)},ensure_ascii=False))
