import json
import sys


def is_ascending(values):
    for index in range(1, len(values)):
        if values[index - 1] > values[index]:
            return False
    return True


def binary_search(values, target, trace):
    low = 0
    high = len(values) - 1
    while low <= high:
        middle = (low + high) // 2
        trace.append({
            "event": "inspect_middle",
            "low": low,
            "high": high,
            "middle": middle,
            "value": values[middle],
        })
        if values[middle] == target:
            return middle
        if target < values[middle]:
            high = middle - 1
        else:
            low = middle + 1
    trace.append({"event": "search_exhausted", "low": low, "high": high})
    return -1


def recursive_binary_search(values, target, low, high, trace):
    trace.append({"event": "recursive_call", "low": low, "high": high})
    if low > high:
        trace.append({"event": "recursive_base_not_found", "low": low, "high": high})
        return -1
    middle = (low + high) // 2
    trace.append({"event": "recursive_inspect", "middle": middle, "value": values[middle]})
    if values[middle] == target:
        return middle
    if target < values[middle]:
        trace.append({"event": "recursive_progress_left", "next_low": low, "next_high": middle - 1})
        return recursive_binary_search(values, target, low, middle - 1, trace)
    trace.append({"event": "recursive_progress_right", "next_low": middle + 1, "next_high": high})
    return recursive_binary_search(values, target, middle + 1, high, trace)


def run(fixture):
    values = fixture["values"]
    trace = []
    if not is_ascending(values):
        trace.append({"event": "reject_unsorted_input"})
        return {"status": "UNSORTED", "index": -1, "trace": trace}
    iterative_index = binary_search(values, fixture["target"], trace)
    recursive_index = recursive_binary_search(values, fixture["target"], 0, len(values) - 1, trace)
    if iterative_index != recursive_index:
        return {"status": "MISMATCH", "index": iterative_index, "recursive_index": recursive_index, "trace": trace}
    return {
        "status": "FOUND" if iterative_index != -1 else "NOT_FOUND",
        "index": iterative_index,
        "recursive_index": recursive_index,
        "trace": trace,
    }


if __name__ == "__main__":
    with open(sys.argv[1], "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file)), ensure_ascii=False, sort_keys=True))
