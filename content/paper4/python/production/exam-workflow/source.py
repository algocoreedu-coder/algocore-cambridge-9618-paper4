from pathlib import Path

def load(rows):
    if not isinstance(rows, list): raise ValueError("rows must be a list")
    return [dict(row) for row in rows]
def validate(rows):
    if any(set(row) != {"name", "score"} or not isinstance(row["score"], int) or not 0 <= row["score"] <= 100 for row in rows): raise ValueError("invalid row")
    return rows
def process(rows, minimum): return [row for row in rows if row["score"] >= minimum]
def format_output(rows): return "\n".join(f"{index + 1}. {row['name']}: {row['score']}" for index, row in enumerate(rows)) or "NO RESULTS"

def run(fixture):
    trace, evidence = [], []
    try:
        rows = load(fixture["rows"]); trace.append({"event": "load", "count": len(rows)}); evidence.append({"requirement": "load", "passed": True})
        validate(rows); trace.append({"event": "validate"}); evidence.append({"requirement": "validate", "passed": True})
        selected = process(rows, fixture["minimum"]); trace.append({"event": "process", "count": len(selected)}); evidence.append({"requirement": "process", "passed": True})
        output = format_output(selected); trace.append({"event": "format", "output": output}); evidence.append({"requirement": "format", "passed": True})
        return {"status": "OK", "output": output, "selected": selected, "evidence": evidence, "first_failed_stage": None, "trace": trace}
    except (KeyError, TypeError, ValueError) as error:
        failed = "load" if not trace else "validate"
        evidence.append({"requirement": failed, "passed": False, "actual": str(error)})
        trace.append({"event": "block_downstream", "failed": failed})
        return {"status": "FAILED", "output": "", "selected": [], "evidence": evidence, "first_failed_stage": failed, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
