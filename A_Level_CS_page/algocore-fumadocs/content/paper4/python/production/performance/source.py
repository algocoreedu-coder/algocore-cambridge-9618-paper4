from pathlib import Path

def linear(values, target):
    comparisons = 0
    for index, value in enumerate(values):
        comparisons += 1
        if value == target: return index, comparisons
    return -1, comparisons

def binary(values, target):
    if values != sorted(values): raise ValueError("binary search requires sorted input")
    low, high, comparisons = 0, len(values) - 1, 0
    while low <= high:
        middle = (low + high) // 2; comparisons += 1
        if values[middle] == target: return middle, comparisons
        if values[middle] < target: low = middle + 1
        else: high = middle - 1
    return -1, comparisons

def insertion_cost(values):
    output, comparisons, shifts = list(values), 0, 0
    for index in range(1, len(output)):
        item, position = output[index], index
        while position > 0:
            comparisons += 1
            if output[position - 1] <= item: break
            output[position] = output[position - 1]; position -= 1; shifts += 1
        output[position] = item
    return output, comparisons, shifts

def run(fixture):
    values = fixture["values"]
    linear_result = linear(values, fixture["target"])
    try: binary_result, status = binary(values, fixture["target"]), "OK"
    except ValueError: binary_result, status = [-1, 0], "UNSORTED"
    ordered, comparisons, shifts = insertion_cost(values)
    trace = [{"event": "linear_count", "comparisons": linear_result[1]}, {"event": "binary_count", "comparisons": binary_result[1]}, {"event": "insertion_count", "comparisons": comparisons, "shifts": shifts}]
    return {"status": status, "linear": linear_result, "binary": binary_result, "sorted": ordered, "result_equivalent": ordered == sorted(values), "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
