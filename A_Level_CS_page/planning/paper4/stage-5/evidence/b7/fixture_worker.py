import argparse, json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "implementation"))
from b7_files import execute

parser = argparse.ArgumentParser()
parser.add_argument("--fixture-json", required=True)
args = parser.parse_args()
row = json.loads(args.fixture_json)
try:
    actual = execute(row)
    ok = actual == row["expected_return"]
    print(json.dumps({"result": "PASS" if ok else "FAIL", "actual_return": actual, "expected_return": row["expected_return"], "assertion_id": f"assert.{row['fixture_id']}"}, ensure_ascii=False))
    raise SystemExit(0 if ok else 1)
except Exception as exc:
    print(json.dumps({"result": "FAIL", "error": repr(exc)}, ensure_ascii=False))
    raise SystemExit(1)
