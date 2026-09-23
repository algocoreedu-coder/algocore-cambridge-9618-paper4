import json
import sys


def recursive_sum(values, index, trace):
    trace.append({"event": "call", "index": index})
    if index == len(values):
        trace.append({"event": "base_case", "index": index, "result": 0})
        return 0
    subtotal = recursive_sum(values, index + 1, trace)
    result = values[index] + subtotal
    trace.append({"event": "return", "index": index, "value": values[index], "result": result})
    return result


def iterative_sum(values):
    total = 0
    for value in values:
        total += value
    return total


def run(fixture):
    values = fixture["values"]
    trace = []
    if not all(isinstance(value, int) for value in values):
        trace.append({"event": "reject_non_integer"})
        return {"status": "INVALID_VALUE", "trace": trace}
    recursive_result = recursive_sum(values, 0, trace)
    iterative_result = iterative_sum(values)
    return {
        "status": "OK" if recursive_result == iterative_result else "MISMATCH",
        "recursive_result": recursive_result,
        "iterative_result": iterative_result,
        "trace": trace,
    }


if __name__ == "__main__":
    with open(sys.argv[1], "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file)), ensure_ascii=False, sort_keys=True))
