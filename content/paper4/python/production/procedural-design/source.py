from pathlib import Path

def classify(score):
    if score < 0 or score > 100:
        return "INVALID"
    if score >= 70:
        return "DISTINCTION"
    if score >= 40:
        return "PASS"
    return "RETRY"

def apply_bonus(scores, bonus):
    # Return a new list: the caller's list is not Cambridge BYREF data.
    return [min(100, score + bonus) for score in scores]

def run(fixture):
    trace = []
    original = list(fixture.get("scores", []))
    if not isinstance(fixture.get("bonus"), int):
        return {"status": "INVALID_INPUT", "scores": original, "caller_unchanged": True, "trace": [{"event": "reject_bonus"}]}
    adjusted = apply_bonus(original, fixture["bonus"])
    labels = []
    for index, score in enumerate(adjusted):
        label = classify(score)
        trace.append({"event": "classify", "index": index, "score": score, "label": label})
        labels.append(label)
    status = "OK" if all(label != "INVALID" for label in labels) else "INVALID_INPUT"
    return {"status": status, "adjusted": adjusted, "labels": labels, "caller_unchanged": original == fixture.get("scores", []), "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
