from pathlib import Path

def defective_grade(score):
    return "PASS" if score > 40 else "RETRY"

def repaired_grade(score):
    if score < 0 or score > 100:
        return "INVALID"
    return "PASS" if score >= 40 else "RETRY"

def run_suite(cases, function):
    rows = []
    for case in cases:
        actual = function(case["input"])
        rows.append({"input": case["input"], "expected": case["expected"], "actual": actual, "passed": actual == case["expected"]})
    return rows

def run(fixture):
    before = run_suite(fixture["cases"], defective_grade)
    first_divergence = next((index for index, row in enumerate(before) if not row["passed"]), -1)
    after = run_suite(fixture["cases"], repaired_grade)
    trace = [{"event": "defect_run", "first_divergence": first_divergence}, {"event": "repair"}, {"event": "regression", "all_pass": all(row["passed"] for row in after)}]
    return {"status": "PASS" if all(row["passed"] for row in after) else "FAIL", "failed_before_repair": first_divergence >= 0, "first_divergence": first_divergence, "before": before, "after": after, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
