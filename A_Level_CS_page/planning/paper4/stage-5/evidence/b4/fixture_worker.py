import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / "implementation"))
from run_b4 import execute  # noqa: E402

parser = argparse.ArgumentParser()
parser.add_argument("--fixture-json", required=True)
args = parser.parse_args()
row = json.loads(args.fixture_json)
try:
    actual = execute(row)
    ok = actual == row["expected_return"]
    print(json.dumps({"result": "PASS" if ok else "FAIL", "evidence": {"actual_return": actual, "expected_return": row["expected_return"], "assertion_id": f"assert.{row['fixture_id']}"}, "error": None if ok else "return mismatch"}, ensure_ascii=False))
    raise SystemExit(0 if ok else 1)
except Exception as exc:
    print(json.dumps({"result": "FAIL", "evidence": {}, "error": repr(exc)}, ensure_ascii=False))
    raise SystemExit(1)
