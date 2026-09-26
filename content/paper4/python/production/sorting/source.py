from pathlib import Path

def bubble(values, trace, reverse=False):
    output = list(values)
    comparisons = 0
    swaps = 0
    for end in range(len(output) - 1, 0, -1):
        changed = False
        pass_number = len(output) - end
        for index in range(end):
            comparisons += 1
            left = output[index]
            right = output[index + 1]
            wrong = left < right if reverse else left > right
            trace.append({
                "event": "bubble_compare",
                "pass": pass_number,
                "left_index": index,
                "right_index": index + 1,
                "left": left,
                "right": right,
                "swap_required": wrong,
            })
            if wrong:
                before = list(output)
                output[index] = right
                output[index + 1] = left
                swaps += 1
                changed = True
                trace.append({
                    "event": "bubble_swap",
                    "pass": pass_number,
                    "indices": [index, index + 1],
                    "before": before,
                    "after": list(output),
                })
        trace.append({
            "event": "bubble_pass_complete",
            "pass": pass_number,
            "changed": changed,
            "sorted_suffix_start": end,
            "values": list(output),
        })
        if not changed:
            break
    trace.append({"event": "bubble_complete", "values": list(output)})
    return output, comparisons, swaps

def insertion(values, trace):
    output = list(values)
    for index in range(1, len(output)):
        item = output[index]
        position = index
        trace.append({
            "event": "insertion_select_key",
            "index": index,
            "key": item,
            "sorted_prefix": list(output[:index]),
        })
        while position > 0 and output[position - 1] > item:
            before = list(output)
            output[position] = output[position - 1]
            trace.append({
                "event": "insertion_shift",
                "from_index": position - 1,
                "to_index": position,
                "value": output[position],
                "before": before,
                "after": list(output),
            })
            position -= 1
        before = list(output)
        output[position] = item
        trace.append({
            "event": "insertion_place_key",
            "from_index": index,
            "to_index": position,
            "key": item,
            "before": before,
            "after": list(output),
        })
    trace.append({"event": "insertion_complete", "values": list(output)})
    return output

def run(fixture):
    values = fixture.get("values", [])
    trace = []
    if not all(isinstance(value, int) for value in values):
        trace.append({
            "event": "reject_key",
            "before": list(values),
            "after": list(values),
        })
        return {"status": "INVALID_KEY", "values": values, "trace": trace}
    ordered, comparisons, swaps = bubble(values, trace, fixture.get("reverse", False))
    insertion_ordered = insertion(values, trace)
    bounded = list(fixture.get("bounded", []))
    if len(bounded) >= fixture["capacity"]:
        before = list(bounded)
        trace.append({
            "event": "capacity_reject",
            "capacity": fixture["capacity"],
            "before": before,
            "after": list(bounded),
        })
        return {
            "status": "FULL",
            "values": bounded,
            "bubble": ordered,
            "insertion": insertion_ordered,
            "trace": trace,
        }
    item = fixture["insert"]
    position = 0
    while position < len(bounded):
        current = bounded[position]
        moves_right = current <= item
        trace.append({
            "event": "ordered_insert_compare",
            "index": position,
            "current": current,
            "item": item,
            "moves_right": moves_right,
        })
        if not moves_right:
            break
        position += 1
    before = list(bounded)
    bounded.insert(position, item)
    trace.append({
        "event": "ordered_insert",
        "position": position,
        "item": item,
        "before": before,
        "after": list(bounded),
    })
    return {
        "status": "OK",
        "bubble": ordered,
        "insertion": insertion_ordered,
        "bounded": bounded,
        "comparisons": comparisons,
        "swaps": swaps,
        "trace": trace,
    }

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
