from __future__ import annotations

import json
import sys

import run_p0


def main() -> int:
    if len(sys.argv) != 2:
        print(json.dumps({"result": "FAIL", "error": "fixture_id required"}))
        return 2
    fixture_id = sys.argv[1]
    tests, _ = run_p0.run_tests()
    rows = [t for t in tests if t["fixture_id"] == fixture_id]
    if len(rows) != 1:
        print(json.dumps({"result": "FAIL", "error": f"expected one fixture, got {len(rows)}"}))
        return 3
    row = rows[0]
    print(json.dumps(row, ensure_ascii=False))
    return 0 if row["result"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
