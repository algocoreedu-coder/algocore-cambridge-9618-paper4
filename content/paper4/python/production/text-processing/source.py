from pathlib import Path

def compare_text(left, right):
    for a, b in zip(left, right):
        if a != b:
            return -1 if a < b else 1
    return (len(left) > len(right)) - (len(left) < len(right))

def run_length_encode(text):
    if text == "":
        return []
    encoded, current, count = [], text[0], 1
    for character in text[1:]:
        if character == current:
            count += 1
        else:
            encoded.append([current, count])
            current, count = character, 1
    encoded.append([current, count])
    return encoded

def run(fixture):
    trace = []
    fields = fixture["record"].split(fixture["delimiter"])
    if len(fields) != 3 or fields[0] not in {"INT", "TEXT"}:
        return {"status": "MALFORMED", "routed": {}, "trace": [{"event": "reject_fields", "fields": fields}]}
    try:
        value = int(fields[2]) if fields[0] == "INT" else fields[2]
    except ValueError:
        return {"status": "MALFORMED", "routed": {}, "trace": [{"event": "reject_conversion", "token": fields[2]}]}
    routed = {fields[1]: value}
    trace.append({"event": "route", "tag": fields[0], "key": fields[1]})
    encoded = run_length_encode(fixture["text"])
    trace.append({"event": "flush_final_run", "runs": len(encoded)})
    return {"status": "OK", "comparison": compare_text(fixture["left"], fixture["right"]), "fields": fields, "routed": routed, "encoded": encoded, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
