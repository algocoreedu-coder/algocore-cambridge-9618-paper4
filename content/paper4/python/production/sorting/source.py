from pathlib import Path

def bubble(values, reverse=False):
    output, comparisons, swaps = list(values), 0, 0
    for end in range(len(output) - 1, 0, -1):
        changed = False
        for index in range(end):
            comparisons += 1
            wrong = output[index] < output[index + 1] if reverse else output[index] > output[index + 1]
            if wrong:
                output[index], output[index + 1] = output[index + 1], output[index]
                swaps, changed = swaps + 1, True
        if not changed:
            break
    return output, comparisons, swaps

def insertion(values):
    output = list(values)
    for index in range(1, len(output)):
        item, position = output[index], index
        while position > 0 and output[position - 1] > item:
            output[position] = output[position - 1]
            position -= 1
        output[position] = item
    return output

def run(fixture):
    values = fixture.get("values", [])
    if not all(isinstance(value, int) for value in values):
        return {"status": "INVALID_KEY", "values": values, "trace": [{"event": "reject_key"}]}
    ordered, comparisons, swaps = bubble(values, fixture.get("reverse", False))
    insertion_ordered = insertion(values)
    bounded = list(fixture.get("bounded", []))
    if len(bounded) >= fixture["capacity"]:
        return {"status": "FULL", "values": bounded, "bubble": ordered, "insertion": insertion_ordered, "trace": [{"event": "capacity_reject"}]}
    item = fixture["insert"]
    position = 0
    while position < len(bounded) and bounded[position] <= item:
        position += 1
    bounded.insert(position, item)
    return {"status": "OK", "bubble": ordered, "insertion": insertion_ordered, "bounded": bounded, "comparisons": comparisons, "swaps": swaps, "trace": [{"event": "bubble_complete"}, {"event": "ordered_insert", "position": position}]}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
