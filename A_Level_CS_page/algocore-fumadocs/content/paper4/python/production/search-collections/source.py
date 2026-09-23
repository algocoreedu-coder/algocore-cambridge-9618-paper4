from pathlib import Path

def run(fixture):
    trace, found = [], -1
    values = fixture.get("values", [])
    for index, value in enumerate(values):
        trace.append({"event": "inspect", "index": index, "match": value == fixture["target"]})
        if found == -1 and value == fixture["target"]:
            found = index
    records = fixture.get("records", [])
    if any("group" not in record or "amount" not in record for record in records):
        return {"status": "MALFORMED_RECORD", "found": found, "groups": {}, "trace": trace + [{"event": "reject_record"}]}
    groups, filtered = {}, []
    for record in records:
        groups[record["group"]] = groups.get(record["group"], 0) + record["amount"]
        if record["amount"] >= fixture["threshold"]:
            filtered.append(record)
    return {"status": "OK", "found": found, "count": sum(value == fixture["target"] for value in values), "filtered": filtered, "groups": groups, "trace": trace + [{"event": "aggregate", "groups": len(groups)}]}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
