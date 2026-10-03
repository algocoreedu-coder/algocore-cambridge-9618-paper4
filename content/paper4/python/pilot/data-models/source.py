import json
import random
import sys


def valid_record(record):
    return (
        isinstance(record, dict)
        and isinstance(record.get("name"), str)
        and record["name"] != ""
        and type(record.get("score")) is int
    )


def add_record(records, capacity, record, trace):
    trace.append({"event": "check_record", "valid": valid_record(record)})
    if not valid_record(record):
        return False, "INVALID_RECORD"
    trace.append({"event": "check_capacity", "count": len(records), "capacity": capacity})
    if len(records) >= capacity:
        return False, "FULL"
    records.append(record)
    trace.append({"event": "append", "index": len(records) - 1, "record": record})
    return True, "ADDED"


def generate_random_array(count, lower, upper, seed, unique, trace):
    if count < 0 or lower > upper:
        raise ValueError("invalid random array contract")
    if unique and count > upper - lower + 1:
        raise ValueError("random range is too small for unique values")
    generator = random.Random(seed)
    values = []
    while len(values) < count:
        candidate = generator.randint(lower, upper)
        accepted = not unique or candidate not in values
        trace.append({"event": "generate_random_value", "candidate": candidate, "accepted": accepted})
        if accepted:
            values.append(candidate)
    return values


def run(fixture):
    records = [dict(record) for record in fixture["records"]]
    trace = []
    added, message = add_record(records, fixture["capacity"], fixture["new_record"], trace)
    random_contract = fixture["random_contract"]
    random_values = generate_random_array(
        random_contract["count"],
        random_contract["lower"],
        random_contract["upper"],
        random_contract["seed"],
        random_contract.get("unique", False),
        trace,
    )
    average = None
    if len(random_values) > 0:
        average = sum(random_values) / len(random_values)
    trace.append({"event": "summarise_random_data", "count": len(random_values), "average": average})
    return {
        "status": message,
        "append_success": added,
        "records": records,
        "random_values": random_values,
        "random_average": average,
        "trace": trace,
    }


if __name__ == "__main__":
    with open(sys.argv[1], "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file)), ensure_ascii=False, sort_keys=True))
