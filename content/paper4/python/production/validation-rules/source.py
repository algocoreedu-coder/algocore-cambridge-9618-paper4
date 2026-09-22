from pathlib import Path

def check_digit(code, weights, modulus):
    if not code.isdigit() or len(code) != len(weights) or modulus <= 1:
        raise ValueError("invalid check-digit contract")
    return sum(int(digit) * weight for digit, weight in zip(code, weights)) % modulus

def run(fixture):
    trace = []
    accepted = list(fixture.get("accepted", []))
    candidate = fixture.get("candidate")
    if not isinstance(candidate, int) or not fixture["minimum"] <= candidate <= fixture["maximum"]:
        return {"status": "INVALID_INPUT", "accepted": accepted, "trace": [{"event": "range_reject", "value": candidate}]}
    if candidate in accepted:
        return {"status": "DUPLICATE", "accepted": accepted, "trace": [{"event": "duplicate_reject", "value": candidate}]}
    try:
        calculated = check_digit(fixture["code"], fixture["weights"], fixture["modulus"])
    except (KeyError, TypeError, ValueError) as error:
        return {"status": "INVALID_CODE", "accepted": accepted, "message": str(error), "trace": [{"event": "code_reject"}]}
    trace.append({"event": "check_digit", "calculated": calculated})
    if calculated != fixture["supplied_digit"]:
        return {"status": "CHECK_DIGIT_MISMATCH", "accepted": accepted, "calculated": calculated, "trace": trace}
    accepted.append(candidate)
    trace.append({"event": "accept_unique", "value": candidate})
    return {"status": "ACCEPTED", "accepted": accepted, "calculated": calculated, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
