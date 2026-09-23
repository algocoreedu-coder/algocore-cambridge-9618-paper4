"""A5 independent fresh process rerun for every frozen B6 fixture."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_b6 import HERE, make_fixtures, run_fresh, run_row, dump

rows = make_fixtures()
tests = [run_row(row) for row in rows]
fresh = run_fresh(rows)
payload = {
    "schema_version": "s5-b6-a5-rerun-v1", "batch_id": "B6",
    "reviewer": "A5_independent_test_engineer",
    "mode": "fresh_process_and_fresh_temp_directory",
    "command": "python -I -B independent_rerun.py",
    "tests": tests, "fresh_fixture_runs": fresh,
    "test_counts": {"total": len(tests), "passed": sum(x["result"] == "PASS" for x in tests), "failed": sum(x["result"] != "PASS" for x in tests)},
    "fresh_fixture_counts": {"total": len(fresh), "passed": sum(x["result"] == "PASS" and x["termination"] == "EXITED" for x in fresh), "failed": sum(x["result"] != "PASS" or x["termination"] != "EXITED" for x in fresh)},
    "status": "PASS" if all(x["result"] == "PASS" for x in tests + fresh) else "FAIL", "findings": []
}
dump(HERE / "qa" / "A5_INDEPENDENT_RERUN.json", payload)
print(json.dumps({"status": payload["status"], "test_counts": payload["test_counts"], "fresh_fixture_counts": payload["fresh_fixture_counts"]}, ensure_ascii=False))
raise SystemExit(0 if payload["status"] == "PASS" else 1)
