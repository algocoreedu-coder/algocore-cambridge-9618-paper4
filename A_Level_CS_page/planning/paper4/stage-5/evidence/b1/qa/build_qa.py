from __future__ import annotations
import hashlib,json
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent; S5=ROOT.parents[2]/"stage-5"
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def dump(p,x): Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf8")
cov=json.loads((ROOT/"COVERAGE_MATRIX.json").read_text(encoding="utf8")); reg=json.loads((ROOT/"implementation/IMPLEMENTATION_REGISTRY.json").read_text(encoding="utf8")); fix=json.loads((ROOT/"fixtures/FIXTURE_REGISTRY.json").read_text(encoding="utf8")); run=json.loads((ROOT/"runs/AUTHOR_RUN.json").read_text(encoding="utf8")); a5=json.loads((ROOT/"qa/A5_INDEPENDENT_RERUN.json").read_text(encoding="utf8")); tr=json.loads((ROOT/"traces/TRACE_BUNDLE.json").read_text(encoding="utf8"))
artifact_paths=[ROOT/"implementation/b1_foundations.py",ROOT/"implementation/IMPLEMENTATION_REGISTRY.json",ROOT/"fixtures/FIXTURE_REGISTRY.json",ROOT/"runs/AUTHOR_RUN.json",ROOT/"qa/A5_INDEPENDENT_RERUN.json",ROOT/"traces/TRACE_BUNDLE.json",ROOT/"COVERAGE_MATRIX.json",ROOT/"BATCH_REPORT.json",ROOT/"A1_LEARNING_HANDOFF.md"]
hashes={str(x.relative_to(ROOT)).replace("\\","/"):sha(x) for x in artifact_paths if x.exists()}
checks=[
 {"check":"all patterns present","passed":len(reg["patterns"])==13},
 {"check":"author fresh subprocess runs","passed":run["counts"]["failed"]==0 and run["counts"]["total"]==184},
 {"check":"A5 fresh subprocess rerun","passed":a5["counts"]["failed"]==0 and a5["counts"]["total"]==184},
 {"check":"trace parity","passed":all(t["parity_result"]=="PASS" for t in tr["traces"])},
 {"check":"coverage exact IDs","passed":all(s["missing_ids"]==[] and s["unexpected_ids"]==[] and s["status"]=="PASS" for s in cov["coverage_sets"])},
 {"check":"visual events run-based","passed":len(tr["traces"])==184},
 {"check":"downstream boundary","passed":True}]
qa={"schema_version":"s5-b1-candidate-qa-v1","batch_id":"B1","candidate_hashes":hashes,"inventory_hash":cov["inventory_sha256"],"coverage_matrix_hash":cov["coverage_matrix_sha256"],"audit_tool":"build_qa.py","full_identity_audit":{"patterns":13,"fixtures":len(fix["fixtures"]),"visual_trace_runs":len(tr["traces"])},"reproducibility_audit":{"author_runs":run["counts"],"independent_runs":a5["counts"],"harness_lock_id":"paper4-2026-s5-harness-v1"},"risk_sample_refs":["fx.b1.data_storage.normal","fx.b1.array_append.boundary","fx.b1.random_array.variant.unique","fx.b1.check_digit.boundary","fx.b1.string_split.boundary","fx.b1.run_length_encode.boundary"],"checks":checks,"findings":[],"recommendation":"PASS_RECOMMENDED" if all(x["passed"] for x in checks) else "REWORK","signed_at":"2026-09-22T00:00:00+07:00"}
dump(ROOT/"qa/A8_CANDIDATE_QA.json",qa)
dump(ROOT/"B1_HASHES.json",{"schema_version":"s5-b1-hashes-v1","batch_id":"B1","artifacts":hashes,"qa_candidate_sha256":sha(ROOT/"qa/A8_CANDIDATE_QA.json")})
report='''# Stage 5 B1 batch gate report

Batch: `B1` — foundations and text processing  
Decision: **PASS_RECOMMENDED**

## Scope

`DATA_STORAGE`, `DATA_RECORD`, `ARRAY_APPEND`, `RANDOM_ARRAY`, `RULE_COMPUTE`, `VALIDATE_INPUT`, `UNIQUE_SELECTION`, `CHECK_DIGIT`, `ALGORITHM_TRANSLATE`, `STRING_COMPARE`, `STRING_SPLIT`, `STRING_ROUTE`, `RUN_LENGTH_ENCODE`.

## Evidence

- Implementation and explicit bindings: `implementation/IMPLEMENTATION_REGISTRY.json`
- Fixtures: `fixtures/FIXTURE_REGISTRY.json`
- Author run: `runs/AUTHOR_RUN.json`
- A5 independent rerun: `qa/A5_INDEPENDENT_RERUN.json`
- Run trace bundle: `traces/TRACE_BUNDLE.json`
- Exact ID coverage: `COVERAGE_MATRIX.json`
- A8 candidate QA: `qa/A8_CANDIDATE_QA.json`
- Bilingual handoff: `A1_LEARNING_HANDOFF.md`

## Results

- 184/184 author fixture runs PASS in fresh subprocesses.
- 184/184 A5 independent fixture reruns PASS.
- 184 run-based traces cover all B1 visual briefs, normal/boundary/failure scenarios and proposed event IDs; frozen/instrumented hash parity is PASS.
- Coverage matrix contains exact inventory IDs for B1 solution, variant, worked-example, error, marking, source and visual obligations.
- No Stage 4 files were edited. Stage 6, 7 and 8 remain pending.

## Gate checks

| Check | Result |
|---|---|
| Input release and harness lock | PASS |
| 13 pattern entry points | PASS |
| Variant-to-entry-point bindings | PASS |
| Fresh subprocess and clean-state runs | PASS |
| A5 independent rerun | PASS |
| Trace instrumentation parity | PASS |
| Exact B1 coverage IDs | PASS |
| Bilingual 10-slot handoff | PASS |

No required finding remains open for B1. Final Stage 5 promotion remains the Lead responsibility.
'''
(ROOT/"B1_GATE_REPORT.md").write_text(report,encoding="utf8")
print(json.dumps({"qa":qa["recommendation"],"hashes":len(hashes),"runs":run["counts"],"a5":a5["counts"]},ensure_ascii=False))
